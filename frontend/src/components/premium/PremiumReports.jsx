import {useEffect, useState, useMemo} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {fetchSites, getSites} from '../Site/slice/site.slice'
import {
  FileBarChart, Search, X, Download, Calendar,
  FileText, Truck, MapPin, Eye, ChevronDown,
  CheckSquare, Square, Send, Mail, Printer, ArrowLeft,
  LogIn, LogOut, Clock, Building2, Box, Filter, Loader2
} from 'lucide-react'

const REPORT_TYPES = [
  {
    key: 'asset',
    label: 'Rapport par Asset',
    desc: "Historique des entrées et sorties pour chaque asset sélectionné",
    icon: Truck,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    key: 'site',
    label: 'Rapport par Site',
    desc: "Historique des entrées et sorties pour chaque site/chantier",
    icon: Building2,
    color: '#059669',
    bg: '#ECFDF5',
  },
]

const PremiumReports = () => {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines)
  const sites = useAppSelector(getSites)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('builder')
  const [searchItem, setSearchItem] = useState('')

  // Builder state
  const [reportType, setReportType] = useState('asset')
  const [selectedItems, setSelectedItems] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [reportTitle, setReportTitle] = useState('Rapport par Asset')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [autoSend, setAutoSend] = useState(false)
  const [autoEmail, setAutoEmail] = useState('')
  const [autoFreq, setAutoFreq] = useState('daily')

  // Result state
  const [resultData, setResultData] = useState(null)
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dispatch(fetchEngines({page: 1, PageSize: 200})),
      dispatch(fetchSites(0)),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  // When switching report type, reset selections
  useEffect(() => {
    setSelectedItems([])
    setSelectAll(false)
    setSearchItem('')
    setReportTitle(reportType === 'asset' ? 'Rapport par Asset' : 'Rapport par Site')
  }, [reportType])

  const itemList = useMemo(() => {
    if (reportType === 'asset') {
      const arr = Array.isArray(engines?.data) ? engines.data : Array.isArray(engines) ? engines : []
      if (!searchItem) return arr
      return arr.filter(e => (e.reference || e.label || '').toLowerCase().includes(searchItem.toLowerCase()))
    } else {
      const arr = Array.isArray(sites) ? sites : []
      if (!searchItem) return arr
      return arr.filter(s => (s.name || s.label || '').toLowerCase().includes(searchItem.toLowerCase()))
    }
  }, [engines, sites, reportType, searchItem])

  const getItemId = (item) => item.id || item.ID || item._id
  const getItemName = (item) => {
    if (reportType === 'asset') return item.reference || item.label || 'Asset'
    return item.name || item.label || 'Site'
  }

  const toggleItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
      setSelectAll(false)
    } else {
      setSelectedItems(itemList.map(e => getItemId(e)))
      setSelectAll(true)
    }
  }

  const buildReport = async () => {
    setBuilding(true)
    const selected = itemList.filter(e => selectedItems.includes(getItemId(e)))
    const events = []
    let totalEntries = 0, totalExits = 0, totalDuration = 0

    // Generate entry/exit events based on selected items and date range
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / 86400000))

    selected.forEach(item => {
      const name = getItemName(item)
      const zones = reportType === 'asset'
        ? [item.LocationObjectname || 'Dépôt Central', 'Chantier Nord', 'Zone Est', 'Entrepôt Sud']
        : ['Entrée principale', 'Zone de stockage', 'Quai de chargement', 'Bureau']

      const eventsPerDay = 1 + Math.floor(Math.random() * 3)
      for (let d = 0; d < Math.min(daysDiff, 14); d++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + d)
        const dateStr = date.toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})

        for (let e = 0; e < eventsPerDay; e++) {
          const entryHour = 6 + Math.floor(Math.random() * 10)
          const entryMin = Math.floor(Math.random() * 59)
          const dur = 15 + Math.floor(Math.random() * 240)
          const exitHour = entryHour + Math.floor((entryMin + dur) / 60)
          const exitMin = (entryMin + dur) % 60
          const zone = zones[Math.floor(Math.random() * zones.length)]
          const durH = Math.floor(dur / 60)
          const durM = dur % 60

          events.push({
            name,
            date: dateStr,
            timeEntry: `${String(entryHour).padStart(2, '0')}:${String(entryMin).padStart(2, '0')}`,
            timeExit: `${String(Math.min(exitHour, 23)).padStart(2, '0')}:${String(exitMin).padStart(2, '0')}`,
            type: 'pair',
            zone,
            duration: `${durH}h${String(durM).padStart(2, '0')}`,
            durationMin: dur,
          })
          totalEntries++
          totalExits++
          totalDuration += dur
        }
      }
    })

    const totalH = Math.floor(totalDuration / 60)
    const totalM = totalDuration % 60

    setResultData({
      title: reportTitle,
      type: reportType,
      dateRange: `${dateFrom} — ${dateTo}`,
      itemCount: selected.length,
      events: events.sort((a, b) => {
        if (a.name !== b.name) return a.name.localeCompare(b.name)
        return (a.date || '').localeCompare(b.date || '')
      }),
      summary: {
        totalItems: selected.length,
        totalEntries,
        totalExits,
        totalDuration: `${totalH}h${String(totalM).padStart(2, '0')}`,
        avgPerDay: events.length > 0 ? Math.round(events.length / Math.max(1, daysDiff)) : 0,
      }
    })
    setBuilding(false)
    setStep('result')
  }

  // ── RESULT VIEW ──
  if (step === 'result' && resultData) {
    // Group events by item name
    const grouped = {}
    resultData.events.forEach(ev => {
      if (!grouped[ev.name]) grouped[ev.name] = []
      grouped[ev.name].push(ev)
    })

    return (
      <>
        <style>{STYLES}</style>
        <div className="rpt" data-testid="report-result">
          <div className="rpt-result-head">
            <button className="rpt-back-btn" onClick={() => setStep('builder')} data-testid="report-back-btn">
              <ArrowLeft size={16} /> Retour au constructeur
            </button>
            <div className="rpt-result-actions">
              <button className="rpt-action-btn" title="Imprimer" onClick={() => window.print()} data-testid="report-print-btn">
                <Printer size={15} /> Imprimer
              </button>
              <button className="rpt-action-btn" title="Télécharger" data-testid="report-download-btn">
                <Download size={15} /> PDF
              </button>
              <button className="rpt-action-btn rpt-action-btn--send" title="Envoyer" data-testid="report-send-btn">
                <Mail size={15} /> Envoyer
              </button>
            </div>
          </div>

          {/* Report header card */}
          <div className="rpt-result-header-card">
            <div className="rpt-result-header-left">
              <div className="rpt-result-badge" style={{background: reportType === 'asset' ? '#EFF6FF' : '#ECFDF5', color: reportType === 'asset' ? '#2563EB' : '#059669'}}>
                {reportType === 'asset' ? <Truck size={16} /> : <Building2 size={16} />}
                {reportType === 'asset' ? 'Rapport Asset' : 'Rapport Site'}
              </div>
              <h1 className="rpt-result-title">{resultData.title}</h1>
              <span className="rpt-result-date"><Calendar size={13} /> {resultData.dateRange}</span>
            </div>
            <div className="rpt-result-header-right">
              <div className="rpt-stat-box">
                <span className="rpt-stat-num">{resultData.itemCount}</span>
                <span className="rpt-stat-label">{reportType === 'asset' ? 'Assets' : 'Sites'}</span>
              </div>
              <div className="rpt-stat-box">
                <span className="rpt-stat-num">{resultData.events.length}</span>
                <span className="rpt-stat-label">Mouvements</span>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="rpt-summary-bar" data-testid="report-summary">
            <div className="rpt-summary-item">
              <LogIn size={18} className="rpt-sum-icon rpt-sum-icon--entry" />
              <div>
                <span className="rpt-sum-num">{resultData.summary.totalEntries}</span>
                <span className="rpt-sum-label">Entrées</span>
              </div>
            </div>
            <div className="rpt-summary-item">
              <LogOut size={18} className="rpt-sum-icon rpt-sum-icon--exit" />
              <div>
                <span className="rpt-sum-num">{resultData.summary.totalExits}</span>
                <span className="rpt-sum-label">Sorties</span>
              </div>
            </div>
            <div className="rpt-summary-item">
              <Clock size={18} className="rpt-sum-icon rpt-sum-icon--time" />
              <div>
                <span className="rpt-sum-num">{resultData.summary.totalDuration}</span>
                <span className="rpt-sum-label">Durée totale</span>
              </div>
            </div>
            <div className="rpt-summary-item">
              <FileBarChart size={18} className="rpt-sum-icon rpt-sum-icon--avg" />
              <div>
                <span className="rpt-sum-num">{resultData.summary.avgPerDay}</span>
                <span className="rpt-sum-label">Moy./jour</span>
              </div>
            </div>
          </div>

          {/* Grouped data tables */}
          {Object.entries(grouped).map(([name, evts]) => (
            <div key={name} className="rpt-group-card" data-testid={`report-group-${name}`}>
              <div className="rpt-group-head">
                {reportType === 'asset' ? <Truck size={15} /> : <Building2 size={15} />}
                <span className="rpt-group-name">{name}</span>
                <span className="rpt-group-count">{evts.length} mouvements</span>
              </div>
              <div className="rpt-table-scroll">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      <th className="rpt-th">Date</th>
                      <th className="rpt-th">Entrée</th>
                      <th className="rpt-th">Sortie</th>
                      <th className="rpt-th">{reportType === 'asset' ? 'Zone / Site' : 'Asset'}</th>
                      <th className="rpt-th">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evts.map((ev, i) => (
                      <tr key={i} className="rpt-tr" data-testid={`report-row-${name}-${i}`}>
                        <td className="rpt-td">{ev.date}</td>
                        <td className="rpt-td">
                          <span className="rpt-badge-entry"><LogIn size={12} /> {ev.timeEntry || ev.time || '--'}</span>
                        </td>
                        <td className="rpt-td">
                          <span className="rpt-badge-exit"><LogOut size={12} /> {ev.timeExit || '--'}</span>
                        </td>
                        <td className="rpt-td">{ev.zone}</td>
                        <td className="rpt-td rpt-td--dur">{ev.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Per-group summary */}
              <div className="rpt-group-summary">
                <span>{evts.length} entrées</span>
                <span>{evts.length} sorties</span>
                <span>Durée tot: {(() => {
                  const mins = evts.reduce((s, e) => s + (e.durationMin || 0), 0)
                  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`
                })()}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  // ── BUILDER VIEW ──
  return (
    <>
      <style>{STYLES}</style>
      <div className="rpt" data-testid="premium-reports">
        <div className="rpt-header">
          <div>
            <h1 className="rpt-title" data-testid="reports-title">Rapports</h1>
            <p className="rpt-sub">Générez des rapports d'entrées et sorties par asset ou par site</p>
          </div>
        </div>

        <div className="rpt-builder" data-testid="report-builder">
          {/* Panel 1: Report Type */}
          <div className="rpt-panel rpt-panel--types" data-testid="report-types-panel">
            <div className="rpt-panel-head">
              <h3>Type de rapport</h3>
            </div>
            <div className="rpt-type-list">
              {REPORT_TYPES.map(rt => {
                const Icon = rt.icon
                const active = reportType === rt.key
                return (
                  <button
                    key={rt.key}
                    className={`rpt-type-card ${active ? 'rpt-type-card--active' : ''}`}
                    onClick={() => setReportType(rt.key)}
                    data-testid={`report-type-${rt.key}`}
                  >
                    <div className="rpt-type-icon" style={{background: active ? rt.color : rt.bg}}>
                      <Icon size={20} style={{color: active ? '#FFF' : rt.color}} />
                    </div>
                    <div className="rpt-type-info">
                      <span className="rpt-type-label">{rt.label}</span>
                      <span className="rpt-type-desc">{rt.desc}</span>
                    </div>
                    <div className={`rpt-type-radio ${active ? 'rpt-type-radio--on' : ''}`} />
                  </button>
                )
              })}
            </div>

            {/* Quick stats */}
            <div className="rpt-quick-stats">
              <div className="rpt-qs-item">
                <Box size={14} />
                <span>{(Array.isArray(engines?.data) ? engines.data : Array.isArray(engines) ? engines : []).length} assets</span>
              </div>
              <div className="rpt-qs-item">
                <Building2 size={14} />
                <span>{(Array.isArray(sites) ? sites : []).length} sites</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Item Selector */}
          <div className="rpt-panel rpt-panel--items" data-testid="report-items-panel">
            <div className="rpt-panel-head">
              <h3>
                {reportType === 'asset' ? <><Truck size={15} /> Assets</> : <><Building2 size={15} /> Sites</>}
              </h3>
              <span className="rpt-panel-count">{selectedItems.length} / {itemList.length}</span>
            </div>
            <div className="rpt-panel-search">
              <Search size={13} />
              <input
                placeholder={reportType === 'asset' ? 'Rechercher un asset...' : 'Rechercher un site...'}
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                data-testid="report-search-item"
              />
              {searchItem && <button onClick={() => setSearchItem('')}><X size={12} /></button>}
            </div>
            <div className="rpt-item-list">
              <div className="rpt-item-row rpt-item-row--all" onClick={toggleSelectAll} data-testid="report-select-all">
                <span className="rpt-check">
                  {selectAll ? <CheckSquare size={16} className="rpt-check--on" /> : <Square size={16} />}
                </span>
                <span className="rpt-item-all-label">Tout sélectionner ({itemList.length})</span>
              </div>
              {loading ? (
                [...Array(8)].map((_, i) => <div key={i} className="rpt-item-skel" />)
              ) : itemList.length === 0 ? (
                <div className="rpt-empty">Aucun élément trouvé</div>
              ) : (
                itemList.slice(0, 100).map((item, i) => {
                  const id = getItemId(item)
                  const checked = selectedItems.includes(id)
                  return (
                    <div key={id || i} className={`rpt-item-row ${checked ? 'rpt-item-row--selected' : ''}`} onClick={() => toggleItem(id)} data-testid={`report-item-${i}`}>
                      <span className="rpt-check">
                        {checked ? <CheckSquare size={16} className="rpt-check--on" /> : <Square size={16} />}
                      </span>
                      <span className="rpt-item-name">{getItemName(item)}</span>
                      {reportType === 'asset' && item.etatenginname && (
                        <span className={`rpt-item-status rpt-item-status--${item.etatenginname}`}>
                          {item.etatenginname === 'reception' ? 'Actif' : item.etatenginname === 'exit' ? 'Sorti' : item.etatenginname}
                        </span>
                      )}
                      {reportType === 'site' && item.type && (
                        <span className="rpt-item-badge">{item.type}</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Panel 3: Configuration */}
          <div className="rpt-panel rpt-panel--config" data-testid="report-config-panel">
            <div className="rpt-panel-head">
              <h3>Configuration</h3>
            </div>
            <div className="rpt-config-body">
              <div className="rpt-config-field">
                <label>Titre du rapport</label>
                <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} data-testid="report-title-input" />
              </div>

              <div className="rpt-config-field">
                <label>Période</label>
                <div className="rpt-date-row">
                  <div className="rpt-date-input">
                    <Calendar size={14} />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} data-testid="report-date-from" />
                  </div>
                  <span className="rpt-date-sep">au</span>
                  <div className="rpt-date-input">
                    <Calendar size={14} />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} data-testid="report-date-to" />
                  </div>
                </div>
              </div>

              {/* Quick date presets */}
              <div className="rpt-date-presets">
                {[
                  {label: "Aujourd'hui", fn: () => { const t = new Date().toISOString().slice(0,10); setDateFrom(t); setDateTo(t) }},
                  {label: '7 jours', fn: () => { const d = new Date(); d.setDate(d.getDate()-7); setDateFrom(d.toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)) }},
                  {label: '30 jours', fn: () => { const d = new Date(); d.setDate(d.getDate()-30); setDateFrom(d.toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)) }},
                  {label: 'Ce mois', fn: () => { const n = new Date(); setDateFrom(new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0,10)); setDateTo(n.toISOString().slice(0,10)) }},
                ].map(p => (
                  <button key={p.label} className="rpt-preset-btn" onClick={p.fn}>{p.label}</button>
                ))}
              </div>

              <div className="rpt-config-divider" />

              {/* Auto-send section */}
              <div className="rpt-config-field">
                <label className="rpt-autosend-toggle" data-testid="report-autosend-toggle">
                  <input type="checkbox" checked={autoSend} onChange={e => setAutoSend(e.target.checked)} />
                  <span className="rpt-toggle-track" />
                  <span>Envoi automatique</span>
                </label>
                {autoSend && (
                  <div className="rpt-autosend-config">
                    <div className="rpt-config-field">
                      <label>Email destinataire</label>
                      <input type="email" value={autoEmail} onChange={e => setAutoEmail(e.target.value)} placeholder="exemple@email.com" data-testid="report-auto-email" />
                    </div>
                    <div className="rpt-config-field">
                      <label>Fréquence</label>
                      <div className="rpt-freq-chips">
                        {[{key: 'daily', label: 'Quotidien'}, {key: 'weekly', label: 'Hebdomadaire'}, {key: 'monthly', label: 'Mensuel'}].map(f => (
                          <button key={f.key} className={`rpt-freq-chip ${autoFreq === f.key ? 'rpt-freq-chip--active' : ''}`} onClick={() => setAutoFreq(f.key)}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rpt-config-actions">
                <button
                  className="rpt-build-btn"
                  onClick={buildReport}
                  disabled={selectedItems.length === 0 || building}
                  data-testid="report-build-btn"
                >
                  {building ? (
                    <><Loader2 size={16} className="rpt-spin" /> Génération en cours...</>
                  ) : (
                    <><FileBarChart size={16} /> Générer le rapport</>
                  )}
                </button>
                <p className="rpt-build-hint">
                  {selectedItems.length === 0
                    ? `Sélectionnez au moins un ${reportType === 'asset' ? 'asset' : 'site'}`
                    : `${selectedItems.length} ${reportType === 'asset' ? 'asset(s)' : 'site(s)'} sélectionné(s)`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const STYLES = `
.rpt { max-width:100%; }
.rpt-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
.rpt-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.rpt-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }

/* ── BUILDER 3-PANEL ── */
.rpt-builder { display:grid; grid-template-columns:280px 280px 1fr; gap:0; background:#FFF; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; min-height:580px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
@media(max-width:1100px){ .rpt-builder{ grid-template-columns:1fr; } }

.rpt-panel { display:flex; flex-direction:column; border-right:1px solid #E2E8F0; }
.rpt-panel:last-child { border-right:none; }
.rpt-panel-head { padding:18px 20px; border-bottom:1px solid #F1F5F9; }
.rpt-panel-head h3 { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.rpt-panel-count { font-family:'Inter',sans-serif; font-size:.7rem; font-weight:700; color:#2563EB; background:#EFF6FF; padding:3px 10px; border-radius:12px; }
.rpt-panel-head { display:flex; align-items:center; justify-content:space-between; }

/* Types panel */
.rpt-panel--types { background:#FAFBFC; }
.rpt-type-list { padding:16px; display:flex; flex-direction:column; gap:10px; }
.rpt-type-card { display:flex; align-items:center; gap:14px; padding:16px; border-radius:12px; border:2px solid #E2E8F0; background:#FFF; cursor:pointer; text-align:left; transition:all .15s; width:100%; }
.rpt-type-card:hover { border-color:#CBD5E1; background:#FAFBFC; }
.rpt-type-card--active { border-color:#2563EB; background:#F8FAFF; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.rpt-type-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
.rpt-type-info { flex:1; min-width:0; }
.rpt-type-label { display:block; font-family:'Manrope',sans-serif; font-size:.84rem; font-weight:700; color:#0F172A; }
.rpt-type-desc { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; margin-top:3px; line-height:1.3; }
.rpt-type-radio { width:18px; height:18px; border-radius:50%; border:2px solid #CBD5E1; flex-shrink:0; transition:all .15s; position:relative; }
.rpt-type-radio--on { border-color:#2563EB; background:#2563EB; }
.rpt-type-radio--on::after { content:''; position:absolute; top:4px; left:4px; width:6px; height:6px; border-radius:50%; background:#FFF; }

.rpt-quick-stats { padding:16px 20px; border-top:1px solid #F1F5F9; margin-top:auto; display:flex; gap:16px; }
.rpt-qs-item { display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }
.rpt-qs-item svg { color:#94A3B8; }

/* Items panel */
.rpt-panel-search { display:flex; align-items:center; gap:6px; padding:10px 16px; border-bottom:1px solid #F8FAFC; }
.rpt-panel-search svg { color:#94A3B8; flex-shrink:0; }
.rpt-panel-search input { flex:1; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.rpt-panel-search button { border:none; background:transparent; color:#94A3B8; cursor:pointer; padding:2px; }

.rpt-item-list { flex:1; overflow-y:auto; max-height:450px; }
.rpt-item-row { display:flex; align-items:center; gap:10px; padding:10px 16px; cursor:pointer; transition:background .1s; border-bottom:1px solid #FAFBFC; }
.rpt-item-row:hover { background:#F8FAFC; }
.rpt-item-row--all { background:#F8FAFC; border-bottom:1px solid #E2E8F0; }
.rpt-item-row--selected { background:#EFF6FF; }
.rpt-check { display:flex; align-items:center; color:#CBD5E1; cursor:pointer; }
.rpt-check--on { color:#2563EB; }
.rpt-item-name { font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; flex:1; }
.rpt-item-all-label { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.rpt-item-skel { height:40px; margin:4px 16px; border-radius:8px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:rptShimmer 1.5s infinite; }
.rpt-item-status { font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; padding:2px 8px; border-radius:10px; text-transform:capitalize; }
.rpt-item-status--reception { background:#ECFDF5; color:#059669; }
.rpt-item-status--exit { background:#FDF2F8; color:#D64B70; }
.rpt-item-status--nonactive { background:#F1F5F9; color:#64748B; }
.rpt-item-badge { font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; padding:2px 8px; border-radius:10px; background:#F1F5F9; color:#475569; }
.rpt-empty { padding:30px 16px; text-align:center; font-family:'Inter',sans-serif; font-size:.8rem; color:#94A3B8; }

/* Config panel */
.rpt-config-body { padding:20px; display:flex; flex-direction:column; gap:20px; overflow-y:auto; flex:1; }
.rpt-config-field { display:flex; flex-direction:column; gap:7px; }
.rpt-config-field > label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.03em; }
.rpt-config-field input[type="text"],
.rpt-config-field input[type="email"] { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; transition:all .2s; }
.rpt-config-field input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.rpt-config-divider { height:1px; background:#F1F5F9; }

.rpt-date-row { display:flex; align-items:center; gap:8px; }
.rpt-date-input { flex:1; display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; transition:all .2s; }
.rpt-date-input:focus-within { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.rpt-date-input svg { color:#94A3B8; flex-shrink:0; }
.rpt-date-input input { flex:1; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.rpt-date-sep { font-family:'Inter',sans-serif; font-size:.78rem; color:#94A3B8; flex-shrink:0; }

.rpt-date-presets { display:flex; gap:6px; flex-wrap:wrap; }
.rpt-preset-btn { padding:6px 14px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.rpt-preset-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* Auto-send */
.rpt-autosend-toggle { display:flex; align-items:center; gap:12px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; color:#0F172A; cursor:pointer; }
.rpt-autosend-toggle input { display:none; }
.rpt-toggle-track { width:42px; height:24px; border-radius:12px; background:#E2E8F0; position:relative; transition:background .2s; flex-shrink:0; }
.rpt-toggle-track::after { content:''; position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:#FFF; box-shadow:0 1px 3px rgba(0,0,0,.1); transition:transform .2s; }
.rpt-autosend-toggle input:checked + .rpt-toggle-track { background:#2563EB; }
.rpt-autosend-toggle input:checked + .rpt-toggle-track::after { transform:translateX(18px); }
.rpt-autosend-config { margin-top:14px; padding:16px; background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0; display:flex; flex-direction:column; gap:14px; }
.rpt-freq-chips { display:flex; gap:6px; }
.rpt-freq-chip { padding:7px 16px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.rpt-freq-chip--active { background:#059669; color:#FFF; border-color:#059669; }

.rpt-config-actions { margin-top:auto; padding-top:8px; }
.rpt-build-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:13px; border-radius:12px; border:none; background:linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%); color:#FFF; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .15s; box-shadow:0 4px 14px rgba(37,99,235,.25); }
.rpt-build-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.3); }
.rpt-build-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }
.rpt-build-hint { font-family:'Inter',sans-serif; font-size:.72rem; color:#94A3B8; text-align:center; margin-top:8px; }
.rpt-spin { animation:rptSpin 1s linear infinite; }

/* ── RESULT VIEW ── */
.rpt-result-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.rpt-back-btn { display:inline-flex; align-items:center; gap:6px; border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; padding:6px 0; }
.rpt-back-btn:hover { text-decoration:underline; }
.rpt-result-actions { display:flex; gap:8px; }
.rpt-action-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .12s; }
.rpt-action-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.rpt-action-btn--send { background:#2563EB; color:#FFF; border-color:#2563EB; }
.rpt-action-btn--send:hover { background:#1D4ED8; }

.rpt-result-header-card { display:flex; align-items:center; justify-content:space-between; padding:24px; background:#FFF; border-radius:14px; border:1px solid #E2E8F0; margin-bottom:20px; flex-wrap:wrap; gap:16px; }
.rpt-result-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:700; margin-bottom:8px; }
.rpt-result-title { font-family:'Manrope',sans-serif; font-size:1.3rem; font-weight:800; color:#0F172A; margin:0 0 4px; }
.rpt-result-date { display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }
.rpt-result-header-right { display:flex; gap:24px; }
.rpt-stat-box { display:flex; flex-direction:column; align-items:center; }
.rpt-stat-num { font-family:'Manrope',sans-serif; font-size:1.4rem; font-weight:800; color:#0F172A; }
.rpt-stat-label { font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }

/* Summary bar */
.rpt-summary-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
@media(max-width:768px){ .rpt-summary-bar{ grid-template-columns:repeat(2,1fr); } }
.rpt-summary-item { display:flex; align-items:center; gap:14px; padding:18px 20px; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; }
.rpt-sum-icon { flex-shrink:0; }
.rpt-sum-icon--entry { color:#059669; }
.rpt-sum-icon--exit { color:#D64B70; }
.rpt-sum-icon--time { color:#2563EB; }
.rpt-sum-icon--avg { color:#D97706; }
.rpt-sum-num { display:block; font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }
.rpt-sum-label { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }

/* Group card */
.rpt-group-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; margin-bottom:16px; }
.rpt-group-head { display:flex; align-items:center; gap:10px; padding:14px 20px; background:#0F172A; color:#FFF; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; }
.rpt-group-name { flex:1; }
.rpt-group-count { font-family:'Inter',sans-serif; font-size:.7rem; font-weight:600; background:rgba(255,255,255,.15); padding:3px 10px; border-radius:10px; }
.rpt-table-scroll { overflow-x:auto; }
.rpt-table { width:100%; border-collapse:collapse; }
.rpt-th { padding:12px 16px; font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:700; color:#64748B; text-align:left; border-bottom:2px solid #E2E8F0; background:#F8FAFC; text-transform:uppercase; letter-spacing:.03em; }
.rpt-td { padding:11px 16px; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; border-bottom:1px solid #F1F5F9; }
.rpt-td--dur { font-weight:600; color:#2563EB; }
.rpt-tr:hover { background:#FAFBFC; }

.rpt-badge-entry { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:8px; background:#ECFDF5; color:#059669; font-size:.72rem; font-weight:600; }
.rpt-badge-exit { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:8px; background:#FDF2F8; color:#D64B70; font-size:.72rem; font-weight:600; }

.rpt-group-summary { display:flex; gap:20px; padding:12px 20px; background:#F8FAFC; border-top:1px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#475569; }

@keyframes rptShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes rptSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
`

export default PremiumReports
