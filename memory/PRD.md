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
├── PremiumSidebar.jsx      # Collapsible sidebar (11 nav items + logout)
├── PremiumBottomNav.jsx    # Mobile bottom navigation
├── PremiumDashboard.jsx    # Dashboard: KPIs, mini map, alerts, activity
├── PremiumAssets.jsx       # Assets: card/list views, search, filters, detail modal
├── PremiumMap.jsx          # Map: fullscreen Leaflet, sidebar, clustering, filters
├── PremiumActivity.jsx     # Activity: timeline, stats, search, filter chips
├── PremiumAlerts.jsx       # Alerts: severity, stats, resolve/mark buttons
├── PremiumZones.jsx        # Zones: Leaflet polygons, zone panel, detail drawer
├── PremiumUsers.jsx        # Users: stats, table, avatars, search, export
├── PremiumSettings.jsx     # Settings: 4 tabs (Entreprise/Familles/Statuts/Corbeille)
├── PremiumReports.jsx      # Reports: type cards, generated report list, actions
└── PremiumGateway.jsx      # Gateway: stats, Leaflet map, gateway panel, logs
```

## Routing
Routes dynamiques via API menus + EXTRA_MENU (config.js) -> components.js mapping:
- `/tagdashboard/index` -> PremiumDashboard
- `/tour/index` -> PremiumMap (fullscreen)
- `/view/engin/index` -> PremiumAssets
- `/Geofence/index` -> PremiumZones
- `/LOGS/index` -> PremiumActivity
- `/alert/index` -> PremiumAlerts
- `/view/staff/index` -> PremiumUsers
- `/gateway/index` -> PremiumGateway
- `/rapport/index` -> PremiumReports
- `/menu/setup` -> PremiumSettings (tabs internes)
- `/customer/index` -> Clients (legacy)

## Completed Features

### Phase 1 - Environment Setup (DONE)
- Cloned React environment, fixed Craco/Webpack/ESLint
- API proxy on backend (/api/proxy/) to avoid CORS/cookie issues

### Phase 2 - Premium SaaS Layout (DONE)
- PremiumLayout replaces Metronic MasterLayout
- Collapsible sidebar, Mobile bottom nav, fullscreen mode for Map page

### Phase 3 - Premium Dashboard (DONE)
- 4 KPI cards with real API data, progress bars, click-to-filter
- Mini map widget, Alerts feed, Activity timeline widgets

### Phase 4 - Premium Assets Page (DONE)
- Card grid + List view toggle, Search, Filter chips, Detail modal, Export, Pagination

### Phase 5 - Premium Map Page (DONE)
- Fullscreen Leaflet map, Independent sidebar, Marker clustering, Popup

### Phase 6 - Activity, Alerts, Zones Pages (DONE)
- Activity: Stats, timeline, filters, search
- Alerts: Stats par type, severity badges, "Marquer traité"
- Zones: Leaflet polygons, zone panel, detail drawer

### Phase 7 - Users, Settings, Reports, Gateway Pages (DONE - Apr 5, 2026)
- **Utilisateurs**: Stats (15 Total/14 Actifs/1 Inactifs), table with avatars, search, Excel/PDF export
- **Paramètres**: 4 onglets internes (Entreprise/Familles/Statuts/Corbeille)
  - Entreprise: Info fields (Nom, Secteur, Contact, Adresse)
  - Familles: Object filter chips + famille list (real API)
  - Statuts: Table with color dots, icons (real API)
  - Corbeille: 50 inactive items with restore action
- **Rapports**: 3 type cards (Présence/Mouvement/Localisation), 214 generated reports, search, download/view/delete
- **Gateway**: Stats (5 Total/5 En ligne), Leaflet map with gateway markers, gateway list panel, event logs timeline
- **Testing**: 100% (iteration_14.json) - All 10 premium pages + login + sidebar

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
- External API slowness (15-20s load times)
- WebSocket connection failures to external API (wss://omniyat.is-certified.com)
- Zones page uses MOCK_ZONES (not API-driven yet)
- Dashboard alerts/activity widgets use static mock data

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_14.json`
