from fastapi import FastAPI, APIRouter, Request, Response, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# External API base URL
EXTERNAL_API_URL = "https://omniyat.is-certified.com:82/logitag_node"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# HTTP client for proxying requests
http_client = httpx.AsyncClient(verify=False, timeout=60.0)


# ═══════════════════════════════════════════════════════════════
#  MODELS
# ═══════════════════════════════════════════════════════════════

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ── Reservation Models ──
class ReservationCreate(BaseModel):
    asset_id: str
    asset_name: str
    user_name: str
    team: Optional[str] = None
    project: Optional[str] = None
    site: Optional[str] = None
    site_id: Optional[str] = None
    start_date: str  # ISO string
    end_date: str
    note: Optional[str] = None
    priority: str = "normal"  # low, normal, high, urgent

class ReservationUpdate(BaseModel):
    user_name: Optional[str] = None
    team: Optional[str] = None
    project: Optional[str] = None
    site: Optional[str] = None
    site_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    note: Optional[str] = None
    priority: Optional[str] = None

class CheckOutData(BaseModel):
    user_name: str
    location: Optional[str] = None
    condition: str = "good"  # good, fair, damaged
    comment: Optional[str] = None

class CheckInData(BaseModel):
    user_name: str
    condition: str = "good"
    comment: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
