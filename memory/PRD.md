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
- **[2026-04-21]** P1 validé : le zoom niveau rue (z17) en mode single-engin ne casse pas le layout
- **[2026-04-21]** P2 : Toggle "Compact / Détaillé" dans le header de la liste (persisté dans `localStorage`). Mode détaillé affiche une 2e ligne avec statut + batterie + dernière activité humanisée.
- **[2026-04-21]** Session précédente : Login premium, Calendrier Gantt, Modals Users/Teams, Module Rapports "Navixy" (export PDF/Excel + Planification), refonte Dépôts + Stepper 3 étapes.
- **[2026-02-XX] FIX statistiques cluster (`ClusterInsightsPanel.jsx`)** : "Sur site" affichait 0 alors que 18 engins étaient sur place. Cause : la logique catégorisait les engins vus < 1h dans le bucket `arrived` (exclu de `present`). Correction : "Sur site" inclut désormais `present` + `stale` + `arrived` (tout engin physiquement présent, peu importe la fraîcheur du signal). "Arrivés 1h" reste un sous-ensemble informatif. Le filtre "Sur site" en bas du panneau a été aligné.
- **[2026-04-22] MODULE RÉSERVATIONS** — Page complète + sidebar (Gestion > Réservations) :
  - **KPIs** : En attente, Validées, En cours, Aujourd'hui, En retard, Terminées (cliquables pour filtrer)
  - **Planning Gantt** : vues Jour / Semaine / Mois, navigation prev/next/today, barres colorées par statut, weekend grisés, aujourd'hui highlighted
  - **Liste** : recherche + filtre statut, actions contextuelles (valider/refuser/check-out/check-in/annuler)
  - **À valider** : panneau dédié des demandes en attente avec workflow admin
  - **Formulaire création/édition** : engin (filter dropdown), dates avec vérification temps réel de disponibilité (POST /availability), utilisateur, équipe, site, projet, priorité, note
  - **Drawer détail** : infos complètes + actions (approve/reject/checkout/checkin/cancel/edit)
  - Backend : endpoints déjà complets dans `/app/backend/routes/reservations.py` (CRUD, planning, gantt, availability, approve/reject, checkout/checkin, export CSV, WebSocket broadcasts)
  - Route enregistrée via `EXTRA_MENU` (config.js) + `components.js`
  - Fichiers : `/app/frontend/src/components/Reservation/ReservationModule.jsx` (~500 lignes), CSS dans `logitag-saas.css` lignes 6843+

  - 5 groupes structurés : Dashboard · GESTION · ORGANISATION · CONFIGURATION · ANALYSE
  - Mapping normalisé (accents/casse) sur les titres backend réels (Timeline→Calendrier, Maps→Map, Equipes→Utilisateurs, Paramettres→Paramètres)
  - Icônes FontAwesome modernes (truck-fast, tags, calendar-days, warehouse, users, gear, chart-column, etc.)
  - États : hover (gris-bleu léger), **actif** (fond `#EFF4FF`, left-bar bleu 3px `#1D4ED8`, texte + icône bleu, font-weight 600)
  - **Mode rétractable** 252px ↔ 68px avec bouton "Replier/Déplier" en bas, état persisté dans `localStorage` (`lt_sidebar_collapsed`)
  - Tooltips natifs (HTML `title`) en mode compact
  - Séparateurs de groupe (barre grise fine) en mode compact
  - Haute spécificité CSS pour écraser Metronic (`#kt_app_sidebar.lt-sidebar` …)

## Files Modified — Sidebar Refonte
- `/app/frontend/src/components/Layout/user-interface/Sidebar/Sidebar.tsx` (ajout état collapsed + toggle btn)
- `/app/frontend/src/components/Layout/user-interface/Sidebar/SidebarLogo.tsx` (ancien toggle Metronic caché)
- `/app/frontend/src/components/Layout/user-interface/Sidebar/sidebar-menu/SidebarMenu.tsx` (cleanup scroll wrapper)
- `/app/frontend/src/components/Layout/user-interface/Sidebar/sidebar-menu/SidebarMenuMain.js` (mapping groupes + icônes, normalisation accents)
- `/app/frontend/src/components/Layout/user-interface/Sidebar/sidebar-menu/SidebarMenuItem.tsx` (rendu propre icon + title + tooltip)
- `/app/frontend/src/components/Layout/user-interface/Sidebar/sidebar-menu/SidebarMenuItemWithSub.tsx` (rendu propre accordéon)
- `/app/frontend/src/logitag-saas.css` (bloc "SIDEBAR PREMIUM" ~200 lignes, lignes ~2446-2660)

## Roadmap / Backlog
### P2
- (si souhaité) Raccourci clavier `/` pour focus instant sur la recherche

## Known Issues
- Lenteurs API externe Omniyat (5-15s, parfois 500/timeouts) — hors contrôle
- Avertissements Playwright backdrop intercepts sur Map — n'affecte pas l'utilisateur

## Key Files
- `/app/frontend/src/components/shared/MapComponent/user-interface/MapComponent.js` (2200+ lignes, ne pas refactorer)
- `/app/frontend/src/components/shared/MapComponent/user-interface/style.css`
- `/app/frontend/src/logitag-saas.css` (styles premium globaux)
- `/app/frontend/src/components/shared/MapComponent/user-interface/ClusterInsightsPanel.jsx`
- `/app/frontend/src/components/Engin/EnginDetail/EnginDetail.js`

## Credentials (test)
- URL: `/auth`
- Username: `admin`
- Password: `user@1234`
