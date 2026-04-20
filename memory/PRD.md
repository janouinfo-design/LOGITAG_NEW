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

### Phase 11 - Boutons d'Action Inline (Completed - 17 Avril 2026)
- [x] **Remplacement global du SplitButton dropdown** par des boutons d'action inline
  - 3 boutons icônes : Oeil bleu (Détail), Bulle verte (Chat), Poubelle rouge (Supprimer)
  - Changement dans le composant partagé `DataTableComponent.jsx` → appliqué à TOUTES les entités
  - CSS : .lt-row-actions, .lt-row-action-btn avec hover scale et box-shadow
  - Testé sur Engins, Tags, Utilisateurs
- [x] **Tests** : 100% (iteration_51.json)

### Phase 12 - Modale de Consultation Rapide (Completed - 17 Avril 2026)
- [x] **4ème bouton "Consulter"** (crayon orange #F59E0B) ajouté sur chaque ligne de tableau
  - Ouvre une modale centrée PrimeReact Dialog en lecture seule
  - 3 onglets dynamiques : Identité, État & Tags, Localisation (avec compteurs)
  - Header personnalisé : icône orange, nom de l'entité, "Consultation rapide"
  - Champs auto-classifiés par catégorie (IDENTITY_FIELDS, STATUS_FIELDS, LOCATION_FIELDS)
  - Rendu spécial : barres de batterie colorées, badges d'état, badges de statut
  - Bouton oeil bleu conserve la navigation vers la page détail complète
- [x] Appliqué à toutes les entités via le composant partagé DataTableComponent
- [x] **Tests** : 100% sur Engins et Tags (iteration_52.json)

### Phase 13 - Refonte Dashboard Premium (Completed - 17 Avril 2026)
- [x] **Dashboard redesigné** avec layout premium : Hero + filtres, 4 KPI, Carte GPS (60%) + Alertes (40%), 4 charts analytics
- [x] **Sidebar restaurée** : navigation complète avec sous-menus fonctionne sur toutes les pages
- [x] Background #F1F5F9, cartes blanches border-radius 14px, max-width 1440px
- [x] **Tests** : Navigation vérifiée (Dashboard, Engins, Tags)

### Phase 14 - Refonte UI SaaS Globale (Completed - 20 Avril 2026)
- [x] **Clients** : Header SaaS (icône indigo, compteur), avatar+nom+code en colonnes, badges "engins"
- [x] **Staff/Equipes** : Wrapper lt-page + header + lt-table-wrap
- [x] **WorkSite/Dépôts** : Wrapper lt-page + header + lt-table-wrap
- [x] **Sites/Places, Utilisateurs, Teams, Inventory** : Déjà au design SaaS, vérifiés
- [x] **Espaces resserrés** : Padding pages 10px/14px, header margin 12px, container max-width none
- [x] **Vignettes 5 colonnes** : Engins + Tags compacts (image 48px, badges 0.62rem)
- [x] Boutons d'action inline (oeil/chat/poubelle/crayon) sur toutes les entités
- [x] Modale de consultation rapide (3 onglets) sur toutes les tables

### Phase 15 - Menu ⋮ + Vignettes Cliquables (Completed - 20 Avril 2026)
- [x] **Menu ⋮ (three dots)** remplace les 4 boutons d'action inline dans les tableaux
  - Dropdown animé avec Consulter / Detail / Chat / Supprimer
  - CSS : .lt-dots-btn, .lt-dots-menu, .lt-dots-item avec animation ltMenuIn
  - Appliqué globalement via DataTableComponent.jsx
- [x] **Vignettes cliquables** : clic sur une carte ouvre la page détail (dispatch setSelectedEngine + setDetailChat)
- [x] **Menu ⋮ sur vignettes** : apparaît au hover (opacity 0 → 1) avec Détail + Localiser
- [x] Tests visuels : Vue grille + vue tableau validés

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
