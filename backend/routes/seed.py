"""Seed Data for testing."""
from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import uuid

from shared import db

router = APIRouter(prefix="/api")


@router.post("/reservations/seed")
async def seed_reservations():
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
            "asset_id": asset[0], "asset_name": asset[1],
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

    notifs = [
        {"id": str(uuid.uuid4()), "type": "overdue", "title": "Asset en retard", "message": "Chariot Elev. #12 devait être retourné il y a 2h", "reservation_id": reservations[3]["id"], "asset_id": "asset-004", "severity": "error", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "due_soon", "title": "Retour imminent", "message": "Grue Mobile T4 à retourner dans 1h", "reservation_id": reservations[4]["id"], "asset_id": "asset-005", "severity": "warning", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "checkout", "title": "Check-out effectué", "message": "Nacelle N15 sortie par Omar K.", "reservation_id": reservations[6]["id"], "asset_id": "asset-007", "severity": "info", "read": False, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "type": "reservation_created", "title": "Nouvelle réservation", "message": "Group Electro G7 réservé par Fatima Z.", "reservation_id": reservations[7]["id"], "asset_id": "asset-008", "severity": "info", "read": True, "created_at": (now - timedelta(hours=2)).isoformat()},
    ]
    await db.notifications.insert_many(notifs)
    return {"message": f"Seeded {len(reservations)} reservations and {len(notifs)} notifications."}
