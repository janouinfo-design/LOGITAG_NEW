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
  - Dropdown portal (React createPortal) avec Consulter / Detail / Chat / Supprimer
  - CSS : .lt-dots-btn, .lt-dots-menu (position: fixed via portal au body)
  - Appliqué globalement via DataTableComponent.jsx
- [x] **Vignettes cliquables** : clic sur une carte ouvre la page détail
- [x] **Menu ⋮ sur vignettes** : apparaît au hover avec Détail + Localiser
- [x] Tests visuels : Menu dropdown + navigation détail validés

### Phase 16 - Page Détail Engin Premium (Completed - 20 Avril 2026)
- [x] **Header résumé** : flèche retour, avatar, nom, badges état/statut/famille, batterie, position, tag, boutons action
- [x] **Formulaire tabs** : Général (Identité + Véhicule en 2 colonnes) / Relations-Tags / Historique
- [x] **Layout 65/35** : Formulaire gauche + carte GPS droite
- [x] Sections formulaire : Identité (référence, statut, image) + Véhicule (brand, model, immatriculation, VIN, infos, famille)

### Phase 17 - Sidebar Groupée + Détail Tags/Clients (Completed - 20 Avril 2026)
- [x] **Sidebar restructurée** par groupes avec labels de section :
  - GESTION : Engins, Tags, Calendrier, Map
  - ORGANISATION : Places, Inventory, Utilisateurs, Facturation, Paramètres
  - ANALYSE : Rapports, LOGS
  - CSS : .lt-sidebar-section, .lt-sidebar-section-label (uppercase, 0.65rem, #94A3B8)
- [x] **Page Détail Tag** : Header premium (icône violet, nom, badge actif/inactif, code, statut) + tab Général avec formulaire structuré
- [x] **Page Détail Client** : Header premium (icône bleu, nom, code, compteurs engins/tags) + tabs Général/Adresses/Sites

### Phase 18 - Détails Utilisateurs/Sites/Entreprises (Completed - 20 Avril 2026)
- [x] **TeamDetail (Utilisateurs)** : Header premium (avatar, nom prénom, badge actif, typeName, embauche) + tabs Général (Identité + Dates) / Tags
  - Sections : Identité (photo, nom*, prénom*, fonction*) + Dates (anniversaire, embauche, départ)
- [x] **CompanyList (Entreprise)** : Header premium (avatar, nom, badges code+IDE, compteur adresses) + tabs Général (Informations + Horaires) / Adresses / Paramètres (Logitrak login)
- [x] **SiteDetail (Sites)** : Header premium (icône map, titre) + tabs Info client / Adresse / Sites / Tags
- [x] Formulaires structurés avec lt-form-section, lt-form-grid (2 colonnes), lt-form-input

### Phase 21 - Refonte SaaS Premium Complète & Actions Rapides (Completed - 20 Avril 2026)
- [x] **4 pages détails refactorisées** au format SaaS Premium (header + 65/35 grid + sidebar + PrimaryActionButton) :
  - `DepotDetail.js` + `DepotDetailWithLinks.js` (Dépôts, avec onglets Info/Adresse/Géofencing unifiés)
  - `FamilleDetail.js` (Familles, avec preview live de la couleur/icône)
  - `StatutDetail.js` (Statuts module Statut)
  - `StatusDetail.js` (Statuts module Status, avec onglet Transitions)
- [x] **Sidebar cards stylées** : CSS `!important` + styles inline JSX (contournement définitif de PrimeReact/Tailwind reset). Les cartes "Résumé / Relations / Aperçu" affichent maintenant fond blanc, bordure, padding, rows flex space-between.
- [x] **Composant partagé `SidebarCard`** (`/components/shared/SidebarCard/`) : briques réutilisables `<SidebarCard>`, `<SidebarRow>`, `<SidebarLink>` pour les futures refontes.
- [x] **QuickActionsDrawer** (`/components/shared/QuickActionsDrawer/`) : FAB violet flottant (bouton ⚡ bottom-right) ouvrant un Drawer latéral droit (440px) avec 9 raccourcis groupés (Gestion / Organisation / Analyse). Injecté dans `MasterLayout.tsx`.
- [x] **Export CSV/Excel des alertes** : `AlertList` reçoit désormais `exportFields` + `tableId` → les boutons "Excel" et "PDF" apparaissent automatiquement dans le header du DataTable (colonnes exportables : Code, Type, Entité, Description, Message, Condition).

### Phase 20 - Fix Layout Détails (Inline Grid Forcing) (Completed - 20 Avril 2026)
- [x] **Bug résolu** : PrimeReact écrasait les classes CSS `lt-detail-grid` et `lt-form-grid` → les pages Détails affichaient le formulaire en 1 seule colonne au lieu de 2.
- [x] **Solution** : Injection de `style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px'}}` directement sur les balises React (pour contourner la priorité CSS de PrimeReact).
- [x] Appliqué sur :
  - `TeamDetail.js` (Utilisateurs) — grille 65/35 + form-grid 2 cols
  - `ClientDetail.js` (Clients) — grille 65/35 + sidebar Résumé/Relations ajoutée
  - `CompanyList.js` (Entreprises) — grille 65/35 + sidebar Résumé/Relations ajoutée + Paramètres form-grid 2 cols
  - `SiteDetail.js` (Sites) — form-grid 2 cols
- [x] Validation visuelle via screenshot : structure 2 colonnes confirmée sur les 3 pages.

### Phase 19 - PrimaryActionButton Standard (Completed - 20 Avril 2026)
- [x] **Composant `PrimaryActionButton`** créé dans `/app/frontend/src/components/shared/PrimaryActionButton/`
  - 7 types : edit (violet gradient), save, communicate (secondary), more (ghost), back (ghost), add (primary), delete (danger)
  - Même couleur, taille, padding, border-radius, icône, typographie partout
- [x] **Appliqué à toutes les pages détail** : Engins, Tags, Clients, Utilisateurs, Entreprises
  - "Modifier" violet en haut à droite (primary action)
  - "Communication" blanc bordé (secondary)
  - "⋮" discret (ghost)
- [x] **Layout 65/35 avec sidebar** sur page Utilisateurs : Résumé (statut, fonction, dates) + Relations (tags assignés)
- [x] CSS : .lt-action-btn--primary (gradient #6366F1→#4F46E5), .lt-action-btn--secondary, .lt-action-btn--ghost, .lt-action-btn--danger

## Backlog

### P1 (Haute priorité)
- [ ] Appliquer le même traitement SaaS Premium sur les autres pages secondaires (si détectées) : pages d'édition, pop-ups d'adresse, etc.

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
