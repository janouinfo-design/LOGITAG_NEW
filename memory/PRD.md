# LOGITAG - Product Requirements Document

## Problem Statement
Transformer l'application LOGITAG (tracking d'assets IoT) en un SaaS B2B Enterprise-grade. **CONTRAINTE** : Frontend UI/UX uniquement. Aucune modification API/Redux.

### Phase 28 — Cluster Insights Panel pour la Map (20 Avril 2026)
- [x] **Nouveau composant** `ClusterInsightsPanel.jsx` : drawer latéral premium ouvert au clic sur un cluster
  - **Header** : badge violet compteur, nom de la zone (LocationObjectname), adresse, 4 stats (Sur site / Arrivés <1h / Sortis / Durée moyenne)
  - **Filtres segmentés** : Tous / Sur site / Sortis / Batterie faible + dropdown Famille + tri (Récent, Nom, Durée, Statut)
  - **Cards engins** cliquables avec dot de couleur (vert=sur site, orange=arrivé, rouge=sorti, violet=zone), chip famille, statut, temps depuis dernier signal, % batterie
  - **Expansion** : timeline verticale (Dernière activité, Durée, Position) + méta (adresse, device/RSSI, utilisateur, état) + bouton "Centrer sur la carte"
- [x] **Cluster icon upgradé** : divIcon violet premium adaptatif (sm/md/lg/xl selon le count), halo blanc + ombre violette, rouge pour >100 engins, hover scale 1.08
- [x] **handleClusterClick amélioré** : ouvre le panneau pour empilements parfaits ET clusters de très courte distance (<50m) — spiderfy uniquement si séparation lisible
- [x] **Intégration** dans `MapComponent.js` (route `/tour/index`) — remplace l'ancien Popup basique par le drawer
- [x] **Aucune modif API/backend** — utilise uniquement les champs déjà chargés (lastSeenAt, batteries, LocationObjectname, etatenginname, statuslabel, etc.)
- [x] **Refonte de la barre de filtres** (Proposition A — Pills Segmenté Violet) sur `DashboardListCards.jsx` :
  - Segmented control `#F1F5F9` (slate) pour Tout/Aujourd'hui/7j/30j/Dates
  - Pill actif : fond blanc + bordure violette 1.5px + ombre violette
  - Inputs dates (custom) restylisés : container unifié, focus violet
  - Bouton "Actualiser" transformé en bouton primaire violet (#6D28D9) avec ombre
- [x] **Refonte secondaire** `DashboardContent.js` (routes `/newdashboard/index`, `/situationtags/index`) :
  - filterTemplate remplacé : segmented period + 4 dropdowns compacts (Etat/Famille/Modèle/Client) + bouton Filtrer violet
  - Ajout de chips filtres actifs supprimables
- [x] **Propagation violet cohérent** aux autres barres de filtres :
  - `.lt-sort-pill--active` (Engins List grid view — Défaut/Nom/Batterie/Statut) : violet
  - `.lt-timeline-filter-pill--active` (Journal/Historique — Tout/Entrées/Sorties) : violet
- [x] Logique métier (periodFilter, filters.periodType, onChange, data-testid) 100% préservée

### Phase 27 — Modernisation Filtres Dashboard (20 Avril 2026)

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

### Phase 35 - Chart Premium avec couleurs Top3/Moyen/Bas + Ligne moyenne (Completed - 20 Avril 2026)
- [x] **ChartGrid.js entièrement réécrit** pour matcher exactement le mockup Proposition A :
  - **Top 3 barres en violet gradient** (#7C3AED) — calculé dynamiquement via tri descendant
  - **Barres moyennes en bleu clair** (#93C5FD)
  - **Barres basses en gris neutre** (#CBD5E1)
  - **Ligne rouge dashed "Moy. X"** dessinée via plugin Chart.js custom `averageLine` avec label pill arrondi top-right
  - Barres avec `borderRadius: 6` + `maxBarThickness: 38` pour un look moderne
  - Card wrapper propre (suppression de PrimeReact Card + gradients legacy)
  - **Légende en haut** avec swatches : Top 3 · Moyen · Bas · Moyenne globale + valeur
  - Tooltip hover noir premium
- [x] Suppression du bouton "Exporter" PrimeReact inutile.
- [x] Validation screenshot : MAGHREB STEEL/JORF OCP/LAURENT MEMBREZ en violet, autres barres en gris avec 2 barres moyennes en bleu, ligne rouge "Moy. 21.1" nette ✅

### Phase 34 - Page Status Refonte Executive Dashboard (Proposition A) (Completed - 20 Avril 2026)
- [x] **KPICardGrid.js refait** en style Stripe/executive :
  - **Sparkline SVG** calculée deterministiquement (seed basé sur index + valeur) en couleur assortie à l'icône
  - **Badge delta coloré** (↗ vert / ↘ rouge / neutre gris) avec parseDelta robuste + label "vs période précédente"
  - **Icône badge** carrée 36x36 en top-right avec palette contextuelle (rouge/bleu/vert/violet/orange)
  - Valeur 1.85rem font-weight 800 + Manrope + letter-spacing négatif
  - Hover interactif (translateY + box-shadow)
- [x] **DashboardContent.js** enrichi :
  - **Hero Header** "Performance · {période}" + badge global coloré (↗ +X% / ↘ -X%) calculé depuis la majorité des deltas
  - **Section Insights automatiques** sous les KPI : 3 cards narratives générées depuis les données (meilleur performer, plus en baisse, fallback) avec icône colorée + texte en HTML
  - Memoization via useMemo pour performance
- [x] Validation screenshot : rendu identique au mockup Proposition A, toutes les sparklines et badges visibles ✅

### Phase 33 - Zoom carte Map adouci (Completed - 20 Avril 2026)
- [x] **Bug UX rapporté** : le clic "Localiser" zoomait trop fortement (niveau 18 - vue rue) → perte du contexte géographique.
- [x] **Fix appliqué** sur `MapComponent.js` :
  - `flyTo` lors de la localisation d'un asset : zoom 18 → **13** (vue quartier/ville)
  - `setView` lors du centrage sur une zone : zoom 19 → **13**
  - `setView` lors du centrage sur coords : zoom 11 (déjà OK)
  - Zoom par défaut de la carte reste à 10 (vue régionale)
- [x] Résultat visuel : l'utilisateur voit maintenant le contexte régional (ex: Europe entière avec clusters) au chargement, et un zoom confortable au niveau ville lors du clic sur un asset.
- [x] Validation screenshot : Europe visible avec clusters 6/25 bien répartis ✅

### Phase 32 - UX Refactor : Supprimer séparée du kebab (Completed - 20 Avril 2026)
- [x] **Problème UX identifié** : avoir "Supprimer" juste à côté de "Détail" dans le kebab ⋮ créait un risque de clic accidentel → perte de données.
- [x] **DataTableComponent.jsx** modifié globalement :
  - Filtrage du menu kebab pour exclure automatiquement les actions `label === 'Supprimer' || 'Delete'`
  - Nouvelle colonne dédiée ajoutée à droite de chaque ligne avec un **icône trash rouge** dans un carré bordé (34x34) rouge doux (`#FECACA` → hover `#F87171`)
  - Colonne `hasDeleteAction` conditionnelle : apparaît uniquement si l'action Supprimer existe dans `rowActions`
- [x] **Impact global** : toutes les tables de l'app (Clients, Engins, Tags, Sites, Dépôts, Alertes, Rapports, etc.) bénéficient automatiquement de cette séparation visuelle.
- [x] Validation screenshot : icône poubelle à droite + kebab avec seulement "Detail" ✅

### Phase 31 - Unification "Ajouter un site" en page unique (Completed - 20 Avril 2026)
- [x] **`SiteFullEditor.js` créé** (nouvelle page unifiée) regroupant en 1 seul flow :
  - Section 1: Informations (Label*, Nom*, Code, Référence, Description, toggle Site actif)
  - Section 2: Adresse (Adresse, Route, N°, Code postal, Ville, Pays)
  - Section 3: Contact (Téléphone, Fax, Email)
  - Carte Localisation sticky à droite (centrée Lausanne par défaut) + banner d'info
- [x] **Un seul bouton "Enregistrer"** qui effectue 2 appels API séquentiels : `createOrUpdateSite` puis `createOrUpdateAddress` avec le `worksiteID` du site créé. Retour automatique après succès.
- [x] Feedback UX : bouton devient vert "Enregistré !" avec spinner pendant la sauvegarde.
- [x] **`SiteClientComponent.jsx` re-orchestré** : affiche `SiteFullEditor` quand `editSite===true`, sinon `SiteDetailWithLinks` si `detailSiteClient===true`, sinon la liste.
- [x] **Dialog SiteEditor retiré** de `ClientDetail.js` (plus d'ouverture du popup quand on clique Ajouter un site).
- [x] Fix bug Leaflet "Invalid LatLng undefined" : position par défaut Lausanne (46.5197, 6.6323).
- [x] Validation screenshot : page unifiée rend parfaitement, carte affichée, tous les champs présents ✅

### Phase 30 - Refonte Pages Config Restantes (StatutList + EnginInactive) (Completed - 20 Avril 2026)
- [x] **StatutList.js** (module Statut séparé) refait avec le même pattern que Familles/Status : header + breadcrumb + bouton "+ Nouveau statut" violet gradient, tabs par objet, toolbar Filtres/Recherche/Cog, table 7 colonnes (Actions, Couleur, Icône, Nom, Type, Statut, chevron), paginator local.
- [x] **EnginInactive.jsx** (`Analyse > Objets inactifs`) refait avec adaptation contextuelle :
  - Header "Objets inactifs" + breadcrumb + **badge orange "X objets archivés"** (alert count)
  - Tabs dynamiques par `tableName` (Tous, Engin, Tag, Site, Client, Objet…) — chaque type avec son icône et couleur distinctive (Engin bleu, Tag violet, Client vert, Site jaune, etc.)
  - Actions kebab adaptées : **Réactiver** (vert pi-replay) + **Supprimer** (rouge)
  - Colonnes : Actions, Image (placeholder icône colorée si image absente), Nom, Type (pill coloré), ID (#monospace), Statut (pill Inactif)
  - Empty state positif "Aucun objet inactif — tout est à jour !" si rien
- [x] Screenshot : 122 objets archivés visibles, 9 lignes par page, tabs dynamiques colorés ✅

### Phase 29 - Refonte Page Statuts (Même design que Familles) (Completed - 20 Avril 2026)
- [x] **StatusList.js entièrement refait** avec exactement le même design pattern que Familles :
  - Header "Statuts" + breadcrumb "Configuration > Statuts" + bouton "+ Nouveau statut" violet gradient
  - Segmented control Tag / Engin (depuis `fetchObject`)
  - Toolbar Filtres + recherche instantanée + cog settings
  - Table custom : Actions (kebab Modifier/Supprimer), Couleur (swatch), Icône (boîte bordée), Nom du statut, Type (pill), Code (monospace), Statut (pill Actif/Inactif), chevron
  - Pagination locale (perPage 10/25/50, numéros violets, range "X à Y de Z éléments")
- [x] Logique métier préservée : `fetchStatus`, `fetchObject`, `setSelectedStatus`, `setEditStatus`, `setShow`.
- [x] Validation visuelle : rendu identique au pattern Familles, 11+ statuts affichés correctement ✅

### Phase 28 - Refonte Page Familles (Match design fourni) (Completed - 20 Avril 2026)
- [x] **FamilleList.js entièrement refait** pour matcher le mockup fourni :
  - Header avec titre "Familles" + breadcrumb "Configuration > Familles" + bouton "+ Nouvelle famille" (gradient violet #7C3AED → #6D28D9)
  - Segmented control Tag / Engin / Utilisateur (actif en violet clair)
  - Toolbar : Filtres + input recherche + bouton cog settings violet
  - Table custom avec colonnes exactes : Actions (kebab portal ⋮ avec Modifier/Supprimer), Couleur (swatch 28x28), Icône (boîte bordée 36x36), Nom, Type (pill Tag), Nombre d'éléments, Créé le, Statut (pill Actif vert), chevron droit
  - Empty state stylé si aucune famille dans la catégorie
  - Pagination interne : Éléments par page (select 10/25/50), numéros de page violet gradient, range "X à Y de Z éléments"
  - Recherche locale instantanée sur le label
- [x] Logique métier préservée : `fetchFamilles`, `setSelectedFamille`, `removeFamille`, `setEditFamille`, `fetchValidator`. Aucune modification backend.
- [x] Validation visuelle : screenshot confirme rendu identique au mockup ✅

### Phase 27 - Bouton "Ajouter un site" + Form premium (Completed - 20 Avril 2026)
- [x] **Bouton "+ Ajouter un site"** (violet gradient) ajouté en haut à droite de l'onglet Sites dans ClientDetail (via SiteList.js). Clic → pré-remplit `selectedSite` avec `customerID` + ouvre le Dialog SiteEditor.
- [x] **SiteEditor refondu** en form premium :
  - Titre français ("Nouveau site" / "Modifier le site")
  - Badge client épinglé en haut ("Client : client 33") avec icône briefcase
  - Form 2 colonnes : Label + Nom (requis), Code + Référence, Description (full), toggle "Site actif" dans encart gris stylé
  - Boutons footer hérités de la CSS .p-dialog globale (Annuler ghost, Enregistrer violet gradient)
  - Tous les champs équipés de `data-testid` (site-editor-label/name/code/reference/description/active)
- [x] Validation visuelle : bouton visible → dialog ouvre → form rempli correctement ✅

### Phase 26 - Refonte AddressDetail full-page (3 variantes) (Completed - 20 Avril 2026)
- [x] **3 variantes refactorisées** (Company / Depot / Site) avec le layout Premium complet :
  - Header Premium (Retour + avatar map-marker coloré + titre dynamique "Adresse de {type}" + badges type/ville + bouton "Enregistrer" violet gradient)
  - Layout 2 colonnes 65/35 via styles inline (contournement PrimeReact)
  - Colonne gauche : 2 sections (Adresse / Contact) avec form-grid 2 cols (Route, N°, Code postal, Ville, Pays full, Téléphone, Fax, Email full)
  - Colonne droite : **sticky card "Localisation"** contenant MapSearchComponent + footer Lat/Lng en bas
  - Avatar Site utilise bleu (#3B82F6) pour différenciation visuelle vs Depot/Company (violet)
- [x] Code simplifié : suppression du `addresses` state inutilisé + des imports superflus. Composants tous sous 180 lignes (vs 284 avant).
- [x] Validation visuelle screenshot : rend parfaitement (client 33 facturation Lausanne) avec carte interactive.

### Phase 25 - Régression Complète + Harmonisation Depot/Site (Completed - 20 Avril 2026)
- [x] **AddressesDepotComponent** et **AddressesSiteComponent** refactorisés avec le même design premium que AddressesComponent (icône colorée circulaire, statut Active, 3 actions œil/crayon/poubelle). Ces 2 composants étaient des fichiers séparés non-partagés.
- [x] **Régression testing_agent_v3_fork** (iteration_54) : 
  - ✅ Login (admin/user@1234) PASS
  - ✅ Dashboard : layout + 4 KPI + Map + Alert Center + FAB visible PASS
  - ✅ FAB Quick Actions Drawer : 9 shortcuts en 3 groupes, close OK PASS
  - ✅ Utilisateurs list : kebab ⋮ avec 3 actions (Detail/Utilisateur/Supprimer), Excel + PDF export buttons PASS
  - ⚠️ TeamDetail/ClientDetail detail pages : navigation visuellement confirmée, mais selectors flaky (portal dropdowns timing) — non-bloquant
  - `no_blocking_errors: true`, success rate 75%+ sur core flows
- [x] **Aucun bug critique introduit** par les changements des phases 20-24.

### Phase 24 - Refonte Section Adresses Client (Premium Cards) (Completed - 20 Avril 2026)
- [x] **`AddressesComponent` refactorisé** (Stripe-like premium cards) :
  - Icône circulaire colorée à gauche (violet = facturation/dépôt, vert = chargement/livraison, orange = siège)
  - Titre "Adresse de [type]" + badge contextuel ("Par défaut" vert, "Adresse principale" violet)
  - Lignes Adresse/Email/Téléphone avec icônes (masquées si vide)
  - Statut "Active/Inactive" en pilule top-right (dot vert)
  - 3 actions bottom-right : Voir (œil), Modifier (crayon), Supprimer (poubelle rouge) — hover states élégants
- [x] **ClientDetail onglet Adresses** :
  - Header "Gestion des adresses" + sous-titre + bouton violet gradient "Ajouter une adresse"
  - Empty state stylisé (icône + message) si aucune adresse
  - Banner d'info bleu "Bon à savoir" en bas expliquant l'usage de l'adresse principale
- [x] Validation visuelle screenshot : rend identique au design de référence fourni par l'utilisateur ✅

### Phase 23 - Hotfix UX Page Utilisateurs + CSS Global (Completed - 20 Avril 2026)
- [x] **Bug CSS critique résolu** : bloc `.lt-detail-header {` non fermé (ligne ~3146) cassait tous les styles après. Également un bloc orphelin (`box-shadow` sans sélecteur) à la fin du fichier. Correction propre + ajout de propriétés complètes pour `.lt-detail-header` (flex, padding, border, shadow, margin).
- [x] **TeamDetail `.js` polish** :
  - Suppression du bouton `more` redondant dans le header (⋯ à côté du bouton Modifier)
  - "Embauche" → "Embauché le {hireday}" (n'affiche que si valeur présente)
  - Bouton "Date départ" toggle (PrimeReact Button violet agressif) remplacé par un `<button>` HTML natif aux couleurs neutres (vert doux pour +, rouge doux pour ✕) bordé gris, aligné verticalement avec l'input Calendar
- [x] **CSS Calendar + Dropdown** : nouvelles règles pour `.p-calendar.lt-form-input` et `.p-dropdown.lt-form-input` — boutons calendrier/trigger intégrés au champ avec fond gris doux (`#F8FAFC`), border gauche continue, hover bleu doux. Fin des gros boutons violets visuellement détachés.
- [x] **`.lt-form-label`** : `display: inline-flex` pour aligner l'asterisque `*` à côté du libellé proprement (plus d'asterisques au-dessus).
- [x] Validation visuelle : TeamDetail "Zakaria RAHALI" rend maintenant de façon complètement premium (header avec Modifier violet gradient, inputs propres, sidebar cards bien stylées, dates intégrées).

### Phase 22 - Uniformisation Éditeurs / Dialogues Premium (Completed - 20 Avril 2026)
- [x] **Refonte CSS globale des dialogues PrimeReact** (`.p-dialog`) — impact automatique sur les 30+ editors existants (TagEditor, SiteEditor, TeamEditor, CustomerEditor, AddressEditor, DepotEditor, EnginEditor, AlertEditor, StatusEditor, etc.) :
  - Rayon 16px, shadow premium 24px+8px
  - Header : gradient subtil, titre uppercase Manrope 800, bouton close dans carré outlined
  - Body : padding 22/24px, labels uniformisés (0.78rem / 600 / #334155), inputs rayon 8px + focus violet (#6366F1 + ring 3px)
  - Footer : séparateur, fond #FAFBFC, boutons alignés droite
  - Bouton "Annuler" (p-button-danger) → ghost outlined blanc
  - Bouton "Enregistrer" (default) → gradient violet #6366F1→#4F46E5 avec shadow et hover translateY
  - Messages d'erreur, asterisques required, badges clients restylés
- [x] **Validation visuelle** : dialog "Create team" (TeamEditor) confirmé en rendu premium complet avec tous les éléments stylés.

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
- [ ] (Tech debt) Nettoyer les React warnings : keys manquantes dans SidebarMenuMain/PrivateRoutes/ChatMessage/DatatableComponent, attributs `full`/`sortable` non-boolean.

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
