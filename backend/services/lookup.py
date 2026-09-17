"""
services/lookup.py
--------------------
Small helpers for resolving a provider/ngo/volunteer document by id and
turning it into a human-readable label. Used wherever a response needs to
show a *name* instead of a raw ObjectId (e.g. "which NGO claimed this",
"who's delivering this") -- the frontend renders these directly, so they
must be readable strings, not ids.
"""

from database import providers_collection, ngos_collection, volunteers_collection


def get_provider(provider_id):
    if not provider_id:
        return None
    return providers_collection.find_one({"_id": provider_id})


def get_ngo(ngo_id):
    if not ngo_id:
        return None
    return ngos_collection.find_one({"_id": ngo_id})


def get_volunteer(volunteer_id):
    if not volunteer_id:
        return None
    return volunteers_collection.find_one({"_id": volunteer_id})


def location_label(doc):
    """
    Human-readable label for a provider or NGO, e.g. "Hotel Meridian, Vellore Town".
    Falls back gracefully if the document or its area is missing.
    """
    if not doc:
        return "Unknown location"
    name = doc.get("name", "Unknown")
    area = doc.get("area")
    return f"{name}, {area}" if area else name
