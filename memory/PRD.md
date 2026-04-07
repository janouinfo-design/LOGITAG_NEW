# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet
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

### All Phases 1-20 (DONE)
- Premium SaaS UI (14+ pages), Reservations, Geofencing, WebSocket, Command Center

### Phase 21: Checkboxes + Smart Alerts (DONE)
- Multi-selection, bulk delete, Smart Alert engine (5 types)

### Phases B/C/D: Gantt + Approbation + KPIs (DONE)
- Vue Gantt chronologique, Approve/Reject, Today Summary KPIs

### P1: Refactoring server.py (DONE - Apr 7, 2026)
- 1487 → 137 lignes + 7 routeurs séparés + shared.py

### BUG FIX: Suppression des Assets (DONE - Apr 7, 2026)
- **Cause racine** : conflit état dual useState/Redux — setAllData ne déclenchait pas de re-render
- **Solution** : `deletedIds` Set + filtrage au rendu (ligne 284 de PremiumAssets.jsx)
- **Résultat** : ENGIN1 supprimé → compteur 500→499, toast affiché, carte disparaît
- Tests: iteration_33 (diagnostic) + iteration_34 (100% fixed)

### P2: Grid/Card + Presets (ALREADY DONE)
- Toggle Liste/Grille + 3 presets de colonnes

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language

## Test Reports
- /app/test_reports/iteration_1.json through iteration_34.json
