from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Set
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
    address: Optional[str] = None
    address_lat: Optional[float] = None
    address_lng: Optional[float] = None
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
    address: Optional[str] = None
    address_lat: Optional[float] = None
    address_lng: Optional[float] = None
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

class DragDropUpdate(BaseModel):
    start_date: str
    end_date: str


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
    doc.pop("_id", None)
    # Broadcast via WebSocket
    await ws_manager.broadcast("notification", {"notification": doc, "event": ntype})
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
#  ZONES ADVANCED GEOFENCING
# ═══════════════════════════════════════════════════════════════

class ZoneCreate(BaseModel):
    name: str
    type: str = "chantier"           # chantier, depot, restricted, parking
    shape: str = "circle"            # circle, polygon, ble
    mode: str = "both"               # entry, exit, both
    color: str = "#2563EB"
    center: Optional[List[float]] = None
    radius: Optional[int] = None
    polygon: Optional[List[List[float]]] = None
    alertEntry: bool = False
    alertExit: bool = False
    active: bool = True
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    router_id: Optional[str] = None
    router_name: Optional[str] = None
    rssi_threshold: Optional[int] = -70    # dBm threshold for BLE
    debounce_seconds: int = 15             # anti-noise delay
    rssi_smoothing: int = 3                # number of readings to average

class ZoneUpdate(ZoneCreate):
    pass


@api_router.post("/zones")
async def create_zone(data: ZoneCreate):
    zone = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "assetsCount": 0,
        "lastActivity": "—",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zones.insert_one(zone)
    zone.pop("_id", None)
    await ws_manager.broadcast("zone_created", zone)
    return zone


@api_router.get("/zones")
async def list_zones():
    zones = await db.zones.find({}, {"_id": 0}).to_list(500)
    return zones


# ── Static zone sub-routes MUST come BEFORE /zones/{zone_id} ──

# ── Zone Events ──

