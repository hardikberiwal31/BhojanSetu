"""
utils.py
--------
Small shared helpers used across routers and services.

Time convention: we store ALL datetimes in MongoDB as naive UTC
(i.e. no timezone attached, but always meaning UTC). This avoids the
common beginner bugs that come from mixing naive and timezone-aware
datetimes when comparing "expiresAt" against "now".
"""

from datetime import datetime, timezone
from bson import ObjectId


def now_utc() -> datetime:
    """Current time, naive UTC. Use this everywhere instead of datetime.now()."""
    return datetime.utcnow()


def to_naive_utc(dt: datetime) -> datetime:
    """
    Normalize any incoming datetime (naive or timezone-aware) into naive UTC,
    so it can be safely compared/stored alongside everything else.
    """
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def _serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return serialize_doc(value)
    if isinstance(value, list):
        return [_serialize_value(v) for v in value]
    return value


def serialize_doc(doc):
    """
    Convert a raw MongoDB document into a JSON-safe dict:
    - ObjectId fields become strings
    - "_id" is renamed to "id" (cleaner for frontend consumption)
    - nested dicts/lists are handled recursively
    Datetimes are left as-is; FastAPI serializes them to ISO strings
    automatically when returning a dict from a route.
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        out_key = "id" if key == "_id" else key
        result[out_key] = _serialize_value(value)
    return result
