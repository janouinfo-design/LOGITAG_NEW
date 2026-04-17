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

### Phase 8 - Centre d'Alertes Automatiques (Completed - 16 Avril 2026)
- [x] **Centre d'Alertes Dashboard** : Détection automatique des équipements à risque
  - 4 catégories : Immobilisés (>30j), Batterie critique (<10%), Sous-utilisés (>14j), Tags inactifs
  - Panneau de paramétrage des seuils (persisté localStorage)
  - Liste détaillée cliquable par catégorie d'alerte
  - Badge compteur total sur l'icône cloche
- [x] **Tests** : 16/16 tests passés (100%) - iteration_48.json

### Phase 9 - Refonte Dashboard "Executive Clean" (Completed - 17 Avril 2026)
- [x] **Layout redesigné** basé sur image de référence fournie par l'utilisateur
  - Top bar compact : logo bleu + "IoT Asset Tracking" + filtres période inline + date/heure + bouton refresh
  - 4 KPI Stat Cards : grands chiffres Manrope 2rem, icônes colorées, barres de progression
  - Split row : Carte GPS (55%) + Centre d'Alertes (45%) côte à côte
  - 4 colonnes charts en bas : Activité, Répartition État, Statuts, Familles
- [x] **Fond gris clair** (#EEF1F5) + cartes blanches border-radius 16px + ombres subtiles
- [x] **Sidebar modernisée** via CSS overrides (hover bleu, items arrondis, fonts Inter)
- [x] **Alertes intégrées** dans panel droit (grille 2x2, batterie section compacte)
- [x] **Tests** : 17/17 tests passés (100%) - iteration_49.json

### Phase 10 - Export PDF Rapports B2B (Completed - 17 Avril 2026)
- [x] **Bouton "Export PDF"** ajouté dans le header de RapportDisplay
  - Bouton sombre (#0F172A) avec icône pi-file-pdf, état disabled pendant l'export
  - PDF professionnel : bandeau header Logitag, 3 cartes résumé (engins/sites, entrées, temps total)
  - Tableau groupé par engin/site avec lignes de détail (période, adresse, durée)
  - Barre de total en pied (#0F172A) avec temps total en bleu
  - Footer paginé "LOGITAG - Rapport de présence B2B"
- [x] Utilise jspdf v2.5.1 + jspdf-autotable v3.5.28 (déjà installés)
- [x] **Tests** : Code review 100% correct (iteration_50.json). UI test bloqué par erreurs 500 API externe

## Backlog

### P2 (Moyenne priorité)
- [ ] Export PDF des rapports de présence B2B

### P3 (Basse priorité)
- [ ] Mode sombre (Dark Theme)
- [ ] Système de notifications push (batterie critique, sortie non autorisée)

## Key Files
- `/app/frontend/src/logitag-saas.css` - Thème global + animations + alertes CSS
- `/app/frontend/src/components/Repports/` - Système de rapports complet
- `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Vignettes + tri rapide
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx` - Dashboard + GPS + Centre d'Alertes
- `/app/frontend/src/components/shared/HistoryComponent/HistoryListComponent.js` - Timeline + filtres
