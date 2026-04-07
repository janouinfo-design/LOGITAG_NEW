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
├── server.py               # ~137 lignes: init, middleware, proxy, websocket
├── shared.py               # DB, WS manager, HTTP client
├── routes/                 # 7 routeurs séparés
```

## Completed Features

### All Phases 1-20 + B/C/D (DONE)
### Suppression Assets + Bulk Delete (DONE)
### Pagination Carte/Command Center (DONE)
### Simplification Formulaire Réservation (DONE)
### Mes Réservations en Vignettes (DONE)

### Menu Sidebar Regroupé (DONE - Apr 7, 2026)
- 5 catégories dépliables: Tableau de bord, Assets, Réservations, Suivi, Administration
- Headers cliquables avec chevron animé (rotation 180deg)
- Auto-ouverture de la section contenant la page active
- Mode collapsed: icônes seules, sections séparées par lignes fines
- Sidebar 240px (vs 260px avant), collapsed 64px (vs 72px)
- Badge notification sur KPI, mode sombre toggle
- Tests: iteration_39 (100% - 10/10 tests passés)

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language
- Backlog: Refactoring PremiumAssets.jsx en sous-composants

## Test Reports
- /app/test_reports/iteration_1.json through iteration_39.json
