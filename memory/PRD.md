# LOGITAG - PRD (Product Requirements Document)

## Date: 2026-03-09

## Problem Statement Original
Faire une app LOGITAG à partir de code existant sur GitHub https://github.com/janouinfo-design/LOGITAG_NEW
Récupérer le code, installer les packages, fournir la visualisation.
Puis: "fais moi un nouveau design propre et moderne" + redesign du contenu interne (dashboard, KPI cards, charts, sidebar, header, etc.)

## Architecture
- **Frontend**: React 18 + TypeScript + Metronic UI + Redux Toolkit + PrimeReact + Leaflet + Socket.IO
- **Backend**: External API at https://omniyat.is-certified.com:82/logitag_node/
- **Database**: External MSSQL
- **Build**: CRA with Craco, SCSS/Sass, Tailwind CSS

## What's Been Implemented

### Session 1 - Initial Setup (2026-03-09)
- [x] Cloned LOGITAG_NEW from GitHub
- [x] Fixed FontAwesome Pro→Free, Prettier import, Leaflet Geoman import
- [x] Configured environment variables

### Session 2 - Login Redesign (2026-03-09)
- [x] Modern split-panel login (dark branded left + white form right)
- [x] Manrope + Inter fonts
- [x] New SplashScreen with dark theme

### Session 3 - Full Internal Redesign (2026-03-09)
- [x] **logitag-theme.css** - Global CSS overrides for entire app:
  - Sidebar: dark theme (#0F172A), blue active states, smooth hover animations
  - Header: backdrop blur glass effect
  - Content area: rounded corners, subtle shadows
  - Cards: 14px radius, hover elevation, fade-in animations
  - Buttons: 10px radius, colored shadows
  - Form inputs: focus glow, clean borders
  - PrimeReact tables: clean headers, no heavy borders
  - PrimeReact dialogs/dropdowns: modern rounded styles
  - Badges: soft colored backgrounds
  - Maps (Leaflet): rounded container
  - SweetAlert2: rounded popups
  - Scrollbar: thin custom scrollbar
- [x] **KPICardGrid.js** - Redesigned KPI cards:
  - Colored gradient icon boxes with shadow
  - Clean progress bars with percentage badges
  - Staggered entrance animations
  - Responsive grid layout
  - Trend indicators (up/down arrows)
- [x] **ChartGrid.js** - Redesigned chart cards:
  - Clean card containers, no heavy borders
  - Custom Chart.js config (no grid, rounded bars, Manrope fonts)
  - Dark tooltips, subtle hover effects
  - Responsive grid layout
- [x] **DashboardContent.js** - Redesigned dashboard:
  - Custom tab bar (pill-style, not PrimeReact TabView)
  - Inline filters bar (period selector, status/model dropdowns, apply button)
  - Modern header with title + subtitle
  - Empty state placeholders
  - Clean section layout

## Tests: 100% passed (13/13 tests - iteration 3)

## Prioritized Backlog
### P0 (Critical)
- Test full auth flow with valid credentials

### P1 (Important)
- Verify dashboard renders correctly after login (KPI cards, charts with real data)
- Test other internal pages (Engins, Tags, Customers, Geofencing)

### P2 (Nice to have)
- Dark mode toggle support
- Mobile responsiveness fine-tuning
- Additional chart types (pie, doughnut for analytics tab)

## Next Tasks
1. User to provide login credentials
2. Verify all internal pages with real data
3. Fine-tune specific page designs as needed
