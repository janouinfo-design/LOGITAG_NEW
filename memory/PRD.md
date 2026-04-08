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

### Dashboard Operations Monitor (/tagdashboard/index) — FAIT
- Header "Operations Monitor" + date/heure + bouton Actualiser
- 4 KPI cards avec format X/Y, icônes gradient, barres progression, % variation
- Fil d'activité "Dernière Activité" (12 items, noms d'assets, badges status)
- Donut "Répartition État" (Actif 95%, Entrée 5%) via ApexCharts
- Barres "Distribution Statuts" (Disponible 28, Reserve, Livré, etc.)
- Donut "Assets par Famille" (BLE, CAB, SENSOR, etc.)
- Panneau "Assets nécessitant attention" (table avec barres batterie colorées)
- KPI cards cliquables → panneau détail DataTable + bouton fermer

### Page Assets/Engins (/view/engin/index) — FAIT
- Header SaaS Premium (gradient bleu, badge 4935 assets)
- Skeleton loading, badges Etat/Status/Batterie/Famille, thumbnails, Géolocalisation

### Page Tags (/tag/index) — FAIT
- Header SaaS Premium (gradient violet, badge 53 tags)
- Skeleton loading, badges Actif/Inactif, Status, Famille, boutons adresse

## Icônes Corrigées
- FontAwesome Pro → PrimeReact Icons (pi pi-arrow-down, pi pi-arrow-up, pi pi-exclamation-triangle)

## Fichiers Clés
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx`
- `/app/frontend/src/components/Engin/EnginList/EnginList.js`
- `/app/frontend/src/components/Tag/user-interface/TagList/TagList.js`
- `/app/frontend/src/logitag-saas.css`

## Backlog
- P1: Intégrer Users dans routing dynamique (components.js)
- P1: Refonte des pages secondaires (Calendrier, Map, Rapports)
- P2: Presets colonnes DataTable
- P3: Carte GPS temps réel
