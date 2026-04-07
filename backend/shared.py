"""Shared dependencies: DB, WebSocket manager, HTTP client, helpers."""
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import WebSocket
from dotenv import load_dotenv
from pathlib import Path
from typing import Set
from datetime import datetime, timezone
import os
import json
import uuid
import logging
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# External API
EXTERNAL_API_URL = "https://omniyat.is-certified.com:82/logitag_node"

# HTTP client for proxy
http_client = httpx.AsyncClient(verify=False, timeout=60.0)

# Logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


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
    await ws_manager.broadcast("notification", {"notification": doc, "event": ntype})
    return doc
