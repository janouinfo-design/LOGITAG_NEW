# LOGITAG - Product Requirements Document

## Original Problem Statement
Créer/améliorer une application LOGITAG à partir de code existant sur le dépôt GitHub `https://github.com/janouinfo-design/LOGITAG_NEW` (ReactJS). L'utilisateur a demandé plusieurs refontes UI/UX globales (login, dashboard, datatables, filtres) pour rendre l'interface plus propre et moderne.

## Tech Stack
- **Frontend**: React 18, PrimeReact, Redux Toolkit, Metronic UI, Tailwind CSS, Leaflet
- **Backend**: EXTERNAL API (omniyat.is-certified.com:82/logitag_node/) - no local backend
- **Auth**: admin / user@1234

## Architecture
```
/app/frontend/src/
├── components/
│   ├── Dashboard/          # ACTIVE Dashboard (KPI cards, detail views)
│   ├── DashboardNew/       # INACTIVE/Legacy - DO NOT USE
│   ├── Engin/              # Engins list and details
│   ├── Tag/                # Tags list
│   ├── User/               # Authentication (LoginComponent)
│   └── shared/             # Shared UI (DatatableComponent)
├── logitag-theme.css       # Global modern styling
├── logitag-datatable.css   # Datatable specific styling
└── api/                    # Axios instances for external API
```

## Completed Features

### Phase 1 - Environment Setup (DONE)
- Cloned and configured React environment from LOGITAG_NEW repo
- Fixed Craco, Webpack, TS/JS conflicts, and ESLint compilation errors

### Phase 2 - UI/UX Overhaul (DONE)
- Redesigned Login Page (modern split-panel design)
- Created global modern UI themes: logitag-theme.css, logitag-datatable.css
- Redesigned main Dashboard KPI cards (DashboardListCards, CardDashboard)
- Replaced toggle switches with modern chips in column selector (DataTableComponent)
- Added default "Tous" (All) filter option to EnginList filters

### Phase 3 - Dashboard Detail Hybrid View (DONE - Feb 25, 2026)
- **Option D implemented**: Hybrid Toggle Table/Cartes for Dashboard Detail
- Toggle button in header to switch between Table and Card Grid views
- Initial card grid with basic layout - Testing: 100% (iteration_8.json)

### Phase 4 - Car-Rental Style Card Redesign + Detail Modal (DONE - Feb 25, 2026)
- **5-column grid** layout inspired by car rental website design
- **New card design**: Header (REF + "Détails →" button), large photo/icon area, famille in colored text, status chips, location footer
- **Detail Modal** when clicking "Détails →":
  - Tag modal: STATUT pills (Actif/Inactif), fields (ID Tag, Label, Famille, Status, Adresse)
  - Engin modal: Photo, STATUT pills (Réception/Sortie/Non actif), 12 fields, battery bar with visual indicator, "Voir sur la carte" button
- **Responsive grid**: 5 cols → 4 → 3 → 2 → 1 based on viewport
- Search bar with live filtering and result count
- Testing: 100% pass rate (iteration_9.json)

## Pending/Future Tasks

### P2 - Grid/Card View for Other Pages
- Implement grid/card view options on Engins and Tags list pages (same style)

### P2 - Column Configuration Presets
- Add "Presets" for the column configuration panel (e.g., "Full view", "Simple view")

### P3 - Real-time GPS Map Widget
- Add a GPS map widget directly on the dashboard

## Known Issues
- External API slowness (omniyat.is-certified.com) - out of control
- Browser caching issues for user - advise incognito/hard refresh
- Minor React warnings (non-boolean attributes, missing keys) - LOW priority

## Key Files
1. `/app/frontend/src/logitag-theme.css` - Global modern theme
2. `/app/frontend/src/logitag-datatable.css` - Datatable styling
3. `/app/frontend/src/components/Dashboard/user-interface/DashboardDetail/DashboardDetail.jsx` - Car-rental style cards + detail modal
4. `/app/frontend/src/components/Dashboard/user-interface/DashboardTable/DashboardTable.jsx` - Toggle container
5. `/app/frontend/src/components/shared/DatatableComponent/DataTableComponent.jsx` - Core shared datatable
6. `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Engin filters

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_9.json`
