# Logitag — SaaS B2B Fleet Management (Frontend UI/UX)

## Original Problem Statement
Transformer l'application Logitag (tracking d'assets) en un SaaS B2B "Enterprise-grade" premium (style Stripe / Notion / Linear).
**CONTRAINTE** : Modifications UI/UX frontend UNIQUEMENT. Interdiction de toucher aux APIs, endpoints, structure des données ou logique métier.

## Tech Stack
- React 18, PrimeReact, Leaflet (react-leaflet, react-leaflet-cluster), Chart.js
- CSS custom (`/app/frontend/src/logitag-saas.css` + `/app/frontend/src/components/shared/MapComponent/user-interface/style.css`)
- Backend / API externe Omniyat : INTOUCHABLE

## User Persona
Gestionnaires de flotte / superviseurs Logistique en entreprise (usage desktop en priorité).

## Core Requirements
- Thème principal : Bleu Fleet Management `#1D4ED8` (pas de violet)
- Pas de mode sombre (refus explicite utilisateur)
- Langue : Français
- Map avec clusters intelligents + panneau latéral droit premium (sans flou)
- Dashboard avec KPI, Alertes, Graphiques + Popovers explicatifs (style Navixy)
- Liste d'engins ultra-compacte (1 ligne) côté Map, avec pagination

## Implemented (Changelog)
- Thème couleur : Violet → Bleu `#1D4ED8`
- `ClusterInsightsPanel.jsx` (drawer droit premium, cluster + single engin)
- Filtres Pills segmentés (Dashboard, Journal, Liste engins)
- Dropdown multi-select Zones (Map) + auto-zoom
- Popovers KPI/Alertes/Graphiques (Dashboard)
- Typographie KPI agrandie
- Marqueur position : Pulse bleu vif
- `EnginDetail.js` : Hero banner premium + stats quick
- Liste de gauche Map ultra-compacte + pagination client-side
- **[2026-04-21]** Barre de recherche Map : max-width 220px (au lieu de 100%)
- **[2026-04-21]** Liste engins Map : s'étire sur toute la hauteur de la carte (flex column, `asset-panel-body` : `flex:1; overflow:auto`)

## Roadmap / Backlog
### P1
- Vérifier le mode "single-engin" (zoom niveau rue) ne casse pas le layout avec le panneau d'historique Enter/Exit.

### P2
- Toggle "Afficher plus d'infos" dans le header de la liste (compact ↔ détaillé)

## Known Issues
- Lenteurs API externe Omniyat (5-15s, parfois 500/timeouts) — hors contrôle
- Avertissements Playwright backdrop intercepts sur Map — n'affecte pas l'utilisateur

## Key Files
- `/app/frontend/src/components/shared/MapComponent/user-interface/MapComponent.js` (2200+ lignes, ne pas refactorer)
- `/app/frontend/src/components/shared/MapComponent/user-interface/style.css`
- `/app/frontend/src/logitag-saas.css` (styles premium globaux)
- `/app/frontend/src/components/shared/MapComponent/user-interface/ClusterInsightsPanel.jsx`
- `/app/frontend/src/components/Engin/EnginDetail/EnginDetail.js`
- `/app/frontend/src/components/DashboardNew/widgets/KPICardGrid.js`, `ChartGrid.js`

## Credentials (test)
- URL: `/auth`
- Username: `admin`
- Password: `user@1234`
