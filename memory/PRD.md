# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS (style Samsara/Stripe/Uber Fleet). Garder React existant + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, PrimeReact, Redux Toolkit, TailwindCSS, ShadCN UI, Lucide React, Leaflet
- **Backend**: FastAPI + MongoDB (proxy vers API externe)
- **External API**: omniyat.is-certified.com:82/logitag_node/ (proxied via /api/proxy/)
- **Auth**: admin / user@1234

## Architecture
```
/app/frontend/src/components/premium/
├── PremiumLayout.jsx       # Main layout (sidebar + main area, fullscreen for map)
├── PremiumSidebar.jsx      # Collapsible sidebar (8 nav items + logout)
├── PremiumBottomNav.jsx    # Mobile bottom navigation (5 items)
├── PremiumDashboard.jsx    # Dashboard: KPIs, mini map, alerts, activity
├── PremiumAssets.jsx       # Assets page: card/list views, search, filters, modal
├── PremiumMap.jsx          # Map: fullscreen Leaflet, sidebar, clustering, filters
├── PremiumActivity.jsx     # Activity: timeline, stats, search, filter chips
├── PremiumAlerts.jsx       # Alerts: severity, stats, resolve/mark buttons
└── PremiumZones.jsx        # Zones: Leaflet polygons, zone panel, detail drawer
```

## Routing
Routes dynamiques via API menus + EXTRA_MENU (config.js) -> components.js mapping:
- `/tagdashboard/index` → PremiumDashboard
- `/tour/index` → PremiumMap (fullscreen)
- `/view/engin/index` → PremiumAssets
- `/Geofence/index` → PremiumZones
- `/LOGS/index` → PremiumActivity
- `/alert/index` → PremiumAlerts

## Completed Features

### Phase 1 - Environment Setup (DONE)
- Cloned React environment, fixed Craco/Webpack/ESLint
- API proxy on backend (/api/proxy/) to avoid CORS/cookie issues

### Phase 2 - Premium SaaS Layout (DONE - Apr 5, 2026)
- PremiumLayout replaces Metronic MasterLayout
- Collapsible sidebar (260px → 72px), 8 nav items + logout
- Mobile bottom nav, fullscreen mode for Map page

### Phase 3 - Premium Dashboard (DONE - Apr 5, 2026)
- 4 KPI cards with real API data, progress bars, click-to-filter
- Mini map widget, Alerts feed, Activity timeline widgets

### Phase 4 - Premium Assets Page (DONE - Apr 5, 2026)
- Card grid (4 cols) + List view toggle
- Search bar, Filter chips, Detail modal, Export button, Pagination

### Phase 5 - Premium Map Page (DONE - Apr 5, 2026)
- Fullscreen Leaflet map with CARTO tiles
- Independent sidebar, Marker clustering, color-coded markers
- Popup with details, FAB buttons, Stats overlay

### Phase 6 - Activity, Alerts, Zones Pages (DONE - Apr 5, 2026)
- **Activity**: Stats cards (Entrées/Sorties/Alertes/Hors ligne), timeline avec données réelles, filtres, recherche
- **Alertes**: Stats par type, badges de sévérité (Critique/Attention/Info), bouton "Marquer traité", filtres
- **Zones**: Carte Leaflet avec polygones colorés, panneau latéral, tiroir de détails, règles d'alerte
- Routes ajoutées dans EXTRA_MENU + components.js
- Testing: 100% (iteration_13.json)

## Pending/Future Tasks

### P0 - Asset Detail Page
- Page Détail Asset: style Stripe (infos, batterie graph, mini map, historique, zones)

### P1 - Mobile & Polish
- Responsive mobile complet (vérifier PremiumBottomNav)
- Performance optimisation

### P2 - Advanced Features
- WebSocket temps réel (positions, alertes)
- Dark mode support
- Mode Scan BLE, Mode proximité

### P3 - Extended
- Multi-tenant B2B (Settings, Clients)

## Known Issues
- External API slowness (omniyat.is-certified.com)
- Most assets have 0 GPS coordinates (map shows "0 localisés")
- Zones page uses MOCK_ZONES (not API-driven yet)
- Dashboard alerts/activity widgets use static mock data

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_13.json`
