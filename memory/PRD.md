# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS. L'application doit ressembler à Samsara, Uber Fleet, Stripe Dashboard. L'utilisateur veut garder React existant et la connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, PrimeReact, Redux Toolkit, TailwindCSS, ShadCN UI, Lucide React
- **Backend**: FastAPI + MongoDB (proxy vers API externe)
- **External API**: omniyat.is-certified.com:82/logitag_node/ (proxied via /api/proxy/)
- **Auth**: admin / user@1234

## Architecture
```
/app/frontend/src/
├── components/
│   ├── premium/                # NEW Premium SaaS components
│   │   ├── PremiumLayout.jsx   # Main layout (sidebar + main area)
│   │   ├── PremiumSidebar.jsx  # Collapsible sidebar
│   │   ├── PremiumBottomNav.jsx # Mobile bottom navigation
│   │   └── PremiumDashboard.jsx # Dashboard with KPIs + widgets
│   ├── Dashboard/              # Dashboard detail views (cards, table, modal)
│   ├── DashboardNew/           # INACTIVE - DO NOT USE
│   ├── Engin/                  # Engins list
│   ├── Tag/                    # Tags list
│   ├── User/                   # Authentication
│   └── shared/                 # Shared UI (DatatableComponent)
├── app/routing/
│   └── PrivateRoutes.jsx       # Uses PremiumLayout (replaces MasterLayout)
└── configs/index.js            # Default route: tagdashboard/index
```

## Completed Features

### Phase 1 - Environment Setup (DONE)
- Cloned React environment, fixed Craco/Webpack/ESLint
- API proxy created on backend to avoid CORS/cookie issues

### Phase 2 - UI/UX Overhaul (DONE)
- Login page modern split-panel
- Global CSS themes (logitag-theme.css, logitag-datatable.css)
- DataTable column chips, "Tous" filter

### Phase 3 - Dashboard Detail Hybrid View (DONE)
- Toggle Tableau/Cartes, 5-column card grid, detail modals

### Phase 4 - Premium SaaS Layout (DONE - Apr 5, 2026)
- **PremiumLayout**: Replaces Metronic MasterLayout
- **PremiumSidebar**: Collapsible (260px → 72px), 8 nav items + logout
  - Dashboard, Carte, Assets, Zones, Activité, Alertes, Clients, Paramètres
  - Active state highlighting, smooth transitions
- **PremiumBottomNav**: Mobile bottom navigation (5 items)
- **PremiumDashboard**: 
  - 4 KPI cards with real API data, progress bars, click-to-filter
  - Mini map widget placeholder
  - Alerts feed (3 mock alerts)
  - Activity timeline (4 mock events)
- Default route changed to tagdashboard/index
- Testing: 100% pass rate (iteration_10.json)

## Pending/Future Tasks

### P0 - Phase 2: Core Pages
- Page Assets: fusion Engins + Tags, vues liste/cartes/map, recherche intelligente, filtres
- Page Détail Asset: style Stripe (infos, batterie, mini map, historique, zones)
- Page Map: fullscreen avec Mapbox GL JS, clustering, filtres

### P1 - Phase 3: Fonctionnalités avancées
- Alerts center (alertes dynamiques depuis API, pas mock)
- Activity timeline (événements depuis API, pas mock)
- Zones management (création zone polygon, règles)
- WebSocket temps réel

### P2 - Phase 4: Polish
- Dark mode
- Mobile responsive complet
- Performance optimisation
- Mode Scan BLE, Mode proximité

## Known Issues
- External API slowness (omniyat.is-certified.com) - out of control
- WebSocket connection to external API fails (not proxied yet)
- Alerts feed & Activity timeline use static/mock data
- Minor React warnings (non-boolean attributes, missing keys)

## Key Files
1. `/app/frontend/src/components/premium/PremiumLayout.jsx`
2. `/app/frontend/src/components/premium/PremiumSidebar.jsx`
3. `/app/frontend/src/components/premium/PremiumDashboard.jsx`
4. `/app/frontend/src/components/premium/PremiumBottomNav.jsx`
5. `/app/frontend/src/components/Dashboard/user-interface/DashboardDetail/DashboardDetail.jsx`
6. `/app/frontend/src/components/Dashboard/user-interface/DashboardTable/DashboardTable.jsx`
7. `/app/frontend/src/app/routing/PrivateRoutes.jsx`
8. `/app/backend/server.py` (proxy route)

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_10.json`
