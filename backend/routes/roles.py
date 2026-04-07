"""Roles & Permissions."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

from shared import db

router = APIRouter(prefix="/api")

ROLE_PERMISSIONS = {
    "super_admin": ["*"],
    "admin_client": ["reservations.*", "assets.read", "assets.edit", "users.read", "users.edit", "reports.*", "notifications.*", "planning.*", "zones.read"],
    "manager": ["reservations.*", "assets.read", "users.read", "reports.read", "notifications.*", "planning.*", "zones.read"],
    "terrain": ["reservations.read", "reservations.create", "reservations.checkout", "reservations.checkin", "assets.read", "notifications.read", "planning.read"],
}

class RoleAssign(BaseModel):
    user_id: str
    user_name: str
    role: str


@router.get("/roles")
async def list_roles():
    return {"roles": list(ROLE_PERMISSIONS.keys()), "permissions": ROLE_PERMISSIONS}

@router.get("/roles/users")
async def list_user_roles():
    users = await db.user_roles.find({}, {"_id": 0}).to_list(200)
    return users

@router.post("/roles/assign")
async def assign_role(data: RoleAssign):
    if data.role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Choix: {list(ROLE_PERMISSIONS.keys())}")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": data.user_id, "user_name": data.user_name, "role": data.role,
        "permissions": ROLE_PERMISSIONS[data.role],
        "assigned_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.user_roles.update_one({"user_id": data.user_id}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc

@router.get("/roles/check/{user_id}/{permission}")
async def check_permission(user_id: str, permission: str):
    user_role = await db.user_roles.find_one({"user_id": user_id}, {"_id": 0})
    if not user_role:
        return {"allowed": False, "reason": "Aucun rôle attribué"}
    perms = user_role.get("permissions", [])
    if "*" in perms:
        return {"allowed": True, "role": user_role["role"]}
    for p in perms:
        if p == permission or (p.endswith(".*") and permission.startswith(p[:-2])):
            return {"allowed": True, "role": user_role["role"]}
    return {"allowed": False, "role": user_role["role"], "reason": "Permission insuffisante"}
