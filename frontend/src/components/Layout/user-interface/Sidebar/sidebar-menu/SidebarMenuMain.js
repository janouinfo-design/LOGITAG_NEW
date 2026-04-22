/* eslint-disable react/jsx-no-target-blank */
import React, {useEffect, useState} from 'react'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'
import {getMenus} from '../../../slice/layout.slice'
import {useAppSelector} from '../../../../../hooks'
import {EXTRA_MENU} from '../../../../../cors/config/config'

/* Normalize title for case/accent-insensitive matching */
const norm = (s) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/* ─────────────────────────────────────────────────────────────
   Icon mapping (normalized keys) — FontAwesome classes
   ───────────────────────────────────────────────────────────── */
const ICON_MAP = {
  // Dashboard
  'tableau de board': 'fa-solid fa-gauge-high',
  'tableau de bord': 'fa-solid fa-gauge-high',
  'dashboard': 'fa-solid fa-gauge-high',

  // Gestion
  'engins': 'fa-solid fa-truck-fast',
  'tags': 'fa-solid fa-tags',
  'calendrier': 'fa-solid fa-calendar-days',
  'timeline': 'fa-solid fa-calendar-days',
  'map': 'fa-solid fa-map-location-dot',
  'maps': 'fa-solid fa-map-location-dot',
  'carte': 'fa-solid fa-map-location-dot',
  'planning': 'fa-solid fa-calendar-days',
  'reservations': 'fa-solid fa-calendar-check',

  // Organisation
  'places': 'fa-solid fa-warehouse',
  'sites': 'fa-solid fa-warehouse',
  'depots': 'fa-solid fa-warehouse',
  'clients': 'fa-solid fa-user-tie',
  'vehicules': 'fa-solid fa-van-shuttle',
  'inventory': 'fa-solid fa-boxes-stacked',
  'inventaire': 'fa-solid fa-boxes-stacked',
  'utilisateurs': 'fa-solid fa-users',
  'users': 'fa-solid fa-users',
  'equipes': 'fa-solid fa-users',
  'facturation': 'fa-solid fa-file-invoice-dollar',
  'invoices': 'fa-solid fa-file-invoice-dollar',
  'elementfacture': 'fa-solid fa-receipt',
  'factureclient': 'fa-solid fa-user-tag',
  'facturefournisseur': 'fa-solid fa-truck-ramp-box',

  // Configuration
  'parametres': 'fa-solid fa-gear',
  'paramettres': 'fa-solid fa-gear',
  'settings': 'fa-solid fa-gear',
  'entreprise': 'fa-solid fa-building',
  'company': 'fa-solid fa-building',
  'famille': 'fa-solid fa-sitemap',
  'status': 'fa-solid fa-signal',
  'enginnoactive': 'fa-solid fa-power-off',
  'logs': 'fa-solid fa-clipboard-list',
  'insertion des donnees': 'fa-solid fa-database',
  'capteurs': 'fa-solid fa-satellite-dish',
  'alertes': 'fa-solid fa-bell',
  'geofencing': 'fa-solid fa-draw-polygon',

  // Analyse
  'rapports': 'fa-solid fa-chart-column',
  'reports': 'fa-solid fa-chart-column',
  'statistiques': 'fa-solid fa-chart-pie',
}

/* ─────────────────────────────────────────────────────────────
   Group mapping (normalized keys)
   ───────────────────────────────────────────────────────────── */
const GROUP_MAP = {
  // Dashboard
  'tableau de board': 'dashboard',
  'tableau de bord': 'dashboard',
  'dashboard': 'dashboard',

  // Gestion — day-to-day operations
  'engins': 'gestion',
  'tags': 'gestion',
  'calendrier': 'gestion',
  'timeline': 'gestion',
  'map': 'gestion',
  'maps': 'gestion',
  'carte': 'gestion',
  'planning': 'gestion',
  'vehicules': 'gestion',
  'reservations': 'gestion',

  // Organisation — entities, sites & people
  'places': 'organisation',
  'sites': 'organisation',
  'depots': 'organisation',
  'clients': 'organisation',
  'inventory': 'organisation',
  'inventaire': 'organisation',
  'utilisateurs': 'organisation',
  'users': 'organisation',
  'equipes': 'organisation',
  'facturation': 'organisation',
  'invoices': 'organisation',
  'elementfacture': 'organisation',
  'factureclient': 'organisation',
  'facturefournisseur': 'organisation',

  // Configuration — system setup
  'parametres': 'config',
  'paramettres': 'config',
  'settings': 'config',
  'entreprise': 'config',
  'company': 'config',
  'famille': 'config',
  'status': 'config',
  'enginnoactive': 'config',
  'logs': 'config',
  'insertion des donnees': 'config',
  'capteurs': 'config',
  'alertes': 'config',
  'geofencing': 'config',

  // Analyse
  'rapports': 'analyse',
  'reports': 'analyse',
  'statistiques': 'analyse',
}

