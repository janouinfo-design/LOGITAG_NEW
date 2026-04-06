import {useEffect, useState, useMemo} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {fetchListRpt, getListRpt} from '../Repports/slice/rapports.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  FileBarChart, Search, X, Download, Calendar, Clock,
  FileText, Truck, MapPin, Plus, Eye, ChevronRight, ChevronDown,
  Route, OctagonAlert, Shield, Gauge, StopCircle, Locate,
  CheckSquare, Square, Send, Mail, Printer, ArrowLeft
} from 'lucide-react'

const REPORT_CATEGORIES = [
  {
    key: 'activity', label: "Rapport d'activité",
    items: [
      {key: 'trajets', label: 'Trajets', desc: 'Historique détaillé des trajets avec heure de départ, d\'arrivée, durée, adresse', icon: Route},
      {key: 'arrets', label: 'Détail des arrêts', desc: 'Historique détaillé des arrêts', icon: StopCircle},
      {key: 'mouvements', label: 'Trajets et arrêts par mouvements', desc: 'Répartition des déplacements et des arrêts par équipes', icon: Truck},
    ]
  },
  {
    key: 'zone', label: 'Rapport de zone géographique',
    items: [
      {key: 'visites_zones', label: 'Visites zones géographiques', desc: 'Date, heure et kilométrage dans une zone', icon: MapPin},
      {key: 'visites_poi', label: 'Visites POI', desc: 'Date, heure et nombre de visites aux POI', icon: Locate},
    ]
  },
  {
    key: 'security', label: 'Rapport de sûreté et de sécurité',
    items: [
      {key: 'securite', label: 'Sécurité du véhicule', desc: 'Alarmes, alertes de remorquage, pannes', icon: Shield},
      {key: 'sos', label: 'Bouton SOS - Alarme', desc: 'Détail des activations du bouton SOS', icon: OctagonAlert},
      {key: 'vitesse', label: 'Excès de vitesse', desc: 'Journal des dépassements de vitesse', icon: Gauge},
    ]
  }
]

const DAYS = [{key: 'Lu', label: 'Lu'}, {key: 'Ma', label: 'Ma'}, {key: 'Me', label: 'Me'}, {key: 'Je', label: 'Je'}, {key: 'Ve', label: 'Ve'}, {key: 'Sa', label: 'Sa'}, {key: 'Di', label: 'Di'}]

