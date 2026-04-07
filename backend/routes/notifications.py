"""Notifications: CRUD and counts."""
from fastapi import APIRouter

from shared import db

router = APIRouter(prefix="/api")


@router.get("/notifications")
async def list_notifications(unread_only: bool = False):
    query = {"read": False} if unread_only else {}
    notifs = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return notifs

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"status": "ok"}

@router.put("/notifications/read-all")
async def mark_all_notifications_read():
    await db.notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"status": "ok"}

@router.get("/notifications/count")
async def notification_count():
    count = await db.notifications.count_documents({"read": False})
    return {"count": count}
