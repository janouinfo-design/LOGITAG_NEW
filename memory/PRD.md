# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet
- Backend: FastAPI + MongoDB + Proxy API externe + WebSocket
- Auth: admin / user@1234

## Code Architecture
```
/app/backend/
├── server.py               # ~137 lignes: init, middleware, proxy, websocket
├── shared.py               # DB, WS manager, HTTP client
├── routes/                 # 7 routeurs séparés
```

## Completed Features

### All Phases 1-20 + B/C/D (DONE)
### Suppression Assets + Bulk Delete (DONE - Apr 7, 2026)
### Pagination Carte/Command Center (DONE - Apr 7, 2026)
### Simplification Formulaire Réservation (DONE - Apr 7, 2026)

### Mes Réservations en Vignettes (DONE - Apr 7, 2026)
- Layout transformé de liste pleine largeur vers grille CSS Grid responsive
- 5 colonnes sur desktop (auto-fill, minmax 300px), 1 colonne mobile
- Chaque vignette: icône + badges statut/priorité, nom asset, site/adresse, dates, boutons actions
- Cartes en retard: bordure rouge + gradient + badge "Retard"
- Hover avec élévation et ombre
- Actions: Sortie/Retour, Annuler, Détail (drawer latéral)
- Tests: iteration_38 (100% - 12/12 tests passés)

## Notes
- L'API externe retourne toujours PageSize=500
- Réservations existantes avec user_name restent en DB

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language
- Backlog: Refactoring PremiumAssets.jsx en sous-composants

## Test Reports
- /app/test_reports/iteration_1.json through iteration_38.json
