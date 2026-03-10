# LOGITAG - PRD (Product Requirements Document)

## Date: 2026-03-10

## Problem Statement
Faire une app LOGITAG à partir de code existant sur GitHub https://github.com/janouinfo-design/LOGITAG_NEW
Récupérer le code, installer les packages, fournir la visualisation, et redesigner avec un design propre et moderne.

## Architecture
- **Frontend**: React 18 + TypeScript + Metronic UI + Redux Toolkit + PrimeReact + Leaflet + Socket.IO
- **Backend**: External API at https://omniyat.is-certified.com:82/logitag_node/
- **Auth**: admin / user@1234
- **Build**: CRA with Craco, SCSS/Sass, Tailwind CSS

## What's Been Implemented

### Session 1 - Setup (2026-03-09)
- [x] Cloned LOGITAG_NEW, installed ~90+ packages, fixed compilation errors

### Session 2 - Login Redesign (2026-03-09)
- [x] Modern split-panel login + SplashScreen

### Session 3 - Global Theme (2026-03-09)
- [x] logitag-theme.css: sidebar dark, header glass, cards, buttons, forms, tables, maps

### Session 4 - Dashboard Redesign (2026-03-10)
- [x] Identified correct components (Dashboard/ not DashboardNew/)
- [x] CardDashboard.jsx: modern cards with colored icon boxes, progress bars, percentage badges
- [x] DashboardListCards.jsx: modern header, subtitle, clean Mode button, flex grid
- [x] DashboardList.jsx: circle mode with modern circular progress, clean cards
- [x] DashboardComponent.jsx: clean wrapper with F8FAFC background
- [x] Tests: 95% pass (17 tests passed, 2 minor LOW priority warnings)

## Prioritized Backlog
### P0
- None (all critical features working)

### P1
- Redesign other pages (Engins list, Tags, Map, Facturation) with same modern style
- Fix React console warnings (missing key props, non-boolean attributes)

### P2
- Dark mode toggle
- Mobile responsiveness tuning
- Dashboard chart integration

## Next Tasks
1. Redesign Engins/Tags list pages with modern tables
2. Redesign Map page
3. Add more dashboard widgets if needed
