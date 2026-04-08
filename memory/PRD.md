# LOGITAG - Application de Tracking d'Assets (SaaS B2B)

## Problème Original
Transformer l'application LOGITAG existante (tracking d'assets IoT) en un SaaS B2B "Enterprise-grade" avec une interface moderne et professionnelle, sans modifier les appels API/Redux sous-jacents.

## Contrainte Critique
**STABILITÉ > DESIGN** : Les modifications sont strictement limitées au frontend (UI/UX). Il est interdit de toucher aux appels API, endpoints, méthodes HTTP, payloads, ou logique métier.

## Architecture
- **Frontend**: React 18, Redux Toolkit, PrimeReact, Metronic UI, SCSS
- **Backend**: API Externe (omniyat.is-certified.com) — aucune modification permise
- **Authentification**: admin / user@1234

## Pages et Composants

### Dashboard (/tagdashboard/index) - FAIT
- 4 KPI cards modernes (Engins utilisés, Tags alertes, Engins inactifs, Tags actifs)
- Layout responsive, progress bars

### Page Assets/Engins (/view/engin/index) - FAIT
- Header SaaS Premium (icône gradient bleu, titre, sous-titre, badge compteur)
- Skeleton loading animé pendant le chargement API
- Badges Etat : Sortie (rouge), Entrée (vert), Inactif (orange)
- Widget Batterie : barre visuelle + pourcentage coloré
- Badges Status : couleur dynamique selon l'API
- Chips Famille : colorées avec icône
- Bouton Géolocalisation : badge bleu cliquable
- Thumbnails images arrondis

### Page Tags (/tag/index) - FAIT
- Header SaaS Premium (icône gradient violet, titre, sous-titre, badge compteur)
- Skeleton loading animé
- Badges Actif/Inactif (vert/rouge)
- Badges Status colorés
- Chips Famille (BLE, etc.)
- Boutons adresse : Géolocalisation ou "Aucune adresse"

### Page Utilisateurs - NON ROUTÉE
- Le composant UserList.jsx a été modernisé mais n'est pas accessible via le routing dynamique (non présent dans components.js)

## Fichiers Clés
- `/app/frontend/src/logitag-saas.css` - Thème CSS global SaaS Premium
- `/app/frontend/src/components/Engin/EnginList/EnginList.js` - Page Assets modernisée
- `/app/frontend/src/components/Tag/user-interface/TagList/TagList.js` - Page Tags modernisée
- `/app/frontend/src/components/Dashboard/user-interface/DashboardComponent.jsx` - Dashboard SaaS

## Icônes
- FontAwesome Pro supprimé (package payant non disponible)
- Remplacé par PrimeReact Icons (pi pi-*) :
  - `fa-down-to-bracket` → `pi pi-arrow-down`
  - `fa-up-from-bracket` → `pi pi-arrow-up`
  - `fa-octagon-exclamation` → `pi pi-exclamation-triangle`

## Backlog
- P1: Ajouter la page Utilisateurs au routing dynamique (components.js)
- P2: Refonte des pages secondaires (Calendrier, Map, Rapports, etc.)
- P2: Ajout de presets pour la configuration des colonnes DataTable
- P3: Carte GPS en temps réel sur le dashboard
- P3: Optimisation des temps de chargement (skeletons systématiques sur toutes les pages)