#  HELPER: Create notification
# ═══════════════════════════════════════════════════════════════
async def create_notification(ntype: str, title: str, message: str, reservation_id: str = None, asset_id: str = None, severity: str = "info"):
    doc = {
        "id": str(uuid.uuid4()),
        "type": ntype,
        "title": title,
        "message": message,
        "reservation_id": reservation_id,
        "asset_id": asset_id,
        "severity": severity,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.notifications.insert_one(doc)
    return doc


# ═══════════════════════════════════════════════════════════════
#  BASIC ROUTES
# ═══════════════════════════════════════════════════════════════

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ═══════════════════════════════════════════════════════════════
#  RESERVATIONS CRUD
# ═══════════════════════════════════════════════════════════════

@api_router.post("/reservations")
async def create_reservation(data: ReservationCreate):
    # Anti-conflict check
    start = data.start_date
    end = data.end_date
    conflict = await db.reservations.find_one({
        "asset_id": data.asset_id,
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [
            {"start_date": {"$lt": end}, "end_date": {"$gt": start}},
        ]
    }, {"_id": 0})
    if conflict:
        raise HTTPException(status_code=409, detail=f"Conflit: cet asset est déjà réservé du {conflict['start_date'][:10]} au {conflict['end_date'][:10]} (Réservation #{conflict['id'][:8]})")

    # Check if asset is in maintenance
    maint = await db.maintenance_records.find_one({
        "asset_id": data.asset_id,
        "status": "active",
        "start_date": {"$lte": end},
        "end_date": {"$gte": start},
    }, {"_id": 0})
    if maint:
        raise HTTPException(status_code=409, detail="Cet asset est en maintenance pendant cette période.")

    reservation = {
        "id": str(uuid.uuid4()),
        "asset_id": data.asset_id,
        "asset_name": data.asset_name,
        "user_name": data.user_name,
        "team": data.team,
        "project": data.project,
        "site": data.site,
        "site_id": data.site_id,
        "start_date": start,
        "end_date": end,
        "note": data.note,
        "priority": data.priority,
        "status": "confirmed",
        "checkout_at": None,
        "checkout_by": None,
        "checkout_location": None,
        "checkout_condition": None,
        "checkout_comment": None,
        "checkin_at": None,
        "checkin_by": None,
        "checkin_condition": None,
        "checkin_comment": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reservations.insert_one(reservation)

    # Log
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()),
        "reservation_id": reservation["id"],
        "action": "created",
        "user": data.user_name,
        "details": f"Réservation créée pour {data.asset_name}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Notification
    await create_notification(
        "reservation_created", "Nouvelle réservation",
        f"{data.asset_name} réservé par {data.user_name} du {start[:10]} au {end[:10]}",
        reservation["id"], data.asset_id,
    )

    # Remove _id before returning
    reservation.pop("_id", None)
    return reservation


@api_router.get("/reservations")
async def list_reservations(
    status: Optional[str] = None,
    asset_id: Optional[str] = None,
    user_name: Optional[str] = None,
    site: Optional[str] = None,
    start_from: Optional[str] = None,
    start_to: Optional[str] = None,
):
    query = {}
    if status:
        query["status"] = status
    if asset_id:
        query["asset_id"] = asset_id
    if user_name:
        query["user_name"] = user_name
    if site:
        query["site"] = site
    if start_from:
        query["start_date"] = {"$gte": start_from}
    if start_to:
        if "start_date" in query:
            query["start_date"]["$lte"] = start_to
        else:
            query["start_date"] = {"$lte": start_to}

    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", -1).to_list(500)
    return reservations


@api_router.get("/reservations/planning")
async def get_planning(
    view: str = "month",
    start: Optional[str] = None,
    end: Optional[str] = None,
):
    query = {"status": {"$in": ["confirmed", "in_progress", "requested"]}}
    if start and end:
        query["$or"] = [
            {"start_date": {"$lt": end}, "end_date": {"$gt": start}},
        ]
    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", 1).to_list(1000)
    return reservations


@api_router.get("/reservations/kpis")
async def get_reservation_kpis():
    now = datetime.now(timezone.utc).isoformat()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()
    today_end = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59).isoformat()

    total = await db.reservations.count_documents({})
    active = await db.reservations.count_documents({"status": "in_progress"})
    confirmed = await db.reservations.count_documents({"status": "confirmed"})
    today_res = await db.reservations.count_documents({
        "start_date": {"$lte": today_end},
        "end_date": {"$gte": today_start},
        "status": {"$in": ["confirmed", "in_progress"]},
    })
    overdue = await db.reservations.count_documents({
        "status": "in_progress",
        "end_date": {"$lt": now},
    })
    completed = await db.reservations.count_documents({"status": "completed"})
    cancelled = await db.reservations.count_documents({"status": "cancelled"})
    unread_notif = await db.notifications.count_documents({"read": False})

    # Top assets
    pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "in_progress", "completed"]}}},
        {"$group": {"_id": "$asset_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_assets = await db.reservations.aggregate(pipeline).to_list(5)

    return {
        "total": total,
        "active": active,
        "confirmed": confirmed,
        "today": today_res,
        "overdue": overdue,
        "completed": completed,
        "cancelled": cancelled,
        "unread_notifications": unread_notif,
        "top_assets": [{"name": a["_id"], "count": a["count"]} for a in top_assets],
    }


@api_router.get("/reservations/availability/{asset_id}")
async def check_availability(asset_id: str, start: str, end: str):
    conflict = await db.reservations.find_one({
        "asset_id": asset_id,
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [
            {"start_date": {"$lt": end}, "end_date": {"$gt": start}},
        ]
    }, {"_id": 0})
    maint = await db.maintenance_records.find_one({
        "asset_id": asset_id,
        "status": "active",
        "start_date": {"$lte": end},
        "end_date": {"$gte": start},
    }, {"_id": 0})
    available = conflict is None and maint is None
    return {
        "available": available,
        "conflict": conflict,
        "maintenance": maint is not None,
    }


@api_router.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    logs = await db.reservation_logs.find({"reservation_id": reservation_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    res["logs"] = logs
    return res


@api_router.put("/reservations/{reservation_id}")
async def update_reservation(reservation_id: str, data: ReservationUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    # Anti-conflict on date change
    if "start_date" in update_data or "end_date" in update_data:
        current = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
        if current:
            new_start = update_data.get("start_date", current["start_date"])
            new_end = update_data.get("end_date", current["end_date"])
            conflict = await db.reservations.find_one({
                "asset_id": current["asset_id"],
                "id": {"$ne": reservation_id},
                "status": {"$in": ["requested", "confirmed", "in_progress"]},
                "$or": [{"start_date": {"$lt": new_end}, "end_date": {"$gt": new_start}}],
            }, {"_id": 0})
            if conflict:
                raise HTTPException(status_code=409, detail="Conflit de dates avec une autre réservation.")

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": update_data})

    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()),
        "reservation_id": reservation_id,
        "action": "updated",
        "user": update_data.get("user_name", "system"),
        "details": f"Champs modifiés: {', '.join(update_data.keys())}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    return updated


@api_router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Impossible d'annuler cette réservation.")

    await db.reservations.update_one({"id": reservation_id}, {
        "$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}
    })
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "cancelled", "user": "admin",
        "details": "Réservation annulée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await create_notification("reservation_cancelled", "Réservation annulée",
        f"La réservation de {res['asset_name']} a été annulée.", reservation_id, res["asset_id"], "warning")
    return {"status": "cancelled"}


@api_router.post("/reservations/{reservation_id}/approve")
async def approve_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    await db.reservations.update_one({"id": reservation_id}, {
        "$set": {"status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}
    })
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "approved", "user": "admin",
        "details": "Réservation approuvée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"status": "confirmed"}


@api_router.post("/reservations/{reservation_id}/reject")
async def reject_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    await db.reservations.update_one({"id": reservation_id}, {
        "$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc).isoformat()}
    })
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "rejected", "user": "admin",
        "details": "Réservation rejetée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await create_notification("reservation_rejected", "Réservation rejetée",
        f"La réservation de {res['asset_name']} a été rejetée.", reservation_id, res["asset_id"], "error")
    return {"status": "rejected"}


# ═══════════════════════════════════════════════════════════════
#  CHECK-OUT / CHECK-IN
# ═══════════════════════════════════════════════════════════════

@api_router.post("/reservations/{reservation_id}/checkout")
async def checkout_reservation(reservation_id: str, data: CheckOutData):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] not in ["confirmed"]:
        raise HTTPException(status_code=400, detail="Seules les réservations confirmées peuvent être sorties.")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "status": "in_progress",
        "checkout_at": now_iso,
        "checkout_by": data.user_name,
        "checkout_location": data.location,
        "checkout_condition": data.condition,
        "checkout_comment": data.comment,
        "updated_at": now_iso,
    }})

    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "checked_out", "user": data.user_name,
        "details": f"Asset sorti. État: {data.condition}. Lieu: {data.location or 'N/A'}",
        "created_at": now_iso,
    })
    await create_notification("checkout", "Check-out effectué",
        f"{res['asset_name']} sorti par {data.user_name}", reservation_id, res["asset_id"])

    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    return updated


