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
│   └── server.py                   # FastAPI: proxy + reservations + zones + WS + roles
├── frontend/src/
│   ├── components/premium/
│   │   ├── EnterpriseCommand.jsx       # Command Center (5 panels + real-time + skeleton + export)
│   │   ├── PremiumGateway.jsx          # Gateway CRUD with Type/Mode/Site/DetectionMode
│   │   ├── PremiumReservationPlanning.jsx  # Reservations with address autocomplete
│   │   └── ... (14+ premium components)
│   ├── hooks/useWebSocket.js
│   └── cors/config/config.js
```

## Completed Features

### Phase 1-17 - ALL DONE
- Full Premium SaaS UI, Reservation Module, CSV Export, Roles & Permissions
- WebSocket Real-Time, Advanced Geofencing (3 zone types, 3 detection modes)

### Phase 18 - ENTERPRISE COMMAND CENTER (DONE)
- 5-panel layout: TopBar, Sidebar, Map, Detail, Timeline
- Route: /command/center (fullscreen)

### Phase 19 - GATEWAY + RÉSERVATION (DONE - Apr 6, 2026)
- Gateway TYPE/MODE/SITE dropdowns + Detection Mode (Entrée/Sortie/Les deux) + real API save
- Address autocomplete (Photon/OSM) in reservations
- Sidebar "Carte" → Command Center (no duplicate)

### Phase 20 - TRACKING TEMPS RÉEL + SKELETON + EXPORT (DONE - Apr 6, 2026)
1. **Tracking temps réel (P1)**:
   - Auto-refresh assets toutes les 30 secondes (silent refresh)
   - Bouton refresh manuel avec animation de rotation
   - Horloge "dernière MàJ" en temps réel (HH:MM:SS) dans topbar
   - Détection de changements d'assets (position/statut/batterie) avec highlight jaune 4s
   - WebSocket écoute `asset_update` et `reservation_update` pour refresh instantané
2. **Skeleton Loading (P1)**:
   - 4 KPI skeleton cards avec animation shimmer
   - 8 skeleton items pour la liste d'assets avec shimmer
   - Animations d'entrée staggerées (fade-in) pour chaque asset
3. **Export Timeline (P2)**:
   - Bouton CSV : Télécharge `timeline_YYYY-MM-DD.csv` avec BOM UTF-8 pour Excel
   - Bouton PDF : Ouvre une fenêtre d'impression avec tableau HTML formaté

**Testing**: iteration_27.json - 100% (12/12 tests passed)

## DB Schema (Local MongoDB `test_database`)
- reservations: {id, asset_id, asset_name, start_date, end_date, user, status, site, priority, address, address_lat, address_lng}
- zones, zone_events, zone_alerts, reservation_logs, notifications, user_roles

## Pending/Future Tasks

### P2 - Next
- Grid/card view sur autres pages (Engins, Tags)
- Presets pour configuration colonnes

### P3 - Backlog
- Maintenance records UI
- Scan QR/NFC (check-in/out rapide)
- Carte GPS temps réel sur dashboard legacy
- Notifications Email/Push (différé par l'utilisateur)
- Multi-language

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_27.json`
