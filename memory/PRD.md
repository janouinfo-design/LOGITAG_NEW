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

**Phase A - Alertes Intelligentes Réservation (DONE):**
Backend (6 endpoints) :
- `GET /api/reservations/alerts/rules` - 5 règles configurables
- `PUT /api/reservations/alerts/rules/{id}` - Toggle ON/OFF par règle
- `POST /api/reservations/alerts/scan` - Scan moteur détection automatique
- `GET /api/reservations/alerts?status=active` - Liste alertes actives
- `PUT /api/reservations/alerts/{id}/resolve` - Résoudre une alerte
- `GET /api/reservations/alerts/stats` - Stats par type et sévérité

Types d'alertes :
1. **Overdue** (CRITICAL) - Asset non retourné après fin de réservation
2. **Upcoming** (WARNING) - Réservation imminente
3. **No checkout** (WARNING) - Réservation commencée sans check-out
4. **Long usage** (INFO) - Utilisation prolongée
5. **Low battery reserved** (WARNING) - Asset réservé avec batterie < 20%
- Test: iteration_30.json - 100% (22/22)

### Phase B - VUE GANTT PLANNING (DONE - Apr 6, 2026)
- Vue timeline/Gantt : 1 ligne par asset, barres colorées par statut (Demandé/Confirmé/En cours/Terminé/Annulé/Rejeté)
- Toolbar : recherche asset, filtre statut, zoom, sélecteur de jours (7/14/30)
- Click sur barre → panneau de détail avec infos complètes
- Marqueur jour courant (ligne rouge)
- Backend: `GET /api/reservations/gantt?days=14`
- Test: iteration_31.json - 100% (Backend 16/16, Frontend 26/26)

### Phase C - WORKFLOW APPROBATION (DONE - Apr 6, 2026)
- Boutons Approuver/Rejeter dans le détail de réservation (Gantt)
- Statut "Demandé" → validation → "Confirmé" ou "Rejeté"
- Backend: `POST /api/reservations/{id}/approve` et `/reject`
- Logs et notifications automatiques
- Test: iteration_31.json - 100%

### Phase D - DASHBOARD OPÉRATIONNEL (DONE - Apr 6, 2026)
- `GET /api/reservations/today-summary` : active, upcoming, overdue, pending, alerts
- KPIs opérationnels dans le Command Center
- Test: iteration_31.json - 100%

## DB Schema (Local MongoDB `test_database`)
- reservations, reservation_logs, notifications, user_roles
- zones, zone_events, zone_alerts
- **reservation_alerts**: {id, type, reservation_id, asset_id, asset_name, user_name, title, message, severity, resolved, created_at}
- **reservation_alert_rules**: {id, type, label, description, enabled, threshold_minutes, severity, auto_notify}

## Backlog (P2-P3)
- P1/P2: Refactoring de `server.py` (1400+ lignes → routeurs séparés)
- P2: Grid/card views alternatifs, Presets colonnes
- P3: Registres de maintenance (Maintenance records)
- P3: Scan QR/NFC pour check-in rapide des assets
- Backlog: Notifications Email et Push mobile
- Backlog: Multi-language

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_31.json`
