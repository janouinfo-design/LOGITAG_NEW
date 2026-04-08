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
- [x] Page Calendrier: Header SaaS violet + toolbar moderne (toggles, recherche, filtres)
- [x] Page Map: Header SaaS vert + carte Leaflet (badge "4935 positions")
- [x] Page Rapports: Header SaaS orange + layout sidebar/contenu moderne
- [x] Page Utilisateurs: Accessible via sidebar, header SaaS indigo + badge count
- [x] Page Paramètres (SetupInfo): Cartes de réglages avec icônes colorées
- [x] Styles CSS ajoutés: lt-settings-grid, lt-rapports-layout, lt-calendar overrides

## Backlog

### P1 (Haute priorité)
- [ ] Toggle Grille/Tableau sur la page Rapports

### P2 (Moyenne priorité)
- [ ] Vue Grille/Carte sur d'autres pages principales (Inventory, Places)
- [ ] Presets pour la configuration colonnes ("Vue complète", "Vue simple")

### P3 (Basse priorité)
- [ ] Widget carte GPS temps réel sur le Dashboard
- [ ] Système de tri rapide sur les vues vignettes (Nom, Batterie, Statut)

## Key Files
- `/app/frontend/src/logitag-saas.css` - Thème SaaS global
- `/app/frontend/src/components/components.js` - Routage dynamique
- `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Modèle vignettes
- `/app/frontend/src/components/Dashboard/` - Dashboard Operations Monitor
