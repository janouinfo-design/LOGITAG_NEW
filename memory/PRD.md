# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS (style Samsara/Stripe/Uber Fleet). React + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Shadcn/Lucide-react, Leaflet, FullCalendar
- **Backend**: FastAPI proxy vers API externe
- **External API**: omniyat.is-certified.com:82/logitag_node/ (via /api/proxy/)
- **Auth**: admin / user@1234

## Premium Pages Architecture
```
/app/frontend/src/components/premium/
├── PremiumLayout.jsx            # Layout (sidebar + main, fullscreen map)
├── PremiumSidebar.jsx           # 12 nav items + logout
├── PremiumBottomNav.jsx         # Mobile bottom nav
├── PremiumDashboard.jsx         # KPIs, mini map, alerts, activity
├── PremiumAssets.jsx            # Card/list views, search, filters, edit modal, pagination
├── PremiumAssetDetail.jsx       # Stripe-style detail: map, timeline, battery, tag BLE, edit modal, photo upload
├── PremiumMap.jsx               # Fullscreen Leaflet, clustering, filters, sidebar pagination
├── PremiumPlanning.jsx          # NEW: Gantt/timeline with FullCalendar resource-timeline
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
- `/timeline/index` -> PremiumPlanning (NEW)
- `/asset/detail` -> PremiumAssetDetail (from Assets click)
- `/Geofence/index` -> PremiumZones
- `/LOGS/index` -> PremiumActivity
- `/alert/index` -> PremiumAlerts
- `/view/staff/index` -> PremiumUsers
- `/gateway/index` -> PremiumGateway
- `/rapport/index` -> PremiumReports
- `/menu/setup` -> PremiumSettings
- `/customer/index` -> Clients

## Completed Features

### Phase 1-8 (Previous forks)
- Environment setup, FastAPI proxy, Premium Layout/Sidebar
- Dashboard, Assets, Map, Activity, Alerts, Zones, Users, Settings, Reports, Gateway
- Stripe-style Asset Detail page with map, timeline, battery, tag BLE
- Asset editing modals (13 fields), Tag Label display fix, Map sidebar pagination, Photo upload

### Phase 9 - Planning/Calendar Page (DONE - Apr 5, 2026)
- **Full Gantt/Timeline view** using FullCalendar resource-timeline plugin
- **Engin/Worksite toggle** for switching between asset and site views
- **Filters**: Status dropdown, Movement dropdown (Entrée/Sortie)
- **Search**: Debounced search across assets
- **Pagination**: Page numbers (1-5), prev/next, record count display
- **Date Navigation**: "Aujourd'hui" button, days selector (1/2/5/10), prev/next arrows, date range display
- **Timeline Zoom**: +/- buttons to adjust slot duration (5-min increments), current slot badge
- **Asset Rows**: Photo, reference, tag ID, movement/status icons
- **Event Rendering**: Color-coded (blue for entrée, red for sortie), tooltips with dates
- **Sidebar Integration**: CalendarDays icon added to premium sidebar
- Testing: Screenshot verified

### Phase 9b - Edit Modal Enhancement (DONE - Apr 5, 2026)
- Added 7 new fields: Tag, Famille, Situation, Statut, Site, Adresse, Infos additionnelles
- 2-column grid layout, scrollable, full-width for address fields
- Applied to both Assets page and Asset Detail page modals
- Fix: Activity log timeout (8s) + Redux setLogList dispatch

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
