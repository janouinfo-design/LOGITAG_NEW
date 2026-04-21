import React, {useMemo, useState} from 'react'
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
      {id: 'engin-mov', title: 'Trajets et arrêts par mouvements', desc: 'Répartition des déplacements et arrêts.'},
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
  // Left panel
  const [activeReport, setActiveReport] = useState('engin-trips')
  const [searchReport, setSearchReport] = useState('')

  // Middle panel
  const [searchTracker, setSearchTracker] = useState('')
  const [selectedTrackers, setSelectedTrackers] = useState(new Set(['1']))
  const [expandedGroups, setExpandedGroups] = useState(new Set(['Benz', 'BMW']))

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
    if (!searchTracker.trim()) return MOCK_TRACKERS
    const q = searchTracker.toLowerCase()
    return MOCK_TRACKERS
      .map((g) => ({...g, items: g.items.filter((t) => t.label.toLowerCase().includes(q))}))
      .filter((g) => g.items.length > 0)
  }, [searchTracker])

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
    MOCK_TRACKERS.forEach((g) => g.items.forEach((t) => next.add(t.id)))
    setSelectedTrackers(next)
  }

  const onBuild = () => setShowResult(true)
  const onClose = () => setShowResult(false)

  const selectedTrackerLabels = useMemo(() => {
    const list = []
    MOCK_TRACKERS.forEach((g) => g.items.forEach((t) => selectedTrackers.has(t.id) && list.push(t)))
    return list
  }, [selectedTrackers])

  // ───────────────────────────────────────────────────────── render
  return (
    <div className='nvx-report-root' data-testid='nvx-report-root'>
      {!showResult ? (
        <>
          <div className='nvx-top-tabs'>
            <button className='nvx-top-tab nvx-top-tab--active'>Rapports</button>
            <button className='nvx-top-tab'>Rapports planifiés</button>
          </div>

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
                <span><i className='pi pi-send' style={{marginRight:8, color:'#1D4ED8'}} />Traqueurs</span>
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
                  checked={MOCK_TRACKERS.every((g) => g.items.every((t) => selectedTrackers.has(t.id)))}
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
                  <button className='nvx-btn nvx-btn--ghost' data-testid='nvx-cancel-btn'>Annuler</button>
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
        </>
      ) : (
        /* ─────────────────── RESULT VIEW ─────────────────── */
        <div className='nvx-result' data-testid='nvx-result-view'>
          <div className='nvx-result-top'>
            <div className='nvx-result-actions'>
              <button className='nvx-action' title='Exporter' data-testid='nvx-action-export'>
                <i className='pi pi-download' />
              </button>
              <button className='nvx-action' title='Supprimer' data-testid='nvx-action-delete' onClick={onClose}>
                <i className='pi pi-trash' />
              </button>
              <button className='nvx-action' title='Imprimer' data-testid='nvx-action-print'>
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
                <div className='nvx-sect-note'>Kilométrage à la fin de la période sélectionnée.</div>
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
          {isZone && <th>Temps sur site</th>}
          {!isZone && <>
            <th>Distance, km</th>
            <th>Temps de trajet</th>
            <th>Vitesse moyenne,<br/>km/h</th>
            <th>V. max., km/h</th>
            <th>Temps d&apos;inactivité</th>
          </>}
        </tr>
      </thead>
      <tbody>
        {MOCK_RESULT_DAYS.map((day) => (
          <React.Fragment key={day.date}>
            <tr className='nvx-tbl-day'>
              <td colSpan={isZone ? 3 : 7}>
                <i className='pi pi-minus' /> {day.date} : {day.rows.length}
              </td>
            </tr>
            {day.rows.map((r, i) => (
              <tr key={i}>
                <td className='nvx-tbl-dp'>{r.depart}</td>
                <td className='nvx-tbl-dp'>{r.arrivee}</td>
                {isZone && <td>{r.duree}</td>}
                {!isZone && <>
                  <td className='nvx-tbl-num'>{[93.86, 192.11, 238.21, 107.72][i] ?? '—'}</td>
                  <td className='nvx-tbl-num'>{r.temps}</td>
                  <td className='nvx-tbl-num'>{[90, 117, 122, 81][i] ?? '—'}</td>
                  <td className='nvx-tbl-num'>{[133, 153, 171, 135][i] ?? '—'}</td>
                  <td className='nvx-tbl-num'>{['00:11', '00:13', '00:06', '00:33'][i] ?? '—'}</td>
                </>}
              </tr>
            ))}
            <tr className='nvx-tbl-total'>
              <td />
              <td style={{textAlign:'right', fontWeight:700}}>Au total :</td>
              {isZone && <td className='nvx-tbl-num'>05:57</td>}
              {!isZone && <>
                <td className='nvx-tbl-num'>631.9</td>
                <td className='nvx-tbl-num'>05:57</td>
                <td className='nvx-tbl-num'>106</td>
                <td className='nvx-tbl-num'>171</td>
                <td className='nvx-tbl-num'>11:34</td>
              </>}
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
        ['Distance, km', '631.9'],
        ['Temps de trajet', '05:57'],
        ['Vitesse moyenne, km/h', '106'],
        ['V. max., km/h', '171'],
        ['Temps d\u2019inactivité', '11:34'],
        ['Valeur "GPS" du compteur kilométrique, km', '49599.3'],
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
              <><th>Trajets</th><th>Distance, km</th><th>Temps de trajet</th><th>Vitesse moy. km/h</th></>
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
                  <td className='nvx-tbl-num'>{(420 + i * 37).toFixed(1)}</td>
                  <td className='nvx-tbl-num'>{`0${(i % 3) + 4}:${10 + (i * 7) % 50}`}</td>
                  <td className='nvx-tbl-num'>{90 + i * 3}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default NavixyReport
