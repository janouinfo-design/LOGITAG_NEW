# LOGITAG - Product Requirements Document

## Problem Statement
Transformer l'application LOGITAG (tracking d'assets IoT) en un SaaS B2B Enterprise-grade. **CONTRAINTE** : Frontend UI/UX uniquement. Aucune modification API/Redux.

## Architecture
- **Frontend**: React 18, Redux Toolkit, PrimeReact, ApexCharts, Leaflet
- **Backend**: API Externe Omniyat - NON modifiable
- **Auth**: admin / user@1234

## Completed Features

### Phase 1-3 - Fondations + Dashboard + Vignettes (Completed)
- [x] Thème SaaS global, login redesign, correction icônes
- [x] Dashboard "Operations Monitor" (ApexCharts, filtres période)
- [x] Vue vignettes par défaut + toggle Grille/Tableau sur Engins/Tags/DashboardDetail
- [x] Chips modernes config colonnes + option "Tous" dans filtres

### Phase 4 - Pages Secondaires SaaS (Completed - 8 Avril 2026)
- [x] Calendrier, Map, Rapports, Utilisateurs, Paramètres : Headers SaaS

### Phase 5 - Journal d'Activité Timeline Immersive (Completed - 8 Avril 2026)
- [x] Header dark premium + timeline verticale glassmorphism
- [x] Nœuds colorés, cartes modernes, indicateur "En cours"

### Phase 6 - Fonctionnalités Avancées (Completed - 8 Avril 2026)
- [x] Toggle Grille/Tableau Rapports, Inventory SaaS, Sites SaaS
- [x] Presets colonnes, Widget GPS Dashboard, Filtre Timeline

### Phase 7 - Rapports Avancés + Tri + Animations (Completed - 8 Avril 2026)
- [x] **Tri rapide vignettes** : Pills Défaut/Nom/Batterie/Statut sur EnginList
- [x] **Animations de transition** : fade-in pages, staggered cards (lt-page-in, lt-card-in)
- [x] **Refonte Rapports 3 panneaux** : 
  - Panneau gauche : Types (Par Engin, Par Site) sous "Rapport d'activité"
  - Panneau centre : Sélection engins/sites (31 engins, 39 sites) avec checkboxes, search, select all
  - Panneau droit : Configuration (titre auto, plage dates, info card)
- [x] **RapportDisplay résumé** : Groupement par engin/site, colonnes (Site/Adresse, Entrées, Durée), carte "Au total"
- [x] **Rapport par Site** : Affiche temps de présence de chaque engin sur le site

## Backlog

### P3 (Basse priorité)
- [ ] Mode sombre (Dark Theme)
- [ ] Système de notifications push (batterie critique, sortie non autorisée)

## Key Files
- `/app/frontend/src/logitag-saas.css` - Thème global + animations + rapport CSS
- `/app/frontend/src/components/Repports/` - Système de rapports complet
- `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Vignettes + tri rapide
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx` - Dashboard + GPS
- `/app/frontend/src/components/shared/HistoryComponent/HistoryListComponent.js` - Timeline + filtres
