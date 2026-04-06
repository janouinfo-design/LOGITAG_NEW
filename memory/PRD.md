# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS. React + FastAPI + MongoDB + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Shadcn/Lucide-react, Leaflet, FullCalendar
- **Backend**: FastAPI + MongoDB (local) + Proxy vers API externe
- **External API**: omniyat.is-certified.com:82/logitag_node/
- **Auth**: admin / user@1234

## Architecture
```
/app/
├── backend/
│   └── server.py                   # FastAPI: proxy + reservations + notifications API
├── frontend/src/components/premium/
│   ├── PremiumLayout.jsx           # Multi-tenant client selector
│   ├── PremiumSidebar.jsx          # Dark mode toggle
│   ├── PremiumDashboard.jsx
│   ├── PremiumAssets.jsx           # Column presets
│   ├── PremiumAssetDetail.jsx
│   ├── PremiumMap.jsx              # Slide-over detail
│   ├── PremiumPlanning.jsx         # FullCalendar Gantt
│   ├── PremiumReservationPlanning.jsx  # NEW: Reservation calendar
│   ├── PremiumMyReservations.jsx       # NEW: My reservations
│   ├── PremiumReservationDashboard.jsx # NEW: KPI Dashboard + Alerts
│   ├── PremiumActivity.jsx, PremiumAlerts.jsx
│   ├── PremiumZones.jsx, PremiumUsers.jsx, PremiumGateway.jsx
│   ├── PremiumSettings.jsx, PremiumReports.jsx
/app/frontend/src/logitag-dark.css
```

## Completed Features

### Phase 1-12 (Previous sessions) - ALL DONE
- Full Premium SaaS UI, 14+ pages, Proxy, Maps, Redux, Edit modals, Slide-overs
- Reports builder (Asset/Site), Multi-tenant, Column presets, Dark mode, Mobile responsive

### Phase 13 - RESERVATION MODULE (DONE - Apr 6, 2026)
Complete asset reservation and planning system with 4 phases:

**Phase 1 - Backend (100% tested)**
- MongoDB collections: `reservations`, `reservation_logs`, `notifications`
- 14 API endpoints:
  - POST /api/reservations (create with anti-conflict validation)
  - GET /api/reservations (list with status/asset/user/site/date filters)
  - GET /api/reservations/{id} (detail with audit logs)
  - PUT /api/reservations/{id} (update with anti-conflict)
  - POST /api/reservations/{id}/cancel, approve, reject
  - POST /api/reservations/{id}/checkout, checkin
  - GET /api/reservations/kpis (dashboard KPIs)
  - GET /api/reservations/planning (calendar data)
  - GET /api/reservations/availability/{asset_id}
  - GET/PUT /api/notifications (CRUD, mark read, count)
- Anti-conflict: Returns 409 for overlapping reservations on same asset
- Statuts: confirmed, in_progress, completed, cancelled, requested, rejected, expired
- Audit trail: reservation_logs collection tracks all actions

**Phase 2 - Planning Page**
- Calendar views: Jour / Semaine / Mois
- Color-coded events by status
- Create reservation modal (asset, user, team, project, site, dates, priority, note)
- Detail drawer (slide-over) with reservation info
- Filters: status, site, search
- Navigation: prev/next, today

**Phase 3 - Mes Réservations**
- Active/History tabs
- Reservation cards with status badges (En cours, Confirmé, En retard)
- Quick actions: Check-out, Check-in, Cancel, View detail
- Check-out modal: responsable, lieu, état, commentaire
- Check-in modal: responsable, état retour, commentaire
- Overdue indicator (red badge "En retard")

**Phase 4 - Dashboard KPI + Centre d'alertes**
- 6 KPI cards: Totales, En cours, Confirmées, Aujourd'hui, En retard, Terminées
- Centre d'alertes in-app: notifications with severity (error/warning/info)
- "Tout marquer lu" functionality
- Top 5 assets les plus réservés
- Réservations récentes avec badges de statut
- Actualiser button

**Testing**: iteration_20.json - 100% backend (20/20) + 100% frontend

## Pending/Future Tasks

### P1 - Reservation Enhancement
- Drag & drop réservations dans le planning
- Intégration BLE: comparer site prévu vs position réelle
- Alertes push / email (intégration SendGrid)
- Scan QR/NFC pour check-out rapide

### P2 - Advanced
- Rôles/Permissions (super admin, admin client, manager, utilisateur terrain)
- WebSocket temps réel pour alertes
- Maintenance records module

### P3 - Extended
- Dark mode vérification complète mobile
- Multi-language
- Export CSV/PDF des réservations

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_20.json`
- `/app/backend/tests/test_reservations.py` (pytest)
