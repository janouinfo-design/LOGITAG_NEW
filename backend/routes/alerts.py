"""Reservation Smart Alerts: Rules, Scan Engine, Alert Management."""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid

from shared import db, create_notification

router = APIRouter(prefix="/api")


@router.get("/reservations/alerts/rules")
async def get_alert_rules():
    rules = await db.reservation_alert_rules.find({}, {"_id": 0}).to_list(50)
    if not rules:
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


@router.put("/reservations/alerts/rules/{rule_id}")
async def update_alert_rule(rule_id: str, body: dict):
    allowed = {"enabled", "threshold_minutes", "severity", "auto_notify"}
    update = {k: v for k, v in body.items() if k in allowed}
    if not update:
        raise HTTPException(400, "Rien à modifier")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservation_alert_rules.update_one({"id": rule_id}, {"$set": update})
    return {"status": "updated"}


@router.post("/reservations/alerts/scan")
async def scan_reservation_alerts():
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    rules = await db.reservation_alert_rules.find({"enabled": True}, {"_id": 0}).to_list(20)
    rule_map = {r["type"]: r for r in rules}
    alerts_generated = []

    active_reservations = await db.reservations.find(
        {"status": {"$in": ["confirmed", "in_progress"]}}, {"_id": 0}
    ).to_list(500)

    for res in active_reservations:
        res_start = res.get("start_date", "")
        res_end = res.get("end_date", "")

        # OVERDUE
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
                        "resolved": False, "resolved_at": None, "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["overdue"].get("auto_notify"):
                        await create_notification("reservation_overdue", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="critical")
                    alerts_generated.append(alert)

        # UPCOMING
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
                        "resolved": False, "resolved_at": None, "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["upcoming"].get("auto_notify"):
                        await create_notification("reservation_upcoming", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="warning")
                    alerts_generated.append(alert)

        # NO_CHECKOUT
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
                        "resolved": False, "resolved_at": None, "created_at": now_iso,
                    }
                    await db.reservation_alerts.insert_one(alert)
                    alert.pop("_id", None)
                    if rule_map["no_checkout"].get("auto_notify"):
                        await create_notification("no_checkout", alert["title"], alert["message"], reservation_id=res["id"], asset_id=res.get("asset_id"), severity="warning")
                    alerts_generated.append(alert)

    return {"scanned": len(active_reservations), "alerts_generated": len(alerts_generated), "alerts": alerts_generated}


@router.get("/reservations/alerts")
async def get_reservation_alerts(status: str = "active", limit: int = 50):
    query = {"resolved": False} if status == "active" else {}
    alerts = await db.reservation_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return alerts


@router.put("/reservations/alerts/{alert_id}/resolve")
async def resolve_reservation_alert(alert_id: str):
    result = await db.reservation_alerts.update_one(
        {"id": alert_id},
        {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Alerte non trouvée")
    return {"status": "resolved"}


@router.get("/reservations/alerts/stats")
async def get_reservation_alert_stats():
    total = await db.reservation_alerts.count_documents({"resolved": False})
    pipeline = [{"$match": {"resolved": False}}, {"$group": {"_id": "$type", "count": {"$sum": 1}}}]
    by_type = await db.reservation_alerts.aggregate(pipeline).to_list(10)
    severity_pipeline = [{"$match": {"resolved": False}}, {"$group": {"_id": "$severity", "count": {"$sum": 1}}}]
    by_severity = await db.reservation_alerts.aggregate(severity_pipeline).to_list(10)
    return {
        "total_active": total,
        "by_type": {t["_id"]: t["count"] for t in by_type},
        "by_severity": {s["_id"]: s["count"] for s in by_severity},
    }
