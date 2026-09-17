"""
routers/provider.py
--------------------
Endpoints only a provider can call.
"""

from fastapi import APIRouter, Depends, HTTPException

from database import food_collection, deliveries_collection
from auth import require_role
from models.food import FoodCreate
from utils import serialize_doc, now_utc, to_naive_utc
from services.urgency import compute_urgency
from services.lookup import get_ngo

router = APIRouter(prefix="/api/provider", tags=["provider"])


@router.post("/food")
def create_food(payload: FoodCreate, current=Depends(require_role("provider"))):
    """Post a new surplus food donation. Always starts as AVAILABLE."""
    provider = current["profile"]

    prepared_at = to_naive_utc(payload.preparedAt)
    expires_at = to_naive_utc(payload.expiresAt)

    if expires_at <= prepared_at:
        raise HTTPException(400, "expiresAt must be after preparedAt")

    food_doc = {
        "providerId": provider["_id"],
        "foodName": payload.foodName,
        "quantity": payload.quantity,
        "foodType": payload.foodType,
        "preparedAt": prepared_at,
        "expiresAt": expires_at,
        "location": payload.location.dict(),
        "status": "AVAILABLE",
        "claimedByNgoId": None,
        "createdAt": now_utc(),
    }
    result = food_collection.insert_one(food_doc)
    food_doc["_id"] = result.inserted_id
    return serialize_doc(food_doc)


@router.get("/food")
def list_my_food(current=Depends(require_role("provider"))):
    """
    List donations posted by this provider, with live urgency + delivery
    status. Includes `foodId` (a plain string, handy as a frontend list key)
    and `ngo` (the claiming NGO's name, once claimed).
    """
    provider = current["profile"]
    items = list(food_collection.find({"providerId": provider["_id"]}))

    results = []
    for food in items:
        remaining_minutes, urgency = compute_urgency(food["expiresAt"])
        delivery = deliveries_collection.find_one({"foodId": food["_id"]})
        ngo = get_ngo(food.get("claimedByNgoId"))

        item = serialize_doc(food)
        item["foodId"] = item["id"]
        item["remainingMinutes"] = remaining_minutes
        item["urgency"] = urgency
        item["deliveryStatus"] = delivery["status"] if delivery else None
        item["ngo"] = ngo["name"] if ngo else None
        results.append(item)

    return results