const PremiumReports = () => {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines)
  const listRpt = useAppSelector(getListRpt)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('builder') // builder | result
  const [searchType, setSearchType] = useState('')
  const [searchAsset, setSearchAsset] = useState('')

  // Builder state
  const [selectedReport, setSelectedReport] = useState('trajets')
  const [selectedAssets, setSelectedAssets] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [reportTitle, setReportTitle] = useState('Rapport des trajets')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedDays, setSelectedDays] = useState(['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'])
  const [timeRange, setTimeRange] = useState('always') // day | night | always
  const [showSummary, setShowSummary] = useState(true)
  const [hideEmpty, setHideEmpty] = useState(true)
  const [autoSend, setAutoSend] = useState(false)
  const [autoEmail, setAutoEmail] = useState('')
  const [autoFreq, setAutoFreq] = useState('daily')
  const [expandedCats, setExpandedCats] = useState({activity: true, zone: true, security: true})

  // Result state
  const [resultData, setResultData] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dispatch(fetchEngines({page: 1})),
      dispatch(fetchListRpt()),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  const assetList = useMemo(() => {
    const arr = Array.isArray(engines) ? engines : []
    if (!searchAsset) return arr
    return arr.filter(e => (e.reference || '').toLowerCase().includes(searchAsset.toLowerCase()))
  }, [engines, searchAsset])

  const toggleAsset = (id) => {
    setSelectedAssets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedAssets([])
      setSelectAll(false)
    } else {
      setSelectedAssets(assetList.map(e => e.id))
      setSelectAll(true)
    }
  }

  const toggleDay = (d) => {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const toggleCat = (key) => {
    setExpandedCats(prev => ({...prev, [key]: !prev[key]}))
  }

  const buildReport = () => {
    // Generate mock trip data based on selected assets
    const selected = assetList.filter(e => selectedAssets.includes(e.id))
    const trips = []
    let totalDist = 0, totalTime = 0, maxSpeed = 0
    selected.forEach(asset => {
      const numTrips = 2 + Math.floor(Math.random() * 4)
      let hour = 6 + Math.floor(Math.random() * 4)
      for (let t = 0; t < numTrips; t++) {
        const depMin = Math.floor(Math.random() * 59)
        const dur = 4 + Math.floor(Math.random() * 25)
        const dist = +(1 + Math.random() * 15).toFixed(2)
        const avgSpd = Math.floor(10 + Math.random() * 50)
        const maxSpd = avgSpd + Math.floor(Math.random() * 40)
        const arrHour = hour + Math.floor((depMin + dur) / 60)
        const arrMin = (depMin + dur) % 60
        trips.push({
          asset: asset.reference || asset.label,
          departure: `${String(hour).padStart(2, '0')}:${String(depMin).padStart(2, '0')} - ${asset.LocationObjectname || asset.enginAddress || 'Site A'}`,
          arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')} - ${asset.LocationObjectname || 'Site B'}`,
          distance: dist,
          duration: `00:${String(dur).padStart(2, '0')}`,
          avgSpeed: avgSpd,
          maxSpeed: maxSpd,
        })
        totalDist += dist
        totalTime += dur
        if (maxSpd > maxSpeed) maxSpeed = maxSpd
        hour = arrHour + Math.floor(Math.random() * 2)
      }
    })
    const h = Math.floor(totalTime / 60)
    const m = totalTime % 60
    setResultData({
      title: reportTitle,
      date: `${dateFrom} — ${dateTo}`,
      trips,
      summary: {
        count: trips.length,
        distance: +totalDist.toFixed(1),
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        avgSpeed: trips.length ? Math.round(trips.reduce((s, t) => s + t.avgSpeed, 0) / trips.length) : 0,
        maxSpeed,
      }
    })
    setStep('result')
  }

  // ── RESULT VIEW ──
  if (step === 'result' && resultData) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ltr" data-testid="report-result">
          <div className="ltr-result-head">
            <button className="ltr-back-btn" onClick={() => setStep('builder')} data-testid="report-back-btn">
              <ArrowLeft size={16} /> Retour
            </button>
            <div className="ltr-result-actions">
              <button className="ltr-icon-btn" title="Imprimer" onClick={() => window.print()}><Printer size={16} /></button>
              <button className="ltr-icon-btn" title="Télécharger"><Download size={16} /></button>
              <button className="ltr-icon-btn" title="Envoyer par email"><Mail size={16} /></button>
            </div>
          </div>

          <div className="ltr-result-title-bar">
            <h1 className="ltr-result-title">{resultData.title}</h1>
            <span className="ltr-result-date"><Calendar size={13} /> {resultData.date}</span>
          </div>

          {/* Trips Table */}
          <div className="ltr-table-card" data-testid="report-trips-table">
            <div className="ltr-table-head-bar">
              <ChevronDown size={14} />
              <span>Trajets</span>
            </div>
            <div className="ltr-table-scroll">
              <table className="ltr-table">
                <thead>
                  <tr>
                    <th className="ltr-th ltr-th--wide">Départ</th>
                    <th className="ltr-th ltr-th--wide">Arrivée</th>
                    <th className="ltr-th">Distance, km</th>
                    <th className="ltr-th">Temps de trajet</th>
                    <th className="ltr-th">Vitesse moyenne, km/h</th>
                    <th className="ltr-th">V. max., km/h</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.trips.map((trip, i) => (
                    <tr key={i} className="ltr-tr" data-testid={`report-trip-${i}`}>
                      <td className="ltr-td">{trip.departure}</td>
                      <td className="ltr-td">{trip.arrival}</td>
                      <td className="ltr-td ltr-td--num">{trip.distance}</td>
                      <td className="ltr-td ltr-td--num">{trip.duration}</td>
                      <td className="ltr-td ltr-td--num">{trip.avgSpeed}</td>
                      <td className="ltr-td ltr-td--num">{trip.maxSpeed}</td>
                    </tr>
                  ))}
                  <tr className="ltr-tr ltr-tr--total">
                    <td className="ltr-td"><strong>Au total :</strong></td>
                    <td className="ltr-td"></td>
                    <td className="ltr-td ltr-td--num"><strong>{resultData.summary.distance}</strong></td>
                    <td className="ltr-td ltr-td--num"><strong>{resultData.summary.time}</strong></td>
                    <td className="ltr-td ltr-td--num"><strong>{resultData.summary.avgSpeed}</strong></td>
                    <td className="ltr-td ltr-td--num"><strong>{resultData.summary.maxSpeed}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {showSummary && (
            <div className="ltr-summary-card" data-testid="report-summary">
              <div className="ltr-table-head-bar">
                <ChevronDown size={14} />
                <span>Résumé</span>
              </div>
              <div className="ltr-summary-grid">
                <SummaryRow label="Trajets" value={resultData.summary.count} />
                <SummaryRow label="Distance, km" value={resultData.summary.distance} />
                <SummaryRow label="Temps de trajet" value={resultData.summary.time} />
                <SummaryRow label="Vitesse moyenne, km/h" value={resultData.summary.avgSpeed} />
                <SummaryRow label="V. max., km/h" value={resultData.summary.maxSpeed} />
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  // ── BUILDER VIEW ──
  return (
    <>
      <style>{STYLES}</style>
      <div className="ltr" data-testid="premium-reports">
        <div className="ltr-header">
          <div>
            <h1 className="ltr-title" data-testid="reports-title">Rapports</h1>
            <p className="ltr-sub">Construisez et envoyez vos rapports d'activité</p>
          </div>
        </div>

        {/* 3-panel builder */}
        <div className="ltr-builder" data-testid="report-builder">
          {/* Panel 1: Report Types */}
          <div className="ltr-panel ltr-panel--types" data-testid="report-types-panel">
            <div className="ltr-panel-head">
              <h3>Rapports disponibles</h3>
            </div>
            <div className="ltr-panel-search">
              <Search size={13} />
              <input placeholder="Recherche rapide" value={searchType} onChange={e => setSearchType(e.target.value)} data-testid="report-search-type" />
              {searchType && <button onClick={() => setSearchType('')}><X size={12} /></button>}
            </div>
            <div className="ltr-panel-list">
              {REPORT_CATEGORIES.map(cat => {
                const filteredItems = cat.items.filter(it => !searchType || it.label.toLowerCase().includes(searchType.toLowerCase()))
                if (filteredItems.length === 0) return null
                return (
                  <div key={cat.key} className="ltr-cat">
                    <button className="ltr-cat-head" onClick={() => toggleCat(cat.key)} data-testid={`report-cat-${cat.key}`}>
                      <ChevronDown size={14} style={{transform: expandedCats[cat.key] ? 'rotate(0)' : 'rotate(-90deg)', transition: '.2s'}} />
                      <span>{cat.label}</span>
                    </button>
                    {expandedCats[cat.key] && filteredItems.map(it => {
                      const Icon = it.icon
                      const isActive = selectedReport === it.key
                      return (
                        <button
                          key={it.key}
                          className={`ltr-report-item ${isActive ? 'ltr-report-item--active' : ''}`}
                          onClick={() => { setSelectedReport(it.key); setReportTitle(`Rapport ${it.label.toLowerCase()}`) }}
                          data-testid={`report-select-${it.key}`}
                        >
                          <Icon size={15} className="ltr-report-icon" />
                          <div>
                            <span className="ltr-report-name">{it.label}</span>
                            <span className="ltr-report-desc">{it.desc}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Panel 2: Asset Selector */}
          <div className="ltr-panel ltr-panel--assets" data-testid="report-assets-panel">
            <div className="ltr-panel-head">
              <h3><Truck size={15} /> Assets</h3>
              <span className="ltr-panel-count">{selectedAssets.length} sélectionnés</span>
            </div>
            <div className="ltr-panel-search">
              <Search size={13} />
              <input placeholder="Recherche rapide" value={searchAsset} onChange={e => setSearchAsset(e.target.value)} data-testid="report-search-asset" />
            </div>
            <div className="ltr-asset-list">
              <label className="ltr-asset-row ltr-asset-row--all" data-testid="report-select-all">
                <span className="ltr-check" onClick={toggleSelectAll}>
                  {selectAll ? <CheckSquare size={16} className="ltr-check--on" /> : <Square size={16} />}
                </span>
                <span className="ltr-asset-all-label">Tout sélectionner</span>
              </label>
              {loading ? (
                [...Array(6)].map((_, i) => <div key={i} className="ltr-asset-skel" />)
              ) : (
                assetList.slice(0, 50).map((eng, i) => {
                  const checked = selectedAssets.includes(eng.id)
                  return (
                    <label key={eng.id || i} className="ltr-asset-row" data-testid={`report-asset-${i}`}>
                      <span className="ltr-check" onClick={() => toggleAsset(eng.id)}>
                        {checked ? <CheckSquare size={16} className="ltr-check--on" /> : <Square size={16} />}
                      </span>
                      <span className="ltr-asset-name">{eng.reference || eng.label || `Asset ${i+1}`}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {/* Panel 3: Configuration */}
          <div className="ltr-panel ltr-panel--config" data-testid="report-config-panel">
            <div className="ltr-panel-head">
              <h3>{REPORT_CATEGORIES.flatMap(c => c.items).find(it => it.key === selectedReport)?.label || 'Configuration'}</h3>
            </div>
            <div className="ltr-config-body">
              <div className="ltr-config-field">
                <label>Titre du rapport :</label>
                <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} data-testid="report-title-input" />
              </div>

              <div className="ltr-config-field">
                <label>Plage de dates :</label>
                <div className="ltr-date-row">
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} data-testid="report-date-from" />
                  <span>—</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} data-testid="report-date-to" />
                </div>
              </div>

              <div className="ltr-config-field">
                <label>Jours de la semaine :</label>
                <div className="ltr-days-row">
                  {DAYS.map(d => (
                    <button
                      key={d.key}
                      className={`ltr-day-btn ${selectedDays.includes(d.key) ? 'ltr-day-btn--active' : ''}`}
                      onClick={() => toggleDay(d.key)}
                      data-testid={`report-day-${d.key}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ltr-config-field">
                <label>Plage horaire :</label>
                <div className="ltr-time-chips">
                  {[{key: 'day', label: 'Journée'}, {key: 'night', label: 'Nuit'}, {key: 'always', label: 'Toujours'}].map(t => (
                    <button key={t.key} className={`ltr-time-chip ${timeRange === t.key ? 'ltr-time-chip--active' : ''}`} onClick={() => setTimeRange(t.key)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ltr-config-checks">
                <label className="ltr-config-check" data-testid="report-hide-empty">
                  <input type="checkbox" checked={hideEmpty} onChange={e => setHideEmpty(e.target.checked)} />
                  <span className="ltr-config-check-box" /> Masquer les onglets vides
                </label>
                <label className="ltr-config-check" data-testid="report-show-summary">
                  <input type="checkbox" checked={showSummary} onChange={e => setShowSummary(e.target.checked)} />
                  <span className="ltr-config-check-box" /> Afficher le résumé
                </label>
              </div>

              {/* Auto-send section */}
              <div className="ltr-config-field">
                <label className="ltr-autosend-toggle" data-testid="report-autosend-toggle">
                  <input type="checkbox" checked={autoSend} onChange={e => setAutoSend(e.target.checked)} />
                  <span className="ltr-toggle-switch" />
                  Envoi automatique
                </label>
                {autoSend && (
                  <div className="ltr-autosend-config">
                    <div className="ltr-config-field">
                      <label>Email :</label>
                      <input type="email" value={autoEmail} onChange={e => setAutoEmail(e.target.value)} placeholder="destinataire@email.com" data-testid="report-auto-email" />
                    </div>
                    <div className="ltr-config-field">
                      <label>Fréquence :</label>
                      <div className="ltr-freq-chips">
                        {[{key: 'daily', label: 'Quotidien'}, {key: 'weekly', label: 'Hebdo'}, {key: 'monthly', label: 'Mensuel'}].map(f => (
                          <button key={f.key} className={`ltr-freq-chip ${autoFreq === f.key ? 'ltr-freq-chip--active' : ''}`} onClick={() => setAutoFreq(f.key)}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ltr-config-actions">
                <button className="ltr-build-btn" onClick={buildReport} disabled={selectedAssets.length === 0} data-testid="report-build-btn">
                  <FileBarChart size={15} /> Construire le rapport
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const SummaryRow = ({label, value}) => (
  <div className="ltr-summary-row">
    <span className="ltr-summary-label">{label}</span>
    <span className="ltr-summary-value">{value}</span>
  </div>
)

const STYLES = `
.ltr { max-width: 100%; }
.ltr-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:16px; }
.ltr-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltr-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }

/* ── BUILDER 3-Panel ── */
.ltr-builder { display:grid; grid-template-columns:280px 240px 1fr; gap:0; background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; min-height:560px; }
@media(max-width:1024px){ .ltr-builder{ grid-template-columns:1fr; } }

.ltr-panel { display:flex; flex-direction:column; border-right:1px solid #E2E8F0; }
.ltr-panel:last-child { border-right:none; }
.ltr-panel-head { padding:16px 18px; border-bottom:1px solid #F1F5F9; display:flex; align-items:center; justify-content:space-between; }
.ltr-panel-head h3 { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.ltr-panel-count { font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; color:#2563EB; background:#EFF6FF; padding:3px 10px; border-radius:12px; }

.ltr-panel-search { display:flex; align-items:center; gap:6px; padding:10px 14px; border-bottom:1px solid #F8FAFC; }
.ltr-panel-search svg { color:#94A3B8; flex-shrink:0; }
.ltr-panel-search input { flex:1; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.ltr-panel-search button { border:none; background:transparent; color:#94A3B8; cursor:pointer; }

/* Types panel */
.ltr-panel--types { background:#FAFBFC; }
.ltr-panel-list { flex:1; overflow-y:auto; }
.ltr-cat { border-bottom:1px solid #F1F5F9; }
.ltr-cat-head { display:flex; align-items:center; gap:8px; padding:10px 14px; width:100%; border:none; background:#F8FAFC; font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:800; color:#475569; cursor:pointer; text-transform:uppercase; letter-spacing:.03em; }
.ltr-report-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px 10px 22px; width:100%; border:none; background:transparent; cursor:pointer; text-align:left; transition:all .12s; border-left:3px solid transparent; }
.ltr-report-item:hover { background:#EFF6FF; }
.ltr-report-item--active { background:#EFF6FF; border-left-color:#2563EB; }
.ltr-report-icon { color:#94A3B8; flex-shrink:0; margin-top:2px; }
.ltr-report-item--active .ltr-report-icon { color:#2563EB; }
.ltr-report-name { display:block; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#0F172A; }
.ltr-report-item--active .ltr-report-name { color:#2563EB; }
.ltr-report-desc { display:block; font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; margin-top:2px; line-height:1.3; }

/* Assets panel */
.ltr-asset-list { flex:1; overflow-y:auto; }
.ltr-asset-row { display:flex; align-items:center; gap:10px; padding:9px 14px; cursor:pointer; transition:background .1s; border-bottom:1px solid #FAFBFC; }
.ltr-asset-row:hover { background:#F8FAFC; }
.ltr-asset-row--all { background:#F8FAFC; border-bottom:1px solid #E2E8F0; font-weight:600; }
.ltr-check { display:flex; align-items:center; color:#CBD5E1; cursor:pointer; }
.ltr-check--on { color:#2563EB; }
.ltr-asset-name { font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; }
.ltr-asset-all-label { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.ltr-asset-skel { height:36px; margin:4px 14px; border-radius:6px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }

/* Config panel */
.ltr-config-body { padding:18px; display:flex; flex-direction:column; gap:18px; overflow-y:auto; flex:1; }
.ltr-config-field { display:flex; flex-direction:column; gap:6px; }
.ltr-config-field > label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#475569; }
.ltr-config-field input[type="text"],
.ltr-config-field input[type="email"] { padding:9px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; transition:all .2s; }
.ltr-config-field input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }

.ltr-date-row { display:flex; align-items:center; gap:8px; }
.ltr-date-row input { flex:1; padding:8px 10px; border-radius:8px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.ltr-date-row input:focus { border-color:#2563EB; }
.ltr-date-row span { color:#94A3B8; font-size:.8rem; }

.ltr-days-row { display:flex; gap:5px; }
.ltr-day-btn { width:36px; height:36px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#64748B; cursor:pointer; transition:all .12s; }
.ltr-day-btn:hover { border-color:#2563EB; }
.ltr-day-btn--active { background:#2563EB; color:#FFF; border-color:#2563EB; }

.ltr-time-chips { display:flex; gap:6px; }
.ltr-time-chip { padding:7px 16px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.ltr-time-chip--active { background:#2563EB; color:#FFF; border-color:#2563EB; }

.ltr-config-checks { display:flex; flex-direction:column; gap:10px; }
.ltr-config-check { display:flex; align-items:center; gap:10px; font-family:'Inter',sans-serif; font-size:.82rem; color:#475569; cursor:pointer; }
.ltr-config-check input { display:none; }
.ltr-config-check-box { width:18px; height:18px; border-radius:5px; border:2px solid #CBD5E1; display:flex; align-items:center; justify-content:center; transition:all .12s; flex-shrink:0; }
.ltr-config-check input:checked ~ .ltr-config-check-box { background:#2563EB; border-color:#2563EB; }
.ltr-config-check input:checked ~ .ltr-config-check-box::after { content:'\\2713'; color:#FFF; font-size:.65rem; font-weight:700; }

/* Auto-send */
.ltr-autosend-toggle { display:flex; align-items:center; gap:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; color:#0F172A; cursor:pointer; }
.ltr-autosend-toggle input { display:none; }
.ltr-toggle-switch { width:40px; height:22px; border-radius:11px; background:#E2E8F0; position:relative; transition:background .2s; flex-shrink:0; }
.ltr-toggle-switch::after { content:''; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#FFF; transition:transform .2s; }
.ltr-autosend-toggle input:checked + .ltr-toggle-switch { background:#2563EB; }
.ltr-autosend-toggle input:checked + .ltr-toggle-switch::after { transform:translateX(18px); }
.ltr-autosend-config { margin-top:12px; padding:14px; background:#F8FAFC; border-radius:12px; border:1px solid #E2E8F0; display:flex; flex-direction:column; gap:12px; }
.ltr-freq-chips { display:flex; gap:6px; }
.ltr-freq-chip { padding:6px 14px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.ltr-freq-chip--active { background:#059669; color:#FFF; border-color:#059669; }

.ltr-config-actions { margin-top:auto; padding-top:12px; }
.ltr-build-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:12px; border:none; background:#2563EB; color:#FFF; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .15s; box-shadow:0 4px 12px rgba(37,99,235,.2); }
.ltr-build-btn:hover { background:#1D4ED8; }
.ltr-build-btn:disabled { opacity:.4; cursor:not-allowed; }

/* ── RESULT VIEW ── */
.ltr-result-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.ltr-back-btn { display:inline-flex; align-items:center; gap:6px; border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; }
.ltr-back-btn:hover { text-decoration:underline; }
.ltr-result-actions { display:flex; gap:8px; }
.ltr-icon-btn { width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; }
.ltr-icon-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

.ltr-result-title-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
.ltr-result-title { font-family:'Manrope',sans-serif; font-size:1.3rem; font-weight:800; color:#0F172A; margin:0; }
.ltr-result-date { display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }

/* Table */
.ltr-table-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; margin-bottom:20px; }
.ltr-table-head-bar { display:flex; align-items:center; gap:8px; padding:12px 20px; background:#475569; color:#FFF; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; }
.ltr-table-scroll { overflow-x:auto; }
.ltr-table { width:100%; border-collapse:collapse; }
.ltr-th { padding:12px 16px; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#64748B; text-align:center; border-bottom:2px solid #E2E8F0; background:#F8FAFC; text-transform:uppercase; letter-spacing:.03em; }
.ltr-th--wide { text-align:left; min-width:220px; }
.ltr-td { padding:12px 16px; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; border-bottom:1px solid #F1F5F9; }
.ltr-td--num { text-align:center; font-variant-numeric:tabular-nums; }
.ltr-tr:hover { background:#FAFBFC; }
.ltr-tr--total { background:#F8FAFC; }
.ltr-tr--total .ltr-td { border-top:2px solid #E2E8F0; font-weight:600; }

/* Summary */
.ltr-summary-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; max-width:360px; }
.ltr-summary-grid { padding:4px 0; }
.ltr-summary-row { display:flex; justify-content:space-between; align-items:center; padding:10px 20px; border-bottom:1px solid #F8FAFC; }
.ltr-summary-row:last-child { border-bottom:none; }
.ltr-summary-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }
.ltr-summary-value { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; }

@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`

export default PremiumReports
