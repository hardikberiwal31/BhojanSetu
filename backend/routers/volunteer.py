"""
routers/volunteer.py
---------------------
Endpoints only a volunteer can call. Volunteers never pick their own food --
the backend assigns them (see services/assignment.py). They only progress
the status of deliveries already assigned to them.
"""

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from database import deliveries_collection, food_collection, volunteers_collection
from auth import require_role
from models.delivery import DeliveryStatusUpdate
from utils import serialize_doc, now_utc
from services.lookup import get_provider, get_ngo, location_label

router = APIRouter(prefix="/api/volunteer", tags=["volunteer"])

# Valid forward transitions. A volunteer can only move to the next step,
# never skip ahead or go backwards.
NEXT_STATUS = {
    "ASSIGNED": "ACCEPTED",     # via /accept, not /status
    "ACCEPTED": "PICKED_UP",
    "PICKED_UP": "IN_TRANSIT",
    "IN_TRANSIT": "DELIVERED",
}


@router.get("/assignments")
def list_assignments(current=Depends(require_role("volunteer"))):
    """
    Deliveries assigned to this volunteer, flattened with readable pickup/
    drop labels (provider/NGO name + area) instead of raw lat/lng, so the
    frontend can render it directly.
    """
    volunteer = current["profile"]
    deliveries = list(deliveries_collection.find({"volunteerId": volunteer["_id"]}))

    results = []
    for delivery in deliveries:
        food = food_collection.find_one({"_id": delivery["foodId"]})
        provider = get_provider(delivery["providerId"])
        ngo = get_ngo(delivery["ngoId"])

        results.append({
            "deliveryId": str(delivery["_id"]),
            "foodId": str(delivery["foodId"]),
            "foodName": food["foodName"] if food else "Unknown food",
            "quantity": food["quantity"] if food else None,
            "foodType": food["foodType"] if food else None,
            "pickupLocation": location_label(provider),
            "dropLocation": location_label(ngo),
            "deliveryStatus": delivery["status"],
        })

    return results


def _load_own_delivery(delivery_id: str, volunteer: dict) -> dict:
    try:
        delivery_oid = ObjectId(delivery_id)
    except InvalidId:
        raise HTTPException(400, "Invalid delivery_id")

    delivery = deliveries_collection.find_one({"_id": delivery_oid})
    if not delivery:
        raise HTTPException(404, "Delivery not found")
    if delivery.get("volunteerId") != volunteer["_id"]:
        raise HTTPException(403, "This delivery is not assigned to you")
    return delivery


@router.post("/delivery/{delivery_id}/accept")
def accept_delivery(delivery_id: str, current=Depends(require_role("volunteer"))):
    """ASSIGNED -> ACCEPTED"""
    volunteer = current["profile"]
    delivery = _load_own_delivery(delivery_id, volunteer)

    if delivery["status"] != "ASSIGNED":
        raise HTTPException(400, f"Cannot accept a delivery in status {delivery['status']}")

    deliveries_collection.update_one(
        {"_id": delivery["_id"]},
        {"$set": {"status": "ACCEPTED", "updatedAt": now_utc()}},
    )
    updated = deliveries_collection.find_one({"_id": delivery["_id"]})
    return serialize_doc(updated)


@router.patch("/delivery/{delivery_id}/status")
def update_status(
    delivery_id: str,
    payload: DeliveryStatusUpdate,
    current=Depends(require_role("volunteer")),
):
    """
    ACCEPTED -> PICKED_UP -> IN_TRANSIT -> DELIVERED
    Strictly sequential; out-of-order transitions are rejected with 400.
    On reaching DELIVERED: food is marked DELIVERED and the volunteer
    becomes AVAILABLE again.
    """
    volunteer = current["profile"]
    delivery = _load_own_delivery(delivery_id, volunteer)

    expected_next = NEXT_STATUS.get(delivery["status"])
    if payload.status != expected_next:
        raise HTTPException(
            400,
            f"Invalid transition: cannot go from {delivery['status']} to {payload.status}. "
            f"Expected next status: {expected_next}",
        )

    deliveries_collection.update_one(
        {"_id": delivery["_id"]},
        {"$set": {"status": payload.status, "updatedAt": now_utc()}},
    )

    if payload.status == "DELIVERED":
        food_collection.update_one(
            {"_id": delivery["foodId"]},
            {"$set": {"status": "DELIVERED"}},
        )
        volunteers_collection.update_one(
            {"_id": volunteer["_id"]},
            {"$set": {"currentStatus": "AVAILABLE"}},
        )

    updated = deliveries_collection.find_one({"_id": delivery["_id"]})
    return serialize_doc(updated)
