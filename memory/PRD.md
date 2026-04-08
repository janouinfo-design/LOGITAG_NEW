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
- **Filtre de période** : 5 pills (Tout, Aujourd'hui, 7 jours, 30 jours, Personnalisé)
  - Personnalisé: 2 champs date (DE / À) + compteur résultats filtrés (ex: 43/44)
  - Les graphiques se mettent à jour dynamiquement selon le filtre
- 4 KPI cards avec format X/Y, icônes gradient, barres progression, % variation
- **Panneau détail Card-List** (quand KPI card cliquée):
  - EnginCard: photo thumbnail, nom, badges (Etat+Status+Famille+Tag), barre batterie, bouton map
  - TagCard: icône famille, nom, badges (Famille+Status+Actif)
  - Barre de recherche "Rechercher un asset..." avec compteur résultats temps réel
  - Bouton fermer (X)
- Donut "Répartition État" (Actif, Entrée) via ApexCharts
- Barres "Distribution Statuts" (Disponible, Reserve, Livré, Réception, En pannee)
- Donut "Assets par Famille" (BLE, CAB, SENSOR, etc.)
- Panneau "Assets nécessitant attention" (table alertes batterie colorées)
- Fil d'activité "Dernière Activité" (12 items avec noms, badges, localisation)

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
- `/app/frontend/src/components/Dashboard/user-interface/DashboardDetail/DashboardDetail.jsx`
- `/app/frontend/src/components/Engin/EnginList/EnginList.js`
- `/app/frontend/src/components/Tag/user-interface/TagList/TagList.js`
- `/app/frontend/src/logitag-saas.css`

## Backlog
- P1: Intégrer Users dans routing dynamique (components.js)
- P1: Refonte des pages secondaires (Calendrier, Map, Rapports)
- P2: Presets colonnes DataTable
- P3: Carte GPS temps réel
