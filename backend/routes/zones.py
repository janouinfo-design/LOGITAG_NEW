"""Zones: Advanced Geofencing, Zone Events, Zone Alerts, Geo-detection."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import math

from shared import db, ws_manager, create_notification, logger

router = APIRouter(prefix="/api")


class ZoneCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "polygon"
    coordinates: List[dict] = []
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    radius: Optional[float] = None
    color: str = "#3B82F6"
    alert_on_entry: bool = True
    alert_on_exit: bool = True
    linked_routers: List[str] = []
    floor: Optional[str] = None
    building: Optional[str] = None
    site_id: Optional[str] = None

class ZoneUpdate(ZoneCreate):
    pass


@router.post("/zones")
async def create_zone(data: ZoneCreate):
    zone = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zones.insert_one(zone)
    zone.pop("_id", None)
    await ws_manager.broadcast("zone_created", zone)
    return zone


@router.get("/zones")
async def list_zones():
    zones = await db.zones.find({}, {"_id": 0}).to_list(200)
    return zones


class ZoneEventCreate(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    zone_id: str
    zone_name: Optional[str] = None
    router_id: Optional[str] = None
    event_type: str  # entry, exit, dwell
    rssi: Optional[int] = None
    battery: Optional[int] = None
    temperature: Optional[float] = None
    floor: Optional[str] = None


@router.post("/zones/events")
async def create_zone_event(data: ZoneEventCreate):
    event = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.zone_events.insert_one(event)
    event.pop("_id", None)
    await ws_manager.broadcast("zone_event", event)

    # Check zone alerts
    alerts = await db.zone_alerts.find({"zone_id": data.zone_id, "enabled": True}, {"_id": 0}).to_list(20)
    for alert in alerts:
        if (alert.get("trigger_on") == "entry" and data.event_type == "entry") or \
           (alert.get("trigger_on") == "exit" and data.event_type == "exit") or \
           alert.get("trigger_on") == "both":
            await create_notification(
                "zone_alert", f"Alerte Zone: {data.zone_name or data.zone_id}",
                f"{data.asset_name or data.asset_id} - {data.event_type} détecté",
                asset_id=data.asset_id, severity=alert.get("severity", "warning")
            )

    return event


@router.get("/zones/events")
async def list_zone_events(zone_id: Optional[str] = None, asset_id: Optional[str] = None, event_type: Optional[str] = None, limit: int = 100):
    query = {}
    if zone_id: query["zone_id"] = zone_id
    if asset_id: query["asset_id"] = asset_id
    if event_type: query["event_type"] = event_type
    events = await db.zone_events.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return events


@router.get("/zones/events/stats")
async def zone_events_stats():
    pipeline_type = [
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    by_type = await db.zone_events.aggregate(pipeline_type).to_list(10)

    pipeline_zone = [
        {"$group": {"_id": {"zone_id": "$zone_id", "zone_name": "$zone_name"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    by_zone = await db.zone_events.aggregate(pipeline_zone).to_list(10)

    total = await db.zone_events.count_documents({})

    return {
        "total": total,
        "by_type": {t["_id"]: t["count"] for t in by_type},
        "by_zone": [{"zone_id": z["_id"]["zone_id"], "zone_name": z["_id"]["zone_name"], "count": z["count"]} for z in by_zone],
    }


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def point_in_polygon(lat, lng, polygon):
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i].get("lat", 0), polygon[i].get("lng", 0)
        xj, yj = polygon[j].get("lat", 0), polygon[j].get("lng", 0)
        if ((yi > lng) != (yj > lng)) and (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


class DetectAssetRequest(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    lat: float
    lng: float
    rssi: Optional[int] = None
    battery: Optional[int] = None
    router_id: Optional[str] = None
    floor: Optional[str] = None


@router.post("/zones/detect")
async def detect_asset_in_zone(data: DetectAssetRequest):
    zones = await db.zones.find({}, {"_id": 0}).to_list(200)
    detected_zones = []

    for zone in zones:
        in_zone = False
        if zone.get("type") == "circle" and zone.get("center_lat") and zone.get("center_lng") and zone.get("radius"):
            dist = haversine_distance(data.lat, data.lng, zone["center_lat"], zone["center_lng"])
            in_zone = dist <= zone["radius"]
        elif zone.get("coordinates"):
            in_zone = point_in_polygon(data.lat, data.lng, zone["coordinates"])

        if in_zone:
            detected_zones.append(zone)
            # Check last event
            last_event = await db.zone_events.find_one(
                {"asset_id": data.asset_id, "zone_id": zone["id"]},
                {"_id": 0}, sort=[("timestamp", -1)]
            )
            if not last_event or last_event.get("event_type") == "exit":
                event = ZoneEventCreate(
                    asset_id=data.asset_id, asset_name=data.asset_name,
                    zone_id=zone["id"], zone_name=zone.get("name"),
                    router_id=data.router_id, event_type="entry",
                    rssi=data.rssi, battery=data.battery, floor=data.floor
                )
                await create_zone_event(event)

    # Check exits
    previous_zones = await db.zone_events.find(
        {"asset_id": data.asset_id, "event_type": "entry"},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)

    seen_zone_ids = set()
    for evt in previous_zones:
        zid = evt.get("zone_id")
        if zid not in seen_zone_ids:
            seen_zone_ids.add(zid)
            if zid not in [z["id"] for z in detected_zones]:
                exit_event = ZoneEventCreate(
                    asset_id=data.asset_id, asset_name=data.asset_name,
                    zone_id=zid, zone_name=evt.get("zone_name"),
                    router_id=data.router_id, event_type="exit",
                    rssi=data.rssi, battery=data.battery, floor=data.floor
                )
                await create_zone_event(exit_event)

    return {
        "asset_id": data.asset_id,
        "position": {"lat": data.lat, "lng": data.lng},
        "detected_zones": [{"id": z["id"], "name": z.get("name")} for z in detected_zones],
        "total_zones_checked": len(zones),
    }


class ZoneAlertCreate(BaseModel):
    zone_id: str
    zone_name: Optional[str] = None
    trigger_on: str = "both"  # entry, exit, both
    severity: str = "warning"
    message: Optional[str] = None
    enabled: bool = True
    notify_users: List[str] = []
    cooldown_minutes: int = 5


@router.post("/zones/alerts")
async def create_zone_alert(data: ZoneAlertCreate):
    alert = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.zone_alerts.insert_one(alert)
    alert.pop("_id", None)
    return alert

@router.get("/zones/alerts")
async def list_zone_alerts(zone_id: Optional[str] = None):
    query = {}
    if zone_id: query["zone_id"] = zone_id
    alerts = await db.zone_alerts.find(query, {"_id": 0}).to_list(100)
    return alerts

@router.put("/zones/alerts/{alert_id}")
async def update_zone_alert(alert_id: str, data: ZoneAlertCreate):
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.zone_alerts.update_one({"id": alert_id}, {"$set": update})
    return {"status": "updated"}

@router.delete("/zones/alerts/{alert_id}")
async def delete_zone_alert(alert_id: str):
    result = await db.zone_alerts.delete_one({"id": alert_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    return {"status": "deleted"}


class TriggerEventRequest(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    router_id: str
    router_name: Optional[str] = None
    rssi: Optional[int] = None
    battery: Optional[int] = None
    event_type: str = "detection"
    timestamp: Optional[str] = None
    floor: Optional[str] = None
    detection_mode: str = "entry"  # entry, exit, both


@router.post("/zones/trigger")
async def trigger_zone_event(data: TriggerEventRequest):
    zones = await db.zones.find({"linked_routers": data.router_id}, {"_id": 0}).to_list(20)
    events = []
    for zone in zones:
        if data.detection_mode in ("entry", "both"):
            event = {
                "id": str(uuid.uuid4()),
                "asset_id": data.asset_id, "asset_name": data.asset_name,
                "zone_id": zone["id"], "zone_name": zone.get("name"),
                "router_id": data.router_id,
                "event_type": "entry" if data.detection_mode != "exit" else "exit",
                "rssi": data.rssi, "battery": data.battery,
                "floor": data.floor,
                "timestamp": data.timestamp or datetime.now(timezone.utc).isoformat(),
            }
            await db.zone_events.insert_one(event)
            event.pop("_id", None)
            events.append(event)
            await ws_manager.broadcast("zone_event", event)

            # Check alerts
            alerts = await db.zone_alerts.find({"zone_id": zone["id"], "enabled": True}, {"_id": 0}).to_list(20)
            for alert in alerts:
                trigger = alert.get("trigger_on", "both")
                if trigger == "both" or trigger == event["event_type"]:
                    await create_notification(
                        "zone_trigger", f"Détection: {data.asset_name or data.asset_id}",
                        f"{event['event_type'].upper()} dans {zone.get('name', zone['id'])} via {data.router_name or data.router_id} (RSSI: {data.rssi or 'N/A'})",
                        asset_id=data.asset_id, severity=alert.get("severity", "warning")
                    )

    return {"events_created": len(events), "zones_matched": len(zones), "events": events}


@router.get("/zones/{zone_id}")
async def get_zone(zone_id: str):
    zone = await db.zones.find_one({"id": zone_id}, {"_id": 0})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone introuvable")
    events = await db.zone_events.find({"zone_id": zone_id}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    zone["recent_events"] = events
    return zone


@router.put("/zones/{zone_id}")
async def update_zone(zone_id: str, data: ZoneUpdate):
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.zones.update_one({"id": zone_id}, {"$set": update})
    updated = await db.zones.find_one({"id": zone_id}, {"_id": 0})
    await ws_manager.broadcast("zone_updated", updated)
    return updated


@router.delete("/zones/{zone_id}")
async def delete_zone(zone_id: str):
    result = await db.zones.delete_one({"id": zone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zone introuvable")
    await ws_manager.broadcast("zone_deleted", {"id": zone_id})
    return {"status": "deleted"}
