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
├── PremiumLayout.jsx, PremiumSidebar.jsx, PremiumBottomNav.jsx
├── PremiumDashboard.jsx, PremiumAssets.jsx, PremiumAssetDetail.jsx
├── PremiumMap.jsx, PremiumPlanning.jsx
├── PremiumActivity.jsx, PremiumAlerts.jsx, PremiumZones.jsx
├── PremiumUsers.jsx, PremiumSettings.jsx, PremiumReports.jsx, PremiumGateway.jsx
```

## Completed Features

### Phase 1-8 (Previous forks) - ALL DONE
- Full Premium SaaS UI with 14 pages, FastAPI proxy, Leaflet maps, Redux

### Phase 9 - Planning + Edit Modals (DONE - Apr 5, 2026)
- Planning page with FullCalendar resource-timeline
- Asset edit modal (13 fields), Tag Label fix, Map pagination, Photo upload

### Phase 10 - 5 Enhancements (DONE - Apr 6, 2026)
1. Zones edit/delete modal
2. Activity time filters (Aujourd'hui, Semaine, Mois, Personnalisé)
3. Alerts time filters
4. Users create/edit modal
5. Gateway edit modal

### Phase 11 - Map Slide-over + Planning Activity (DONE - Apr 6, 2026)
- Map detail slide-over panel (replaces popup navigation)
- Planning activity log slide-over panel

### Phase 12 - Reports Redesign (DONE - Apr 6, 2026)
- Simplified to 2 report types: **Rapport par Asset** and **Rapport par Site**
- 3-panel builder: Type selector, Item selector (Assets/Sites), Configuration
- Focus on entrées/sorties (no speed data)
- Result view with: summary cards (Entrées, Sorties, Durée, Moy./jour), grouped data tables
- Features: search, select all, date presets, auto-send config
- Testing: 15/15 tests passed (iteration_18.json)
- Note: Report data is MOCKED (client-side generated) due to slow external API

## Pending/Future Tasks

### P1 - Polish & Mobile
- Responsive mobile verification
- Performance optimization

### P2 - Advanced
- WebSocket real-time / Dark mode / BLE Scan
- Better FullCalendar free alternative evaluation

### P3 - Extended
- Multi-tenant B2B / Column presets / GPS Widget dashboard

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_18.json`
