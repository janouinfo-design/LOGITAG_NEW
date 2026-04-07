# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet
- Backend: FastAPI + MongoDB + Proxy API externe + WebSocket
- Auth: admin / user@1234

## Completed Features

### All Phases 1-20 + B/C/D (DONE)
### Suppression Assets + Bulk Delete (DONE)
### Pagination Carte/Command Center (DONE)
### Simplification Formulaire Réservation (DONE)
### Mes Réservations en Vignettes (DONE)
### Menu Sidebar Regroupé (DONE)
### Dashboard KPI Cliquables (DONE)
### Renommage Menu: Timeline + Planification (DONE)

### Activité en Vignettes + Déplacement Menu (DONE - Apr 7, 2026)
- Page Activité transformée de timeline verticale en grille de vignettes responsive (3 colonnes)
- Chaque vignette: icône type, temps relatif, nom asset, détail événement, zone, badge type
- "Activité" déplacé de "Suivi" vers "Tableau de bord" dans le sidebar
- Section "Suivi" ne contient plus que Alertes et Rapports

## Menu Sidebar Structure
- **Tableau de bord**: Carte, Dashboard, Activité
- **Assets**: Liste Assets, Zones, Gateway
- **Réservations**: Timeline, Planification, Calendrier, Mes réservations, KPI
- **Suivi**: Alertes, Rapports
- **Administration**: Utilisateurs, Rôles, Clients, Paramètres

## Backlog
- P3: Registres de maintenance (UI)
- P3: Scan QR/NFC pour check-in rapide
- Backlog: Notifications Email/Push, Multi-language
- Backlog: Refactoring PremiumAssets.jsx en sous-composants

## Test Reports
- /app/test_reports/iteration_1.json through iteration_39.json
