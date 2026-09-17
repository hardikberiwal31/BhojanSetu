"""
services/urgency.py
--------------------
Urgency is always derived live from (expiresAt - now). It is never stored
as a static field on a food donation, so it's always accurate.
"""

from datetime import datetime
from utils import now_utc
from config import URGENCY_CRITICAL_MAX, URGENCY_HIGH_MAX, URGENCY_MEDIUM_MAX


def compute_urgency(expires_at: datetime):
    """
    Returns (remaining_minutes: int, urgency_label: str).
    remaining_minutes can be negative if the food has already expired.
    """
    remaining_minutes = round((expires_at - now_utc()).total_seconds() / 60)

    if remaining_minutes < URGENCY_CRITICAL_MAX:
        label = "CRITICAL"
    elif remaining_minutes < URGENCY_HIGH_MAX:
        label = "HIGH"
    elif remaining_minutes < URGENCY_MEDIUM_MAX:
        label = "MEDIUM"
    else:
        label = "LOW"

    return remaining_minutes, label
