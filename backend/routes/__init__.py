from fastapi import APIRouter
from routes.zones import router as zones_router
from routes.reservations import router as reservations_router
from routes.alerts import router as alerts_router
from routes.notifications import router as notifications_router
from routes.roles import router as roles_router
from routes.maintenance import router as maintenance_router
from routes.seed import router as seed_router
