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
│   │   ├── EnterpriseCommand.jsx       # NEW: Samsara-like Command Center (fullscreen)
│   │   ├── PremiumLayout.jsx           # Multi-tenant + fullscreen path management
│   │   ├── PremiumSidebar.jsx          # Dark mode toggle, notification badge, Command Center nav
│   │   ├── PremiumDashboard.jsx
│   │   ├── PremiumAssets.jsx           # Column presets
│   │   ├── PremiumAssetDetail.jsx
│   │   ├── PremiumMap.jsx              # Slide-over detail
│   │   ├── PremiumPlanning.jsx         # FullCalendar Gantt
│   │   ├── PremiumReservationPlanning.jsx  # Reservation calendar + D&D + CSV export + WS
│   │   ├── PremiumMyReservations.jsx       # My reservations + CSV export + WS
│   │   ├── PremiumReservationDashboard.jsx # KPI Dashboard + Alerts + WS
│   │   ├── PremiumRoles.jsx                # Roles & Permissions management
│   │   ├── PremiumActivity.jsx, PremiumAlerts.jsx
│   │   ├── PremiumZones.jsx, PremiumUsers.jsx, PremiumGateway.jsx
│   │   └── PremiumSettings.jsx, PremiumReports.jsx
│   ├── hooks/
│   │   └── useWebSocket.js             # WebSocket hook for real-time
│   └── cors/config/config.js
```

## Completed Features

### Phase 1-12 (Previous sessions) - ALL DONE
- Full Premium SaaS UI, 14+ pages, Proxy, Maps, Redux, Edit modals, Slide-overs
- Reports builder (Asset/Site), Multi-tenant, Column presets, Dark mode, Mobile responsive

### Phase 13 - RESERVATION MODULE (DONE)
Complete asset reservation and planning system with 14+ API endpoints

### Phase 14 - EXPORT CSV + ROLES + WEBSOCKET (DONE)
CSV Export, Roles & Permissions, WebSocket Real-Time

### Phase 15 - ZONES CERCLES PERSONNALISÉS (DONE)
Cercles et Polygones, Slider de rayon, Dessin interactif

### Phase 16 - ZONES MONGODB + RAPPORTS ADRESSE (DONE)
Zones CRUD MongoDB, Rapports - Adresse en fallback

### Phase 17 - GEOFENCING AVANCÉ (DONE)
3 types de zones, 3 modes de détection, BLE configurable, Alertes, Événements

### Phase 18 - ENTERPRISE COMMAND CENTER (DONE - Apr 6, 2026)
Interface unifiée style Samsara/Motive avec 5 sections:
1. **TopBar**: 4 KPIs temps réel (Assets actifs, Hors zone, Alertes, Batterie faible)
2. **Sidebar Assets**: Recherche, filtres par statut (Tous/Actif/Sorti/Inactif/Batt.), liste scrollable
3. **Carte Leaflet**: Smart markers colorés, clustering, toggle Routers/Zones, overlay BLE
4. **Panneau Détail**: Jauge batterie SVG, localisation GPS, infos asset, actions navigation
5. **Timeline Événements**: Événements zone récents en temps réel via WebSocket
- Route: `/command/center` (mode fullscreen, self-contained)
- WebSocket Live indicator
- Responsive mobile avec sidebar/detail en overlay

**Testing**: iteration_25.json - 13/13 features passed (100%)

## DB Schema (Local MongoDB `test_database`)
- reservations, reservation_logs, notifications, user_roles, maintenance_records
- zones, zone_events, zone_alerts

## API Endpoints
### Reservations, Roles, Notifications, Maintenance, WebSocket
(See previous PRD for full endpoint list)

### Zones (Geofencing)
- POST/GET /api/zones, GET/PUT/DELETE /api/zones/{id}
- POST/GET /api/zones/events, GET /api/zones/events/stats
- POST /api/zones/detect, POST /api/zones/trigger
- POST/GET/PUT/DELETE /api/zones/alerts

## Pending/Future Tasks

### P1 - Next
- Connecter WebSocket aux assets pour tracking temps réel sur Command Center
- Skeleton loading + animations pour le Command Center

### P2 - Future
- Export Timeline (PDF/Excel) depuis le Command Center
- Grid/card view sur autres pages (Engins, Tags)
- Presets pour configuration colonnes

### P3 - Backlog
- Maintenance records UI (registres de maintenance des assets)
- Scan QR/NFC (check-in/out rapide, orienté mobile)
- Carte GPS temps réel sur dashboard
- Notifications Email/Push (différé par l'utilisateur)
- Multi-language

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_25.json`
