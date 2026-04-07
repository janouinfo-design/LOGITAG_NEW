# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet
- Backend: FastAPI + MongoDB + Proxy API externe + WebSocket
- Auth: admin / user@1234

## Code Architecture
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

### Phases B/C/D: Gantt + Approbation + KPIs (DONE)

### P1: Refactoring server.py (DONE - Apr 7, 2026)
- 1487 → 137 lignes + 7 routeurs séparés

### Suppression avec Undo (DONE - Apr 7, 2026)
- Bouton supprimer (poubelle) sur chaque carte et ligne
- Modal de confirmation individuel avec nom de l'asset
- **Undo 5 secondes** : item disparaît immédiatement, toast noir avec barre de progression + bouton "Annuler"
- Si annulé : item restauré, aucune suppression API
- Si pas annulé après 5s : API delete exécuté, toast vert de confirmation
- Suppression en masse (bulk) toujours disponible via checkboxes
- Tests: iteration_35 (100% - 14/14 tests passés)

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language

## Test Reports
- /app/test_reports/iteration_1.json through iteration_35.json
