"""Reservations: CRUD, Planning, Gantt, Availability, Approval, Checkout/Checkin, Export."""
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid

from shared import db, ws_manager, create_notification, http_client, EXTERNAL_API_URL, logger

router = APIRouter(prefix="/api")


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
    start_date: str
    end_date: str
    note: Optional[str] = None
    priority: str = "normal"
    status: str = "requested"

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
    status: Optional[str] = None

class CheckOutData(BaseModel):
    user_name: str
    location: Optional[str] = None
    condition: str = "good"
    comment: Optional[str] = None

class CheckInData(BaseModel):
    user_name: str
    condition: str = "good"
    comment: Optional[str] = None

class DragDropUpdate(BaseModel):
    start_date: str
    end_date: str


# ── STATIC ROUTES FIRST (before {reservation_id}) ──

@router.post("/reservations")
async def create_reservation(data: ReservationCreate):
    start = data.start_date
    end = data.end_date
    conflict = await db.reservations.find_one({
        "asset_id": data.asset_id,
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [{"start_date": {"$lt": end}, "end_date": {"$gt": start}}]
    }, {"_id": 0})
    if conflict:
        raise HTTPException(status_code=409, detail=f"Conflit: cet asset est déjà réservé du {conflict['start_date'][:10]} au {conflict['end_date'][:10]} (Réservation #{conflict['id'][:8]})")

    maint = await db.maintenance_records.find_one({
        "asset_id": data.asset_id, "status": "active",
        "start_date": {"$lte": end}, "end_date": {"$gte": start},
    }, {"_id": 0})
    if maint:
        raise HTTPException(status_code=409, detail="Cet asset est en maintenance pendant cette période.")

    reservation = {
        "id": str(uuid.uuid4()),
        "asset_id": data.asset_id, "asset_name": data.asset_name,
        "user_name": data.user_name, "team": data.team, "project": data.project,
        "site": data.site, "site_id": data.site_id,
        "address": data.address, "address_lat": data.address_lat, "address_lng": data.address_lng,
        "start_date": start, "end_date": end, "note": data.note,
        "priority": data.priority,
        "status": data.status if data.status in ("requested", "confirmed") else "requested",
        "checkout_at": None, "checkout_by": None, "checkout_location": None,
        "checkout_condition": None, "checkout_comment": None,
        "checkin_at": None, "checkin_by": None, "checkin_condition": None, "checkin_comment": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reservations.insert_one(reservation)
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation["id"],
        "action": "created", "user": data.user_name,
        "details": f"Réservation créée pour {data.asset_name}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await create_notification(
        "reservation_created", "Nouvelle réservation",
        f"{data.asset_name} réservé par {data.user_name} du {start[:10]} au {end[:10]}",
        reservation["id"], data.asset_id,
    )
    reservation.pop("_id", None)
    await ws_manager.broadcast("reservation_created", reservation)
    return reservation


@router.get("/reservations")
async def list_reservations(
    status: Optional[str] = None, asset_id: Optional[str] = None,
    user_name: Optional[str] = None, site: Optional[str] = None,
    start_from: Optional[str] = None, start_to: Optional[str] = None,
):
    query = {}
    if status: query["status"] = status
    if asset_id: query["asset_id"] = asset_id
    if user_name: query["user_name"] = user_name
    if site: query["site"] = site
    if start_from: query["start_date"] = {"$gte": start_from}
    if start_to:
        if "start_date" in query: query["start_date"]["$lte"] = start_to
        else: query["start_date"] = {"$lte": start_to}
    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", -1).to_list(500)
    return reservations


@router.get("/reservations/planning")
async def get_planning(view: str = "month", start: Optional[str] = None, end: Optional[str] = None):
    query = {"status": {"$in": ["confirmed", "in_progress", "requested"]}}
    if start and end:
        query["$or"] = [{"start_date": {"$lt": end}, "end_date": {"$gt": start}}]
    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", 1).to_list(1000)
    return reservations


