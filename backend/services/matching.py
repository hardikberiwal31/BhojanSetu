"""
services/matching.py
---------------------
The core matching engine. Deterministic, explainable, no ML.

Given one food donation and one NGO, compute:
- a 0-100 matchScore
- the individual factor scores that produced it
- human-readable reasons, so the frontend can explain "why this match"
"""

from services.distance import haversine_km
from services.urgency import compute_urgency
from config import (
    WEIGHT_DISTANCE,
    WEIGHT_QUANTITY,
    WEIGHT_URGENCY,
    WEIGHT_FOOD_COMPAT,
    DISTANCE_PENALTY_PER_KM,
)

URGENCY_SCORE_MAP = {
    "CRITICAL": 100,
    "HIGH": 75,
    "MEDIUM": 50,
    "LOW": 25,
}


def _distance_label(distance_km: float) -> str:
    if distance_km < 2:
        return "Very close"
    if distance_km < 5:
        return "Close"
    if distance_km < 10:
        return "Moderate"
    return "Far"


def _quantity_label(quantity_score: float) -> str:
    if quantity_score >= 90:
        return "Excellent fit"
    if quantity_score >= 60:
        return "Good fit"
    if quantity_score >= 30:
        return "Fair fit"
    return "Poor fit"


def _food_compat_label(food_compat_score: float) -> str:
    return "Compatible" if food_compat_score == 100 else "Not compatible"


def _urgency_label_text(urgency_label: str) -> str:
    # Same CRITICAL/HIGH/MEDIUM/LOW vocabulary as the top-level `urgency`
    # field, just title-cased for the matchFactors text-label group
    # (distance/quantity/foodCompatibility already have one; urgency didn't).
    return urgency_label.title()


def compute_match(food: dict, ngo: dict) -> dict:
    """
    food: a food_donations document
    ngo: an ngos document
    Returns a dict with matchScore, matchFactors, matchReasons, plus the
    raw distance/urgency numbers (useful for the frontend to display directly).
    """
    # --- Distance factor ---
    distance_km = haversine_km(food["location"], ngo["location"])
    distance_score = max(0.0, 100 - distance_km * DISTANCE_PENALTY_PER_KM)

    # --- Quantity factor ---
    capacity = ngo.get("capacity", 0)
    quantity = food.get("quantity", 0)
    if capacity <= 0:
        quantity_score = 0.0
    elif quantity <= capacity:
        quantity_score = 100.0
    else:
        excess_pct = ((quantity - capacity) / capacity) * 100
        quantity_score = max(0.0, 100 - excess_pct)

    # --- Urgency factor ---
    remaining_minutes, urgency_label = compute_urgency(food["expiresAt"])
    urgency_score = URGENCY_SCORE_MAP[urgency_label]

    # --- Food type compatibility factor ---
    food_type = food.get("foodType")
    preferences = ngo.get("foodPreferences", [])
    food_compat_score = 100.0 if food_type in preferences else 0.0

    # --- Weighted total ---
    match_score = (
        distance_score * WEIGHT_DISTANCE
        + quantity_score * WEIGHT_QUANTITY
        + urgency_score * WEIGHT_URGENCY
        + food_compat_score * WEIGHT_FOOD_COMPAT
    )
    match_score = round(min(100.0, max(0.0, match_score)), 1)

    # --- Human-readable explanation ---
    reasons = []
    if distance_km < 2:
        reasons.append("Very close distance")
    elif distance_km < 5:
        reasons.append("Reasonably close distance")
    else:
        reasons.append("Far from this NGO")

    if quantity_score == 100:
        reasons.append("Quantity fits NGO capacity")
    elif quantity_score < 50:
        reasons.append("Quantity may exceed NGO capacity")

    if food_compat_score == 100:
        reasons.append("Compatible food type")
    else:
        reasons.append("Food type not a preferred match for this NGO")

    if urgency_label in ("HIGH", "CRITICAL"):
        reasons.append("Urgent rescue needed")

    return {
        "matchScore": match_score,
        "matchFactors": {
            # Numeric factors (0-100) -- the source-of-truth explainability data.
            "distanceScore": round(distance_score, 1),
            "quantityScore": round(quantity_score, 1),
            "urgencyScore": urgency_score,
            "foodCompatibilityScore": food_compat_score,
            # Short human-readable labels for the same factors -- purely
            # cosmetic, for frontend chips that display text instead of numbers.
            "distance": _distance_label(distance_km),
            "quantity": _quantity_label(quantity_score),
            "foodCompatibility": _food_compat_label(food_compat_score),
            "urgency": _urgency_label_text(urgency_label),
        },
        "matchReasons": reasons,
        "distanceKm": distance_km,
        "remainingMinutes": remaining_minutes,
        "urgency": urgency_label,
    }
