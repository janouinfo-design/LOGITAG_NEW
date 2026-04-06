# LOGITAG - Product Requirements Document

## Original Problem Statement
Refonte complète de l'application LOGITAG (tracking BLE d'assets) avec un niveau Premium SaaS (style Samsara/Stripe/Uber Fleet). React + connexion API externe Omniyat.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, TailwindCSS, Shadcn/Lucide-react, Leaflet, FullCalendar
- **Backend**: FastAPI proxy vers API externe
- **External API**: omniyat.is-certified.com:82/logitag_node/ (via /api/proxy/)
- **Auth**: admin / user@1234

## Premium Pages Architecture
```
/app/frontend/src/components/premium/
├── PremiumLayout.jsx, PremiumSidebar.jsx, PremiumBottomNav.jsx
├── PremiumDashboard.jsx, PremiumAssets.jsx, PremiumAssetDetail.jsx
├── PremiumMap.jsx, PremiumPlanning.jsx
├── PremiumActivity.jsx, PremiumAlerts.jsx, PremiumZones.jsx
├── PremiumUsers.jsx, PremiumSettings.jsx, PremiumReports.jsx, PremiumGateway.jsx
```

## Completed Features

### Phase 1-8 (Previous forks) - ALL DONE
- Full Premium SaaS UI with 14 pages, FastAPI proxy, Leaflet maps, Redux

### Phase 9 - Planning + Edit Modals (DONE - Apr 5, 2026)
- Planning page with FullCalendar resource-timeline
- Asset edit modal (13 fields), Tag Label fix, Map pagination, Photo upload

### Phase 10 - 5 Enhancements (DONE - Apr 6, 2026)
1. **Zones edit/delete** - Modal with name, type, color picker, alert toggles (entry/exit). Modifier + Supprimer buttons functional. Nouvelle zone button wired
2. **Activity time filters** - "Aujourd'hui", "Semaine", "Mois", "Personnalisé" chips with date pickers
3. **Alerts time filters** - Same time range filters (today/week/month/custom) 
4. **Users create/edit modal** - Full form: Prénom, Nom, Email, Mot de passe, Téléphone, Poste, Rôle (chips: Employé/Manager/Admin/Technicien), Actif toggle. Tabs: Identité/Contrat/Avancé. Pencil edit button per row
5. **Gateway edit modal** - Fields: Code, IMEI, Type (dropdown), Mode (dropdown), Site, Actif toggle. Pencil edit button per gateway item

## Pending/Future Tasks

### P1 - Polish & Mobile
- Responsive mobile verification
- Performance optimization

### P2 - Advanced
- WebSocket real-time / Dark mode / BLE Scan
- Better FullCalendar free alternative evaluation

### P3 - Extended
- Multi-tenant B2B / Column presets / GPS widget dashboard

## Test Reports
- `/app/test_reports/iteration_1.json` through `iteration_16.json`
