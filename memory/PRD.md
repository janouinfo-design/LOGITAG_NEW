# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG vers un SaaS Premium Enterprise de tracking BLE. React + FastAPI + MongoDB + API externe Omniyat.

## Tech Stack
- Frontend: React 18, Redux Toolkit, TailwindCSS, Leaflet, FullCalendar
- Backend: FastAPI + MongoDB + Proxy API externe + WebSocket
- Auth: admin / user@1234

## Completed Features

### Phase 1-20 - ALL DONE
- Full Premium SaaS UI (14+ pages), Reservation Module, Advanced Geofencing, WebSocket
- Enterprise Command Center, Skeleton Loading, Rich Timeline Journal, Auto-refresh

### Phase 21 - CHECKBOXES ASSETS + ALERTES SMART (DONE - Apr 6, 2026)

**Checkboxes multi-sélection Assets :**
- Checkbox individuel sur chaque carte/ligne d'asset
- Checkbox "Tout sélectionner" dans le header de liste
- Barre d'actions en masse (compteur, "Sélectionner les 500", Supprimer, Annuler)
- Modal de confirmation suppression avec avertissement
- Highlight bleu sur les items sélectionnés
- Test: iteration_29.json - 100% (7/7)

**Phase A - Alertes Intelligentes Réservation :**
Backend (6 endpoints) :
- `GET /api/reservations/alerts/rules` - 5 règles configurables
- `PUT /api/reservations/alerts/rules/{id}` - Toggle ON/OFF par règle
- `POST /api/reservations/alerts/scan` - Scan moteur détection automatique
- `GET /api/reservations/alerts?status=active` - Liste alertes actives
- `PUT /api/reservations/alerts/{id}/resolve` - Résoudre une alerte
- `GET /api/reservations/alerts/stats` - Stats par type et sévérité

Types d'alertes :
1. **Overdue** (CRITICAL) - Asset non retourné après fin de réservation
2. **Upcoming** (WARNING) - Réservation imminente (configurable en minutes)
3. **No checkout** (WARNING) - Réservation commencée sans check-out
4. **Long usage** (INFO) - Utilisation prolongée au-delà de la durée
5. **Low battery reserved** (WARNING) - Asset réservé avec batterie < 20%

Frontend - Dashboard KPI Réservations enrichi :
- Onglets "Alertes Smart" / "Notifications"
- Bouton "Scanner" pour lancer le scan
- Panneau "Règles" avec 5 toggles ON/OFF
- Chips stats (En retard: X, Pas de check-out: X)
- Cartes alertes avec titre, message, type badge, sévérité, bouton résoudre
- Test: iteration_30.json - 100% (22/22 = 10 backend + 12 frontend)

## DB Schema (Local MongoDB `test_database`)
- reservations, reservation_logs, notifications, user_roles
- zones, zone_events, zone_alerts
- **reservation_alerts**: {id, type, reservation_id, asset_id, asset_name, user_name, title, message, severity, resolved, created_at}
- **reservation_alert_rules**: {id, type, label, description, enabled, threshold_minutes, severity, auto_notify}

## Pending/Future Tasks

### Phase B - VUE GANTT PLANNING (P0 - Next)
- Vue timeline/Gantt : 1 ligne par asset, barres colorées par réservation
- Cliquable pour voir les détails
- Indicateur de disponibilité

### Phase C - WORKFLOW APPROBATION (P1)
- Statut "Demandé" → validation → "Confirmé"
- Notification au manager

### Phase D - DASHBOARD OPÉRATIONNEL (P1)
- Vue résumé du jour dans le Command Center
- Assets critiques avec action rapide

### Backlog (P2-P3)
- Maintenance records, QR/NFC, Notifications Email/Push, Multi-language
- Grid/card view alternatives, Presets colonnes

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_30.json`
