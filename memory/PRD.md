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
│   │   ├── EnterpriseCommand.jsx       # Samsara-like Command Center (fullscreen, replaces Carte)
│   │   ├── PremiumLayout.jsx           # Multi-tenant + fullscreen path management
│   │   ├── PremiumSidebar.jsx          # Navigation (Carte → Command Center)
│   │   ├── PremiumDashboard.jsx
│   │   ├── PremiumGateway.jsx          # Gateway CRUD with Type/Mode/Site/DetectionMode
│   │   ├── PremiumReservationPlanning.jsx  # Reservations with address autocomplete (Photon)
│   │   └── ... (14+ premium components)
│   ├── hooks/
│   │   └── useWebSocket.js
│   └── cors/config/config.js
```

## Completed Features

### Phase 1-12 (Previous sessions) - ALL DONE
- Full Premium SaaS UI, 14+ pages, Proxy, Maps, Redux, Edit modals, Slide-overs

### Phase 13-17 - ALL DONE
- Reservation Module (14+ endpoints), CSV Export, Roles & Permissions, WebSocket Real-Time
- Advanced Geofencing (3 zone types, 3 detection modes, BLE, alerts, events)

### Phase 18 - ENTERPRISE COMMAND CENTER (DONE - Apr 6, 2026)
- 5-panel layout: TopBar KPIs, Assets Sidebar, Leaflet Map with clustering, Detail Panel, Timeline
- Route: /command/center (fullscreen, self-contained)
- Replaces "Carte" in sidebar navigation (user request)

### Phase 19 - GATEWAY + RÉSERVATION AMÉLIORATIONS (DONE - Apr 6, 2026)
1. **Gateway Edit fonctionnel**:
   - TYPE dropdown chargé depuis l'API (types/typeItemsList: deviceType)
   - MODE dropdown chargé depuis l'API (types/typeItemsList: deviceMode)
   - SITE dropdown avec 37+ sites réels (fetchAllSites)
   - NOM field ajouté
   - Sauvegarde via device/save API (plus de fake save)
2. **Mode de Détection Gateway**:
   - 3 boutons visuels: Entrée uniquement, Sortie uniquement, Entrée + Sortie
   - Sélection interactive avec couleurs (vert/orange/bleu)
3. **Adresse autocomplétion Réservation**:
   - API Photon (OSM, gratuit, sans clé) pour suggestions d'adresses
   - Debounce 350ms, minimum 3 caractères
   - Stocke address, address_lat, address_lng dans MongoDB
   - Affichage dans le drawer de détail
4. **Sidebar Carte → Command Center**:
   - Lien "Carte" pointe vers /command/center (plus de doublure)

**Testing**: iteration_26.json - 100% (14/14 tests passed)

## DB Schema (Local MongoDB `test_database`)
- reservations: {id, asset_id, asset_name, start_date, end_date, user, status, site, priority, **address, address_lat, address_lng**}
- zones, zone_events, zone_alerts
- reservation_logs, notifications, user_roles, maintenance_records

## Pending/Future Tasks

### P1 - Next
- Connecter WebSocket aux assets pour tracking temps réel sur Command Center
- Skeleton loading + animations pour le Command Center

### P2 - Future
- Export Timeline (PDF/Excel) depuis le Command Center
- Grid/card view sur autres pages (Engins, Tags)
- Presets pour configuration colonnes

### P3 - Backlog
- Maintenance records UI
- Scan QR/NFC (check-in/out rapide, orienté mobile)
- Carte GPS temps réel sur dashboard
- Notifications Email/Push (différé par l'utilisateur)
- Multi-language

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_26.json`
