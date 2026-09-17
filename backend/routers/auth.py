"""
routers/auth.py
-----------------
Two small endpoints that support the frontend's demo login screen.
Neither one is "real" authentication (no passwords, no tokens) -- they
exist purely so the frontend can (a) let someone pick a demo account by
name instead of pasting a raw Mongo id, and (b) validate that id before
starting a session.

NOTE: these two endpoints are intentionally NOT behind X-User-Id, because
their entire purpose is to run *before* the user has an id to send.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel

from database import users_collection, providers_collection, ngos_collection, volunteers_collection

router = APIRouter(prefix="/api/auth", tags=["auth"])

ROLE_COLLECTIONS = {
    "provider": providers_collection,
    "ngo": ngos_collection,
    "volunteer": volunteers_collection,
}


@router.get("/demo-accounts")
def list_demo_accounts():
    """
    All seeded users, grouped by role, so the login screen can show a
    friendly picker ("Hope Foundation", "Ravi Kumar", ...) instead of
    asking someone to type a Mongo id from memory.
    """
    accounts = []
    for user in users_collection.find({}):
        accounts.append({
            "userId": str(user["_id"]),
            "role": user["role"],
            "name": user["name"],
        })
    # Stable ordering: providers, then ngos, then volunteers, each alphabetical.
    role_order = {"provider": 0, "ngo": 1, "volunteer": 2}
    accounts.sort(key=lambda a: (role_order.get(a["role"], 99), a["name"]))
    return accounts


class DemoLoginRequest(BaseModel):
    userId: str
    role: Optional[str] = None  # optional hint from the UI; DB role always wins


@router.post("/demo-login")
def demo_login(payload: DemoLoginRequest):
    """
    Validate a demo user id and return their actual role + name.
    The frontend merges this response into its session, so the role
    returned here (from the database) is authoritative -- it overrides
    whatever role the login form happened to have selected.
    """
    try:
        user_oid = ObjectId(payload.userId)
    except InvalidId:
        raise HTTPException(400, "That doesn't look like a valid demo user id")

    user = users_collection.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(401, "Unknown demo user id — run seed.py or pick an account from the list")

    role = user["role"]
    role_collection = ROLE_COLLECTIONS.get(role)
    profile = role_collection.find_one({"userId": user_oid}) if role_collection is not None else None
    if not profile:
        raise HTTPException(401, f"No {role} profile exists for this user")

    return {
        "userId": str(user["_id"]),
        "role": role,
        "name": user["name"],
    }
