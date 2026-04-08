# LOGITAG — Application de Tracking d'Assets (SaaS B2B)

## Problème Original
Transformer l'application LOGITAG existante en SaaS B2B Enterprise-grade avec une interface moderne, sans modifier les appels API/Redux.

## Contrainte Critique
**STABILITÉ > DESIGN** : Aucune modification des appels API, endpoints, payloads ou logique métier.

## Architecture
- **Frontend**: React 18, Redux Toolkit, PrimeReact, ApexCharts, Metronic UI
- **Backend**: API Externe (omniyat.is-certified.com) — interdiction de modifier
- **Auth**: admin / user@1234

## Pages Implémentées

### Dashboard Operations Monitor (/tagdashboard/index)
- Header "Operations Monitor" + date/heure + bouton Actualiser
- Filtre de période : 5 pills (Tout, Aujourd'hui, 7 jours, 30 jours, Personnalisé) avec date-pickers
- 4 KPI cards cliquables avec format X/Y, barres progression, % variation
- Panneau détail avec **toggle Grille/Ligne** :
  - Grille: Vignettes carrées (EnginVCard / TagVCard) avec Localiser centré
  - Ligne: Cards horizontales compactes
  - Barre de recherche + compteur résultats
- Graphiques: Donut État + Barres Statuts + Donut Familles (ApexCharts)
- Panneau alertes batterie + Fil d'activité

### Page Assets/Engins (/view/engin/index)
- Vue **Vignettes carrées par défaut** (toggle grille/tableau)
- Chaque vignette: photo, nom, badges (Etat, Status, Famille, Tag ID), bouton "Localiser" centré bleu gradient, footer (localisation + batterie)
- Search bar + pagination grille (prev/next)
- Vue tableau: DataTable PrimeReact complète (fallback)

### Page Tags (/tag/index)
- Vue **Vignettes carrées par défaut** (toggle grille/tableau)
- Chaque vignette: icône famille colorée, nom, badges (Famille, Status, Actif), bouton "Localiser" centré (si adresse), footer localisation
- Search bar + pagination grille

## Icônes Corrigées
- FontAwesome Pro → PrimeReact Icons

## Fichiers Clés
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx`
- `/app/frontend/src/components/Dashboard/user-interface/DashboardDetail/DashboardDetail.jsx`
- `/app/frontend/src/components/Engin/EnginList/EnginList.js`
- `/app/frontend/src/components/Tag/user-interface/TagList/TagList.js`
- `/app/frontend/src/logitag-saas.css`

## Backlog
- P1: Intégrer Users dans routing dynamique (components.js)
- P1: Refonte pages secondaires (Calendrier, Map, Rapports)
- P2: Presets colonnes DataTable
- P3: Carte GPS temps réel
