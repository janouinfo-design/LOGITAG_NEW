"""Maintenance Records."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from shared import db, create_notification

router = APIRouter(prefix="/api")


class MaintenanceCreate(BaseModel):
    asset_id: str
    asset_name: str
    type: str = "preventive"
    description: Optional[str] = None
    start_date: str
    end_date: str
    technician: Optional[str] = None


@router.post("/maintenance")
async def create_maintenance(data: MaintenanceCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "asset_id": data.asset_id, "asset_name": data.asset_name,
        "type": data.type, "description": data.description,
        "start_date": data.start_date, "end_date": data.end_date,
        "technician": data.technician, "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.maintenance_records.insert_one(doc)
    doc.pop("_id", None)
    await create_notification("maintenance", "Maintenance planifiée",
        f"{data.asset_name} en maintenance du {data.start_date[:10]} au {data.end_date[:10]}", None, data.asset_id, "warning")
    return doc

@router.get("/maintenance")
async def list_maintenance(asset_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if asset_id: query["asset_id"] = asset_id
    if status: query["status"] = status
    records = await db.maintenance_records.find(query, {"_id": 0}).sort("start_date", -1).to_list(200)
    return records

@router.put("/maintenance/{maint_id}/complete")
async def complete_maintenance(maint_id: str):
    await db.maintenance_records.update_one({"id": maint_id}, {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": "completed"}
