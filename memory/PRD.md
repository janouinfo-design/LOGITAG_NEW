# LOGITAG - Product Requirements Document

## Problem Statement
Transformer l'application LOGITAG (tracking d'assets IoT) en un SaaS B2B Enterprise-grade avec une interface moderne et cohérente. **CONTRAINTE CRITIQUE** : Modifications frontend UI/UX uniquement. Aucune modification des appels API, endpoints, payloads, Redux ou logique métier.

## Architecture
- **Frontend**: React 18, Redux Toolkit, PrimeReact, ApexCharts, Leaflet, SCSS, Tailwind
- **Backend**: API Externe Omniyat (https://omniyat.is-certified.com:82/logitag_node/) - NON modifiable
- **Auth**: admin / user@1234

## Completed Features

### Phase 1 - Fondations (Completed)
- [x] Clone et setup du repo LOGITAG_NEW
- [x] Fix Craco, Webpack, TS/JS conflicts, ESLint
- [x] Login page redesign (split-panel moderne)
- [x] Thème global SaaS (`logitag-saas.css`)
- [x] Correction icônes FontAwesome Pro → standards

### Phase 2 - Dashboard (Completed)
- [x] Dashboard "Operations Monitor" avec graphiques ApexCharts (Donut/Bar)
- [x] Filtre de période (Aujourd'hui, 7J, 30J, Custom)
- [x] Vue détail dynamique en bas du dashboard

### Phase 3 - Vignettes Carrées (Completed)
- [x] Vue vignettes par défaut sur EnginList, TagList, DashboardDetail
- [x] Toggle Grille/Tableau sur toutes les listes principales
- [x] Bouton de géolocalisation centré sur les vignettes
- [x] Chips modernes pour config colonnes DataTable
- [x] Option "Tous" dans les filtres

### Phase 4 - Pages Secondaires SaaS (Completed - 8 Avril 2026)
- [x] Page Calendrier: Header SaaS violet + toolbar moderne
- [x] Page Map: Header SaaS vert + carte Leaflet fonctionnelle
- [x] Page Rapports: Header SaaS orange + layout sidebar/contenu
- [x] Page Utilisateurs: Accessible via sidebar, header SaaS indigo
- [x] Page Paramètres (SetupInfo): Cartes de réglages

### Phase 5 - Journal d'Activité Timeline Immersive (Completed - 8 Avril 2026)
- [x] Header dark premium avec nom asset + LastSeen glassmorphism
- [x] Timeline verticale avec nœuds colorés (vert=Entrée, rouge=Sortie)
- [x] Cartes timeline modernes: badges, durées, sites cliquables
- [x] Indicateur "En cours" animé pour les entrées live

### Phase 6 - Fonctionnalités Avancées (Completed - 8 Avril 2026)
- [x] P1: Toggle Grille/Tableau sur la page Rapports (214 rapports en vignettes)
- [x] P2: Page Inventory SaaS (header rose + 3 cartes statistiques)
- [x] P2: Page Sites/Places SaaS (header teal + badge count)
- [x] P2: Presets de colonnes ("Vue simple" / "Vue complète") dans DataTable
- [x] P3: Widget carte GPS temps réel sur le Dashboard (Leaflet intégré)
- [x] P3: Filtre Entrée/Sortie (Tout/Entrées/Sorties) dans le Timeline

## Backlog (Restant)

### P3 (Basse priorité)
- [ ] Mode sombre (Dark Theme)
- [ ] Système de tri rapide sur les vues vignettes (Nom, Batterie, Statut)
- [ ] Animations de transition entre les pages

## Key Files
- `/app/frontend/src/logitag-saas.css` - Thème SaaS global
- `/app/frontend/src/components/components.js` - Routage dynamique
- `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Modèle vignettes
- `/app/frontend/src/components/Engin/EnginList/EnginMapLocation.js` - Dialog Journal
- `/app/frontend/src/components/shared/HistoryComponent/HistoryListComponent.js` - Panel Timeline
- `/app/frontend/src/components/Engin/EnginDetail/CardHistory.jsx` - Cartes Timeline
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx` - Dashboard + GPS Widget
- `/app/frontend/src/components/shared/DatatableComponent/DataTableComponent.jsx` - DataTable + Presets
- `/app/frontend/src/components/Repports/user-interface/RapportList/RaportList.jsx` - Rapports Grid
- `/app/frontend/src/components/Inventory/InventoryList.js` - Inventory SaaS
- `/app/frontend/src/components/Site/user-interface/SiteList/SiteList.js` - Sites SaaS
