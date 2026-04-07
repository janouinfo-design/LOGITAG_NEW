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

## Completed Features (All Phases Done)

### P1 - REFACTORING server.py (DONE - Apr 7, 2026)
- server.py: 1487 lignes → 137 lignes + 7 routeurs séparés
- shared.py pour les dépendances partagées
- Test regression: iteration_32 (24/24)

### BUG FIX - SUPPRESSION ASSETS (DONE - Apr 7, 2026)
- Ajout bouton supprimer individuel (icône poubelle rouge) sur chaque carte
- Modal de confirmation individuel avec nom de l'asset
- Toast de résultat (succès/erreur) après suppression
- Gestion d'erreur améliorée (vérification de la réponse API)
- parseInt pour les IDs numériques de l'API externe

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
