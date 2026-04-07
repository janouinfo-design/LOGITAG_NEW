"""LOGITAG Backend - Main Application Entry Point.
Slim server: init FastAPI, middleware, include routers, proxy, websocket.
"""
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime, timezone
import os
import json

from shared import db, client, http_client, EXTERNAL_API_URL, ws_manager, logger

# ── App init ──
app = FastAPI()

# ── Import and include routers ──
from routes.zones import router as zones_router
from routes.reservations import router as reservations_router
from routes.alerts import router as alerts_router
from routes.notifications import router as notifications_router
from routes.roles import router as roles_router
from routes.maintenance import router as maintenance_router
from routes.seed import router as seed_router

app.include_router(zones_router)
app.include_router(alerts_router)  # Must be before reservations_router (has /reservations/alerts/* routes)
app.include_router(reservations_router)
app.include_router(notifications_router)
app.include_router(roles_router)
app.include_router(maintenance_router)
app.include_router(seed_router)


# ── Basic health routes ──
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


@app.get("/api/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@app.get("/api/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ── Device/Gateway save (direct route) ──
@app.post("/api/device/save")
async def save_device_config(request: Request):
    data = await request.json()
    device_id = data.get("id") or data.get("device_id")
    if device_id:
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.device_configs.update_one({"device_id": device_id}, {"$set": data}, upsert=True)
    return {"status": "saved"}

@app.get("/api/device/configs")
async def list_device_configs():
    configs = await db.device_configs.find({}, {"_id": 0}).to_list(100)
    return configs


# ── Proxy: forwards /api/proxy/* to external API ──
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


# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── WebSocket ──
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
