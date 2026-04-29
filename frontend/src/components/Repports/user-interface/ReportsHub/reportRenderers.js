/* ═══════════════════════════════════════════════════════════════
   Reports Hub — Renderers
   Each renderer takes (engines, config) and returns:
     { kpis: [{label,value,sub,color}], columns: [{key,label}], rows: [...] }
   ═══════════════════════════════════════════════════════════════ */

const parseDate = (raw) => {
  if (!raw) return null
  if (typeof raw === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
    const [d, t] = raw.split(' ')
    const [dd, mm, yyyy] = d.split('/')
    const [hh = '0', mi = '0'] = (t || '').split(':')
    const x = new Date(+yyyy, +mm - 1, +dd, +hh, +mi)
    return isNaN(x.getTime()) ? null : x
  }
  const x = new Date(raw)
  return isNaN(x.getTime()) || x.getFullYear() < 2000 ? null : x
}

const fmtDate = (d) => (d ? d.toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—')
const daysSince = (d) => (d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000)) : null)

/** Filter engines based on config (date range + scope + zone) */
const applyFilters = (engines, config) => {
  let list = engines || []
  if (config?.zone) list = list.filter((e) => (e.LocationObjectname || e.zoneName) === config.zone)
  if (config?.scopeIds && config.scopeIds.length > 0) {
    const set = new Set(config.scopeIds)
    list = list.filter((e) => set.has(e.id) || set.has(e.uid))
  }
  if (config?.from) {
    const from = new Date(config.from).getTime()
    list = list.filter((e) => {
      const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
      return d && d.getTime() >= from
    })
  }
  if (config?.to) {
    const to = new Date(config.to).getTime() + 86400000
    list = list.filter((e) => {
      const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
      return d && d.getTime() <= to
    })
  }
  return list
}

/* ─── Renderers ─── */

