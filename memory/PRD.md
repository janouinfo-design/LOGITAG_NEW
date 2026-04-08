# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte UI/UX frontend de l'application LOGITAG (tracking BLE). STABILITÉ > DESIGN. Aucune modification API.

## Tech Stack
- Frontend: React 18, Redux Toolkit, PrimeReact, Metronic UI
- Backend: API externe (omniyat.is-certified.com) - NON MODIFIABLE
- Auth: admin / user@1234

## Contrainte Critique
- AUCUNE modification des appels API, endpoints, payloads, méthodes HTTP
- Uniquement des changements UI/UX frontend

## Completed Features (Apr 8, 2026)

### Re-clone depuis GitHub (DONE)
- Code frais cloné depuis github.com/janouinfo-design/LOGITAG_NEW
- Fix compilation: fontawesome-pro supprimé, geoman import corrigé, prettier ajouté

### Dashboard SaaS Premium (DONE)
- Header avec titre "Dashboard" + bouton "Actualiser"
- 4 KPI cards avec icônes colorées, valeurs, labels, barres de progression animées
- Clic sur KPI ouvre panneau détail avec tableau filtré (DashboardDetail existant)
- Skeleton loading pendant chargement API lente
- Empty state si aucune donnée
- Hover animation (translateY + shadow)
- Bouton fermer (X) pour le panneau détail
- Fix: loadingCard toujours réinitialisé (.finally au lieu de .then)
- Zéro modification API - même dispatch, selectors, endpoints

## Files Modified
- `/app/frontend/src/components/Dashboard/user-interface/DashboardComponent.jsx` (simplifié)
- `/app/frontend/src/components/Dashboard/user-interface/DashboardCards/DashboardListCards.jsx` (refonte complète)
- `/app/frontend/src/_metronic/assets/sass/style.react.scss` (suppression fontawesome-pro)
- `/app/frontend/src/components/shared/MapComponent/user-interface/GeomanComponent/GeomanComponent.js` (fix import)

## Backlog
- Refonte page Engins (vignettes + filtres modernes)
- Refonte page Tags
- Refonte page Map
- Refonte page Calendrier
- Responsive design global
- États visuels (loading/empty/error) sur toutes les pages
