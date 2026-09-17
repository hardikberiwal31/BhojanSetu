"""
routers/ngo.py
---------------
Endpoints only an NGO can call.
"""

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from database import food_collection, deliveries_collection
from auth import require_role
from services.matching import compute_match
from services.claim import try_claim_food
from services.assignment import assign_volunteer_to_delivery
from services.lookup import get_provider, get_volunteer
from utils import serialize_doc

router = APIRouter(prefix="/api/ngo", tags=["ngo"])


def _require_available_ngo(current):
    """An NGO marked unavailable cannot view or claim food."""
    ngo = current["profile"]
    if not ngo.get("isAvailable", True):
        raise HTTPException(
            403,
            "This NGO is currently marked unavailable and cannot view or claim food",
        )
    return ngo


@router.get("/food/available")
def list_available_food(current=Depends(require_role("ngo"))):
    """
    All AVAILABLE donations, each scored specifically for this NGO
    (distance/capacity/preferences), sorted best match first.
    """
    ngo = _require_available_ngo(current)

    donations = list(food_collection.find({"status": "AVAILABLE"}))
    results = []
    for food in donations:
        match = compute_match(food, ngo)
        provider = get_provider(food["providerId"])
        results.append({
            "foodId": str(food["_id"]),
            "foodName": food["foodName"],
            "quantity": food["quantity"],
            "foodType": food["foodType"],
            "providerId": str(food["providerId"]),
            "providerName": provider["name"] if provider else "Unknown provider",
            "expiresAt": food["expiresAt"],
            **match,
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)
    return results


@router.post("/food/{food_id}/claim")
def claim_food(food_id: str, current=Depends(require_role("ngo"))):
    """
    Atomically claim a donation. Only succeeds if it's still AVAILABLE.
    On success, a volunteer is auto-assigned and a delivery is created.
    """
    ngo = _require_available_ngo(current)

    try:
        food_oid = ObjectId(food_id)
    except InvalidId:
        raise HTTPException(400, "Invalid food_id")

    existing = food_collection.find_one({"_id": food_oid})
    if not existing:
        raise HTTPException(404, "Food donation not found")

    updated_food = try_claim_food(food_oid, ngo["_id"])
    if not updated_food:
        raise HTTPException(409, "This donation has already been claimed")

    delivery = assign_volunteer_to_delivery(updated_food, ngo)

    return {
        "food": serialize_doc(updated_food),
        "delivery": serialize_doc(delivery),
    }


@router.get("/claims")
def list_my_claims(current=Depends(require_role("ngo"))):
    """
    Donations this NGO has claimed, flattened with the provider's name and
    (once assigned) the volunteer's name, so the frontend can render it
    directly without needing a second round of id lookups.
    """
    ngo = current["profile"]
    foods = list(food_collection.find({"claimedByNgoId": ngo["_id"]}))

    results = []
    for food in foods:
        delivery = deliveries_collection.find_one({"foodId": food["_id"]})
        provider = get_provider(food["providerId"])
        volunteer = get_volunteer(delivery["volunteerId"]) if delivery else None

        results.append({
            "deliveryId": str(delivery["_id"]) if delivery else None,
            "foodId": str(food["_id"]),
            "foodName": food["foodName"],
            "quantity": food["quantity"],
            "foodType": food["foodType"],
            "providerName": provider["name"] if provider else "Unknown provider",
            "status": food["status"],
            "deliveryStatus": delivery["status"] if delivery else "UNASSIGNED",
            "volunteer": volunteer["name"] if volunteer else None,
            "expiresAt": food["expiresAt"],
        })

    return results


@router.post("/delivery/{delivery_id}/confirm-receipt")
def confirm_receipt(delivery_id: str, current=Depends(require_role("ngo"))):
    """NGO confirms it physically received the food, after volunteer marks DELIVERED."""
    ngo = current["profile"]

    try:
        delivery_oid = ObjectId(delivery_id)
    except InvalidId:
        raise HTTPException(400, "Invalid delivery_id")

    delivery = deliveries_collection.find_one({"_id": delivery_oid})
    if not delivery:
        raise HTTPException(404, "Delivery not found")
    if delivery["ngoId"] != ngo["_id"]:
        raise HTTPException(403, "This delivery does not belong to your NGO")
    if delivery["status"] != "DELIVERED":
        raise HTTPException(400, "Volunteer has not marked this delivery as DELIVERED yet")

    deliveries_collection.update_one(
        {"_id": delivery_oid},
        {"$set": {"receiptConfirmed": True}},
    )
    updated = deliveries_collection.find_one({"_id": delivery_oid})
    return serialize_doc(updated)