@router.get("/reservations/kpis")
async def get_reservation_kpis():
    now = datetime.now(timezone.utc).isoformat()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()
    today_end = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59).isoformat()

    total = await db.reservations.count_documents({})
    active = await db.reservations.count_documents({"status": "in_progress"})
    confirmed = await db.reservations.count_documents({"status": "confirmed"})
    today_res = await db.reservations.count_documents({
        "start_date": {"$lte": today_end}, "end_date": {"$gte": today_start},
        "status": {"$in": ["confirmed", "in_progress"]},
    })
    overdue = await db.reservations.count_documents({"status": "in_progress", "end_date": {"$lt": now}})
    completed = await db.reservations.count_documents({"status": "completed"})
    cancelled = await db.reservations.count_documents({"status": "cancelled"})
    unread_notif = await db.notifications.count_documents({"read": False})

    pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "in_progress", "completed"]}}},
        {"$group": {"_id": "$asset_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 5},
    ]
    top_assets = await db.reservations.aggregate(pipeline).to_list(5)

    return {
        "total": total, "active": active, "confirmed": confirmed, "today": today_res,
        "overdue": overdue, "completed": completed, "cancelled": cancelled,
        "unread_notifications": unread_notif,
        "top_assets": [{"name": a["_id"], "count": a["count"]} for a in top_assets],
    }


@router.get("/reservations/availability/{asset_id}")
async def check_availability(asset_id: str, start: str, end: str):
    conflict = await db.reservations.find_one({
        "asset_id": asset_id,
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [{"start_date": {"$lt": end}, "end_date": {"$gt": start}}]
    }, {"_id": 0})
    maint = await db.maintenance_records.find_one({
        "asset_id": asset_id, "status": "active",
        "start_date": {"$lte": end}, "end_date": {"$gte": start},
    }, {"_id": 0})
    return {"available": conflict is None and maint is None, "conflict": conflict, "maintenance": maint is not None}


@router.get("/reservations/gantt")
async def get_reservations_gantt(days: int = 14):
    now = datetime.now(timezone.utc)
    start_range = (now - timedelta(days=3)).isoformat()
    end_range = (now + timedelta(days=days)).isoformat()
    reservations = await db.reservations.find(
        {"end_date": {"$gte": start_range}, "start_date": {"$lte": end_range}}, {"_id": 0}
    ).sort("start_date", 1).to_list(500)

    asset_map = {}
    for r in reservations:
        aid = r.get("asset_id", "unknown")
        if aid not in asset_map:
            asset_map[aid] = {"asset_id": aid, "asset_name": r.get("asset_name", ""), "reservations": []}
        asset_map[aid]["reservations"].append({
            "id": r["id"], "user_name": r.get("user_name"), "status": r.get("status"),
            "priority": r.get("priority"), "site": r.get("site"), "address": r.get("address"),
            "start_date": r.get("start_date"), "end_date": r.get("end_date"),
            "note": r.get("note"), "project": r.get("project"),
        })
    return {"assets": list(asset_map.values()), "range_start": start_range, "range_end": end_range, "total_reservations": len(reservations)}


@router.get("/reservations/today-summary")
async def get_today_summary():
    now = datetime.now(timezone.utc)
    today_end = now.replace(hour=23, minute=59, second=59).isoformat()
    now_iso = now.isoformat()

    active = await db.reservations.find({"status": "in_progress"}, {"_id": 0}).sort("end_date", 1).to_list(50)
    upcoming = await db.reservations.find(
        {"status": "confirmed", "start_date": {"$gte": now_iso, "$lte": today_end}}, {"_id": 0}
    ).sort("start_date", 1).to_list(20)
    overdue = await db.reservations.find(
        {"status": "in_progress", "end_date": {"$lt": now_iso}}, {"_id": 0}
    ).sort("end_date", 1).to_list(20)
    pending_approval = await db.reservations.find({"status": "requested"}, {"_id": 0}).sort("created_at", -1).to_list(20)
    active_alerts = await db.reservation_alerts.count_documents({"resolved": False})

    return {
        "active_count": len(active), "active": active[:10],
        "upcoming_count": len(upcoming), "upcoming": upcoming[:10],
        "overdue_count": len(overdue), "overdue": overdue[:10],
        "pending_count": len(pending_approval), "pending": pending_approval[:10],
        "alert_count": active_alerts, "timestamp": now_iso,
    }


@router.get("/reservations/export/csv")
async def export_reservations_csv(status: Optional[str] = None):
    import csv
    import io
    query = {}
    if status: query["status"] = status
    reservations = await db.reservations.find(query, {"_id": 0}).sort("start_date", -1).to_list(1000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Asset", "Utilisateur", "Équipe", "Projet", "Site", "Début", "Fin", "Statut", "Priorité", "Check-out", "Check-in", "Créé le"])
    for r in reservations:
        writer.writerow([
            r.get("id", "")[:8], r.get("asset_name", ""), r.get("user_name", ""),
            r.get("team", ""), r.get("project", ""), r.get("site", ""),
            r.get("start_date", "")[:16] if r.get("start_date") else "",
            r.get("end_date", "")[:16] if r.get("end_date") else "",
            r.get("status", ""), r.get("priority", ""),
            r.get("checkout_at", "")[:16] if r.get("checkout_at") else "",
            r.get("checkin_at", "")[:16] if r.get("checkin_at") else "",
            r.get("created_at", "")[:16] if r.get("created_at") else "",
        ])
    content = output.getvalue()
    return Response(content=content, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=reservations.csv"})


# ── DYNAMIC ROUTES ({reservation_id}) ──

@router.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    logs = await db.reservation_logs.find({"reservation_id": reservation_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    res["logs"] = logs
    return res


@router.put("/reservations/{reservation_id}")
async def update_reservation(reservation_id: str, data: ReservationUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    if "start_date" in update_data or "end_date" in update_data:
        current = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
        if current:
            new_start = update_data.get("start_date", current["start_date"])
            new_end = update_data.get("end_date", current["end_date"])
            conflict = await db.reservations.find_one({
                "asset_id": current["asset_id"], "id": {"$ne": reservation_id},
                "status": {"$in": ["requested", "confirmed", "in_progress"]},
                "$or": [{"start_date": {"$lt": new_end}, "end_date": {"$gt": new_start}}],
            }, {"_id": 0})
            if conflict:
                raise HTTPException(status_code=409, detail="Conflit de dates avec une autre réservation.")

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": update_data})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "updated", "user": update_data.get("user_name", "system"),
        "details": f"Champs modifiés: {', '.join(update_data.keys())}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    return updated


@router.put("/reservations/{reservation_id}/drag")
async def drag_drop_reservation(reservation_id: str, data: DragDropUpdate):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] in ["completed", "cancelled", "rejected"]:
        raise HTTPException(status_code=400, detail="Impossible de déplacer cette réservation.")

    conflict = await db.reservations.find_one({
        "asset_id": res["asset_id"], "id": {"$ne": reservation_id},
        "status": {"$in": ["requested", "confirmed", "in_progress"]},
        "$or": [{"start_date": {"$lt": data.end_date}, "end_date": {"$gt": data.start_date}}],
    }, {"_id": 0})
    if conflict:
        raise HTTPException(status_code=409, detail=f"Conflit: créneau occupé par {conflict['asset_name']} ({conflict['id'][:8]})")

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "start_date": data.start_date, "end_date": data.end_date, "updated_at": now_iso,
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


@router.get("/reservations/{reservation_id}/ble-check")
async def ble_position_check(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")

    planned_site = res.get("site", "")
    asset_id = res.get("asset_id", "")
    ble_data = {"detected": False, "current_site": None, "match": None, "last_seen": None}
    try:
        resp = await http_client.post(f"{EXTERNAL_API_URL}/engin/list", json={"page": 1, "PageSize": 200}, timeout=8.0)
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
                        "detected": detected, "current_site": current_site or None,
                        "planned_site": planned_site or None, "match": match_status,
                        "last_seen": last_seen, "battery": eng.get("batteries", ""),
                        "etat": eng.get("etatenginname", ""),
                    }
                    break
    except Exception as e:
        logger.warning(f"BLE check failed: {e}")
        ble_data["error"] = "API externe indisponible"
    return ble_data


@router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Impossible d'annuler cette réservation.")
    await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "cancelled", "user": "admin",
        "details": "Réservation annulée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await create_notification("reservation_cancelled", "Réservation annulée",
        f"La réservation de {res['asset_name']} a été annulée.", reservation_id, res["asset_id"], "warning")
    await ws_manager.broadcast("reservation_cancelled", {"id": reservation_id, "asset_name": res["asset_name"]})
    return {"status": "cancelled"}


@router.post("/reservations/{reservation_id}/approve")
async def approve_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "approved", "user": "admin",
        "details": "Réservation approuvée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"status": "confirmed"}


@router.post("/reservations/{reservation_id}/reject")
async def reject_reservation(reservation_id: str):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc).isoformat()}})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "rejected", "user": "admin",
        "details": "Réservation rejetée", "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await create_notification("reservation_rejected", "Réservation rejetée",
        f"La réservation de {res['asset_name']} a été rejetée.", reservation_id, res["asset_id"], "error")
    return {"status": "rejected"}


