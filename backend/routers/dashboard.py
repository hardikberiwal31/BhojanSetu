"""
routers/dashboard.py
---------------------
Impact stats, viewable by any authenticated role. All numbers are computed
live from the database -- nothing cached or hardcoded.
"""

from fastapi import APIRouter, Depends

from database import food_collection, ngos_collection, volunteers_collection, deliveries_collection
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(current=Depends(get_current_user)):
    total_donations = food_collection.count_documents({})
    available_count = food_collection.count_documents({"status": "AVAILABLE"})
    claimed_count = food_collection.count_documents({"status": "CLAIMED"})
    delivered_count = food_collection.count_documents({"status": "DELIVERED"})

    # Meals "rescued" = meals from donations that actually completed delivery.
    meals_pipeline = list(food_collection.aggregate([
        {"$match": {"status": "DELIVERED"}},
        {"$group": {"_id": None, "total": {"$sum": "$quantity"}}},
    ]))
    total_meals_rescued = meals_pipeline[0]["total"] if meals_pipeline else 0

    active_ngos = ngos_collection.count_documents({"isAvailable": True})
    active_volunteers = volunteers_collection.count_documents({"currentStatus": "AVAILABLE"})
    completed_deliveries = deliveries_collection.count_documents({"status": "DELIVERED"})

    return {
        "totalDonations": total_donations,
        "totalMealsRescued": total_meals_rescued,
        "availableCount": available_count,
        "claimedCount": claimed_count,
        "deliveredCount": delivered_count,
        "activeNgos": active_ngos,
        "activeVolunteers": active_volunteers,
        "completedDeliveries": completed_deliveries,
    }
