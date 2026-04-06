# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) vers un SaaS Premium Enterprise. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Leaflet, FullCalendar
- **Backend**: FastAPI + MongoDB (local) + Proxy API externe + WebSocket
- **External API**: omniyat.is-certified.com:82/logitag_node/
- **Auth**: admin / user@1234

## Completed Features

### Phase 1-17 - ALL DONE
- Full Premium SaaS UI, Reservation Module, CSV Export, Roles & Permissions
- WebSocket Real-Time, Advanced Geofencing (3 zone types, 3 detection modes)

### Phase 18-19 - ENTERPRISE COMMAND CENTER + GATEWAY (DONE)
- 5-panel layout (TopBar, Sidebar, Map, Detail, Timeline)
- Gateway TYPE/MODE/SITE fonctionnels + Mode de Détection (Entrée/Sortie/Les deux)
- Address autocomplete (Photon/OSM) dans réservations

### Phase 20 - TRACKING + SKELETON + EXPORT (DONE)
- Auto-refresh 30s, skeleton loading, export CSV/PDF

### Phase 21 - JOURNAL RICHE (DONE - Apr 6, 2026)
Timeline redesignée en cartes de journal enrichies:
- **Paires Entrée/Sortie** avec calcul de durée
- **Données affichées**: Type, Asset, Entrée, Sortie, Durée, Site/Zone, Routeur, RSSI (badge coloré)
- **RSSI coloré**: Vert (>-60), Jaune (>-80), Rouge (<-80)
- **Cliquable**: Click sur carte → highlight + localise l'asset sur la carte
- **Fusion données**: Zone events locaux (MongoDB) + logs API externe quand disponibles
- **Export enrichi**: CSV 8 colonnes + PDF 8 colonnes (Événement/Asset/Zone/Entrée/Sortie/Durée/Routeur/RSSI)
- **Testing**: iteration_28.json - 92% (11/12, 1 mineur corrigé)

## DB Schema (Local MongoDB `test_database`)
- reservations, zones, zone_events, zone_alerts
- reservation_logs, notifications, user_roles

## Pending/Future Tasks

### P2 - Next
- Grid/card view sur autres pages (Engins, Tags)
- Presets pour configuration colonnes

### P3 - Backlog
- Maintenance records UI
- Scan QR/NFC
- Notifications Email/Push (différé)
- Multi-language

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_28.json`
