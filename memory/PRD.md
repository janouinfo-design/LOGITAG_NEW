# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS. React + FastAPI + MongoDB + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Shadcn/Lucide-react, Leaflet, FullCalendar
- **Backend**: FastAPI + MongoDB (local) + Proxy vers API externe + WebSocket
- **External API**: omniyat.is-certified.com:82/logitag_node/
- **Auth**: admin / user@1234

## Architecture
```
/app/
├── backend/
│   └── server.py                   # FastAPI: proxy + reservations + notifications + roles + WebSocket
├── frontend/src/
│   ├── components/premium/
│   │   ├── PremiumLayout.jsx           # Multi-tenant client selector
│   │   ├── PremiumSidebar.jsx          # Dark mode toggle, notification badge
│   │   ├── PremiumDashboard.jsx
│   │   ├── PremiumAssets.jsx           # Column presets
│   │   ├── PremiumAssetDetail.jsx
│   │   ├── PremiumMap.jsx              # Slide-over detail
│   │   ├── PremiumPlanning.jsx         # FullCalendar Gantt
│   │   ├── PremiumReservationPlanning.jsx  # Reservation calendar + D&D + CSV export + WS
│   │   ├── PremiumMyReservations.jsx       # My reservations + CSV export + WS
│   │   ├── PremiumReservationDashboard.jsx # KPI Dashboard + Alerts + WS
│   │   ├── PremiumRoles.jsx                # NEW: Roles & Permissions management
│   │   ├── PremiumActivity.jsx, PremiumAlerts.jsx
│   │   ├── PremiumZones.jsx, PremiumUsers.jsx, PremiumGateway.jsx
│   │   └── PremiumSettings.jsx, PremiumReports.jsx
│   ├── hooks/
│   │   └── useWebSocket.js             # NEW: WebSocket hook for real-time
│   ├── logitag-dark.css
│   └── cors/config/config.js
```

## Completed Features

### Phase 1-12 (Previous sessions) - ALL DONE
- Full Premium SaaS UI, 14+ pages, Proxy, Maps, Redux, Edit modals, Slide-overs
- Reports builder (Asset/Site), Multi-tenant, Column presets, Dark mode, Mobile responsive

### Phase 13 - RESERVATION MODULE (DONE - Apr 6, 2026)
Complete asset reservation and planning system:
- Backend: 14+ API endpoints (CRUD, anti-conflict, check-in/out, KPIs, planning, availability)
- Frontend: Calendar with D&D, My Reservations list, KPI Dashboard, Alerts center
- BLE Integration: compares actual position vs reserved site
- Notification system with sidebar badge

### Phase 14 - EXPORT CSV + ROLES + WEBSOCKET (DONE - Apr 6, 2026)
1. **Bug Fix**: Fixed missing @api_router.post decorator on cancel_reservation endpoint
2. **CSV Export**: 
   - Backend: GET /api/reservations/export/csv with optional status filter
   - Frontend: Export CSV buttons on "Mes Réservations" and "Planning" pages
3. **Roles & Permissions**:
   - Backend: GET /api/roles, POST /api/roles/assign, GET /api/roles/users, GET /api/roles/check/{user_id}/{permission}
   - 4 roles: super_admin, admin_client, manager, terrain
   - Frontend: Full PremiumRoles.jsx page with role cards, permissions matrix, assign modal
4. **WebSocket Real-Time**:
   - Backend: WebSocket endpoint at /ws with ConnectionManager
   - Auto-broadcasts on: reservation created/moved/checkout/checkin/cancelled + notifications
   - Frontend: useWebSocket hook with auto-reconnect + heartbeat
   - "Live" indicator on Mes Réservations, Planning, KPI Dashboard pages

**Testing**: iteration_21.json - 100% backend (13/13) + 100% frontend

## DB Schema (Local MongoDB `test_database`)
- reservations: {id, asset_id, asset_name, start_date, end_date, user_name, status, site, priority, ...}
- reservation_logs: {id, reservation_id, action, user, details, created_at}
- notifications: {id, type, title, message, severity, read, created_at}
- user_roles: {id, user_id, user_name, role, permissions, assigned_at}
- maintenance_records: {id, asset_id, asset_name, type, status, start_date, end_date}

## API Endpoints
### Reservations
- POST /api/reservations (create with anti-conflict)
- GET /api/reservations (list with filters)
- GET /api/reservations/{id} (detail with logs)
- PUT /api/reservations/{id} (update)
- PUT /api/reservations/{id}/drag (D&D move)
- POST /api/reservations/{id}/cancel|approve|reject
- POST /api/reservations/{id}/checkout|checkin
- GET /api/reservations/kpis
- GET /api/reservations/planning
- GET /api/reservations/availability/{asset_id}
- GET /api/reservations/export/csv
- GET /api/reservations/{id}/ble-check

### Roles
- GET /api/roles
- POST /api/roles/assign
- GET /api/roles/users
- GET /api/roles/check/{user_id}/{permission}

### Notifications
- GET /api/notifications
- PUT /api/notifications/{id}/read
- PUT /api/notifications/read-all
- GET /api/notifications/count

### Maintenance
- POST /api/maintenance
- GET /api/maintenance
- PUT /api/maintenance/{id}/complete

### WebSocket
- WS /ws (real-time events)

## Pending/Future Tasks

### P2 - Next
- Maintenance records UI (registres de maintenance des assets)
- Scan QR/NFC (check-in/out rapide, orienté mobile)

### P3 - Backlog
- Notifications automatiques via Email et Push (reporté par l'utilisateur)
- Multi-language
- Dark mode mobile vérification complète

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_21.json`
- `/app/backend/tests/test_reservations.py`
- `/app/backend/tests/test_iteration21.py`
