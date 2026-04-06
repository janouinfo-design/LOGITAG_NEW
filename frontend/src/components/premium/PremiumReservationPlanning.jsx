import {useState, useEffect, useCallback, useMemo} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {fetchSites, getSites} from '../Site/slice/site.slice'
import {
  CalendarDays, ChevronLeft, ChevronRight, Filter, Plus, X, Search,
  Truck, MapPin, Clock, User, AlertTriangle, CheckCircle2, XCircle,
  LogIn, LogOut, Eye, Loader2, ChevronDown, ArrowRight, Calendar as CalIcon,
  Wifi, WifiOff, Battery, GripVertical
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const STATUS_MAP = {
  confirmed: {label: 'Confirmé', bg: '#DBEAFE', color: '#2563EB', bar: '#3B82F6'},
  in_progress: {label: 'En cours', bg: '#FEF3C7', color: '#D97706', bar: '#F59E0B'},
  completed: {label: 'Terminé', bg: '#D1FAE5', color: '#059669', bar: '#10B981'},
  cancelled: {label: 'Annulé', bg: '#FEE2E2', color: '#DC2626', bar: '#EF4444'},
  requested: {label: 'Demandé', bg: '#E0E7FF', color: '#4F46E5', bar: '#6366F1'},
  rejected: {label: 'Rejeté', bg: '#FCE7F3', color: '#BE185D', bar: '#EC4899'},
  expired: {label: 'Expiré', bg: '#F1F5F9', color: '#64748B', bar: '#94A3B8'},
}
const PRIORITY_MAP = {
  low: {label: 'Basse', color: '#64748B'},
  normal: {label: 'Normal', color: '#2563EB'},
  high: {label: 'Haute', color: '#D97706'},
  urgent: {label: 'Urgent', color: '#DC2626'},
}

const PremiumReservationPlanning = () => {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines)
  const sites = useAppSelector(getSites)

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('week') // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSite, setFilterSite] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailDrawer, setShowDetailDrawer] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(null)
  const [showCheckinModal, setShowCheckinModal] = useState(null)

  // Create form
  const [createForm, setCreateForm] = useState({
    asset_id: '', asset_name: '', user_name: '', team: '', project: '',
    site: '', start_date: '', end_date: '', note: '', priority: 'normal',
  })
  const [createError, setCreateError] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)

  // Checkout/Checkin forms
  const [coForm, setCoForm] = useState({user_name: '', location: '', condition: 'good', comment: ''})
  const [ciForm, setCiForm] = useState({user_name: '', condition: 'good', comment: ''})
  const [actionLoading, setActionLoading] = useState(false)
  const [dragItem, setDragItem] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [bleData, setBleData] = useState(null)
  const [bleLoading, setBleLoading] = useState(false)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/reservations`)
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch { setReservations([]) }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReservations()
    dispatch(fetchEngines({page: 1, PageSize: 200}))
    dispatch(fetchSites(0))
  }, [dispatch, fetchReservations])

  const assetList = useMemo(() => {
    const arr = Array.isArray(engines?.data) ? engines.data : Array.isArray(engines) ? engines : []
    return arr
  }, [engines])
  const siteList = useMemo(() => Array.isArray(sites) ? sites : [], [sites])

  // ── Filtered reservations ──
  const filtered = useMemo(() => {
    return reservations.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false
      if (filterSite !== 'all' && r.site !== filterSite) return false
      if (searchTerm) {
        const t = searchTerm.toLowerCase()
        if (![r.asset_name, r.user_name, r.project, r.team, r.site].some(f => f && f.toLowerCase().includes(t))) return false
      }
      return true
    })
  }, [reservations, filterStatus, filterSite, searchTerm])

  // ── Date helpers ──
  const getDaysInView = () => {
    const days = []
    const d = new Date(currentDate)
    if (viewMode === 'day') {
      days.push(new Date(d))
    } else if (viewMode === 'week') {
      const dayOfWeek = d.getDay()
      const monday = new Date(d); monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday); day.setDate(monday.getDate() + i)
        days.push(day)
      }
    } else {
      const y = d.getFullYear(), m = d.getMonth()
      const firstDay = new Date(y, m, 1)
      const lastDay = new Date(y, m + 1, 0)
      const startOfWeek = new Date(firstDay)
      startOfWeek.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1))
      const endOfWeek = new Date(lastDay)
      endOfWeek.setDate(lastDay.getDate() + (7 - (lastDay.getDay() === 0 ? 7 : lastDay.getDay())))
      const cur = new Date(startOfWeek)
      while (cur <= endOfWeek) {
        days.push(new Date(cur))
        cur.setDate(cur.getDate() + 1)
      }
    }
    return days
  }

  const navigate = (dir) => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() + dir)
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const formatDateShort = (d) => d.toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric'})
  const formatMonthYear = (d) => d.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const isToday = (d) => isSameDay(d, new Date())
  const isCurrentMonth = (d) => d.getMonth() === currentDate.getMonth()

  const getReservationsForDay = (day) => {
    return filtered.filter(r => {
      const s = new Date(r.start_date), e = new Date(r.end_date)
      const dayStart = new Date(day); dayStart.setHours(0,0,0,0)
      const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999)
      return s <= dayEnd && e >= dayStart
    })
  }

  // ── Actions ──
  const handleCreate = async () => {
    setCreateError(null)
    if (!createForm.asset_id || !createForm.start_date || !createForm.end_date || !createForm.user_name) {
      setCreateError("Veuillez remplir tous les champs obligatoires."); return
    }
    setCreateLoading(true)
    try {
      const res = await fetch(`${API}/api/reservations`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(createForm)
      })
      if (!res.ok) {
        const err = await res.json()
        setCreateError(err.detail || 'Erreur lors de la création.')
        setCreateLoading(false); return
      }
      setShowCreateModal(false)
      setCreateForm({asset_id: '', asset_name: '', user_name: '', team: '', project: '', site: '', start_date: '', end_date: '', note: '', priority: 'normal'})
      fetchReservations()
    } catch { setCreateError("Erreur réseau.") }
    setCreateLoading(false)
  }

  const handleCheckout = async () => {
    if (!showCheckoutModal) return
    setActionLoading(true)
    try {
      await fetch(`${API}/api/reservations/${showCheckoutModal.id}/checkout`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(coForm)
      })
      setShowCheckoutModal(null)
      setCoForm({user_name: '', location: '', condition: 'good', comment: ''})
      fetchReservations()
    } catch {}
    setActionLoading(false)
  }

  const handleCheckin = async () => {
    if (!showCheckinModal) return
    setActionLoading(true)
    try {
      await fetch(`${API}/api/reservations/${showCheckinModal.id}/checkin`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(ciForm)
      })
      setShowCheckinModal(null)
      setCiForm({user_name: '', condition: 'good', comment: ''})
      fetchReservations()
    } catch {}
    setActionLoading(false)
  }

  const handleCancel = async (id) => {
    await fetch(`${API}/api/reservations/${id}/cancel`, {method: 'POST'})
    fetchReservations()
    setShowDetailDrawer(null)
  }

  // ── Drag & Drop ──
  const handleDragStart = (e, reservation) => {
    setDragItem(reservation)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', reservation.id)
    e.target.style.opacity = '0.5'
  }
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDragItem(null)
    setDropTarget(null)
  }
  const handleDragOver = (e, dayIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(dayIndex)
  }
  const handleDragLeave = () => { setDropTarget(null) }
  const handleDrop = async (e, targetDay) => {
    e.preventDefault()
    setDropTarget(null)
    if (!dragItem) return
    if (['completed', 'cancelled', 'rejected'].includes(dragItem.status)) return

    const origStart = new Date(dragItem.start_date)
    const origEnd = new Date(dragItem.end_date)
    const duration = origEnd - origStart
    const newStart = new Date(targetDay)
    newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0)
    const newEnd = new Date(newStart.getTime() + duration)

    try {
      const res = await fetch(`${API}/api/reservations/${dragItem.id}/drag`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({start_date: newStart.toISOString(), end_date: newEnd.toISOString()})
      })
      if (res.ok) {
        fetchReservations()
      } else {
        const err = await res.json()
        alert(err.detail || 'Impossible de déplacer.')
      }
    } catch { alert('Erreur réseau.') }
    setDragItem(null)
  }

  // ── BLE Check ──
  const fetchBleCheck = async (resId) => {
    setBleLoading(true)
    setBleData(null)
    try {
      const res = await fetch(`${API}/api/reservations/${resId}/ble-check`)
      if (res.ok) { setBleData(await res.json()) }
    } catch {}
    setBleLoading(false)
  }

  const openDetail = (r) => {
    setShowDetailDrawer(r)
    if (r.status === 'in_progress' || r.status === 'confirmed') {
      fetchBleCheck(r.id)
    }
  }

  const days = getDaysInView()
  const uniqueSites = [...new Set(reservations.map(r => r.site).filter(Boolean))]

  return (
    <>
      <style>{STYLES}</style>
      <div className="rp" data-testid="reservation-planning">
        {/* Header */}
        <div className="rp-header">
          <div>
            <h1 className="rp-title" data-testid="planning-title">Réservation & Planning</h1>
            <p className="rp-sub">{filtered.length} réservation{filtered.length !== 1 ? 's' : ''} {filterStatus !== 'all' ? `(${STATUS_MAP[filterStatus]?.label})` : ''}</p>
          </div>
          <button className="rp-create-btn" onClick={() => setShowCreateModal(true)} data-testid="create-reservation-btn">
            <Plus size={16} /> Nouvelle réservation
          </button>
        </div>

        {/* Toolbar */}
        <div className="rp-toolbar" data-testid="planning-toolbar">
          <div className="rp-tool-left">
            <div className="rp-nav">
              <button onClick={() => navigate(-1)} data-testid="planning-prev"><ChevronLeft size={16} /></button>
              <button className="rp-nav-today" onClick={goToday} data-testid="planning-today">Aujourd'hui</button>
              <button onClick={() => navigate(1)} data-testid="planning-next"><ChevronRight size={16} /></button>
              <span className="rp-nav-label">{formatMonthYear(currentDate)}</span>
            </div>
            <div className="rp-view-toggle">
              {['day', 'week', 'month'].map(v => (
                <button key={v} className={`rp-vt ${viewMode === v ? 'rp-vt--active' : ''}`} onClick={() => setViewMode(v)} data-testid={`view-${v}`}>
                  {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
          </div>
          <div className="rp-tool-right">
            <div className="rp-search-box">
              <Search size={13} />
              <input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} data-testid="planning-search" />
            </div>
            <select className="rp-filter-sel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} data-testid="filter-status">
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="rp-filter-sel" value={filterSite} onChange={e => setFilterSite(e.target.value)} data-testid="filter-site">
              <option value="all">Tous les sites</option>
              {uniqueSites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="rp-loading"><Loader2 size={28} className="rp-spin" /> Chargement...</div>
        ) : (
          <div className={`rp-grid rp-grid--${viewMode}`} data-testid="planning-grid">
            {days.map((day, di) => {
              const dayRes = getReservationsForDay(day)
              const today = isToday(day)
              const curMonth = isCurrentMonth(day)
              const isDropZone = dropTarget === di
              return (
                <div key={di}
                  className={`rp-day ${today ? 'rp-day--today' : ''} ${!curMonth && viewMode === 'month' ? 'rp-day--outside' : ''} ${isDropZone ? 'rp-day--drop' : ''}`}
                  data-testid={`day-${di}`}
                  onDragOver={(e) => handleDragOver(e, di)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className="rp-day-head">
                    <span className={`rp-day-num ${today ? 'rp-day-num--today' : ''}`}>{day.getDate()}</span>
                    {(viewMode !== 'month') && <span className="rp-day-name">{day.toLocaleDateString('fr-FR', {weekday: 'short'})}</span>}
                  </div>
                  <div className="rp-day-body">
                    {dayRes.slice(0, viewMode === 'month' ? 3 : 20).map(r => {
                      const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed
                      const canDrag = !['completed', 'cancelled', 'rejected'].includes(r.status)
                      return (
                        <div key={r.id} className={`rp-event ${canDrag ? 'rp-event--draggable' : ''}`}
                          style={{borderLeftColor: st.bar, background: st.bg}}
                          draggable={canDrag}
                          onDragStart={(e) => canDrag && handleDragStart(e, r)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openDetail(r)} data-testid={`event-${r.id}`}>
                          <span className="rp-event-name">{r.asset_name}</span>
                          <span className="rp-event-user">{r.user_name}</span>
                          {canDrag && <span className="rp-event-grip">⠿</span>}
                        </div>
                      )
                    })}
                    {dayRes.length > (viewMode === 'month' ? 3 : 20) && (
                      <span className="rp-day-more">+{dayRes.length - (viewMode === 'month' ? 3 : 20)} de plus</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ═══ CREATE MODAL ═══ */}
        {showCreateModal && (
          <div className="rp-modal-bg" onClick={() => setShowCreateModal(false)}>
            <div className="rp-modal" onClick={e => e.stopPropagation()} data-testid="create-modal">
              <div className="rp-modal-head">
                <h2>Nouvelle réservation</h2>
                <button onClick={() => setShowCreateModal(false)}><X size={18} /></button>
              </div>
              <div className="rp-modal-body">
                {createError && <div className="rp-modal-error" data-testid="create-error"><AlertTriangle size={14} /> {createError}</div>}
                <div className="rp-form-row">
                  <div className="rp-form-field rp-form-field--full">
                    <label>Asset *</label>
                    <select value={createForm.asset_id} onChange={e => {
                      const a = assetList.find(x => (x.id || x.ID) === e.target.value)
                      setCreateForm(f => ({...f, asset_id: e.target.value, asset_name: a ? (a.reference || a.label) : ''}))
                    }} data-testid="create-asset">
                      <option value="">Sélectionner un asset</option>
                      {assetList.map((a, i) => <option key={i} value={a.id || a.ID}>{a.reference || a.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="rp-form-row">
                  <div className="rp-form-field">
                    <label>Utilisateur *</label>
                    <input value={createForm.user_name} onChange={e => setCreateForm(f => ({...f, user_name: e.target.value}))} placeholder="Nom" data-testid="create-user" />
                  </div>
                  <div className="rp-form-field">
                    <label>Équipe</label>
                    <input value={createForm.team} onChange={e => setCreateForm(f => ({...f, team: e.target.value}))} placeholder="Équipe" />
                  </div>
                </div>
                <div className="rp-form-row">
                  <div className="rp-form-field">
                    <label>Projet</label>
                    <input value={createForm.project} onChange={e => setCreateForm(f => ({...f, project: e.target.value}))} placeholder="Projet / Chantier" />
                  </div>
                  <div className="rp-form-field">
                    <label>Site</label>
                    <select value={createForm.site} onChange={e => setCreateForm(f => ({...f, site: e.target.value}))}>
                      <option value="">Sélectionner un site</option>
                      {siteList.map((s, i) => <option key={i} value={s.name || s.label}>{s.name || s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="rp-form-row">
                  <div className="rp-form-field">
                    <label>Date début *</label>
                    <input type="datetime-local" value={createForm.start_date} onChange={e => setCreateForm(f => ({...f, start_date: e.target.value}))} data-testid="create-start" />
                  </div>
                  <div className="rp-form-field">
                    <label>Date fin *</label>
                    <input type="datetime-local" value={createForm.end_date} onChange={e => setCreateForm(f => ({...f, end_date: e.target.value}))} data-testid="create-end" />
                  </div>
                </div>
                <div className="rp-form-row">
                  <div className="rp-form-field">
                    <label>Priorité</label>
                    <select value={createForm.priority} onChange={e => setCreateForm(f => ({...f, priority: e.target.value}))}>
                      {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="rp-form-field">
                    <label>Note</label>
                    <input value={createForm.note} onChange={e => setCreateForm(f => ({...f, note: e.target.value}))} placeholder="Note optionnelle" />
                  </div>
                </div>
              </div>
              <div className="rp-modal-foot">
                <button className="rp-btn rp-btn--ghost" onClick={() => setShowCreateModal(false)}>Annuler</button>
                <button className="rp-btn rp-btn--primary" onClick={handleCreate} disabled={createLoading} data-testid="create-submit">
                  {createLoading ? <Loader2 size={14} className="rp-spin" /> : <Plus size={14} />} Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DETAIL DRAWER ═══ */}
        {showDetailDrawer && (
          <div className="rp-drawer-bg" onClick={() => setShowDetailDrawer(null)}>
            <div className="rp-drawer" onClick={e => e.stopPropagation()} data-testid="detail-drawer">
              <div className="rp-drawer-head">
                <h3>Détail réservation</h3>
                <button onClick={() => setShowDetailDrawer(null)} data-testid="drawer-close"><X size={18} /></button>
              </div>
              {(() => {
                const r = showDetailDrawer
                const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed
                const pr = PRIORITY_MAP[r.priority] || PRIORITY_MAP.normal
                return (
                  <div className="rp-drawer-body">
                    <div className="rp-drawer-badges">
                      <span className="rp-badge" style={{background: st.bg, color: st.color}}>{st.label}</span>
                      <span className="rp-badge" style={{color: pr.color, border: `1px solid ${pr.color}`}}>{pr.label}</span>
                    </div>
                    <div className="rp-drawer-main-info">
                      <Truck size={20} /> <span className="rp-drawer-asset">{r.asset_name}</span>
                    </div>
                    <div className="rp-drawer-grid">
                      <div className="rp-drawer-row"><User size={13} /><label>Utilisateur</label><span>{r.user_name}</span></div>
                      <div className="rp-drawer-row"><MapPin size={13} /><label>Site</label><span>{r.site || '—'}</span></div>
                      <div className="rp-drawer-row"><CalIcon size={13} /><label>Début</label><span>{new Date(r.start_date).toLocaleString('fr-FR')}</span></div>
                      <div className="rp-drawer-row"><CalIcon size={13} /><label>Fin</label><span>{new Date(r.end_date).toLocaleString('fr-FR')}</span></div>
                      {r.team && <div className="rp-drawer-row"><User size={13} /><label>Équipe</label><span>{r.team}</span></div>}
                      {r.project && <div className="rp-drawer-row"><Truck size={13} /><label>Projet</label><span>{r.project}</span></div>}
                      {r.note && <div className="rp-drawer-row"><Eye size={13} /><label>Note</label><span>{r.note}</span></div>}
                    </div>
                    {r.checkout_at && (
                      <div className="rp-drawer-section">
                        <h4><LogOut size={14} /> Check-out</h4>
                        <div className="rp-drawer-row"><Clock size={13} /><label>Heure</label><span>{new Date(r.checkout_at).toLocaleString('fr-FR')}</span></div>
                        <div className="rp-drawer-row"><User size={13} /><label>Par</label><span>{r.checkout_by}</span></div>
                        <div className="rp-drawer-row"><MapPin size={13} /><label>Lieu</label><span>{r.checkout_location || '—'}</span></div>
                        <div className="rp-drawer-row"><Eye size={13} /><label>État</label><span>{r.checkout_condition}</span></div>
                      </div>
                    )}
                    {r.checkin_at && (
                      <div className="rp-drawer-section">
                        <h4><LogIn size={14} /> Check-in</h4>
                        <div className="rp-drawer-row"><Clock size={13} /><label>Heure</label><span>{new Date(r.checkin_at).toLocaleString('fr-FR')}</span></div>
                        <div className="rp-drawer-row"><User size={13} /><label>Par</label><span>{r.checkin_by}</span></div>
                        <div className="rp-drawer-row"><Eye size={13} /><label>État</label><span>{r.checkin_condition}</span></div>
                      </div>
                    )}
                    {/* ── BLE Position Check ── */}
                    {(r.status === 'in_progress' || r.status === 'confirmed') && (
                      <div className="rp-ble-section" data-testid="ble-section">
                        <h4><Wifi size={14} /> Tracking BLE</h4>
                        {bleLoading ? (
                          <div className="rp-ble-loading"><Loader2 size={14} className="rp-spin" /> Vérification position...</div>
                        ) : bleData ? (
                          <div className="rp-ble-data">
                            <div className={`rp-ble-status rp-ble-status--${bleData.match || 'unknown'}`}>
                              {bleData.match === 'match' && <><CheckCircle2 size={16} /> Position correcte</>}
                              {bleData.match === 'mismatch' && <><AlertTriangle size={16} /> Hors zone prévue</>}
                              {bleData.match === 'no_planned_site' && <><MapPin size={16} /> Détecté (pas de site prévu)</>}
                              {!bleData.detected && <><WifiOff size={16} /> Non détecté</>}
                            </div>
                            {bleData.current_site && (
                              <div className="rp-ble-row"><MapPin size={12} /> <label>Position actuelle</label><span>{bleData.current_site}</span></div>
                            )}
                            {bleData.planned_site && (
                              <div className="rp-ble-row"><MapPin size={12} /> <label>Site prévu</label><span>{bleData.planned_site}</span></div>
                            )}
                            {bleData.last_seen && (
                              <div className="rp-ble-row"><Clock size={12} /> <label>Dernière détection</label><span>{bleData.last_seen}</span></div>
                            )}
                            {bleData.battery && (
                              <div className="rp-ble-row"><Battery size={12} /> <label>Batterie</label><span>{bleData.battery}</span></div>
                            )}
                            {bleData.error && (
                              <div className="rp-ble-row rp-ble-row--warn"><AlertTriangle size={12} /> {bleData.error}</div>
                            )}
                          </div>
                        ) : (
                          <div className="rp-ble-loading">Données BLE non disponibles</div>
                        )}
                      </div>
                    )}
                    <div className="rp-drawer-actions">
                      {r.status === 'confirmed' && (
                        <button className="rp-btn rp-btn--warning" onClick={() => { setShowDetailDrawer(null); setCoForm({user_name: r.user_name, location: r.site || '', condition: 'good', comment: ''}); setShowCheckoutModal(r); }} data-testid="action-checkout">
                          <LogOut size={14} /> Check-out
                        </button>
                      )}
                      {r.status === 'in_progress' && (
                        <button className="rp-btn rp-btn--success" onClick={() => { setShowDetailDrawer(null); setCiForm({user_name: r.user_name, condition: 'good', comment: ''}); setShowCheckinModal(r); }} data-testid="action-checkin">
                          <LogIn size={14} /> Check-in
                        </button>
                      )}
                      {!['completed', 'cancelled', 'rejected'].includes(r.status) && (
                        <button className="rp-btn rp-btn--danger" onClick={() => handleCancel(r.id)} data-testid="action-cancel">
                          <XCircle size={14} /> Annuler
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ═══ CHECKOUT MODAL ═══ */}
        {showCheckoutModal && (
          <div className="rp-modal-bg" onClick={() => setShowCheckoutModal(null)}>
            <div className="rp-modal rp-modal--sm" onClick={e => e.stopPropagation()} data-testid="checkout-modal">
              <div className="rp-modal-head rp-modal-head--warning">
                <h2><LogOut size={18} /> Check-out — {showCheckoutModal.asset_name}</h2>
                <button onClick={() => setShowCheckoutModal(null)}><X size={18} /></button>
              </div>
              <div className="rp-modal-body">
                <div className="rp-form-field"><label>Responsable *</label><input value={coForm.user_name} onChange={e => setCoForm(f => ({...f, user_name: e.target.value}))} data-testid="co-user" /></div>
                <div className="rp-form-field"><label>Lieu</label><input value={coForm.location} onChange={e => setCoForm(f => ({...f, location: e.target.value}))} data-testid="co-location" /></div>
                <div className="rp-form-field"><label>État de l'asset</label>
                  <select value={coForm.condition} onChange={e => setCoForm(f => ({...f, condition: e.target.value}))}>
                    <option value="good">Bon état</option><option value="fair">Correct</option><option value="damaged">Endommagé</option>
                  </select>
                </div>
                <div className="rp-form-field"><label>Commentaire</label><input value={coForm.comment} onChange={e => setCoForm(f => ({...f, comment: e.target.value}))} /></div>
              </div>
              <div className="rp-modal-foot">
                <button className="rp-btn rp-btn--ghost" onClick={() => setShowCheckoutModal(null)}>Annuler</button>
                <button className="rp-btn rp-btn--warning" onClick={handleCheckout} disabled={actionLoading} data-testid="co-submit">
                  {actionLoading ? <Loader2 size={14} className="rp-spin" /> : <LogOut size={14} />} Confirmer la sortie
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHECKIN MODAL ═══ */}
        {showCheckinModal && (
          <div className="rp-modal-bg" onClick={() => setShowCheckinModal(null)}>
            <div className="rp-modal rp-modal--sm" onClick={e => e.stopPropagation()} data-testid="checkin-modal">
              <div className="rp-modal-head rp-modal-head--success">
                <h2><LogIn size={18} /> Check-in — {showCheckinModal.asset_name}</h2>
                <button onClick={() => setShowCheckinModal(null)}><X size={18} /></button>
              </div>
              <div className="rp-modal-body">
                <div className="rp-form-field"><label>Responsable *</label><input value={ciForm.user_name} onChange={e => setCiForm(f => ({...f, user_name: e.target.value}))} data-testid="ci-user" /></div>
                <div className="rp-form-field"><label>État retour</label>
                  <select value={ciForm.condition} onChange={e => setCiForm(f => ({...f, condition: e.target.value}))}>
                    <option value="good">Bon état</option><option value="fair">Correct</option><option value="damaged">Endommagé</option>
                  </select>
                </div>
                <div className="rp-form-field"><label>Commentaire</label><input value={ciForm.comment} onChange={e => setCiForm(f => ({...f, comment: e.target.value}))} /></div>
              </div>
              <div className="rp-modal-foot">
                <button className="rp-btn rp-btn--ghost" onClick={() => setShowCheckinModal(null)}>Annuler</button>
                <button className="rp-btn rp-btn--success" onClick={handleCheckin} disabled={actionLoading} data-testid="ci-submit">
                  {actionLoading ? <Loader2 size={14} className="rp-spin" /> : <LogIn size={14} />} Confirmer le retour
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
.rp { max-width:100%; }
.rp-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.rp-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.rp-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.rp-create-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:12px; border:none; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:#FFF; font-family:'Manrope',sans-serif; font-size:.84rem; font-weight:700; cursor:pointer; box-shadow:0 4px 14px rgba(37,99,235,.25); transition:all .15s; }
.rp-create-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.3); }

/* Toolbar */
.rp-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; padding:14px 20px; background:#FFF; border-radius:14px; border:1px solid #E2E8F0; }
.rp-tool-left,.rp-tool-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.rp-nav { display:flex; align-items:center; gap:4px; }
.rp-nav button { width:32px; height:32px; border-radius:8px; border:1px solid #E2E8F0; background:#FFF; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; }
.rp-nav button:hover { border-color:#2563EB; color:#2563EB; }
.rp-nav-today { width:auto !important; padding:0 14px !important; font-family:'Inter',sans-serif; font-size:.76rem; font-weight:600; }
.rp-nav-label { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; margin-left:8px; text-transform:capitalize; }
.rp-view-toggle { display:flex; background:#F1F5F9; border-radius:8px; padding:3px; }
.rp-vt { padding:6px 14px; border-radius:6px; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.rp-vt--active { background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.rp-search-box { display:flex; align-items:center; gap:6px; padding:7px 12px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; }
.rp-search-box svg { color:#94A3B8; flex-shrink:0; }
.rp-search-box input { border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; width:140px; }
.rp-filter-sel { padding:7px 12px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.76rem; color:#475569; background:#FFF; cursor:pointer; }

/* Grid */
.rp-grid { display:grid; gap:1px; background:#E2E8F0; border-radius:14px; overflow:hidden; border:1px solid #E2E8F0; }
.rp-grid--day { grid-template-columns:1fr; }
.rp-grid--week { grid-template-columns:repeat(7,1fr); }
.rp-grid--month { grid-template-columns:repeat(7,1fr); }
.rp-day { background:#FFF; min-height:120px; display:flex; flex-direction:column; }
.rp-day--today { background:#FAFBFF; }
.rp-day--outside { opacity:.5; }
.rp-day-head { display:flex; align-items:center; gap:6px; padding:8px 10px; border-bottom:1px solid #F1F5F9; }
.rp-day-num { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:8px; }
.rp-day-num--today { background:#2563EB; color:#FFF; }
.rp-day-name { font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; text-transform:capitalize; }
.rp-day-body { flex:1; padding:4px 6px; overflow-y:auto; }
.rp-event { display:flex; flex-direction:column; padding:4px 8px; margin-bottom:3px; border-radius:6px; border-left:3px solid; cursor:pointer; transition:all .1s; }
.rp-event:hover { transform:translateX(2px); opacity:.9; }
.rp-event-name { font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rp-event-user { font-family:'Inter',sans-serif; font-size:.6rem; color:#64748B; }
.rp-day-more { font-family:'Inter',sans-serif; font-size:.62rem; color:#2563EB; font-weight:600; cursor:pointer; padding:2px 6px; }
.rp-loading { display:flex; align-items:center; justify-content:center; gap:10px; padding:60px; font-family:'Inter',sans-serif; color:#64748B; }
.rp-spin { animation:rpSpin 1s linear infinite; }

/* Modal */
.rp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.rp-modal { background:#FFF; border-radius:16px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 48px rgba(0,0,0,.15); animation:rpFadeIn .2s ease; }
.rp-modal--sm { max-width:480px; }
.rp-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #E2E8F0; }
.rp-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.rp-modal-head--warning { background:#FFFBEB; }
.rp-modal-head--success { background:#ECFDF5; }
.rp-modal-head button { background:none; border:none; color:#94A3B8; cursor:pointer; padding:4px; }
.rp-modal-body { padding:24px; display:flex; flex-direction:column; gap:16px; }
.rp-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #E2E8F0; }
.rp-modal-error { display:flex; align-items:center; gap:8px; padding:12px 16px; border-radius:10px; background:#FEF2F2; color:#DC2626; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; }
.rp-form-row { display:flex; gap:14px; }
.rp-form-row > .rp-form-field { flex:1; }
.rp-form-field { display:flex; flex-direction:column; gap:6px; }
.rp-form-field--full { flex:1; }
.rp-form-field label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.02em; }
.rp-form-field input,.rp-form-field select,.rp-form-field textarea { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; transition:all .2s; }
.rp-form-field input:focus,.rp-form-field select:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }

/* Buttons */
.rp-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; border:none; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; transition:all .12s; }
.rp-btn--primary { background:#2563EB; color:#FFF; }
.rp-btn--primary:hover { background:#1D4ED8; }
.rp-btn--ghost { background:#F1F5F9; color:#475569; }
.rp-btn--ghost:hover { background:#E2E8F0; }
.rp-btn--warning { background:#F59E0B; color:#FFF; }
.rp-btn--warning:hover { background:#D97706; }
.rp-btn--success { background:#10B981; color:#FFF; }
.rp-btn--success:hover { background:#059669; }
.rp-btn--danger { background:#EF4444; color:#FFF; }
.rp-btn--danger:hover { background:#DC2626; }
.rp-btn:disabled { opacity:.4; cursor:not-allowed; }

/* Drawer */
.rp-drawer-bg { position:fixed; inset:0; background:rgba(0,0,0,.3); z-index:1000; display:flex; justify-content:flex-end; }
.rp-drawer { width:440px; max-width:100%; height:100%; background:#FFF; overflow-y:auto; box-shadow:-8px 0 24px rgba(0,0,0,.1); animation:rpSlideIn .25s ease; }
.rp-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #E2E8F0; position:sticky; top:0; background:#FFF; z-index:1; }
.rp-drawer-head h3 { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; margin:0; }
.rp-drawer-head button { background:none; border:none; color:#94A3B8; cursor:pointer; }
.rp-drawer-body { padding:24px; }
.rp-drawer-badges { display:flex; gap:8px; margin-bottom:16px; }
.rp-badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:700; }
.rp-drawer-main-info { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
.rp-drawer-asset { font-family:'Manrope',sans-serif; font-size:1.2rem; font-weight:800; color:#0F172A; }
.rp-drawer-grid { display:flex; flex-direction:column; gap:4px; margin-bottom:20px; }
.rp-drawer-row { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:8px; background:#F8FAFC; }
.rp-drawer-row svg { color:#94A3B8; flex-shrink:0; }
.rp-drawer-row label { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; width:80px; flex-shrink:0; }
.rp-drawer-row span { font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; font-weight:600; }
.rp-drawer-section { margin-top:16px; padding:16px; background:#FAFBFC; border-radius:12px; border:1px solid #E2E8F0; }
.rp-drawer-section h4 { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; margin:0 0 12px; display:flex; align-items:center; gap:6px; }
.rp-drawer-actions { display:flex; gap:10px; margin-top:24px; flex-wrap:wrap; }

/* Drag & Drop */
.rp-day--drop { background:#EFF6FF !important; outline:2px dashed #3B82F6; outline-offset:-2px; }
.rp-event--draggable { cursor:grab; position:relative; }
.rp-event--draggable:active { cursor:grabbing; }
.rp-event-grip { position:absolute; right:4px; top:50%; transform:translateY(-50%); font-size:.6rem; color:#94A3B8; opacity:0; transition:opacity .15s; }
.rp-event--draggable:hover .rp-event-grip { opacity:1; }

/* BLE Section */
.rp-ble-section { margin-top:16px; padding:16px; background:#FAFBFC; border-radius:12px; border:1px solid #E2E8F0; }
.rp-ble-section h4 { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; margin:0 0 12px; display:flex; align-items:center; gap:6px; }
.rp-ble-loading { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; display:flex; align-items:center; gap:6px; }
.rp-ble-data { display:flex; flex-direction:column; gap:6px; }
.rp-ble-status { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; }
.rp-ble-status--match { background:#D1FAE5; color:#059669; }
.rp-ble-status--mismatch { background:#FEF2F2; color:#DC2626; }
.rp-ble-status--no_planned_site { background:#DBEAFE; color:#2563EB; }
.rp-ble-status--unknown { background:#F1F5F9; color:#64748B; }
.rp-ble-row { display:flex; align-items:center; gap:8px; padding:7px 10px; font-family:'Inter',sans-serif; font-size:.76rem; color:#475569; }
.rp-ble-row svg { color:#94A3B8; flex-shrink:0; }
.rp-ble-row label { color:#64748B; width:110px; flex-shrink:0; }
.rp-ble-row span { color:#0F172A; font-weight:600; }
.rp-ble-row--warn { color:#D97706; background:#FFFBEB; border-radius:8px; }

@keyframes rpSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes rpFadeIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes rpSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
@media(max-width:768px) {
  .rp-toolbar { flex-direction:column; }
  .rp-grid--week,.rp-grid--month { grid-template-columns:repeat(2,1fr) !important; }
  .rp-drawer { width:100%; }
  .rp-modal { max-width:100%; }
  .rp-form-row { flex-direction:column; }
}
`

export default PremiumReservationPlanning
