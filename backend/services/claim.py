"""
services/claim.py
------------------
Atomic claiming logic. This is the piece that prevents two NGOs from both
successfully claiming the same donation.

We do NOT read the food, check its status in Python, then write -- that
"check-then-update" pattern has a race condition window between the check
and the write. Instead we do it in a single atomic MongoDB operation:
"only update this document if its status is still AVAILABLE".
"""

from pymongo import ReturnDocument
from database import food_collection


def try_claim_food(food_id, ngo_id):
    """
    Attempt to atomically claim a food donation.

    Returns the UPDATED food document if the claim succeeded, or None if it
    failed (either the food doesn't exist, or someone already claimed it).
    """
    updated = food_collection.find_one_and_update(
        {"_id": food_id, "status": "AVAILABLE"},
        {"$set": {"status": "CLAIMED", "claimedByNgoId": ngo_id}},
        return_document=ReturnDocument.AFTER,
    )
    return updated
