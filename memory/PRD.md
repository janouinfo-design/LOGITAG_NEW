# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS (style Samsara/Stripe/Uber Fleet). React + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Lucide React, Leaflet
- **Backend**: FastAPI proxy vers API externe
- **External API**: omniyat.is-certified.com:82/logitag_node/ (via /api/proxy/)
- **Auth**: admin / user@1234

## Premium Pages Architecture
```
/app/frontend/src/components/premium/
├── PremiumLayout.jsx            # Layout (sidebar + main, fullscreen map)
├── PremiumSidebar.jsx           # 11 nav items + logout
├── PremiumBottomNav.jsx         # Mobile bottom nav
├── PremiumDashboard.jsx         # KPIs, mini map, alerts, activity
├── PremiumAssets.jsx            # Card/list views, search, filters, detail modal
├── PremiumAssetDetail.jsx       # Stripe-style detail: map, timeline, battery, tag BLE
├── PremiumMap.jsx               # Fullscreen Leaflet, clustering, filters
├── PremiumActivity.jsx          # Timeline, stats, search, filter chips
├── PremiumAlerts.jsx            # Severity, stats, resolve buttons
├── PremiumZones.jsx             # Leaflet polygons, zone panel
├── PremiumUsers.jsx             # Stats, table, avatars, search, export
├── PremiumSettings.jsx          # 4 tabs (Entreprise/Familles/Statuts/Corbeille)
├── PremiumReports.jsx           # Type cards, report list, actions
└── PremiumGateway.jsx           # Stats, Leaflet map, gateway panel, logs
```

## Routes
- `/tagdashboard/index` -> PremiumDashboard
- `/tour/index` -> PremiumMap (fullscreen)
- `/view/engin/index` -> PremiumAssets
- `/asset/detail` -> PremiumAssetDetail (from Assets click)
- `/Geofence/index` -> PremiumZones
- `/LOGS/index` -> PremiumActivity
- `/alert/index` -> PremiumAlerts
- `/view/staff/index` -> PremiumUsers
- `/gateway/index` -> PremiumGateway
- `/rapport/index` -> PremiumReports
- `/menu/setup` -> PremiumSettings (internal tabs)
- `/customer/index` -> Clients (legacy)

## Completed Features

### Phase 1-6 (Previous forks)
- Environment setup, FastAPI proxy, Premium Layout/Sidebar
- Dashboard, Assets, Map, Activity, Alerts, Zones pages - ALL DONE

### Phase 7 - Users, Settings, Reports, Gateway (DONE - Apr 5, 2026)
- **Utilisateurs**: 15 users, stats, table, avatars, search, export
- **Paramètres**: 4 internal tabs (Entreprise/Familles/Statuts/Corbeille)
- **Rapports**: 3 report type cards, 214 reports with actions
- **Gateway**: Stats, Leaflet map, gateway panel, event timeline

### Phase 8 - Asset Detail Page Stripe-style (DONE - Apr 5, 2026)
- 2-column layout: Main (map + timeline) + Sidebar (details, battery, tag, zone)
- Breadcrumb navigation ← Assets > [Reference]
- Hero with asset photo, name, status badges
- Leaflet mini-map with real GPS coordinates
- Activity timeline from LogsTracking slice
- Battery card with % + progress bar + 7-day chart
- Tag BLE card with ID, reference, movement status
- Localisation card with zone name + address
- Back button returns to Assets list
- Testing: 100% (iteration_15.json)

## Pending/Future Tasks

### P1 - Mobile & Polish
- Responsive mobile (verify PremiumBottomNav)
- Performance optimization

### P2 - Advanced Features
- WebSocket real-time (positions, alerts)
- Dark mode
- BLE Scan mode, proximity mode

### P3 - Extended
- Multi-tenant B2B (Settings, Clients)

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_15.json`