export const renderers = {
  /* Détail des arrêts — group last positions by engin (1 stop per engin = last known) */
  stops: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const rows = filtered
      .map((e) => {
        const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
        return {
          id: e.id,
          name: e.reference || e.label || '—',
          position: e.LocationObjectname || e.lastSeenAddress || '—',
          startedAt: fmtDate(d),
          duration: daysSince(d),
        }
      })
      .filter((r) => r.duration !== null)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
    const totalDays = rows.reduce((s, r) => s + (r.duration || 0), 0)
    return {
      kpis: [
        {label: 'Arrêts totaux', value: rows.length, color: '#1D4ED8', icon: 'fa-octagon-minus'},
        {label: 'Cumul jours arrêtés', value: totalDays, color: '#DC2626', icon: 'fa-clock'},
        {label: 'Engins concernés', value: new Set(rows.map((r) => r.id)).size, color: '#0EA5E9', icon: 'fa-truck'},
        {label: 'Durée moyenne', value: rows.length ? Math.round(totalDays / rows.length) + 'j' : '0j', color: '#7C3AED', icon: 'fa-stopwatch'},
      ],
      columns: [
        {key: 'name', label: 'Engin'},
        {key: 'position', label: 'Position'},
        {key: 'startedAt', label: 'Début arrêt'},
        {key: 'duration', label: 'Durée (jours)', align: 'right'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },

  /* Rapport zone — temps cumulé par zone */
  zone: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const map = new Map()
    filtered.forEach((e) => {
      const z = e.LocationObjectname || e.zoneName || 'Hors zone'
      const days = daysSince(parseDate(e.lastSeenAt) || parseDate(e.locationDate)) || 0
      if (!map.has(z)) map.set(z, {zone: z, count: 0, totalDays: 0})
      const v = map.get(z)
      v.count += 1
      v.totalDays += days
    })
    const rows = [...map.values()].sort((a, b) => b.totalDays - a.totalDays).map((r) => ({
      ...r,
      avgDays: r.count ? Math.round(r.totalDays / r.count) : 0,
    }))
    return {
      kpis: [
        {label: 'Zones suivies', value: rows.length, color: '#7C3AED', icon: 'fa-draw-polygon'},
        {label: 'Engins suivis', value: filtered.length, color: '#1D4ED8', icon: 'fa-truck'},
        {label: 'Cumul jours sur zone', value: rows.reduce((s, r) => s + r.totalDays, 0), color: '#0EA5E9', icon: 'fa-clock'},
        {label: 'Top zone', value: rows[0]?.zone?.slice(0, 18) || '—', color: '#F59E0B', icon: 'fa-trophy'},
      ],
      columns: [
        {key: 'zone', label: 'Zone'},
        {key: 'count', label: 'Engins présents', align: 'right'},
        {key: 'totalDays', label: 'Total jours', align: 'right'},
        {key: 'avgDays', label: 'Moyenne / engin', align: 'right'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
      chart: {
        type: 'bar',
        labels: rows.slice(0, 10).map((r) => r.zone),
        data: rows.slice(0, 10).map((r) => r.totalDays),
        label: 'Jours cumulés',
        color: '#7C3AED',
      },
    }
  },

  /* Visites POI — count visits per location */
  poi: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const map = new Map()
    filtered.forEach((e) => {
      const p = e.lastSeenAddress || e.LocationObjectname || 'Inconnu'
      if (!map.has(p)) map.set(p, {poi: p, visits: 0, lastVisit: null})
      const v = map.get(p)
      v.visits += 1
      const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
      if (d && (!v.lastVisit || d > v.lastVisit)) v.lastVisit = d
    })
    const rows = [...map.values()].sort((a, b) => b.visits - a.visits).map((r) => ({
      ...r,
      lastVisit: fmtDate(r.lastVisit),
    }))
    return {
      kpis: [
        {label: 'POI suivis', value: rows.length, color: '#7C3AED', icon: 'fa-location-dot'},
        {label: 'Visites totales', value: rows.reduce((s, r) => s + r.visits, 0), color: '#1D4ED8', icon: 'fa-flag-checkered'},
        {label: 'POI le + visité', value: rows[0]?.poi?.slice(0, 18) || '—', color: '#F59E0B', icon: 'fa-trophy'},
        {label: 'POI uniques', value: rows.length, color: '#0EA5E9', icon: 'fa-map-pin'},
      ],
      columns: [
        {key: 'poi', label: 'Point d\'intérêt'},
        {key: 'visits', label: 'Visites', align: 'right'},
        {key: 'lastVisit', label: 'Dernière visite'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },

  /* Outils sous-utilisés — explicit "nonactive" or "exit" state, OR not seen 30+ days */
  underused: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const threshold = config?.threshold || 30
    const rows = filtered
      .map((e) => {
        const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
        const days = daysSince(d)
        const underused =
          (e.etatenginname === 'nonactive' || e.etatenginname === 'exit') ||
          (days !== null && days >= threshold)
        if (!underused) return null
        return {
          id: e.id,
          name: e.reference || e.label || '—',
          category: e.types || e.familleNom || '—',
          lastSeen: fmtDate(d),
          days: days,
          state: e.etatenginname || '—',
          position: e.LocationObjectname || e.lastSeenAddress || '—',
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b.days || 0) - (a.days || 0))
    return {
      kpis: [
        {label: 'Outils sous-utilisés', value: rows.length, color: '#F59E0B', icon: 'fa-arrow-trend-down'},
        {label: 'Seuil', value: `${threshold}j`, color: '#94A3B8', icon: 'fa-sliders'},
        {label: 'Jamais détectés', value: rows.filter((r) => r.days === null).length, color: '#DC2626', icon: 'fa-circle-exclamation'},
        {label: 'Total flotte', value: filtered.length, color: '#1D4ED8', icon: 'fa-boxes-stacked'},
      ],
      columns: [
        {key: 'name', label: 'Outil'},
        {key: 'category', label: 'Catégorie'},
        {key: 'position', label: 'Position'},
        {key: 'lastSeen', label: 'Dernière activité'},
        {key: 'days', label: 'Jours inactif', align: 'right'},
        {key: 'state', label: 'État'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },

  /* Dernière position des outils — full snapshot */
  lastPosition: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const rows = filtered.map((e) => {
      const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
      return {
        id: e.id,
        name: e.reference || e.label || '—',
        category: e.types || e.familleNom || '—',
        position: e.LocationObjectname || e.lastSeenAddress || '—',
        zone: e.LocationObjectname || '—',
        battery: e.batteries ? `${e.batteries}%` : '—',
        lastSeen: fmtDate(d),
        days: daysSince(d),
      }
    }).sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
    return {
      kpis: [
        {label: 'Outils tracés', value: rows.length, color: '#0EA5E9', icon: 'fa-location-crosshairs'},
        {label: 'Vu < 24h', value: rows.filter((r) => r.days !== null && r.days < 1).length, color: '#16A34A', icon: 'fa-clock'},
        {label: 'Vu < 7 jours', value: rows.filter((r) => r.days !== null && r.days < 7).length, color: '#1D4ED8', icon: 'fa-calendar-week'},
        {label: 'Sans signal', value: rows.filter((r) => r.days === null).length, color: '#94A3B8', icon: 'fa-question'},
      ],
      columns: [
        {key: 'name', label: 'Outil'},
        {key: 'category', label: 'Catégorie'},
        {key: 'position', label: 'Position'},
        {key: 'battery', label: 'Batterie', align: 'right'},
        {key: 'lastSeen', label: 'Dernière détection'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },

  /* Temps par zone (outils) — same as zone but tool-focused */
  timeZone: (engines, config) => {
    const r = renderers.zone(engines, config)
    return {...r, kpis: r.kpis.map((k, i) => i === 1 ? {...k, label: 'Outils suivis'} : k)}
  },

  /* Rapport global d'alertes — battery low + immobilized + no-signal */
  alerts: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const rows = []
    filtered.forEach((e) => {
      const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
      const days = daysSince(d)
      const batt = parseInt(e.batteries, 10)
      if (!isNaN(batt) && batt < 20) {
        rows.push({id: `${e.id}-batt`, engin: e.reference || '—', type: 'Batterie faible', severity: 'high', detail: `Batterie ${batt}%`, at: fmtDate(d)})
      }
      if (days !== null && days >= 14) {
        rows.push({id: `${e.id}-imm`, engin: e.reference || '—', type: 'Immobilisé', severity: 'medium', detail: `${days} jours sans mouvement`, at: fmtDate(d)})
      }
      if (days === null) {
        rows.push({id: `${e.id}-nosig`, engin: e.reference || '—', type: 'Aucun signal', severity: 'high', detail: 'Tag jamais détecté', at: '—'})
      }
    })
    const high = rows.filter((r) => r.severity === 'high').length
    return {
      kpis: [
        {label: 'Alertes totales', value: rows.length, color: '#DC2626', icon: 'fa-triangle-exclamation'},
        {label: 'Critique', value: high, color: '#DC2626', icon: 'fa-bell'},
        {label: 'Modérée', value: rows.length - high, color: '#F59E0B', icon: 'fa-bell'},
        {label: 'Engins touchés', value: new Set(rows.map((r) => r.engin)).size, color: '#1D4ED8', icon: 'fa-truck'},
      ],
      columns: [
        {key: 'engin', label: 'Engin'},
        {key: 'type', label: "Type d'alerte"},
        {key: 'detail', label: 'Détail'},
        {key: 'at', label: 'Détectée le'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },

  /* Équipements non détectés — never seen or seen > 30 days */
  undetected: (engines, config) => {
    const filtered = applyFilters(engines, config)
    const threshold = config?.threshold || 30
    const rows = filtered
      .map((e) => {
        const d = parseDate(e.lastSeenAt) || parseDate(e.locationDate)
        const days = daysSince(d)
        if (days !== null && days < threshold) return null
        return {
          id: e.id,
          name: e.reference || e.label || '—',
          category: e.types || e.familleNom || '—',
          lastSeen: fmtDate(d),
          days: days,
          tag: e.tagName || e.tagDate || '—',
          status: days === null ? 'Jamais détecté' : `Hors portée ${days}j`,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b.days ?? 99999) - (a.days ?? 99999))
    return {
      kpis: [
        {label: 'Équipements perdus', value: rows.length, color: '#DC2626', icon: 'fa-signal'},
        {label: 'Jamais détectés', value: rows.filter((r) => r.days === null).length, color: '#DC2626', icon: 'fa-circle-xmark'},
        {label: 'Hors portée', value: rows.filter((r) => r.days !== null).length, color: '#F59E0B', icon: 'fa-signal-slash'},
        {label: `Seuil`, value: `${threshold}j`, color: '#94A3B8', icon: 'fa-sliders'},
      ],
      columns: [
        {key: 'name', label: 'Équipement'},
        {key: 'category', label: 'Catégorie'},
        {key: 'tag', label: 'Tag'},
        {key: 'lastSeen', label: 'Dernier signal'},
        {key: 'status', label: 'Statut'},
      ],
      rows: rows.slice(0, 500),
      total: rows.length,
    }
  },
}
