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
└── PremiumMap.jsx          # Map: fullscreen Leaflet, sidebar, clustering, filters
```

## Completed Features

### Phase 1 - Environment Setup (DONE)
- Cloned React environment, fixed Craco/Webpack/ESLint
- API proxy on backend (/api/proxy/) to avoid CORS/cookie issues

### Phase 2 - Premium SaaS Layout (DONE - Apr 5, 2026)
- PremiumLayout replaces Metronic MasterLayout
- Collapsible sidebar (260px → 72px), 8 nav items + logout
- Mobile bottom nav, fullscreen mode for Map page
- Testing: 100% (iteration_10.json)

### Phase 3 - Premium Dashboard (DONE - Apr 5, 2026)
- 4 KPI cards with real API data, progress bars, click-to-filter
- Mini map widget, Alerts feed, Activity timeline widgets
- Default route: /tagdashboard/index
- Testing: 100% (iteration_10.json)

### Phase 4 - Premium Assets Page (DONE - Apr 5, 2026)
- Fusion Engins + Tags into "Assets" view
- Card grid (4 cols) + List view toggle
- Search bar, Filter chips (Tous/Entrée/Sortie)
- Detail modal: photo, STATUT pills, 10 fields, battery bar, "Voir sur la carte" / "Fiche complète"
- Export button, Pagination
- Testing: 100% (iteration_11.json)

### Phase 5 - Premium Map Page (DONE - Apr 5, 2026)
- Fullscreen Leaflet map with CARTO tiles
- Independent sidebar: asset list, search, filters (Tous/Entrée/Sortie)
- Marker clustering, color-coded markers by status
- Popup with photo, status, battery, actions
- FAB buttons (Recentrer, Calques), Stats overlay
- Sidebar toggle (collapse/expand)
- Testing: 100% (iteration_12.json)

## Pending/Future Tasks

### P1 - Remaining Pages
- Page Détail Asset: style Stripe (infos, batterie graph, mini map, historique, zones)
- Zones management: création polygon sur carte, règles entrée/sortie
- Activity page: timeline globale avec événements réels (pas mock)
- Alerts center: alertes dynamiques depuis API

### P2 - Advanced Features
- WebSocket temps réel (positions, alertes)
- Dark mode support
- Mode Scan BLE, Mode proximité

### P3 - Polish
- Responsive mobile complet
- Performance optimisation
- Multi-tenant B2B

## Known Issues
- External API slowness (omniyat.is-certified.com)
- Most assets have 0 GPS coordinates (map shows "0 localisés")
- Alerts feed & Activity timeline use static/mock data
- WebSocket not proxied yet

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_12.json`
