/* ═══════════════════════════════════════════════════════════════
   Reports Hub — Catalog
   Defines categories + reports + metadata (badges, renderers, links)
   ═══════════════════════════════════════════════════════════════ */

export const REPORT_CATALOG = [
  {
    id: 'cat-activity',
    label: "Rapport d'activité",
    icon: 'fa-truck-fast',
    color: '#1D4ED8',
    desc: "Activité quotidienne des engins, déplacements et arrêts",
    reports: [
      {
        id: 'engin-activity',
        name: 'Rapport engin',
        desc: 'Heure de départ, arrivée, temps sur site, adresse',
        icon: 'fa-route',
        badges: ['recommended'],
        renderer: 'navixy',
        navigate: '/rapports/legacy',
      },
      {
        id: 'stops-detail',
        name: 'Détail des arrêts',
        desc: 'Historique détaillé des arrêts par engin',
        icon: 'fa-octagon-minus',
        renderer: 'stops',
      },
    ],
  },
  {
    id: 'cat-zone',
    label: 'Rapport de zone géographique',
    icon: 'fa-map-location-dot',
    color: '#7C3AED',
    desc: "Temps passé dans chaque zone et visites des POI",
    reports: [
      {
        id: 'zone-time',
        name: 'Rapport zone',
        desc: 'Date, heure et temps passé dans chaque zone',
        icon: 'fa-draw-polygon',
        renderer: 'zone',
      },
      {
        id: 'poi-visits',
        name: 'Visites POI',
        desc: "Date, heure et nombre de visites aux points d'intérêt",
        icon: 'fa-location-dot',
        renderer: 'poi',
      },
    ],
  },
  {
    id: 'cat-logitag',
    label: 'Rapports Logitag (Outils / Assets)',
    icon: 'fa-tags',
    color: '#0EA5E9',
    desc: "Suivi des outils, immobilisations et utilisation",
    reports: [
      {
        id: 'idle-assets',
        name: 'Outils immobilisés',
        desc: "Dernière position, durée sans mouvement, statut",
        icon: 'fa-clock',
        badges: ['recommended', 'mostUsed'],
        renderer: 'redirect',
        navigate: '/idle-assets/index',
      },
      {
        id: 'underused-assets',
        name: 'Outils sous-utilisés',
        desc: "Taux d'utilisation faible, dernière activité",
        icon: 'fa-arrow-trend-down',
        renderer: 'underused',
      },
      {
        id: 'last-position',
        name: 'Dernière position des outils',
        desc: 'Liste complète avec position actuelle et date',
        icon: 'fa-location-crosshairs',
        renderer: 'lastPosition',
      },
      {
        id: 'time-zone-tools',
        name: 'Temps par zone (outils)',
        desc: 'Temps passé sur chantier ou dépôt',
        icon: 'fa-stopwatch',
        renderer: 'timeZone',
      },
    ],
  },
  {
    id: 'cat-alerts',
    label: "Rapports d'alerte",
    icon: 'fa-bell',
    color: '#DC2626',
    desc: "Alertes système, batteries, équipements perdus",
    reports: [
      {
        id: 'alerts-global',
        name: "Rapport global d'alertes",
        desc: 'Toutes les alertes sur la période',
        icon: 'fa-triangle-exclamation',
        renderer: 'alerts',
      },
      {
        id: 'undetected',
        name: 'Équipements non détectés',
        desc: 'Tags absents ou hors portée',
        icon: 'fa-signal',
        renderer: 'undetected',
      },
    ],
  },
]

/** Flatten all reports for search */
export const FLAT_REPORTS = REPORT_CATALOG.flatMap((c) =>
  c.reports.map((r) => ({...r, categoryId: c.id, categoryLabel: c.label, categoryColor: c.color}))
)

export const BADGE_LABELS = {
  recommended: 'Recommandé',
  mostUsed: 'Le plus utilisé',
  new: 'Nouveau',
}
export const BADGE_COLORS = {
  recommended: {bg: '#DBEAFE', fg: '#1D4ED8'},
  mostUsed: {bg: '#FEF3C7', fg: '#92400E'},
  new: {bg: '#DCFCE7', fg: '#166534'},
}
