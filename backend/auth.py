"""
auth.py
-------
Minimal demo authentication, exactly as specified: every protected request
sends a header:

    X-User-Id: <mongo _id of a users document>

We look up that user's role in MongoDB and load their role-specific profile
(provider / ngo / volunteer document). No passwords, tokens, or sessions.

Routers use `require_role("provider")` etc. as a FastAPI dependency to both
authenticate AND authorize a request in one step.
"""

from fastapi import Header, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from database import (
    users_collection,
    providers_collection,
    ngos_collection,
    volunteers_collection,
)

ROLE_COLLECTIONS = {
    "provider": providers_collection,
    "ngo": ngos_collection,
    "volunteer": volunteers_collection,
}


def get_current_user(x_user_id: str = Header(..., alias="X-User-Id")):
    """
    Resolve the X-User-Id header into:
        { "user_id": ObjectId, "role": str, "user": dict, "profile": dict }
    `profile` is the matching providers/ngos/volunteers document.
    """
    try:
        user_oid = ObjectId(x_user_id)
    except InvalidId:
        raise HTTPException(status_code=401, detail="Invalid X-User-Id header")

    user = users_collection.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(status_code=401, detail="Unknown X-User-Id")

    role = user.get("role")
    role_collection = ROLE_COLLECTIONS.get(role)
    if role_collection is None:
        raise HTTPException(status_code=401, detail=f"User has an invalid role: {role}")

    profile = role_collection.find_one({"userId": user_oid})
    if not profile:
        raise HTTPException(
            status_code=401,
            detail=f"No {role} profile exists for this user",
        )

    return {"user_id": user_oid, "role": role, "user": user, "profile": profile}


def require_role(required_role: str):
    """
    Dependency factory: use as Depends(require_role("provider")) on a route
    to require that the caller is authenticated AND has that exact role.
    """

    def role_checker(current=Depends(get_current_user)):
        if current["role"] != required_role:
            raise HTTPException(
                status_code=403,
                detail=f"This action requires role '{required_role}', "
                       f"but this user is '{current['role']}'",
            )
        return current

    return role_checker