const GROUP_ORDER = ['dashboard', 'gestion', 'organisation', 'config', 'analyse']
const GROUP_LABELS = {
  dashboard: '',
  gestion: 'Gestion',
  organisation: 'Organisation',
  config: 'Configuration',
  analyse: 'Analyse',
}

const resolveIcon = (item) => {
  const k1 = norm(item.title)
  const k2 = norm(item.olang)
  if (ICON_MAP[k1]) return ICON_MAP[k1]
  if (ICON_MAP[k2]) return ICON_MAP[k2]
  if (item.fontIcon && item.fontIcon.trim()) return item.fontIcon
  return 'fa-solid fa-circle-dot'
}

const resolveGroup = (item) => {
  const k1 = norm(item.title)
  const k2 = norm(item.olang)
  return GROUP_MAP[k1] || GROUP_MAP[k2] || 'gestion'
}

const SidebarMenuMain = () => {
  const [links, setLinks] = useState([])
  const menus = useAppSelector(getMenus)

  useEffect(() => {
    setLinks(
      !Array.isArray(menus)
        ? []
        : [...menus, ...EXTRA_MENU].map((m) => ({
            title: m.Text,
            fontIcon: m.icon,
            icon: '',
            to: m.Link == '#' ? '' : m.Link,
            hasBullet: false,
            olang: m.Name,
            children: !Array.isArray(m.subMenu)
              ? null
              : m.subMenu.map((o) => ({
                  title: o.Text,
                  fontIcon: o.icon,
                  icon: '',
                  to: o.Link,
                  hasBullet: false,
                  olang: o.Name,
                })),
          }))
    )
  }, [menus])

  // Bucket links into groups (preserving original order within group)
  const buckets = GROUP_ORDER.reduce((acc, g) => {
    acc[g] = []
    return acc
  }, {})
  links.forEach((l) => {
    const g = resolveGroup(l)
    if (!buckets[g]) buckets[g] = []
    buckets[g].push(l)
  })

  const renderLink = (l, idx) => {
    const iconClass = resolveIcon(l)
    return (
      <React.Fragment key={`${l.title}-${idx}`}>
        {Array.isArray(l.children) && l.children.length > 0 ? (
          <SidebarMenuItemWithSub
            to={l.to}
            title={l.title}
            fontIcon={iconClass}
            icon={l.icon}
            olang={l.olang}
          >
            {l.children.map((lc, ci) => (
              <SidebarMenuItem
                key={`${lc.title}-${ci}`}
                to={l.to + '/' + (lc.to?.startsWith('/') ? lc.to.slice(1) : lc.to)}
                icon={lc.icon || ''}
                title={lc.title}
                fontIcon={resolveIcon(lc)}
                hasBullet={lc.hasBullet}
                olang={lc.olang}
              />
            ))}
          </SidebarMenuItemWithSub>
        ) : (
          <SidebarMenuItem
            to={l.to}
            icon={l.icon}
            title={l.title}
            fontIcon={iconClass}
            olang={l.olang}
          />
        )}
      </React.Fragment>
    )
  }

  return (
    <>
      {GROUP_ORDER.map((g) => {
        const items = buckets[g]
        if (!items || items.length === 0) return null
        const label = GROUP_LABELS[g]
        return (
          <div
            key={g}
            className={`lt-sidebar-group lt-sidebar-group-${g}`}
            data-testid={`sidebar-group-${g}`}
          >
            {label && (
              <div className='lt-sidebar-section'>
                <span className='lt-sidebar-section-label'>{label}</span>
              </div>
            )}
            {items.map(renderLink)}
          </div>
        )
      })}
    </>
  )
}

export {SidebarMenuMain}
