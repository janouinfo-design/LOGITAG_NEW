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
├── PremiumAssets.jsx            # Card/list views, search, filters, edit modal, pagination
├── PremiumAssetDetail.jsx       # Stripe-style detail: map, timeline, battery, tag BLE, edit modal, photo upload
├── PremiumMap.jsx               # Fullscreen Leaflet, clustering, filters, sidebar pagination
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
- Utilisateurs, Paramètres, Rapports, Gateway pages

### Phase 8 - Asset Detail Page Stripe-style (DONE - Apr 5, 2026)
- 2-column layout, breadcrumb, hero, Leaflet mini-map, activity timeline, battery, tag BLE, zone cards

### Phase 9 - Asset Editing, Tag Labels, Map Pagination, Photo Upload (DONE - Apr 5, 2026)
- **Edit Modal (Assets page)**: Click pencil icon on card -> modal with 6 editable fields (reference, label, brand, model, VIN, immatriculation) using `createOrUpdateEngine` Redux thunk -> saves via `engin/save` API
- **Edit Modal (Asset Detail page)**: "Modifier" button in hero + "Éditer" button on details card -> same 6-field edit modal
- **Tag Label Display**: Changed from "ID Tag" to "Label Tag" in Asset Detail Tag BLE card. Uses `labeltag` field instead of `tagname` across all views
- **Map Sidebar Pagination**: 15 items per page with prev/next buttons in the Map sidebar. Resets to page 1 on filter/search change
- **Photo Upload Modal**: Camera overlay on asset photo in Asset Detail. Opens popup with current photo preview + FileUploadeComponent for upload (engin source, profile desc, 1MB limit)
- Testing: 100% (iteration_16.json)

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
- Column presets for datatables
- GPS map widget on dashboard

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_16.json`
