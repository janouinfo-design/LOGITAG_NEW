# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS (style Samsara/Stripe Dashboard). React + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Shadcn/Lucide-react, Leaflet, FullCalendar
- **Backend**: FastAPI proxy vers API externe
- **External API**: omniyat.is-certified.com:82/logitag_node/ (via /api/proxy/)
- **Auth**: admin / user@1234

## Premium Pages Architecture
```
/app/frontend/src/components/premium/
├── PremiumLayout.jsx (Multi-tenant client selector bar)
├── PremiumSidebar.jsx (Dark mode toggle)
├── PremiumBottomNav.jsx
├── PremiumDashboard.jsx
├── PremiumAssets.jsx (Column presets + tenant filtering)
├── PremiumAssetDetail.jsx
├── PremiumMap.jsx (Slide-over detail panel)
├── PremiumPlanning.jsx (FullCalendar Gantt + slide-over)
├── PremiumActivity.jsx, PremiumAlerts.jsx
├── PremiumZones.jsx, PremiumUsers.jsx, PremiumGateway.jsx
├── PremiumSettings.jsx
├── PremiumReports.jsx (2-type report builder: Asset + Site)
/app/frontend/src/logitag-dark.css (Complete dark mode theme)
```

## Completed Features

### Phase 1-8 (Previous forks) - ALL DONE
- Full Premium SaaS UI with 14 pages, FastAPI proxy, Leaflet maps, Redux

### Phase 9 - Planning + Edit Modals (DONE)
- Planning page with FullCalendar resource-timeline
- Asset edit modal (13 fields), Tag Label fix, Map pagination, Photo upload

### Phase 10 - 5 Enhancements (DONE)
- Zones edit/delete modal, Activity/Alerts time filters, Users/Gateway modals

### Phase 11 - Map Slide-over + Planning Activity (DONE)
- Map detail slide-over panel, Planning activity log slide-over

### Phase 12 - Reports Redesign (DONE - Apr 6, 2026)
- 2 report types: Rapport par Asset + Rapport par Site
- 3-panel builder with entry/exit focus, summary cards
- Tests: 15/15 passed (iteration_18.json)

### Phase 13 - Multi-tenant B2B + Presets + Mobile + Dark Mode (DONE - Apr 6, 2026)
1. **Multi-tenant B2B** - Global client selector in PremiumLayout header
   - Dropdown with customer list (LOGITRAK, CLIENT01)
   - Filters Assets page by selected client
   - "Tous les clients" shows all data

2. **Column Presets** - Assets page column configuration
   - 3 presets: Vue complète (12 cols), Vue standard (8 cols), Vue simple (4 cols)
   - 12 individually toggleable columns (Photo, Référence, Label, Zone, Batterie, etc.)
   - Saved in localStorage

3. **Mobile Responsive** - Media queries for Reports builder, Layout, Slide-overs
   - Reports 3-panel stacks to single column on mobile
   - Tenant bar responsive

4. **Dark Mode** - Complete dark theme via CSS class toggle
   - Toggle in sidebar bottom (Moon/Sun icons)
   - Persisted in localStorage
   - Covers: Sidebar, Cards, Lists, Modals, Reports, Map, Planning, Inputs, Buttons
   - Tests: 17/17 passed (iteration_19.json)

## Pending/Future Tasks

### P1 - Further Mobile Polish
- Test all pages on actual mobile device
- Slide-over panels on small screens

### P2 - Advanced Features
- WebSocket real-time / BLE Proximity Scan
- Real report data from API with cache layer

### P3 - Extended
- GPS Widget on dashboard
- Multi-language support

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_19.json`
