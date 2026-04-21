import React, {useEffect, useMemo, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {fetchEngines, getEngines} from '../../../Engin/slice/engin.slice'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {saveAs} from 'file-saver'
import './NavixyReport.css'

/**
 * Navixy-inspired Report module (frontend-only, mock data).
 * 3-column layout:
 *   1. Available reports (categorized list)
 *   2. Trackers (multi-select list)
 *   3. Parameters panel (title, date range, days, time, options, build button)
 * + Result view with tabs (Résumé + per-engin) and columnar tables.
 */

// ── Report catalog (Rapport engin, Zone, Alertes…) ─────────────
const REPORT_CATALOG = [
  {
    group: "Rapport d'activité",
    items: [
      {id: 'engin-trips', title: 'Rapport engin', desc: "Heure de départ, arrivée, temps sur site, adresse."},
      {id: 'engin-stops', title: 'Détail des arrêts', desc: 'Historique détaillé des arrêts par engin.'},
    ],
  },
  {
    group: 'Rapport de zone géographique',
    items: [
      {id: 'zone-visits', title: 'Rapport zone', desc: 'Date, heure et temps passé dans chaque zone.'},
      {id: 'zone-poi', title: 'Visites POI', desc: 'Date, heure et nombre de visites aux POI.'},
    ],
  },
  {
    group: "Rapports d'alerte",
    items: [
      {id: 'alert-immobilized', title: 'Engins immobilisés', desc: "Assets sans mouvement sur la période — adresse, durée, statut."},
      {id: 'alert-underused', title: 'Engins sous-utilisés', desc: "Taux d'utilisation faible — temps, adresse, dernière activité."},
      {id: 'alert-global', title: "Rapport global d'alertes", desc: "Toutes les alertes déclenchées sur la période."},
    ],
  },
]

// ── Mock trackers ────────────────────────────────────────────────
const MOCK_TRACKERS = [
  {group: 'Annulés', color: '#EF4444', count: 4, items: [
    {id: '18', label: '18- MINI cab VD310396'},
    {id: '7', label: '7- BMW 420i Cabrio VD 306604'},
    {id: '16', label: '16-'},
    {id: '8', label: '8-BMW GRA VD361994'},
  ]},
  {group: 'Benz', color: '#F97316', count: 8, items: [
    {id: '15', label: '15-Vito VD636369'},
    {id: '10', label: '10-Utilitaire VD274083'},
    {id: '3', label: '03-Mer E 148 119'},
    {id: '1', label: '01-GLE VD600928'},
    {id: '11', label: '11-Mer CLA VD464302'},
    {id: '21', label: '21-GLC VD 621956'},
    {id: '22', label: '22-GLB VD 621745'},
    {id: '24', label: '24-GLE 24 VD451264'},
  ]},
  {group: 'BMW', color: '#10B981', count: 3, items: [
    {id: '17', label: '17-Bmw 1 VD579397'},
    {id: '4', label: '4- X5 VD244 348'},
    {id: '26', label: '26-BMW S5 VD361 65'},
  ]},
  {group: 'Mercedes Classe A', color: '#3B82F6', count: 2, items: [
    {id: 'mca1', label: 'A 180 VD 12345'},
    {id: 'mca2', label: 'A 200 VD 67890'},
  ]},
]

// ── Mock report result rows (for demo) ──────────────────────────
const MOCK_RESULT_DAYS = [
  {
    date: '7 nov. 2024 (Jeu.)',
    rows: [
      {depart: '10:30 - Princesa-Centro Comercial, Subterráneo de Princesa a Santa Cruz de Marcenado, Universidad, Madrid, Communauté de Madrid, Espagne, 28015', arrivee: '11:32 - Repsol, A-2, Trijueque, Guadalajara, ES-GU, Castille-La Manche, Espagne, 19190', temps: '01:02', addresse: 'Madrid → Guadalajara', duree: '01:02'},
      {depart: '11:44 - Repsol, A-2, Trijueque, Guadalajara, ES-GU, Castille-La Manche, Espagne, 19190', arrivee: '13:22 - Estación de Servicio Repsol Cred Área 280 Zaragoza, Autovía del Nordeste, Calatorao, Saragosse, ES-Z, Aragon, Espagne, 50280', temps: '01:38', addresse: 'Guadalajara → Saragosse', duree: '01:38'},
      {depart: '13:35 - Estación de Servicio Repsol Cred Área 280 Zaragoza, Autovía del Nordeste, Calatorao, Saragosse, ES-Z, Aragon, Espagne, 50280', arrivee: '15:32 - Polígon Industrial de Fonolleres, Granyanella, Ségarra, Lérida, ES-L, Catalogne, Espagne, 25218', temps: '01:57', addresse: 'Saragosse → Lérida', duree: '01:57'},
      {depart: "15:38 - Polígon Industrial de Fonolleres, Granyanella, Ségarra, Lérida, ES-L, Catalogne, Espagne, 25218", arrivee: "16:58 - Place de Catalogne, Plaça de Catalunya, la Dreta de l'Eixample, Barcelone, ES-B, Catalogne, Espagne, 08001", temps: '01:20', addresse: 'Lérida → Barcelone', duree: '01:20'},
    ],
  },
]
const MOCK_ALERT_ROWS = [
  {time: '07 nov. 2024 09:12', address: 'Zone Est · Site Omniyat Dubai', status: 'Immobilisé', duration: '2j 04h', severity: 'warning'},
  {time: '07 nov. 2024 11:44', address: 'Place de Catalogne, Barcelone', status: 'Sous-utilisé', duration: '7j', severity: 'info'},
  {time: '07 nov. 2024 14:22', address: 'Estación Repsol, Saragosse', status: 'Hors zone', duration: '—', severity: 'danger'},
  {time: '08 nov. 2024 06:15', address: 'Polígon Industrial Fonolleres, Lérida', status: 'Immobilisé', duration: '1j 11h', severity: 'warning'},
]

// ── Days + time range helpers ──────────────────────────────────
const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

function NavixyReport() {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines) || []

  useEffect(() => {
    dispatch(fetchEngines({page: 1, SortDirection: 'DESC', SortColumn: 'lastSeenAt'}))
  }, [dispatch])

  // Build tag groups from real engines (grouped by pioFamilyLabel / famille or fallback)
  const realTagGroups = useMemo(() => {
    if (!engines || engines.length === 0) return []
    const byGroup = new Map()
    engines.forEach((e) => {
      const grp = e.pioFamilyLabel || e.familyLabel || e.familyname || e.familyName || 'Autres'
      const label = e.reference || e.label || e.name || `Tag ${e.id}`
      if (!byGroup.has(grp)) byGroup.set(grp, [])
      byGroup.get(grp).push({id: String(e.id || e.uid || label), label})
    })
    // color palette cycling
    const colors = ['#1D4ED8', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#0EA5E9', '#F59E0B']
    let i = 0
    return Array.from(byGroup.entries()).map(([group, items]) => ({
      group,
      color: colors[i++ % colors.length],
      count: items.length,
      items,
    }))
  }, [engines])

  const trackerGroups = realTagGroups.length > 0 ? realTagGroups : MOCK_TRACKERS

  // Auto-expand all groups when data loads
  useEffect(() => {
    if (trackerGroups.length > 0) {
      setExpandedGroups(new Set(trackerGroups.map((g) => g.group)))
    }
  }, [trackerGroups.length])

  // Left panel
  const [activeReport, setActiveReport] = useState('engin-trips')
  const [searchReport, setSearchReport] = useState('')

  // Middle panel
  const [searchTracker, setSearchTracker] = useState('')
  const [selectedTrackers, setSelectedTrackers] = useState(new Set())
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  // Right panel (parameters)
  const [reportTitle, setReportTitle] = useState('Rapport des trajets')
  const [dateRange, setDateRange] = useState({from: '13/04/2026 00:00', to: '19/04/2026 23:59'})
  const [selectedDays, setSelectedDays] = useState(new Set([0, 1, 2, 3, 4]))
  const [timeMode, setTimeMode] = useState('toujours') // journee | nuit | toujours
  const [hideEmpty, setHideEmpty] = useState(true)
  const [showSeconds, setShowSeconds] = useState(false)
  const [showResume, setShowResume] = useState(true)
  const [onlyResume, setOnlyResume] = useState(false)

  // Result view
  const [showResult, setShowResult] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')

  const filteredCatalog = useMemo(() => {
    if (!searchReport.trim()) return REPORT_CATALOG
    const q = searchReport.toLowerCase()
    return REPORT_CATALOG
      .map((g) => ({...g, items: g.items.filter((i) => i.title.toLowerCase().includes(q))}))
      .filter((g) => g.items.length > 0)
  }, [searchReport])

  const filteredTrackers = useMemo(() => {
    if (!searchTracker.trim()) return trackerGroups
    const q = searchTracker.toLowerCase()
    return trackerGroups
      .map((g) => ({...g, items: g.items.filter((t) => t.label.toLowerCase().includes(q))}))
      .filter((g) => g.items.length > 0)
  }, [searchTracker, trackerGroups])

  const currentReportMeta = useMemo(() => {
    for (const g of REPORT_CATALOG) for (const i of g.items) if (i.id === activeReport) return i
    return null
  }, [activeReport])

  const isAlertReport = activeReport?.startsWith('alert-')
  const isZoneReport = activeReport?.startsWith('zone-')

  const toggleDay = (i) => {
    const next = new Set(selectedDays)
    if (next.has(i)) next.delete(i); else next.add(i)
    setSelectedDays(next)
  }
  const toggleTracker = (id) => {
    const next = new Set(selectedTrackers)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedTrackers(next)
  }
  const toggleGroup = (grp) => {
    const next = new Set(expandedGroups)
    if (next.has(grp)) next.delete(grp); else next.add(grp)
    setExpandedGroups(next)
  }
  const selectAllInGroup = (grp, items) => {
    const next = new Set(selectedTrackers)
    const allSelected = items.every((t) => next.has(t.id))
    if (allSelected) items.forEach((t) => next.delete(t.id))
    else items.forEach((t) => next.add(t.id))
    setSelectedTrackers(next)
  }
  const selectAll = () => {
    const next = new Set()
    trackerGroups.forEach((g) => g.items.forEach((t) => next.add(t.id)))
    setSelectedTrackers(next)
  }

  const onBuild = () => setShowResult(true)
  const onClose = () => setShowResult(false)

  const [exportOpen, setExportOpen] = useState(false)

  // ── Build rows to export based on current view ──
  const buildExportRows = () => {
    if (isAlertReport) {
      return {
        headers: ['Heure', 'Adresse', 'Statut', 'Durée'],
        rows: MOCK_ALERT_ROWS.map((r) => [r.time, r.address, r.status, r.duration]),
      }
    }
    const headers = isZoneReport
      ? ['Départ', 'Arrivée', 'Temps sur site']
      : ['Départ', 'Arrivée', 'Temps sur site', 'Temps d\u2019inactivité']
    const rows = []
    MOCK_RESULT_DAYS.forEach((day) => {
      rows.push([`── ${day.date} ──`, '', '', ''])
      day.rows.forEach((r, i) => {
        const row = [r.depart, r.arrivee, r.temps]
        if (!isZoneReport) row.push(['00:11', '00:13', '00:06', '00:33'][i] ?? '—')
        rows.push(row)
      })
    })
    return {headers, rows}
  }

  const exportPDF = () => {
    const {headers, rows} = buildExportRows()
    const doc = new jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'})
    const pageWidth = doc.internal.pageSize.getWidth()

    // Branded header
    doc.setFillColor(29, 78, 216)
    doc.rect(0, 0, pageWidth, 48, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16).setFont('helvetica', 'bold')
    doc.text('LOGITAG', 40, 22)
    doc.setFontSize(9).setFont('helvetica', 'normal')
    doc.text('Assets Tracking', 40, 36)
    doc.setFontSize(11).setFont('helvetica', 'bold')
    doc.text(reportTitle, pageWidth / 2, 30, {align: 'center'})
    doc.setTextColor(255, 255, 255).setFontSize(9).setFont('helvetica', 'normal')
    doc.text(`${dateRange.from} → ${dateRange.to}`, pageWidth - 40, 30, {align: 'right'})

    doc.setTextColor(15, 23, 42).setFontSize(10).setFont('helvetica', 'bold')
    doc.text(`Engin : ${activeTab === 'summary' ? 'Résumé (tous)' : (selectedTrackerLabels.find((t) => t.id === activeTab)?.label || '—')}`, 40, 70)

    doc.autoTable({
      startY: 82,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 9, fontStyle: 'bold'},
      bodyStyles: {fontSize: 8, textColor: [51, 65, 85]},
      alternateRowStyles: {fillColor: [250, 251, 252]},
      margin: {left: 40, right: 40},
      didParseCell: (data) => {
        if (typeof data.cell.raw === 'string' && data.cell.raw.startsWith('── ')) {
          data.cell.styles.fillColor = [241, 245, 249]
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [71, 85, 105]
        }
      },
    })

    const y = doc.lastAutoTable.finalY || 90
    doc.setFontSize(8).setTextColor(100, 116, 139)
    doc.text(`Généré le ${new Date().toLocaleString('fr-FR')} · Logitag Fleet Intelligence Platform`, 40, y + 20)

    const filename = `${reportTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    doc.save(filename)
    setExportOpen(false)
  }

  const exportExcel = () => {
    const {headers, rows} = buildExportRows()
    const wb = XLSX.utils.book_new()
    const meta = [
      ['LOGITAG — Assets Tracking'],
      [reportTitle],
      [`Période : ${dateRange.from} → ${dateRange.to}`],
      [`Engin : ${activeTab === 'summary' ? 'Résumé (tous)' : (selectedTrackerLabels.find((t) => t.id === activeTab)?.label || '—')}`],
      [],
      headers,
      ...rows,
    ]
    const ws = XLSX.utils.aoa_to_sheet(meta)
    ws['!cols'] = headers.map(() => ({wch: 40}))
    // Style header row (row 6)
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({r: 5, c: C})
      if (!ws[addr]) continue
      ws[addr].s = {font: {bold: true}, fill: {fgColor: {rgb: 'F1F5F9'}}}
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport')
    const blob = new Blob([XLSX.write(wb, {bookType: 'xlsx', type: 'array'})], {type: 'application/octet-stream'})
    saveAs(blob, `${reportTitle.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
    setExportOpen(false)
  }

  const printReport = () => { window.print() }

  // ─── Scheduling (frontend-only, persisted in localStorage) ───
  const [scheduled, setScheduled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lt_scheduled_reports') || '[]') } catch { return [] }
  })
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'weekly', // daily | weekly | monthly
    day: 'Mo', // week day code
    time: '08:00',
    recipients: '',
    format: 'pdf',
  })
  const [topTab, setTopTab] = useState('reports') // reports | scheduled

  const saveSchedule = () => {
    const item = {
      id: `sch_${Date.now()}`,
      reportId: activeReport,
      reportLabel: currentReportMeta?.title || activeReport,
      title: reportTitle,
      trackers: selectedTrackerLabels.length,
      dateRange: `${dateRange.from} → ${dateRange.to}`,
      ...scheduleForm,
      createdAt: new Date().toISOString(),
    }
    const next = [item, ...scheduled]
    setScheduled(next)
    localStorage.setItem('lt_scheduled_reports', JSON.stringify(next))
    setScheduleOpen(false)
  }
  const removeSchedule = (id) => {
    const next = scheduled.filter((s) => s.id !== id)
    setScheduled(next)
    localStorage.setItem('lt_scheduled_reports', JSON.stringify(next))
  }

  const selectedTrackerLabels = useMemo(() => {
    const list = []
    trackerGroups.forEach((g) => g.items.forEach((t) => selectedTrackers.has(t.id) && list.push(t)))
    return list
  }, [selectedTrackers, trackerGroups])

  // ───────────────────────────────────────────────────────── render
  return (
    <div className='nvx-report-root' data-testid='nvx-report-root'>
      {!showResult ? (
        <>
          <div className='nvx-top-tabs'>
            <button
              className={`nvx-top-tab ${topTab === 'reports' ? 'nvx-top-tab--active' : ''}`}
              onClick={() => setTopTab('reports')}
              data-testid='nvx-top-tab-reports'
            >Rapports</button>
            <button
              className={`nvx-top-tab ${topTab === 'scheduled' ? 'nvx-top-tab--active' : ''}`}
              onClick={() => setTopTab('scheduled')}
              data-testid='nvx-top-tab-scheduled'
            >
              Rapports planifiés
              {scheduled.length > 0 && <span className='nvx-top-tab-badge'>{scheduled.length}</span>}
            </button>
          </div>

          {topTab === 'reports' ? (
          <div className='nvx-cols'>
            {/* ─────────── COL 1: Reports catalog ─────────── */}
            <aside className='nvx-col nvx-col--left' data-testid='nvx-col-catalog'>
              <div className='nvx-col-head'>
                <span>Rapports disponibles</span>
                <button className='nvx-col-collapse' aria-label='Collapse' title='Masquer'>
                  <i className='pi pi-angle-left' />
                </button>
              </div>
              <div className='nvx-col-search'>
                <i className='pi pi-search' />
                <input
                  type='text'
                  placeholder='Recherche rapide'
                  value={searchReport}
                  onChange={(e) => setSearchReport(e.target.value)}
                  data-testid='nvx-catalog-search'
                />
              </div>
              <div className='nvx-catalog'>
                {filteredCatalog.map((grp) => (
                  <div key={grp.group} className='nvx-catalog-grp'>
                    <div className='nvx-catalog-grp-title'>{grp.group}</div>
                    {grp.items.map((it) => (
                      <button
                        key={it.id}
                        className={`nvx-catalog-item ${activeReport === it.id ? 'is-active' : ''}`}
                        onClick={() => setActiveReport(it.id)}
                        data-testid={`nvx-report-${it.id}`}
                      >
                        <div className='nvx-catalog-item-title'>{it.title}</div>
                        <div className='nvx-catalog-item-desc'>{it.desc}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </aside>

            {/* ─────────── COL 2: Trackers ─────────── */}
            <section className='nvx-col nvx-col--mid' data-testid='nvx-col-trackers'>
              <div className='nvx-col-head'>
                <span><i className='pi pi-tag' style={{marginRight:8, color:'#1D4ED8'}} />Tags</span>
              </div>
              <div className='nvx-col-search'>
                <i className='pi pi-search' />
                <input
                  type='text'
                  placeholder='Recherche rapide'
                  value={searchTracker}
                  onChange={(e) => setSearchTracker(e.target.value)}
                  data-testid='nvx-tracker-search'
                />
              </div>
              <label className='nvx-tracker-row nvx-tracker-all' onClick={selectAll}>
                <input
                  type='checkbox'
                  readOnly
                  checked={trackerGroups.length > 0 && trackerGroups.every((g) => g.items.every((t) => selectedTrackers.has(t.id)))}
                  data-testid='nvx-tracker-select-all'
                />
                <span>Tout sélectionner</span>
              </label>
              <div className='nvx-tracker-list'>
                {filteredTrackers.map((g) => {
                  const open = expandedGroups.has(g.group)
                  const allSel = g.items.every((t) => selectedTrackers.has(t.id))
                  return (
                    <div key={g.group} className='nvx-tracker-group'>
                      <div className='nvx-tracker-group-head'>
                        <span
                          className='nvx-tracker-group-bar'
                          style={{background: g.color}}
                          aria-hidden='true'
                        />
                        <input
                          type='checkbox'
                          checked={allSel}
                          onChange={() => selectAllInGroup(g.group, g.items)}
                          data-testid={`nvx-grp-${g.group}`}
                        />
                        <button className='nvx-tracker-group-label' onClick={() => toggleGroup(g.group)}>
                          {g.group} <span className='nvx-tracker-count'>({g.count})</span>
                        </button>
                        <button className='nvx-tracker-group-toggle' onClick={() => toggleGroup(g.group)}>
                          <i className={`pi pi-${open ? 'minus' : 'plus'}`} />
                        </button>
                      </div>
                      {open && (
                        <div className='nvx-tracker-group-items'>
                          {g.items.map((t) => (
                            <label key={t.id} className='nvx-tracker-row'>
                              <input
                                type='checkbox'
                                checked={selectedTrackers.has(t.id)}
                                onChange={() => toggleTracker(t.id)}
                                data-testid={`nvx-tracker-${t.id}`}
                              />
                              <span>{t.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* ─────────── COL 3: Parameters ─────────── */}
            <aside className='nvx-col nvx-col--right' data-testid='nvx-col-params'>
              <div className='nvx-col-head'>
                <span>{currentReportMeta?.title || 'Paramètres'}</span>
              </div>
              <div className='nvx-params'>
                <div className='nvx-field'>
                  <label>Titre du rapport :</label>
                  <input
                    type='text'
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    data-testid='nvx-title'
                  />
                </div>
                <div className='nvx-field'>
                  <label>Plage de dates :</label>
                  <div className='nvx-daterange'>
                    <input
                      type='text'
                      value={`${dateRange.from} — ${dateRange.to}`}
                      onChange={() => {}}
                      readOnly
                      data-testid='nvx-daterange'
                    />
                    <i className='pi pi-calendar' />
                  </div>
                </div>
                <div className='nvx-field'>
                  <label>Jours de la semaine :</label>
                  <div className='nvx-days'>
                    {DAYS.map((d, i) => (
                      <button
                        key={d}
                        className={`nvx-day ${selectedDays.has(i) ? 'is-active' : ''}`}
                        onClick={() => toggleDay(i)}
                        data-testid={`nvx-day-${d}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className='nvx-field'>
                  <label>Plage horaire : de 00:00 à 23:59</label>
                  <input type='range' min='0' max='23' value='23' readOnly className='nvx-slider' />
                  <div className='nvx-time-modes'>
                    {[
                      {key: 'journee', lbl: 'Journée'},
                      {key: 'nuit', lbl: 'Nuit'},
                      {key: 'toujours', lbl: 'Toujours'},
                    ].map((m) => (
                      <button
                        key={m.key}
                        className={`nvx-time-mode ${timeMode === m.key ? 'is-active' : ''}`}
                        onClick={() => setTimeMode(m.key)}
                        data-testid={`nvx-time-${m.key}`}
                      >
                        {m.lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='nvx-field nvx-options'>
                  <label className='nvx-check'>
                    <input type='checkbox' checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
                    <span>Masquer les onglets vides</span>
                  </label>
                  <label className='nvx-check'>
                    <input type='checkbox' checked={showSeconds} onChange={(e) => setShowSeconds(e.target.checked)} />
                    <span>Voir les secondes <i className='pi pi-question-circle' style={{color:'#F59E0B'}} /></span>
                  </label>
                  <label className='nvx-check'>
                    <input type='checkbox' checked={showResume} onChange={(e) => setShowResume(e.target.checked)} />
                    <span>Afficher le résumé</span>
                  </label>
                  <label className='nvx-check'>
                    <input type='checkbox' checked={onlyResume} onChange={(e) => setOnlyResume(e.target.checked)} />
                    <span>Affichage uniquement résumé</span>
                  </label>
                </div>

                <button className='nvx-advanced'>
                  <i className='pi pi-chevron-down' /> Paramètres avancés
                </button>

                <div className='nvx-params-foot'>
                  <button
                    className='nvx-btn nvx-btn--ghost'
                    onClick={() => setScheduleOpen(true)}
                    disabled={selectedTrackers.size === 0}
                    data-testid='nvx-schedule-btn'
                  >
                    <i className='pi pi-clock' style={{marginRight: 6}} />
                    Planifier
                  </button>
                  <button
                    className='nvx-btn nvx-btn--primary'
                    disabled={selectedTrackers.size === 0}
                    onClick={onBuild}
                    data-testid='nvx-build-btn'
                  >
                    Construire le rapport
                  </button>
                </div>
              </div>
            </aside>
          </div>
          ) : (
            <ScheduledList items={scheduled} onRemove={removeSchedule} onGoReports={() => setTopTab('reports')} />
          )}

          {scheduleOpen && (
            <ScheduleDialog
              form={scheduleForm}
              setForm={setScheduleForm}
              onCancel={() => setScheduleOpen(false)}
              onSave={saveSchedule}
              reportTitle={reportTitle}
              trackersCount={selectedTrackerLabels.length}
            />
          )}
        </>
      ) : (
        /* ─────────────────── RESULT VIEW ─────────────────── */
        <div className='nvx-result' data-testid='nvx-result-view'>
          <div className='nvx-result-top'>
            <div className='nvx-result-actions' style={{position: 'relative'}}>
              <button
                className='nvx-action'
                title='Exporter'
                onClick={() => setExportOpen((v) => !v)}
                data-testid='nvx-action-export'
              >
                <i className='pi pi-download' />
              </button>
              {exportOpen && (
                <div className='nvx-export-menu' data-testid='nvx-export-menu'>
                  <button onClick={exportPDF} data-testid='nvx-export-pdf'>
                    <span className='nvx-export-ico' style={{background: '#FEE2E2', color: '#DC2626'}}><i className='pi pi-file-pdf' /></span>
                    <span>
                      <span className='nvx-export-title'>PDF</span>
                      <span className='nvx-export-sub'>Document à imprimer</span>
                    </span>
                  </button>
                  <button onClick={exportExcel} data-testid='nvx-export-excel'>
                    <span className='nvx-export-ico' style={{background: '#DCFCE7', color: '#16A34A'}}><i className='pi pi-file-excel' /></span>
                    <span>
                      <span className='nvx-export-title'>Excel (.xlsx)</span>
                      <span className='nvx-export-sub'>Feuille modifiable</span>
                    </span>
                  </button>
                </div>
              )}
              <button className='nvx-action' title='Supprimer' data-testid='nvx-action-delete' onClick={onClose}>
                <i className='pi pi-trash' />
              </button>
              <button className='nvx-action' title='Imprimer' data-testid='nvx-action-print' onClick={printReport}>
                <i className='pi pi-print' />
              </button>
            </div>
            <div className='nvx-result-title'>{reportTitle}</div>
            <div style={{width: 140}} />
          </div>

          <div className='nvx-result-tabs'>
            <button
              className={`nvx-result-tab ${activeTab === 'summary' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('summary')}
              data-testid='nvx-tab-summary'
            >
              Résumé <i className='pi pi-times' />
            </button>
            {selectedTrackerLabels.map((t) => (
              <button
                key={t.id}
                className={`nvx-result-tab ${activeTab === t.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                data-testid={`nvx-tab-${t.id}`}
              >
                {t.label} <i className='pi pi-times' />
              </button>
            ))}
          </div>

          <div className='nvx-result-body'>
            {activeTab === 'summary' ? (
              /* Summary table aggregated */
              <SummaryPanel
                isAlert={isAlertReport}
                isZone={isZoneReport}
                trackers={selectedTrackerLabels}
              />
            ) : (
              <>
                <div className='nvx-sect'>
                  <div className='nvx-sect-head'>
                    <i className='pi pi-chevron-down' />
                    <span>{isAlertReport ? 'Alertes' : isZoneReport ? 'Visites de zones' : 'Trajets'}</span>
                  </div>
                  {isAlertReport ? <AlertTable /> : <TripsTable isZone={isZoneReport} />}
                </div>
                {showResume && (
                  <div className='nvx-sect nvx-sect-resume'>
                    <div className='nvx-sect-head'>
                      <i className='pi pi-chevron-down' />
                      <span>Résumé</span>
                    </div>
                    <ResumeCard isAlert={isAlertReport} />
                  </div>
                )}
                <div className='nvx-sect-note'>Données basées sur la période sélectionnée.</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ────────── Sub components ──────────
function TripsTable({isZone}) {
  return (
    <table className='nvx-tbl' data-testid='nvx-trips-table'>
      <thead>
        <tr>
          <th>Départ</th>
          <th>Arrivée</th>
          <th>Temps sur site</th>
          {!isZone && <th>Temps d&apos;inactivité</th>}
        </tr>
      </thead>
      <tbody>
        {MOCK_RESULT_DAYS.map((day) => (
          <React.Fragment key={day.date}>
            <tr className='nvx-tbl-day'>
              <td colSpan={isZone ? 3 : 4}>
                <i className='pi pi-minus' /> {day.date} : {day.rows.length}
              </td>
            </tr>
            {day.rows.map((r, i) => (
              <tr key={i}>
                <td className='nvx-tbl-dp'>{r.depart}</td>
                <td className='nvx-tbl-dp'>{r.arrivee}</td>
                <td className='nvx-tbl-num'>{r.temps}</td>
                {!isZone && <td className='nvx-tbl-num'>{['00:11', '00:13', '00:06', '00:33'][i] ?? '—'}</td>}
              </tr>
            ))}
            <tr className='nvx-tbl-total'>
              <td />
              <td style={{textAlign:'right', fontWeight:700}}>Au total :</td>
              <td className='nvx-tbl-num'>05:57</td>
              {!isZone && <td className='nvx-tbl-num'>11:34</td>}
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

function AlertTable() {
  const sevCol = {warning: '#F59E0B', info: '#3B82F6', danger: '#EF4444'}
  return (
    <table className='nvx-tbl' data-testid='nvx-alert-table'>
      <thead>
        <tr>
          <th>Heure</th>
          <th>Adresse</th>
          <th>Statut</th>
          <th>Durée</th>
        </tr>
      </thead>
      <tbody>
        {MOCK_ALERT_ROWS.map((r, i) => (
          <tr key={i}>
            <td className='nvx-tbl-num'>{r.time}</td>
            <td>{r.address}</td>
            <td>
              <span className='nvx-sev' style={{background: `${sevCol[r.severity]}1a`, color: sevCol[r.severity]}}>
                <span className='nvx-sev-dot' style={{background: sevCol[r.severity]}} />
                {r.status}
              </span>
            </td>
            <td className='nvx-tbl-num'>{r.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ResumeCard({isAlert}) {
  const rows = isAlert
    ? [
        ['Alertes totales', '4'],
        ['Immobilisés', '2'],
        ['Sous-utilisés', '1'],
        ['Hors zone', '1'],
      ]
    : [
        ['Trajets', '4'],
        ['Temps sur site total', '05:57'],
        ['Temps d\u2019inactivité', '11:34'],
        ['Dernière adresse', 'Place de Catalogne, Barcelone'],
      ]
  return (
    <table className='nvx-tbl nvx-tbl--resume'>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}><td>{k}</td><td className='nvx-tbl-num'>{v}</td></tr>
        ))}
      </tbody>
    </table>
  )
}

function SummaryPanel({isAlert, isZone, trackers}) {
  return (
    <div className='nvx-sect'>
      <div className='nvx-sect-head'><i className='pi pi-chevron-down' /><span>Résumé</span></div>
      <table className='nvx-tbl' data-testid='nvx-summary-table'>
        <thead>
          <tr>
            <th>Engin</th>
            {isAlert ? (
              <><th>Alertes</th><th>Dernière adresse</th><th>Dernière durée</th></>
            ) : isZone ? (
              <><th>Visites</th><th>Temps total</th><th>Zones</th></>
            ) : (
              <><th>Trajets</th><th>Temps sur site</th><th>Temps inactivité</th></>
            )}
          </tr>
        </thead>
        <tbody>
          {trackers.map((t, i) => (
            <tr key={t.id}>
              <td>{t.label}</td>
              {isAlert ? (
                <>
                  <td className='nvx-tbl-num'>{[4,2,1,3][i % 4]}</td>
                  <td>{MOCK_ALERT_ROWS[i % MOCK_ALERT_ROWS.length].address}</td>
                  <td className='nvx-tbl-num'>{MOCK_ALERT_ROWS[i % MOCK_ALERT_ROWS.length].duration}</td>
                </>
              ) : isZone ? (
                <>
                  <td className='nvx-tbl-num'>{5 + i}</td>
                  <td className='nvx-tbl-num'>{`0${2 + i}:4${i % 6}`}</td>
                  <td>Zone Est, Zone Ouest</td>
                </>
              ) : (
                <>
                  <td className='nvx-tbl-num'>{4 + (i % 3)}</td>
                  <td className='nvx-tbl-num'>{`0${(i % 3) + 4}:${10 + (i * 7) % 50}`}</td>
                  <td className='nvx-tbl-num'>{`${10 + (i % 3)}:${20 + (i * 3) % 40}`}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScheduledList({items, onRemove, onGoReports}) {
  if (!items || items.length === 0) {
    return (
      <div className='nvx-scheduled-empty' data-testid='nvx-scheduled-empty'>
        <div className='nvx-scheduled-empty-ico'><i className='pi pi-clock' /></div>
        <div className='nvx-scheduled-empty-title'>Aucun rapport planifié</div>
        <div className='nvx-scheduled-empty-desc'>
          Planifiez un rapport récurrent (quotidien, hebdomadaire ou mensuel) pour recevoir automatiquement les exports par e-mail.
        </div>
        <button className='nvx-btn nvx-btn--primary' onClick={onGoReports} data-testid='nvx-scheduled-goto'>
          <i className='pi pi-plus' style={{marginRight: 6}} />
          Créer un rapport planifié
        </button>
      </div>
    )
  }
  const freqLabel = (f) => ({daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel'}[f] || f)
  const dayLabel = (d) => ({Mo: 'Lundi', Tu: 'Mardi', We: 'Mercredi', Th: 'Jeudi', Fr: 'Vendredi', Sa: 'Samedi', Su: 'Dimanche'}[d] || d)
  return (
    <div className='nvx-scheduled' data-testid='nvx-scheduled-list'>
      <div className='nvx-scheduled-head'>
        <div>
          <div className='nvx-scheduled-title'>Rapports planifiés</div>
          <div className='nvx-scheduled-sub'>{items.length} rapport{items.length > 1 ? 's' : ''} programmé{items.length > 1 ? 's' : ''}.</div>
        </div>
        <button className='nvx-btn nvx-btn--primary' onClick={onGoReports} data-testid='nvx-scheduled-new'>
          <i className='pi pi-plus' style={{marginRight: 6}} />Nouveau
        </button>
      </div>
      <div className='nvx-scheduled-grid'>
        {items.map((it) => (
          <div key={it.id} className='nvx-scheduled-card' data-testid={`nvx-sch-${it.id}`}>
            <div className='nvx-scheduled-card-top'>
              <div className='nvx-scheduled-card-ico'>
                <i className={`pi pi-${it.format === 'excel' ? 'file-excel' : 'file-pdf'}`} />
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div className='nvx-scheduled-card-title'>{it.title}</div>
                <div className='nvx-scheduled-card-report'>{it.reportLabel}</div>
              </div>
              <button
                className='nvx-scheduled-del'
                onClick={() => onRemove(it.id)}
                title='Supprimer'
                data-testid={`nvx-sch-del-${it.id}`}
              ><i className='pi pi-trash' /></button>
            </div>
            <div className='nvx-scheduled-card-meta'>
              <span className='nvx-scheduled-chip nvx-scheduled-chip--blue'>
                <i className='pi pi-refresh' />{freqLabel(it.frequency)}
                {it.frequency === 'weekly' && ` · ${dayLabel(it.day)}`}
              </span>
              <span className='nvx-scheduled-chip'>
                <i className='pi pi-clock' />{it.time}
              </span>
              <span className='nvx-scheduled-chip'>
                <i className='pi pi-tag' />{it.trackers} tag{it.trackers > 1 ? 's' : ''}
              </span>
              <span className='nvx-scheduled-chip'>
                <i className='pi pi-envelope' />{(it.recipients || '—').split(',').length} dest.
              </span>
            </div>
            {it.recipients && (
              <div className='nvx-scheduled-recip'>
                {it.recipients.split(',').map((e) => e.trim()).filter(Boolean).map((e, i) => (
                  <span key={i} className='nvx-scheduled-email'>{e}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleDialog({form, setForm, onCancel, onSave, reportTitle, trackersCount}) {
  const days = [
    {k: 'Mo', l: 'Lu'}, {k: 'Tu', l: 'Ma'}, {k: 'We', l: 'Me'},
    {k: 'Th', l: 'Je'}, {k: 'Fr', l: 'Ve'}, {k: 'Sa', l: 'Sa'}, {k: 'Su', l: 'Di'},
  ]
  const update = (key, val) => setForm((f) => ({...f, [key]: val}))
  return (
    <div className='nvx-dialog-backdrop' onClick={onCancel} data-testid='nvx-sch-dialog'>
      <div className='nvx-dialog' onClick={(e) => e.stopPropagation()}>
        <div className='nvx-dialog-head'>
          <div className='nvx-dialog-ico'><i className='pi pi-clock' /></div>
          <div>
            <div className='nvx-dialog-title'>Planifier le rapport</div>
            <div className='nvx-dialog-sub'>« {reportTitle} » · {trackersCount} tag{trackersCount > 1 ? 's' : ''} sélectionné{trackersCount > 1 ? 's' : ''}</div>
          </div>
          <button className='nvx-dialog-close' onClick={onCancel}><i className='pi pi-times' /></button>
        </div>
        <div className='nvx-dialog-body'>
          <div className='nvx-field'>
            <label>Fréquence</label>
            <div className='nvx-sch-freq'>
              {[
                {k: 'daily', l: 'Quotidien', i: 'pi-calendar'},
                {k: 'weekly', l: 'Hebdomadaire', i: 'pi-calendar-plus'},
                {k: 'monthly', l: 'Mensuel', i: 'pi-calendar-times'},
              ].map((f) => (
                <button
                  key={f.k}
                  className={`nvx-sch-freq-btn ${form.frequency === f.k ? 'is-active' : ''}`}
                  onClick={() => update('frequency', f.k)}
                  data-testid={`nvx-sch-freq-${f.k}`}
                >
                  <i className={`pi ${f.i}`} />
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {form.frequency === 'weekly' && (
            <div className='nvx-field'>
              <label>Jour de la semaine</label>
              <div className='nvx-days'>
                {days.map((d) => (
                  <button
                    key={d.k}
                    className={`nvx-day ${form.day === d.k ? 'is-active' : ''}`}
                    onClick={() => update('day', d.k)}
                  >{d.l}</button>
                ))}
              </div>
            </div>
          )}

          <div className='nvx-field'>
            <label>Heure d'envoi</label>
            <input
              type='time'
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              data-testid='nvx-sch-time'
            />
          </div>

          <div className='nvx-field'>
            <label>Destinataires (séparés par virgules)</label>
            <input
              type='text'
              placeholder='contact@client.com, manager@client.com'
              value={form.recipients}
              onChange={(e) => update('recipients', e.target.value)}
              data-testid='nvx-sch-recipients'
            />
          </div>

          <div className='nvx-field'>
            <label>Format</label>
            <div className='nvx-sch-freq'>
              <button
                className={`nvx-sch-freq-btn ${form.format === 'pdf' ? 'is-active' : ''}`}
                onClick={() => update('format', 'pdf')}
              ><i className='pi pi-file-pdf' style={{color: '#DC2626'}} />PDF</button>
              <button
                className={`nvx-sch-freq-btn ${form.format === 'excel' ? 'is-active' : ''}`}
                onClick={() => update('format', 'excel')}
              ><i className='pi pi-file-excel' style={{color: '#16A34A'}} />Excel</button>
            </div>
          </div>

          <div className='nvx-sch-note'>
            <i className='pi pi-info-circle' />
            Le rapport sera généré et envoyé automatiquement selon la fréquence configurée.
          </div>
        </div>
        <div className='nvx-dialog-foot'>
          <button className='nvx-btn nvx-btn--ghost' onClick={onCancel} data-testid='nvx-sch-cancel'>Annuler</button>
          <button className='nvx-btn nvx-btn--primary' onClick={onSave} data-testid='nvx-sch-save'>
            <i className='pi pi-check' style={{marginRight: 6}} />
            Planifier
          </button>
        </div>
      </div>
    </div>
  )
}



export default NavixyReport
