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
├── routes/                 # 7 routeurs séparés (alerts, maintenance, notifications, reservations, roles, seed, zones)
```

## Completed Features

### All Phases 1-20 (DONE)
### Phase 21: Checkboxes + Smart Alerts (DONE)
### Phases B/C/D: Gantt + Approbation + KPIs (DONE)
### P1: Refactoring server.py (DONE)
### Suppression Assets + Bulk Delete Visual Feedback (DONE - Apr 7, 2026)
### Pagination Carte/Command Center (DONE - Apr 7, 2026)

### Simplification Formulaire Réservation (DONE - Apr 7, 2026)
- Supprimé les champs Utilisateur, Équipe, Projet du formulaire de création
- Formulaire simplifié: Asset + Site + Adresse + Dates + Priorité + Note
- Backend mis à jour: user_name est maintenant optionnel dans ReservationCreate
- Nettoyé l'affichage dans 3 composants: PremiumReservationPlanning, PremiumGantt, PremiumMyReservations
- Detail drawers mis à jour (supprimé Utilisateur/Équipe/Projet)
- Gantt bars affichent maintenant le nom de l'asset au lieu du user_name
- Testé: Création API OK sans user_name, formulaire UI validé via screenshot

## Notes
- L'API externe retourne toujours PageSize=500 depuis sa base plus large
- Les suppressions sont permanentes dans l'API externe
- Les réservations existantes avec user_name restent inchangées dans la DB

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language
- Backlog: Refactoring PremiumAssets.jsx (~1320 lignes) en sous-composants

## Test Reports
- /app/test_reports/iteration_1.json through iteration_37.json