@api_router.post("/reservations/{reservation_id}/checkin")
async def checkin_reservation(reservation_id: str, data: CheckInData):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Seuls les assets en cours peuvent être retournés.")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "status": "completed",
        "checkin_at": now_iso,
        "checkin_by": data.user_name,
        "checkin_condition": data.condition,
        "checkin_comment": data.comment,
        "updated_at": now_iso,
    }})

    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "checked_in", "user": data.user_name,
        "details": f"Asset retourné. État: {data.condition}",
        "created_at": now_iso,
    })
    await create_notification("checkin", "Check-in effectué",
        f"{res['asset_name']} retourné par {data.user_name}", reservation_id, res["asset_id"])

    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    return updated


# ═══════════════════════════════════════════════════════════════
#  NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/notifications")
async def list_notifications(unread_only: bool = False):
    query = {"read": False} if unread_only else {}
    notifs = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return notifs

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"status": "ok"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read():
    await db.notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"status": "ok"}

@api_router.get("/notifications/count")
async def notification_count():
    count = await db.notifications.count_documents({"read": False})
    return {"count": count}


# ═══════════════════════════════════════════════════════════════
#  SEED DATA
# ═══════════════════════════════════════════════════════════════

@api_router.post("/reservations/seed")
async def seed_reservations():
    """Seed sample reservations for testing"""
    existing = await db.reservations.count_documents({})
    if existing > 0:
        return {"message": f"Already have {existing} reservations, skipping seed."}

    now = datetime.now(timezone.utc)
    sample_assets = [
        ("asset-001", "DA-PC"), ("asset-002", "Antenne001 PC"), ("asset-003", "BadgeRN"),
        ("asset-004", "Chariot Elev. #12"), ("asset-005", "Grue Mobile T4"),
        ("asset-006", "Compacteur C200"), ("asset-007", "Nacelle N15"),
        ("asset-008", "Group Electro G7"),
    ]
    sample_sites = ["Dépôt Central", "Chantier Nord", "Zone Est", "Entrepôt Sud", "Site Alpha"]
    sample_users = ["Ahmed B.", "Sophie M.", "Omar K.", "Fatima Z.", "Karim L."]
    sample_teams = ["Équipe A", "Équipe B", "Équipe C", "Maintenance"]
    sample_projects = ["Projet Alpha", "Chantier Rénovation", "Installation ERP", "Inventaire Q1"]
    statuses = ["confirmed", "in_progress", "completed", "cancelled"]

    reservations = []
    for i in range(20):
        asset = sample_assets[i % len(sample_assets)]
        delta_start = timedelta(days=i - 10, hours=(i * 3) % 12)
        delta_end = delta_start + timedelta(hours=4 + (i % 8) * 2)
        status = statuses[i % len(statuses)]
        r = {
            "id": str(uuid.uuid4()),
            "asset_id": asset[0],
            "asset_name": asset[1],
            "user_name": sample_users[i % len(sample_users)],
            "team": sample_teams[i % len(sample_teams)],
            "project": sample_projects[i % len(sample_projects)],
            "site": sample_sites[i % len(sample_sites)],
            "site_id": None,
            "start_date": (now + delta_start).isoformat(),
            "end_date": (now + delta_end).isoformat(),
            "note": f"Réservation test #{i+1}" if i % 3 == 0 else None,
            "priority": ["low", "normal", "high", "urgent"][i % 4],
            "status": status,
            "checkout_at": (now + delta_start + timedelta(minutes=15)).isoformat() if status in ["in_progress", "completed"] else None,
            "checkout_by": sample_users[i % len(sample_users)] if status in ["in_progress", "completed"] else None,
            "checkout_location": sample_sites[i % len(sample_sites)] if status in ["in_progress", "completed"] else None,
            "checkout_condition": "good" if status in ["in_progress", "completed"] else None,
            "checkout_comment": None,
            "checkin_at": (now + delta_end - timedelta(minutes=10)).isoformat() if status == "completed" else None,
            "checkin_by": sample_users[i % len(sample_users)] if status == "completed" else None,
            "checkin_condition": ["good", "fair"][i % 2] if status == "completed" else None,
            "checkin_comment": None,
            "created_at": (now + delta_start - timedelta(days=1)).isoformat(),
            "updated_at": (now + delta_start).isoformat(),
        }
        reservations.append(r)

    await db.reservations.insert_many(reservations)

    # Sample notifications
    notifs = [
        {"id": str(uuid.uuid4()), "type": "overdue", "title": "Asset en retard", "message": "Chariot Elev. #12 devait être retourné il y a 2h", "reservation_id": reservations[3]["id"], "asset_id": "asset-004", "severity": "error", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "due_soon", "title": "Retour imminent", "message": "Grue Mobile T4 à retourner dans 1h", "reservation_id": reservations[4]["id"], "asset_id": "asset-005", "severity": "warning", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "checkout", "title": "Check-out effectué", "message": "Nacelle N15 sortie par Omar K.", "reservation_id": reservations[6]["id"], "asset_id": "asset-007", "severity": "info", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "reservation_created", "title": "Nouvelle réservation", "message": "Group Electro G7 réservé par Fatima Z.", "reservation_id": reservations[7]["id"], "asset_id": "asset-008", "severity": "info", "read": True, "created_at": (now - timedelta(hours=2)).isoformat()},
    ]
    await db.notifications.insert_many(notifs)

    return {"message": f"Seeded {len(reservations)} reservations and {len(notifs)} notifications."}


# Include the router in the main app
app.include_router(api_router)

# ── Proxy route: forwards all /api/proxy/* requests to external API ──
@app.api_route("/api/proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
async def proxy_external_api(path: str, request: Request):
    target_url = f"{EXTERNAL_API_URL}/{path}"
    if request.query_params:
        target_url += f"?{request.query_params}"
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ('host', 'origin', 'referer', 'connection', 'transfer-encoding'):
            headers[key] = value
    body = await request.body()
    try:
        response = await http_client.request(method=request.method, url=target_url, headers=headers, content=body)
        resp_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ('content-encoding', 'content-length', 'transfer-encoding', 'connection',
                                    'access-control-allow-origin', 'access-control-allow-credentials',
                                    'access-control-allow-methods', 'access-control-allow-headers'):
                resp_headers[key] = value
        return Response(content=response.content, status_code=response.status_code, headers=resp_headers, media_type=response.headers.get('content-type', 'application/json'))
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        return Response(content=f'{{"error": "{str(e)}"}}', status_code=502, media_type="application/json")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