class ZoneEventCreate(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    zone_id: str
    zone_name: Optional[str] = None
    router_id: Optional[str] = None
    event_type: str
    signal_strength: Optional[int] = None
    location: Optional[List[float]] = None
    metadata: Optional[dict] = None


@api_router.post("/zones/events")
async def create_zone_event(data: ZoneEventCreate):
    event = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.zone_events.insert_one(event)
    event.pop("_id", None)
    await ws_manager.broadcast("zone_event", event)
    if data.event_type in ("asset_enter_zone", "asset_exit_zone", "asset_not_detected"):
        severity = "warning" if data.event_type == "asset_not_detected" else "info"
        labels = {"asset_enter_zone": "Entrée zone", "asset_exit_zone": "Sortie zone", "asset_not_detected": "Asset non détecté"}
        await create_notification(
            data.event_type, labels.get(data.event_type, data.event_type),
            f"{data.asset_name or data.asset_id} - {data.zone_name or data.zone_id}",
            asset_id=data.asset_id, severity=severity
        )
    return event


@api_router.get("/zones/events")
async def list_zone_events(zone_id: Optional[str] = None, asset_id: Optional[str] = None, event_type: Optional[str] = None, limit: int = 100):
    query = {}
    if zone_id:
        query["zone_id"] = zone_id
    if asset_id:
        query["asset_id"] = asset_id
    if event_type:
        query["event_type"] = event_type
    events = await db.zone_events.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return events


@api_router.get("/zones/events/stats")
async def zone_events_stats():
    total = await db.zone_events.count_documents({})
    entries = await db.zone_events.count_documents({"event_type": "asset_enter_zone"})
    exits = await db.zone_events.count_documents({"event_type": "asset_exit_zone"})
    not_detected = await db.zone_events.count_documents({"event_type": "asset_not_detected"})
    ble_detected = await db.zone_events.count_documents({"event_type": "asset_detected_by_router"})
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent = await db.zone_events.count_documents({"timestamp": {"$gte": cutoff}})
    pipeline = [
        {"$group": {"_id": "$zone_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    active_zones = await db.zone_events.aggregate(pipeline).to_list(5)
    return {
        "total_events": total, "entries": entries, "exits": exits,
        "not_detected": not_detected, "ble_detected": ble_detected,
        "recent_24h": recent,
        "most_active_zones": [{"zone": z["_id"] or "Inconnu", "count": z["count"]} for z in active_zones],
    }


# ── Zone Detection (Anti-noise logic) ──

import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def point_in_polygon(lat, lng, polygon):
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        if ((polygon[i][0] > lat) != (polygon[j][0] > lat)) and \
           (lng < (polygon[j][1] - polygon[i][1]) * (lat - polygon[i][0]) / (polygon[j][0] - polygon[i][0]) + polygon[i][1]):
            inside = not inside
        j = i
    return inside


class DetectAssetRequest(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    router_id: Optional[str] = None
    rssi: Optional[int] = None


@api_router.post("/zones/detect")
async def detect_asset_in_zone(data: DetectAssetRequest):
    zones = await db.zones.find({"active": {"$ne": False}}, {"_id": 0}).to_list(500)
    results = []
    for zone in zones:
        in_zone = False
        method = "unknown"
        if zone.get("shape") == "ble" and data.router_id and data.rssi is not None:
            if zone.get("router_id") == data.router_id:
                threshold = zone.get("rssi_threshold", -70)
                smoothing = zone.get("rssi_smoothing", 3)
                recent_events = await db.zone_events.find(
                    {"asset_id": data.asset_id, "zone_id": zone["id"], "signal_strength": {"$ne": None}},
                    {"_id": 0, "signal_strength": 1}
                ).sort("timestamp", -1).to_list(smoothing)
                readings = [e["signal_strength"] for e in recent_events] + [data.rssi]
                avg_rssi = sum(readings) / len(readings)
                in_zone = avg_rssi >= threshold
                method = "ble"
        elif data.lat is not None and data.lng is not None:
            if zone.get("shape") == "circle" and zone.get("center"):
                dist = haversine_distance(data.lat, data.lng, zone["center"][0], zone["center"][1])
                in_zone = dist <= (zone.get("radius", 200))
                method = "gps_circle"
            elif zone.get("shape") == "polygon" and zone.get("polygon"):
                in_zone = point_in_polygon(data.lat, data.lng, zone["polygon"])
                method = "gps_polygon"
        if in_zone:
            results.append({"zone_id": zone["id"], "zone_name": zone["name"], "method": method, "in_zone": True})
    debounce_events = []
    for r in results:
        zone = next((z for z in zones if z["id"] == r["zone_id"]), None)
        debounce_sec = zone.get("debounce_seconds", 15) if zone else 15
        cutoff = (datetime.now(timezone.utc) - timedelta(seconds=debounce_sec)).isoformat()
        last_event = await db.zone_events.find_one(
            {"asset_id": data.asset_id, "zone_id": r["zone_id"], "timestamp": {"$gte": cutoff}}, {"_id": 0}
        )
        r["debounced"] = last_event is not None
        debounce_events.append(r)
    return {"asset_id": data.asset_id, "zones_detected": debounce_events, "total_zones_in": len([r for r in debounce_events if not r.get("debounced")])}


# ── Zone Alerts Configuration ──

class ZoneAlertCreate(BaseModel):
    zone_id: str
    zone_name: Optional[str] = None
    alert_type: str
    message_template: Optional[str] = None
    enabled: bool = True
    channels: List[str] = ["in_app"]
    cooldown_minutes: int = 5


@api_router.post("/zones/alerts")
async def create_zone_alert(data: ZoneAlertCreate):
    alert = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zone_alerts.insert_one(alert)
    alert.pop("_id", None)
    return alert


@api_router.get("/zones/alerts")
async def list_zone_alerts(zone_id: Optional[str] = None):
    query = {"zone_id": zone_id} if zone_id else {}
    alerts = await db.zone_alerts.find(query, {"_id": 0}).to_list(200)
    return alerts


@api_router.put("/zones/alerts/{alert_id}")
async def update_zone_alert(alert_id: str, data: ZoneAlertCreate):
    existing = await db.zone_alerts.find_one({"id": alert_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Alert not found")
    await db.zone_alerts.update_one({"id": alert_id}, {"$set": data.model_dump()})
    updated = await db.zone_alerts.find_one({"id": alert_id}, {"_id": 0})
    return updated


@api_router.delete("/zones/alerts/{alert_id}")
async def delete_zone_alert(alert_id: str):
    result = await db.zone_alerts.delete_one({"id": alert_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "deleted"}


# ── Trigger Zone Event (with alert checking) ──

class TriggerEventRequest(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    zone_id: str
    event_type: str
    router_id: Optional[str] = None
    signal_strength: Optional[int] = None
    location: Optional[List[float]] = None


@api_router.post("/zones/trigger")
async def trigger_zone_event(data: TriggerEventRequest):
    zone = await db.zones.find_one({"id": data.zone_id}, {"_id": 0})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    mode = zone.get("mode", "both")
    if mode == "entry" and data.event_type == "asset_exit_zone":
        return {"status": "skipped", "reason": "Zone mode is entry-only"}
    if mode == "exit" and data.event_type == "asset_enter_zone":
        return {"status": "skipped", "reason": "Zone mode is exit-only"}
    event = {
        "id": str(uuid.uuid4()),
        "asset_id": data.asset_id, "asset_name": data.asset_name,
        "zone_id": data.zone_id, "zone_name": zone.get("name"),
        "router_id": data.router_id, "event_type": data.event_type,
        "signal_strength": data.signal_strength, "location": data.location,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.zone_events.insert_one(event)
    event.pop("_id", None)
    alert_map = {"asset_enter_zone": "asset_enter", "asset_exit_zone": "asset_exit", "asset_not_detected": "asset_not_detected"}
    alert_type = alert_map.get(data.event_type)
    triggered_alerts = []
    if alert_type:
        alerts = await db.zone_alerts.find(
            {"zone_id": data.zone_id, "alert_type": alert_type, "enabled": True}, {"_id": 0}
        ).to_list(50)
        for alert in alerts:
            cooldown = alert.get("cooldown_minutes", 5)
            cutoff = (datetime.now(timezone.utc) - timedelta(minutes=cooldown)).isoformat()
            recent = await db.zone_events.count_documents({
                "zone_id": data.zone_id, "asset_id": data.asset_id,
                "event_type": data.event_type, "timestamp": {"$gte": cutoff}
            })
            if recent <= 1:
                msg = alert.get("message_template") or f"{data.asset_name or data.asset_id} - {zone['name']}"
                if "in_app" in alert.get("channels", []):
                    await create_notification(data.event_type, f"Alerte: {zone['name']}", msg, asset_id=data.asset_id, severity="warning")
                triggered_alerts.append(alert["id"])
    await ws_manager.broadcast("zone_event", event)
    return {"status": "triggered", "event": event, "alerts_triggered": len(triggered_alerts)}


# ── Parametric routes LAST ──

@api_router.get("/zones/{zone_id}")
async def get_zone(zone_id: str):
    zone = await db.zones.find_one({"id": zone_id}, {"_id": 0})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@api_router.put("/zones/{zone_id}")
async def update_zone(zone_id: str, data: ZoneUpdate):
    existing = await db.zones.find_one({"id": zone_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Zone not found")
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.zones.update_one({"id": zone_id}, {"$set": update_data})
    updated = await db.zones.find_one({"id": zone_id}, {"_id": 0})
    await ws_manager.broadcast("zone_updated", updated)
    return updated


@api_router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: str):
    result = await db.zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    await ws_manager.broadcast("zone_deleted", {"id": zone_id})
    return {"status": "deleted"}

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
        "address": data.address,
        "address_lat": data.address_lat,
        "address_lng": data.address_lng,
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
    await ws_manager.broadcast("reservation_created", reservation)
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


# ═══════════════════════════════════════════════════════════════
#  RESERVATION SMART ALERTS
# ═══════════════════════════════════════════════════════════════

@api_router.get("/reservations/alerts/rules")
async def get_alert_rules():
    rules = await db.reservation_alert_rules.find({}, {"_id": 0}).to_list(50)
    if not rules:
        # Seed defaults
        defaults = [
            {"id": str(uuid.uuid4()), "type": "overdue", "label": "Asset non retourné", "description": "Réservation terminée mais asset pas check-in", "enabled": True, "threshold_minutes": 0, "severity": "critical", "auto_notify": True},
            {"id": str(uuid.uuid4()), "type": "upcoming", "label": "Réservation imminente", "description": "Réservation commence bientôt", "enabled": True, "threshold_minutes": 60, "severity": "warning", "auto_notify": True},
            {"id": str(uuid.uuid4()), "type": "no_checkout", "label": "Check-out manquant", "description": "Réservation commencée sans check-out", "enabled": True, "threshold_minutes": 30, "severity": "warning", "auto_notify": True},
            {"id": str(uuid.uuid4()), "type": "long_usage", "label": "Utilisation prolongée", "description": "Asset utilisé au-delà de la durée prévue", "enabled": True, "threshold_minutes": 1440, "severity": "info", "auto_notify": False},
            {"id": str(uuid.uuid4()), "type": "low_battery_reserved", "label": "Batterie faible (réservé)", "description": "Asset réservé avec batterie < 20%", "enabled": True, "threshold_minutes": 0, "severity": "warning", "auto_notify": True},
        ]
        for d in defaults:
            d["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.reservation_alert_rules.insert_one(d)
        rules = defaults
    for r in rules:
        r.pop("_id", None)
    return rules

@api_router.put("/reservations/alerts/rules/{rule_id}")
async def update_alert_rule(rule_id: str, body: dict):
    allowed = {"enabled", "threshold_minutes", "severity", "auto_notify"}
    update = {k: v for k, v in body.items() if k in allowed}
    if not update:
        raise HTTPException(400, "Rien à modifier")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservation_alert_rules.update_one({"id": rule_id}, {"$set": update})
    return {"status": "updated"}

@api_router.post("/reservations/alerts/scan")
async def scan_reservation_alerts():
    """Scan all active reservations and generate smart alerts."""
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    rules = await db.reservation_alert_rules.find({"enabled": True}, {"_id": 0}).to_list(20)
    rule_map = {r["type"]: r for r in rules}
    alerts_generated = []

    active_reservations = await db.reservations.find(
        {"status": {"$in": ["confirmed", "in_progress"]}},
        {"_id": 0}
    ).to_list(500)

    for res in active_reservations:
        res_start = res.get("start_date", "")
        res_end = res.get("end_date", "")

        # ── OVERDUE: reservation ended but no check-in ──
        if "overdue" in rule_map and res_end < now_iso and res.get("status") == "in_progress" and not res.get("checkin_at"):
            threshold = rule_map["overdue"].get("threshold_minutes", 0)
            end_dt = datetime.fromisoformat(res_end.replace("Z", "+00:00")) if res_end else now
            overdue_min = (now - end_dt).total_seconds() / 60
            if overdue_min >= threshold:
                existing = await db.reservation_alerts.find_one({"reservation_id": res["id"], "type": "overdue", "resolved": False}, {"_id": 0})
                if not existing:
                    alert = {
                        "id": str(uuid.uuid4()), "type": "overdue",
                        "reservation_id": res["id"], "asset_id": res.get("asset_id"),
                        "asset_name": res.get("asset_name"), "user_name": res.get("user_name"),
                        "title": f"Asset non retourné: {res.get('asset_name', '')}",
                        "message": f"Réservation de {res.get('user_name', '')} terminée le {res_end[:16].replace('T',' ')} — asset pas encore retourné ({int(overdue_min)}min de retard)",
                        "severity": rule_map["overdue"]["severity"],
                        "overdue_minutes": int(overdue_min),
                        "resolved": False, "resolved_at": None,
                        "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["overdue"].get("auto_notify"):
                        await create_notification("reservation_overdue", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="critical")
                    alerts_generated.append(alert)

        # ── UPCOMING: reservation starts soon ──
        if "upcoming" in rule_map and res.get("status") == "confirmed" and res_start > now_iso:
            threshold = rule_map["upcoming"].get("threshold_minutes", 60)
            start_dt = datetime.fromisoformat(res_start.replace("Z", "+00:00")) if res_start else now
            min_until = (start_dt - now).total_seconds() / 60
            if 0 < min_until <= threshold:
                existing = await db.reservation_alerts.find_one({"reservation_id": res["id"], "type": "upcoming", "resolved": False}, {"_id": 0})
                if not existing:
                    alert = {
                        "id": str(uuid.uuid4()), "type": "upcoming",
                        "reservation_id": res["id"], "asset_id": res.get("asset_id"),
                        "asset_name": res.get("asset_name"), "user_name": res.get("user_name"),
                        "title": f"Réservation imminente: {res.get('asset_name', '')}",
                        "message": f"{res.get('user_name', '')} a réservé '{res.get('asset_name', '')}' — début dans {int(min_until)} min",
                        "severity": rule_map["upcoming"]["severity"],
                        "minutes_until": int(min_until),
                        "resolved": False, "resolved_at": None,
                        "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["upcoming"].get("auto_notify"):
                        await create_notification("reservation_upcoming", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="warning")
                    alerts_generated.append(alert)

        # ── NO_CHECKOUT: started but no checkout done ──
        if "no_checkout" in rule_map and res.get("status") == "confirmed" and res_start < now_iso and not res.get("checkout_at"):
            threshold = rule_map["no_checkout"].get("threshold_minutes", 30)
            start_dt = datetime.fromisoformat(res_start.replace("Z", "+00:00")) if res_start else now
            min_since = (now - start_dt).total_seconds() / 60
            if min_since >= threshold:
                existing = await db.reservation_alerts.find_one({"reservation_id": res["id"], "type": "no_checkout", "resolved": False}, {"_id": 0})
                if not existing:
                    alert = {
                        "id": str(uuid.uuid4()), "type": "no_checkout",
                        "reservation_id": res["id"], "asset_id": res.get("asset_id"),
                        "asset_name": res.get("asset_name"), "user_name": res.get("user_name"),
                        "title": f"Check-out manquant: {res.get('asset_name', '')}",
                        "message": f"Réservation de {res.get('user_name', '')} a commencé il y a {int(min_since)} min mais pas de check-out effectué",
                        "severity": rule_map["no_checkout"]["severity"],
                        "resolved": False, "resolved_at": None,
                        "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["no_checkout"].get("auto_notify"):
                        await create_notification("no_checkout", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="warning")
                    alerts_generated.append(alert)

    return {"scanned": len(active_reservations), "alerts_generated": len(alerts_generated), "alerts": alerts_generated}

@api_router.get("/reservations/alerts")
async def get_reservation_alerts(status: str = "active", limit: int = 50):
    query = {"resolved": False} if status == "active" else {}
    alerts = await db.reservation_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return alerts

@api_router.put("/reservations/alerts/{alert_id}/resolve")
async def resolve_reservation_alert(alert_id: str):
    result = await db.reservation_alerts.update_one(
        {"id": alert_id},
        {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Alerte non trouvée")
    return {"status": "resolved"}

@api_router.get("/reservations/alerts/stats")
async def get_reservation_alert_stats():
    total = await db.reservation_alerts.count_documents({"resolved": False})
    pipeline = [
        {"$match": {"resolved": False}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
    ]
    by_type = await db.reservation_alerts.aggregate(pipeline).to_list(10)
    severity_pipeline = [
        {"$match": {"resolved": False}},
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
    ]
    by_severity = await db.reservation_alerts.aggregate(severity_pipeline).to_list(10)
    return {
        "total_active": total,
        "by_type": {t["_id"]: t["count"] for t in by_type},
        "by_severity": {s["_id"]: s["count"] for s in by_severity},
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


@api_router.put("/reservations/{reservation_id}/drag")
async def drag_drop_reservation(reservation_id: str, data: DragDropUpdate):
    """Move reservation via drag & drop (update dates only)"""
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] in ["completed", "cancelled", "rejected"]:
        raise HTTPException(status_code=400, detail="Impossible de déplacer cette réservation.")

    # Anti-conflict check
    conflict = await db.reservations.find_one({
        "asset_id": res["asset_id"],
        "id": {"$ne": reservation_id},
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [{"start_date": {"$lt": data.end_date}, "end_date": {"$gt": data.start_date}}],
    }, {"_id": 0})
    if conflict:
        raise HTTPException(status_code=409, detail=f"Conflit: créneau occupé par {conflict['asset_name']} ({conflict['id'][:8]})")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "start_date": data.start_date,
        "end_date": data.end_date,
        "updated_at": now_iso,
    }})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "moved", "user": "admin",
        "details": f"Déplacé vers {data.start_date[:10]} — {data.end_date[:10]}",
        "created_at": now_iso,
    })
    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    await ws_manager.broadcast("reservation_moved", updated)
    return updated


@api_router.get("/reservations/{reservation_id}/ble-check")
async def ble_position_check(reservation_id: str):
    """Compare reservation planned site vs real BLE position"""
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    planned_site = res.get("site", "")
    asset_id = res.get("asset_id", "")

    # Fetch asset position from external API
    ble_data = {"detected": False, "current_site": None, "match": None, "last_seen": None}
    try:
        resp = await http_client.post(
            f"{EXTERNAL_API_URL}/engin/list",
            json={"page": 1, "PageSize": 200},
            timeout=8.0
        )
        if resp.status_code == 200:
            body = resp.json()
            engines = body.get("data", []) if isinstance(body, dict) else body if isinstance(body, list) else []
            for eng in engines:
                eid = eng.get("id") or eng.get("ID") or ""
                if str(eid) == str(asset_id) or (eng.get("reference", "").lower() == res.get("asset_name", "").lower()):
                    current_site = eng.get("LocationObjectname", "") or ""
                    last_seen = eng.get("lastSeenAt", "") or eng.get("dateLastSeen", "")
                    detected = bool(current_site or eng.get("etatenginname") == "reception")
                    match_status = None
                    if detected and planned_site:
                        match_status = "match" if planned_site.lower() in current_site.lower() or current_site.lower() in planned_site.lower() else "mismatch"
                    elif detected:
                        match_status = "no_planned_site"
                    ble_data = {
                        "detected": detected,
                        "current_site": current_site or None,
                        "planned_site": planned_site or None,
                        "match": match_status,
                        "last_seen": last_seen,
                        "battery": eng.get("batteries", ""),
                        "etat": eng.get("etatenginname", ""),
                    }
                    break
    except Exception as e:
        logger.warning(f"BLE check failed: {e}")
        ble_data["error"] = "API externe indisponible"

    return ble_data


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
    await ws_manager.broadcast("reservation_cancelled", {"id": reservation_id, "asset_name": res["asset_name"]})
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
    await ws_manager.broadcast("reservation_checkout", updated)
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
    await ws_manager.broadcast("reservation_checkin", updated)
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
#  ROLES & PERMISSIONS
# ═══════════════════════════════════════════════════════════════

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

@api_router.get("/roles")
async def list_roles():
    return {"roles": list(ROLE_PERMISSIONS.keys()), "permissions": ROLE_PERMISSIONS}

@api_router.get("/roles/users")
async def list_user_roles():
    users = await db.user_roles.find({}, {"_id": 0}).to_list(200)
    return users

@api_router.post("/roles/assign")
async def assign_role(data: RoleAssign):
    if data.role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Choix: {list(ROLE_PERMISSIONS.keys())}")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": data.user_id,
        "user_name": data.user_name,
        "role": data.role,
        "permissions": ROLE_PERMISSIONS[data.role],
        "assigned_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.user_roles.update_one(
        {"user_id": data.user_id},
        {"$set": doc},
        upsert=True
    )
    doc.pop("_id", None)
    return doc

@api_router.get("/roles/check/{user_id}/{permission}")
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


# ═══════════════════════════════════════════════════════════════
#  EXPORT CSV
# ═══════════════════════════════════════════════════════════════

@api_router.get("/reservations/export/csv")
async def export_reservations_csv(status: Optional[str] = None):
    import csv
    import io
    query = {}
    if status:
        query["status"] = status
    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", -1).to_list(1000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Asset", "Utilisateur", "Équipe", "Projet", "Site", "Début", "Fin", "Statut", "Priorité", "Check-out", "Check-in", "Créé le"])
    for r in reservations:
        writer.writerow([
            r.get("id", "")[:8],
            r.get("asset_name", ""),
            r.get("user_name", ""),
            r.get("team", ""),
            r.get("project", ""),
            r.get("site", ""),
            r.get("start_date", "")[:16] if r.get("start_date") else "",
            r.get("end_date", "")[:16] if r.get("end_date") else "",
            r.get("status", ""),
            r.get("priority", ""),
            r.get("checkout_at", "")[:16] if r.get("checkout_at") else "",
            r.get("checkin_at", "")[:16] if r.get("checkin_at") else "",
            r.get("created_at", "")[:16] if r.get("created_at") else "",
        ])

    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reservations.csv"}
    )


# ═══════════════════════════════════════════════════════════════
#  MAINTENANCE RECORDS
# ═══════════════════════════════════════════════════════════════

class MaintenanceCreate(BaseModel):
    asset_id: str
    asset_name: str
    type: str = "preventive"  # preventive, corrective, inspection
    description: Optional[str] = None
    start_date: str
    end_date: str
    technician: Optional[str] = None

@api_router.post("/maintenance")
async def create_maintenance(data: MaintenanceCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "asset_id": data.asset_id,
        "asset_name": data.asset_name,
        "type": data.type,
        "description": data.description,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "technician": data.technician,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.maintenance_records.insert_one(doc)
    doc.pop("_id", None)

    await create_notification("maintenance", "Maintenance planifiée",
        f"{data.asset_name} en maintenance du {data.start_date[:10]} au {data.end_date[:10]}", None, data.asset_id, "warning")

    return doc

@api_router.get("/maintenance")
async def list_maintenance(asset_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if asset_id: query["asset_id"] = asset_id
    if status: query["status"] = status
    records = await db.maintenance_records.find(query, {"_id": 0}).sort("start_date", -1).to_list(200)
    return records

@api_router.put("/maintenance/{maint_id}/complete")
async def complete_maintenance(maint_id: str):
    await db.maintenance_records.update_one({"id": maint_id}, {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": "completed"}


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


# ═══════════════════════════════════════════════════════════════
#  WEBSOCKET MANAGER
# ═══════════════════════════════════════════════════════════════

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, event_type: str, data: dict):
        message = json.dumps({"type": event_type, "data": data, "timestamp": datetime.now(timezone.utc).isoformat()})
        dead = set()
        for conn in self.active_connections:
            try:
                await conn.send_text(message)
            except Exception:
                dead.add(conn)
        for d in dead:
            self.active_connections.discard(d)

ws_manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # heartbeat/ping support
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