@router.post("/reservations/{reservation_id}/checkout")
async def checkout_reservation(reservation_id: str, data: CheckOutData):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] not in ["confirmed"]:
        raise HTTPException(status_code=400, detail="Seules les réservations confirmées peuvent être sorties.")
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "status": "in_progress", "checkout_at": now_iso, "checkout_by": data.user_name,
        "checkout_location": data.location, "checkout_condition": data.condition,
        "checkout_comment": data.comment, "updated_at": now_iso,
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


@router.post("/reservations/{reservation_id}/checkin")
async def checkin_reservation(reservation_id: str, data: CheckInData):
    res = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if res["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Seuls les assets en cours peuvent être retournés.")
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": {
        "status": "completed", "checkin_at": now_iso, "checkin_by": data.user_name,
        "checkin_condition": data.condition, "checkin_comment": data.comment, "updated_at": now_iso,
    }})
    await db.reservation_logs.insert_one({
        "id": str(uuid.uuid4()), "reservation_id": reservation_id,
        "action": "checked_in", "user": data.user_name,
        "details": f"Asset retourné. État: {data.condition}", "created_at": now_iso,
    })
    await create_notification("checkin", "Check-in effectué",
        f"{res['asset_name']} retourné par {data.user_name}", reservation_id, res["asset_id"])
    updated = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    await ws_manager.broadcast("reservation_checkin", updated)
    return updated
