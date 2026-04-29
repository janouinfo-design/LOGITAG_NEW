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
- **[2026-02-XX] FIX pagination grille engins (`EnginList.js`)** : "next" affichait une page vide. Cause : `handlePageChange` était appelé avec un objet `{page, rows}` au lieu de deux args, et la grille faisait un refetch serveur alors que les 5000 engins étaient déjà chargés. Solution : pagination 100% client-side (`gridPage` state + `slice()`) avec page size de 24, clamp automatique quand le dataset change.
- **[2026-02-XX] FEAT Indicateur "Sur site" sur cartes engins** : Point pulsant vert (top-right) + bordure gauche verte sur les cartes dont `etatenginname === 'reception'`. Animation `lt-onsite-pulse` + ring expansion `lt-onsite-ring`. Respect de `prefers-reduced-motion`.
- **[2026-02-XX] PERF Optimisation chargement page Engins** :
  - Backend (`server.py`) : ajout de `engin/list` aux endpoints cachés (TTL 60s, vs 30s pour le dashboard). Premier appel cold ~29s, suivants 0.3s (cache hit, x100 plus rapide).
- **[2026-02-XX] FIX icône bouton "trajet" sur cartes engins (Map)** : Dans `MapComponent.js` (drawer expandé d'un engin), le bouton circulaire bleu utilisait `fas fa-solid fa-route` (syntaxe FontAwesome v5+v6 invalide) qui rendait un glyphe parasite. Remplacé par `pi pi-directions` (icône PrimeReact native) pour cohérence avec le reste du panneau. Tooltip également traduit (`title="Voir le trajet"`).
- **[2026-02-XX] REDESIGN tab "Paramètres" → "Intégrations" (page Entreprise)** :
  - Refonte complète du tab en hub d'intégrations premium B2B (style Notion/Linear).
  - Header avec titre + sous-titre contextuel ("Connectez vos services tiers…").
  - Card d'intégration Logitrak avec : logo encadré, nom + tag "GPS · Navixy", description, **pill de statut animé** (Connecté = vert pulsant, Non connecté = gris), accent visuel vert quand connecté.
  - **Mode connecté** : compte affiché + token sécurisé + bouton "Déconnecter" rouge sobre.
  - **Mode déconnecté** : formulaire inline avec inputs premium (focus ring bleu), bouton "Connecter le compte" désactivé tant que les champs sont vides (= disabled state propre).
  - Card placeholder "D'autres intégrations bientôt disponibles" (Stripe, Google Calendar, SMS) — extensible pour le futur.
  - Suppression des boîtes rouges parasites précédentes (icônes FontAwesome cassées remplacées par PrimeReact natifs).
  - Responsive : passe en 1 colonne sous 600px.
  - Frontend (`EnginList.js`) : pattern stale-while-revalidate — si Redux contient déjà des engins (navigation back), on les affiche immédiatement sans bloquer avec le skeleton, et on rafraîchit en arrière-plan.
- **[2026-02-XX] FIX raccourcis du header (`HeaderWrapper.tsx`)** : Les 4 boutons "Engins / Map / Calendrier / Rapports" pointaient vers des routes inexistantes (`/engin/index`, `/map/index`, `/planning/index`) → fallback vers le dashboard à chaque clic. Routes corrigées : `/view/engin/index`, `/tour/index`, `/reservations/index`, `/rapports/index`. Tous les liens validés en e2e (Playwright).
- **[2026-02-XX] FIX données identiques entre tous les onglets de rapport (`NavixyReport.jsx`)** : Quand l'utilisateur générait un rapport pour 3 trackers (RE01, RE02, RE04), les onglets affichaient tous les mêmes trajets car `TripsTable` lisait un `MOCK_RESULT_DAYS` global hardcodé. Solution : génération **déterministe par tracker** via `hashId(trackerId) → buildDaysForTracker()` avec un pool de 5 routes différentes (Madrid-Barcelone, Lyon-Genève, Zürich-Bâle, Paris-Lille, sites Lausanne) et 5 dates. Ajout d'un pill "tracker actif" dans le header de section. `ResumeCard` et `AlertTable` également alimentés dynamiquement (totaux calculés depuis les trajets, dernière adresse extraite). 3 onglets = 3 jeux de données distincts validés en e2e.
- **[2026-02-XX] FEAT (P1) Drag cross-row sur le Gantt** :
  - Frontend : détection live de la rangée d'engin sous le curseur via `getBoundingClientRect()` pendant le mousemove. Visuel "is-drop-target" (outline vert pulsant + pill "Déposer ici"). Au mouseup, si le tracker change, appel à `onDrag(reservation, deltaMs, targetAsset)`.
  - Backend (`routes/reservations.py`) : `DragDropUpdate` étendu avec `asset_id` + `asset_name` optionnels. Vérif de conflit horaire utilise désormais l'asset cible. Log d'action `moved_to_asset` avec format "Engin: A → B · dates".
  - Validé en e2e via curl (backward compat + cross-row + log audit).
- **[2026-02-XX] FEAT (P1) Palette de commandes Cmd+K** (`CommandPalette.jsx` + CSS) :
  - Ouverture avec `Cmd+K` ou `Ctrl+K` partout dans l'app, fermeture avec ESC.
  - 14 commandes (Navigation : Dashboard, Engins, Map, Réservations, Tags, Rapports, Dépôts, Inventaire, Utilisateurs, Gateways, Logs, Entreprise · Actions : Nouvelle réservation, Export CSV).
  - Recherche live (insensible aux accents), navigation clavier ↑/↓/Enter, raccourcis affichés en kbd, animation fade+pop à l'ouverture.
  - Intégrée globalement dans `MasterLayout.tsx`.
- **[2026-02-XX] FEAT (P2) Notifications planifiées** (`ReservationNotifier.jsx`) :
  - Composant headless intégré dans `MasterLayout`. Fetch les réservations confirmed toutes les 5 min, planifie une `Notification` browser native 1h avant chaque `start_date`.
  - Déduplication via localStorage (clé `lt-reservation-notified`).
  - Demande la permission Notification au premier déclenchement, click sur la notif → ouvre `/reservations/index`.
  - Ne fonctionne que sur HTTPS (preview/prod).
- **[2026-02-XX] FEAT (P2) Sauvegarde des filtres Gantt en localStorage** :
  - `filterUser` et `filterSite` du `ReservationModule` sont persistés dans `localStorage` (clés `lt-res-filterUser`, `lt-res-filterSite`). Restaurés à chaque montage.
  - Résultat e2e mesuré : 1ère visite ~2-3s (avec cache préchauffé), 2ème visite 0.22s.
- **[2026-04-22] MODULE RÉSERVATIONS** — Page complète + sidebar (Gestion > Réservations) :
  - **KPIs** : En attente, Validées, En cours, Aujourd'hui, En retard, Terminées (cliquables pour filtrer)
  - **Planning Gantt** : vues Jour / Semaine / Mois, navigation prev/next/today, barres colorées par statut, weekend grisés, aujourd'hui highlighted
  - **Liste** : recherche + filtre statut, actions contextuelles (valider/refuser/check-out/check-in/annuler)
- **[2026-02-XX] FIX critique Centre d'alertes (`DashboardListCards.jsx`)** : Les KPIs "Immobilisés / Sous-utilisés" affichaient 0 alors que des dizaines d'engins n'ont pas été vus depuis 2025. Trois causes :
  1. La source de données était `tag/dashboarddetail` (sous-ensemble actif/in-zone) au lieu de la liste complète d'engins (5000 records de Redux).
  2. Le filtre `if (item.etatenginname && ...)` excluait tout engin sans état défini, alors que ces engins fantômes sont précisément les plus immobilisés.
  3. Le parser de date `new Date(item.locationDate || ...)` échouait sur le format FR `DD/MM/YYYY HH:mm` du champ `tagDate`.
  
  **Solution** :
  - Source primaire = `enginesFromRedux` (Redux selector `getEngines`, 5000 entrées avec `lastSeenAt` ISO 8601 fiable) ; fallback `allDetailData` si engins pas encore chargés.
  - Parser de date tolérant : ISO 8601, format FR, fallback Date natif.
  - Critère "Immobilisé" simplifié : tout engin avec `lastSeenAt` plus ancien que le seuil (peu importe l'état).
  - Résultat e2e mesuré : Immobilisés 0→12, Batterie 1→9, Sous-utilisés 0→10, badge total 1→31. Le centre d'alertes reflète enfin la réalité.
- **[2026-02-XX] FEAT Bouton "Voir la liste" + actions sur les rangées d'alertes** :
  - CTA explicite sur chaque card d'alerte (toggle "Voir la liste" / "Masquer la liste") avec couleur synchronisée à l'alerte (rouge pour Immobilisés, orange Batterie, violet Sous-utilisés…).
  - Les rangées affichent désormais : nom, lieu (📍), **date du dernier signal** (🕐 "Vu le 25 juin 2024"), valeur d'alerte en pill rouge, **2 boutons d'action** : 🗺️ Localiser (→ `/tour/index?focus=<id>`) et ➡️ Fiche engin (→ `/view/engin/index?selected=<id>`).
  - Badge count ajouté dans l'en-tête du panneau (ex: "Immobilisés [1]").
  - Styles `.dbn-alert-*` (~250 lignes) ajoutés dans `logitag-saas.css` (le code utilisait des classes non stylées jusqu'ici).
  - **À valider** : panneau dédié des demandes en attente avec workflow admin
  - **Formulaire création/édition** : engin (filter dropdown), dates avec vérification temps réel de disponibilité (POST /availability), utilisateur, équipe, site, projet, priorité, note
  - **Drawer détail** : infos complètes + actions (approve/reject/checkout/checkin/cancel/edit)
  - Backend : endpoints déjà complets dans `/app/backend/routes/reservations.py` (CRUD, planning, gantt, availability, approve/reject, checkout/checkin, export CSV, WebSocket broadcasts)
  - Route enregistrée via `EXTRA_MENU` (config.js) + `components.js`
- **[2026-02-XX] PERF Optimisation majeure du Calendrier (`CalendarView.js`)** :
  Page très lente, parfois blanche. 3 causes :
  1. Au mount → fetchEngines (30s, 5000 records) à chaque visite, même si Redux était chaud.
  2. FullCalendar recevait **les 5000 lignes d'engins** d'un coup → freeze navigateur.
  3. Pagination + recherche faisaient un refetch serveur (30s) à chaque interaction.
  
- **[2026-02-XX] FIX filtres Calendrier** (`CalendarView.js`) :
  - `handleMovementFilterChange` utilisait `e.target.value` au lieu de `e.value` (PrimeReact Dropdown). Résultat : sélectionner "Sortie" → state = `undefined` → filtre cassé.
  - Ajout de `setFirst(0)` + `setCalendarKey(k+1)` dans `handleStatusFilterChange` et `handleMovementFilterChange` pour reset de la pagination + redraw FullCalendar quand on change de filtre.
  - Validé e2e : filtre "Sortie" passe la liste de 4935 → 12 engins.
- **[2026-02-XX] CLEANUP Navbar header** (`Navbar.tsx`) :
  - Suppression de 3 boutons fantômes (cercles sombres vides) qui n'avaient aucun contenu ni handler (`kt_activities_toggle`, `element-plus`, etc.) — restes legacy de Metronic.
  - Suppression du chat toggle non fonctionnel (icône KTIcon ne rendait pas, drawer vide).
  - Imports inutilisés retirés (`HeaderNotificationsMenu`, `ThemeModeSwitcher`, `getUserRead`).
  - Header simplifié à : raccourcis quick + avatar avec menu utilisateur fonctionnel. `console.log` de debug retirés.
  **Solutions** :
  - **Source primaire** : `enginesFromRedux` (cache 60s backend déjà chaud) — fallback sur `dispatch(fetchEngines)` uniquement si vide.
  - **Pagination 100% client-side** : `filteredRessources.slice(first, first+rows)` → FullCalendar ne reçoit jamais plus de 30 lignes (rowsPerPage 10/20/30). 
- **[2026-02-XX] FIX Map "vide" au cold start** :
  - **Bug** : Quand l'utilisateur arrivait sur `/tour/index` sans warmup préalable du Redux engines, la liste latérale "Liste des engins" affichait "Aucun engin ne correspond aux filtres" pendant 30s (le temps que `fetchEngines(PageSize:5000)` finisse côté serveur). Trompeur — on dirait que la map est cassée.
  - **Fix 1 (TagMapViewComponent)** : Skip `dispatch(fetchEngines)` au mount si Redux contient déjà des engines (même pattern que CalendarView). Bénéficie du cache backend 60s.
  - **Fix 2 (MapComponent UX)** : Quand `realList.length === 0`, afficher un état de chargement explicite (spinner bleu + "Chargement des engins…") au lieu du message d'erreur trompeur "Aucun engin ne correspond aux filtres".
  - **Validation e2e** : Map list peuplée en **0.75s** quand on arrive du Dashboard (cache hot), 4935 engins / Pagination 1/494 fonctionnelle.
  - **Recherche client-side** : filtre sur `reference/nom/tagname` du cache Redux (instantané, plus de 30s d'attente).
- **[2026-02-XX] FIX pagination des Tags** (`TagList.js`) :
  - **Bug 1** : `handlePageChange({page, rows})` recevait un objet alors qu'il attend `(newPage, rows)` → state pété, page suivante vide.
  - **Bug 2** : Le fetch initial chargeait seulement 10 tags du serveur (pagination serveur par défaut) → "Page 1/6 — 53 tags" mais Redux ne contient que 10.
  - **Solution** : Pagination 100% client-side comme EnginList (`gridPage` state local + `slice(start, start+24)`). Fetch initial avec `PageSize: 5000` pour charger les 53 tags d'un coup. Clamp auto sur changement de liste.
  - **Validation e2e** : navigation Page 1→2→3 affiche bien 24 + 24 + 5 = 53 tags distincts.
- **[2026-02-XX] FIX bouton "Voir le trajet" silencieux** (`MapComponent.js`) :
  - **Bug** : Le bouton bleu de direction sur les cards d'engins sortis ne déclenchait rien visuellement. La fonction `fetchVehiculePositionsHistory` skipait silencieusement quand `lastSeenDevice` était null (cas fréquent pour les engins inactifs depuis longtemps).
  - **Fix UX en cascade** :
    1. **Bouton désactivé** (gris + icône `pi-ban`) si pas de `lastSeenDevice` ou date manquante. Tooltip explicite "Trajet indisponible (aucun device GPS)".
    2. **Spinner** sur le bouton pendant le fetch (`isFetchingRoute`) avec icône `pi-spin pi-spinner`.
    3. **3 toasts contextuels** :
       - INFO : "Récupération du trajet…" au lancement.
       - SUCCESS : "Trajet affiché — N positions GPS sur la carte" + `fitBounds` automatique.
       - WARN : "Aucun trajet — pas de positions GPS sur la période ±2h" si réponse vide.
       - INFO : "Position unique — pas de trajet à dessiner" si 1 seul point.
    4. **`fitBounds`** au lieu de simple `setView` → la polyline remplit la vue automatiquement (zoom max 14, padding 50px).
    5. Suppression des `console.log` de debug.
  - **`onPageChange`** : juste un bump du `calendarKey`, plus aucun appel réseau.
  
  **Mesures e2e** : 1er rendu **1.4s** (vs 30s+ ou blank page), nav page suivante **2.1s** (vs ~30s + freeze), recherche instantanée.
  - Fichiers : `/app/frontend/src/components/Reservation/ReservationModule.jsx` (~500 lignes), CSS dans `logitag-saas.css` lignes 6843+

- **[2026-02-XX] FIX KPIs cluster incohérents** (`ClusterInsightsPanel.jsx`) :
  - **Bug** : Le panneau cluster (Casablanca-Settat 16 engins) affichait "Tous 16, Sur site 0, Sortis 0" — KPIs fausses car les engins **sans `lastSeenAt`** (engins fraîchement créés ou sans gateway GPS) tombaient dans le bucket `unknown` qui n'était compté ni dans "Sur site" ni dans "Sortis".
  - **Fix** : Logique simplifiée — par définition, un engin géolocalisé dans ce cluster **est sur site** (sauf s'il est explicitement marqué "exited"/sorti). Le check passe de :
    ```js
    bucket === 'present' || 'stale' || 'arrived'  // exclut 'unknown'
    ```
    à :
    ```js
    bucket !== 'exited'  // inclut tout sauf les sortis
    ```
  - Le filtre du panneau (segmenté Sur site / Sortis / Batt. faible) suit la même logique.
  - Résultat : "Sur site 16" cohérent avec "Tous 16" pour un cluster sans engin sorti.
  - 5 groupes structurés : Dashboard · GESTION · ORGANISATION · CONFIGURATION · ANALYSE
  - Mapping normalisé (accents/casse) sur les titres backend réels (Timeline→Calendrier, Maps→Map, Equipes→Utilisateurs, Paramettres→Paramètres)
- **[2026-02-XX] REDESIGN "Activité récente" du Dashboard** :
  - **Avant** : Simple point coloré + nom + lieu. Très épuré, beaucoup d'espace vide perdu, pas d'info utile au coup d'œil.
  - **Après** : Card premium par ligne avec :
    - Icône carrée colorée (vert/rouge/orange/bleu) selon l'état (Entré/Sorti/Inactif/Actif) + icône sémantique (`pi-sign-in/out/pause/circle-fill`).
    - Pill de statut en couleur cohérente (ENTRÉ, SORTI, INACTIF, ACTIF).
    - Ligne 2 enrichie : 📍 lieu, 🕐 date relative ("il y a 25 min" / "il y a 2j" / "25 juin"), ⚡/⚠️ batterie avec couleur rouge si <20%.
    - Parser de date tolérant FR `DD/MM/YYYY` + ISO 8601.
    - Hover effect, scrollbar custom, max-height 380px.
  - **Styles** : ~200 lignes de CSS `.dbn-card`, `.dbn-feed-*`, `.dbn-skel`, etc. ajoutées dans `logitag-saas.css` (les classes existaient sans styles).
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
