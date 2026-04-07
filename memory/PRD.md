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

### All Phases 1-20 (DONE)
### Phase 21: Checkboxes + Smart Alerts (DONE)
### Phases B/C/D: Gantt + Approbation + KPIs (DONE)
### P1: Refactoring server.py (DONE)

### Suppression Assets (DONE - Apr 7, 2026)
- Bouton supprimer individuel (poubelle rouge) sur chaque carte/ligne
- Modal de confirmation + Undo 5 secondes avec barre de progression
- Persistance des IDs supprimés dans localStorage (expire 24h)
- Suppression en masse via checkboxes avec overlay de progression
- Route Assets ajoutée à EXTRA_MENU (fix navigation)
- Pagination cartes fonctionnelle (15 items/page, 34 pages)

### Bulk Delete Visual Feedback (DONE - Apr 7, 2026)
- Overlay de progression avec spinner, barre de progression et compteur (X/Y traités)
- Fermeture immédiate du modal de confirmation au début du bulk delete
- Pause de 600ms à 100% pour montrer la complétion
- Auto-correction de la page de pagination si elle dépasse le total après suppression (safePage)
- Toast résultat final (succès/échec) affiché 8 secondes
- Tests: iteration_36 (100% - 12/12 tests passés)

### Pagination Carte/Command Center (DONE - Apr 7, 2026)
- Ajout pagination sidebar assets: 30 items/page avec boutons prev/next
- Fix loading state bloqué par API logs externe (rendu non-bloquant)
- Reset automatique page 1 lors de changement de filtre ou recherche
- Pagination masquée quand résultats < 30 items
- Fallback "Chargement des assets..." si Redux n'a pas encore chargé
- Tests: iteration_37 (100% - 11/11 tests passés)

## Notes
- L'API externe retourne toujours PageSize=500 depuis sa base plus large
- Les suppressions sont permanentes dans l'API externe

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language
- Backlog: Refactoring PremiumAssets.jsx (~1320 lignes) en sous-composants

## Test Reports
- /app/test_reports/iteration_1.json through iteration_37.json
