# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet, FullCalendar
- Backend: FastAPI + MongoDB + Proxy API externe + WebSocket
- Auth: admin / user@1234

## Code Architecture (Post-Refactoring - Apr 7, 2026)
```
/app/backend/
├── server.py               # ~137 lignes: init FastAPI, middleware, proxy, websocket
├── shared.py               # DB, WebSocket manager, HTTP client, create_notification
├── routes/
│   ├── reservations.py     # CRUD + Gantt + Planning + Approval + Checkout/Checkin
│   ├── alerts.py           # Smart Alerts engine, rules, scan
│   ├── zones.py            # Geofencing, zone events, zone alerts
│   ├── notifications.py    # Notifications CRUD
│   ├── roles.py            # Roles & permissions
│   ├── maintenance.py      # Maintenance records
│   └── seed.py             # Test data seeding
```

## Completed Features

### Phase 1-20 - ALL DONE
- Full Premium SaaS UI (14+ pages), Reservation Module, Advanced Geofencing, WebSocket
- Enterprise Command Center, Skeleton Loading, Rich Timeline Journal, Auto-refresh

### Phase 21 - CHECKBOXES ASSETS + ALERTES SMART (DONE)
- Multi-selection checkboxes, bulk delete, select all
- Phase A: Smart Alert engine (5 rule types, scan, resolve, stats)
- Tests: iteration_29 (7/7), iteration_30 (22/22)

### Phase B - VUE GANTT PLANNING (DONE)
- Gantt timeline: 1 ligne/asset, barres colorées, toolbar, zoom, filtres
- Backend: GET /api/reservations/gantt?days=14
- Test: iteration_31 (42/42)

### Phase C - WORKFLOW APPROBATION (DONE)
- Approve/Reject buttons in Gantt detail panel
- Backend: POST /api/reservations/{id}/approve et /reject

### Phase D - DASHBOARD OPERATIONNEL (DONE)
- GET /api/reservations/today-summary
- KPIs dans Command Center

### P1 - REFACTORING server.py (DONE - Apr 7, 2026)
- server.py: 1487 lignes → 137 lignes + 7 routeurs séparés
- shared.py pour les dépendances partagées (db, ws_manager, http_client)
- Bug fix: ordre des routeurs (alerts_router avant reservations_router)
- Test regression: iteration_32 (24/24 backend, frontend OK)

### P2 - GRID/CARD VIEWS + PRESETS (ALREADY DONE)
- Toggle Liste/Grille dans PremiumAssets.jsx
- 3 presets: Vue complète, Vue standard, Vue simple
- Configuration colonnes individuelle avec sauvegarde localStorage

### BUG FIX - SUPPRESSION ASSETS (DONE - Apr 7, 2026)
- Problème: L'API externe exige un ID numérique, le frontend envoyait une string
- Fix: parseInt(item.id, 10) dans PremiumAssets.jsx

## DB Schema (Local MongoDB `test_database`)
- reservations, reservation_logs, notifications, user_roles
- zones, zone_events, zone_alerts
- reservation_alerts, reservation_alert_rules
- maintenance_records, device_configs, status_checks

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language

## Test Reports
- /app/test_reports/iteration_1.json through iteration_32.json
