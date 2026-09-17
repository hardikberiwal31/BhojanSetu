"""
services/distance.py
---------------------
Simple great-circle distance between two lat/lng points using the
Haversine formula. No external maps/routing APIs needed.
"""

from math import radians, sin, cos, sqrt, atan2

EARTH_RADIUS_KM = 6371


def haversine_km(loc1: dict, loc2: dict) -> float:
    """
    loc1, loc2: {"lat": float, "lng": float}
    Returns straight-line distance in kilometers, rounded to 2 decimals.
    """
    lat1, lng1 = radians(loc1["lat"]), radians(loc1["lng"])
    lat2, lng2 = radians(loc2["lat"]), radians(loc2["lng"])

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(EARTH_RADIUS_KM * c, 2)
