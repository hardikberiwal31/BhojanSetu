"""
services/assignment.py
-----------------------
Automatic volunteer assignment. Called right after a claim succeeds.

Rule: assign the nearest AVAILABLE volunteer (by Haversine distance to the
pickup location). If no volunteer is available, we do NOT block the claim --
the NGO still gets the food -- we just create the delivery in an
UNASSIGNED state instead of leaving the system in a broken/partial state.
"""

from database import volunteers_collection, deliveries_collection
from services.distance import haversine_km
from utils import now_utc


def assign_volunteer_to_delivery(food: dict, ngo: dict) -> dict:
    """
    food: the just-claimed food_donations document
    ngo: the claiming ngos document
    Returns the newly created delivery document.
    """
    available_volunteers = list(volunteers_collection.find({"currentStatus": "AVAILABLE"}))

    pickup_location = food["location"]
    drop_location = ngo["location"]

    delivery_doc = {
        "foodId": food["_id"],
        "providerId": food["providerId"],
        "ngoId": ngo["_id"],
        "volunteerId": None,
        "pickupLocation": pickup_location,
        "dropLocation": drop_location,
        "status": "UNASSIGNED",
        "createdAt": now_utc(),
        "updatedAt": now_utc(),
    }

    if available_volunteers:
        nearest = min(
            available_volunteers,
            key=lambda v: haversine_km(v["location"], pickup_location),
        )
        delivery_doc["volunteerId"] = nearest["_id"]
        delivery_doc["status"] = "ASSIGNED"

        volunteers_collection.update_one(
            {"_id": nearest["_id"]},
            {"$set": {"currentStatus": "BUSY"}},
        )

    result = deliveries_collection.insert_one(delivery_doc)
    delivery_doc["_id"] = result.inserted_id
    return delivery_doc
