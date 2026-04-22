/**
 * LOGITAG — Reservations Module
 *
 * All-in-one page: KPIs + Planning (Gantt) + List + Pending Approval
 * Create / Approve / Reject / Cancel / Checkout / Checkin
 *
 * Backend: /api/reservations (FastAPI) — uses REACT_APP_BACKEND_URL
 */
import React, {useEffect, useMemo, useState, useCallback, useRef} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Dialog} from 'primereact/dialog'
import {InputText} from 'primereact/inputtext'
import {InputTextarea} from 'primereact/inputtextarea'
import {Dropdown} from 'primereact/dropdown'
import {Calendar} from 'primereact/calendar'
import {Button} from 'primereact/button'
import {Toast} from 'primereact/toast'
import {confirmDialog, ConfirmDialog} from 'primereact/confirmdialog'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {_fetchStaffs} from '../../api/index'

const API = process.env.REACT_APP_BACKEND_URL + '/api'
const WS_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/^http/, 'ws') + '/api/ws'

// ── Status config ───────────────────────────────────────────────
const STATUS_META = {
  requested: {label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: 'pi-clock'},
  confirmed: {label: 'Validée', color: '#10B981', bg: '#D1FAE5', icon: 'pi-check-circle'},
  in_progress: {label: 'En cours', color: '#3B82F6', bg: '#DBEAFE', icon: 'pi-play-circle'},
  completed: {label: 'Terminée', color: '#64748B', bg: '#F1F5F9', icon: 'pi-flag-fill'},
  rejected: {label: 'Refusée', color: '#EF4444', bg: '#FEE2E2', icon: 'pi-times-circle'},
  cancelled: {label: 'Annulée', color: '#94A3B8', bg: '#F1F5F9', icon: 'pi-ban'},
}

const fmtDate = (iso) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})
  } catch { return '-' }
}
const fmtDateTime = (iso) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})
  } catch { return '-' }
}

// ──────────────────────────────────────────────────────────────
// ReservationModule
// ──────────────────────────────────────────────────────────────
const ReservationModule = () => {
  const dispatch = useDispatch()
  const engines = useSelector(getEngines) || []
  const [staffs, setStaffs] = useState([])

  const [tab, setTab] = useState('planning') // planning | list | pending
  const [view, setView] = useState('week') // day | week | month
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [reservations, setReservations] = useState([])
  const [kpis, setKpis] = useState({total: 0, active: 0, today: 0, pending: 0, overdue: 0})
  const [loading, setLoading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedRes, setSelectedRes] = useState(null)

  const [filterStatus, setFilterStatus] = useState(null)
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState(null)
  const [filterSite, setFilterSite] = useState(null)

  const toastRef = React.useRef(null)
  const wsRef = useRef(null)

  // ── Load engines (Redux) + staffs (direct API) ──
  useEffect(() => {
    if (!engines || engines.length === 0) dispatch(fetchEngines())
    ;(async () => {
      try {
        const res = await _fetchStaffs({})
        const list = res?.result || res?.data || res?.staffs || []
        setStaffs(Array.isArray(list) ? list : [])
      } catch (_) { /* ignore */ }
    })()
  }, [dispatch]) // eslint-disable-line

  // ── Load KPIs + reservations ──
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [kpiRes, resRes] = await Promise.all([
        fetch(`${API}/reservations/kpis`).then((r) => r.json()).catch(() => ({})),
        fetch(`${API}/reservations`).then((r) => r.json()).catch(() => []),
      ])
      setKpis(kpiRes || {})
      setReservations(Array.isArray(resRes) ? resRes : [])
    } catch (e) {
      console.error('[Reservations] load error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── WebSocket: live refresh on reservation events + desktop notifications ──
  useEffect(() => {
    // Request notification permission once (async, non-blocking)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (!WS_URL || WS_URL.indexOf('ws') !== 0) return
    let reconnectTimer = null
    const pushDesktop = (title, body, level) => {
      try {
        if (!('Notification' in window) || Notification.permission !== 'granted') return
        const n = new Notification(title, {
          body, icon: '/favicon.ico', tag: 'logitag-reservation', badge: '/favicon.ico',
          silent: level === 'info',
        })
        setTimeout(() => { try { n.close() } catch {} }, 6000)
      } catch {}
    }
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws
        ws.onopen = () => { /* connected */ }
        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data)
            if (!msg || !msg.type) return
            const t = msg.type
            const relevant = [
              'reservation_created', 'reservation_moved', 'reservation_cancelled',
              'reservation_checkout', 'reservation_checkin',
            ]
            if (relevant.includes(t)) {
              loadData()
              const summary = {
                reservation_created: 'Nouvelle réservation',
                reservation_moved: 'Réservation déplacée',
                reservation_cancelled: 'Réservation annulée',
                reservation_checkout: 'Check-out effectué',
                reservation_checkin: 'Check-in effectué',
              }[t] || 'Mise à jour'
              const assetName = msg.data?.asset_name || msg.data?.id?.slice(0, 8) || ''
              toastRef.current?.show({severity: 'info', summary, detail: assetName, life: 3000})
              // Desktop push notif for CRITICAL events only
              const critical = ['reservation_cancelled', 'reservation_created']
              if (critical.includes(t)) {
                const level = t === 'reservation_cancelled' ? 'warn' : 'info'
                pushDesktop(`Logitag · ${summary}`, assetName || 'Nouvel événement', level)
              }
            }
          } catch {}
        }
        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 4000)
        }
        ws.onerror = () => { try { ws.close() } catch {} }
      } catch (e) {
        reconnectTimer = setTimeout(connect, 5000)
      }
    }
    connect()
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      try { wsRef.current?.close() } catch {}
    }
  }, [loadData])

  // ── Date helpers for planning ──
  const dateRange = useMemo(() => {
    const d = new Date(anchorDate)
    d.setHours(0, 0, 0, 0)
    if (view === 'day') {
      return {start: d, end: new Date(d.getTime() + 24 * 3600 * 1000), unit: 'hour', count: 24}
    }
    if (view === 'week') {
      const day = d.getDay() || 7
      const monday = new Date(d.getTime() - (day - 1) * 24 * 3600 * 1000)
      return {start: monday, end: new Date(monday.getTime() + 7 * 24 * 3600 * 1000), unit: 'day', count: 7}
    }
    // month
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return {start: firstDay, end: new Date(lastDay.getTime() + 24 * 3600 * 1000), unit: 'day', count: lastDay.getDate()}
  }, [anchorDate, view])

  const shiftAnchor = (delta) => {
    const d = new Date(anchorDate)
    if (view === 'day') d.setDate(d.getDate() + delta)
    else if (view === 'week') d.setDate(d.getDate() + delta * 7)
    else d.setMonth(d.getMonth() + delta)
    setAnchorDate(d)
  }

  // ── Distinct user/site values found in reservations (for filters) ──
  const userOptions = useMemo(() => {
    const set = new Set()
    reservations.forEach((r) => { if (r.user_name) set.add(r.user_name) })
    return [{label: 'Tous les utilisateurs', value: null}, ...Array.from(set).sort().map((v) => ({label: v, value: v}))]
  }, [reservations])
  const siteOptions = useMemo(() => {
    const set = new Set()
    reservations.forEach((r) => { if (r.site) set.add(r.site) })
    return [{label: 'Tous les sites', value: null}, ...Array.from(set).sort().map((v) => ({label: v, value: v}))]
  }, [reservations])

  // ── Filtered lists ──
  const filteredReservations = useMemo(() => {
    let arr = reservations
    if (filterStatus) arr = arr.filter((r) => r.status === filterStatus)
    if (filterUser) arr = arr.filter((r) => r.user_name === filterUser)
    if (filterSite) arr = arr.filter((r) => r.site === filterSite)
    if (search) {
      const s = search.toLowerCase()
      arr = arr.filter((r) =>
        (r.asset_name || '').toLowerCase().includes(s) ||
        (r.user_name || '').toLowerCase().includes(s) ||
        (r.site || '').toLowerCase().includes(s) ||
        (r.project || '').toLowerCase().includes(s)
      )
    }
    return arr
  }, [reservations, filterStatus, filterUser, filterSite, search])

  const pendingReservations = useMemo(
    () => reservations.filter((r) => r.status === 'requested'),
    [reservations]
  )

  // Assets shown in Gantt: derive from FILTERED reservations
  const ganttAssets = useMemo(() => {
    const inRange = filteredReservations.filter((r) => {
      const s = new Date(r.start_date).getTime()
      const e = new Date(r.end_date).getTime()
      return s < dateRange.end.getTime() && e > dateRange.start.getTime()
    })
    const assetMap = new Map()
    inRange.forEach((r) => {
      if (!assetMap.has(r.asset_id)) {
        assetMap.set(r.asset_id, {id: r.asset_id, name: r.asset_name, reservations: []})
      }
      assetMap.get(r.asset_id).reservations.push(r)
    })
    return Array.from(assetMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [filteredReservations, dateRange])

  // ── Actions ──
  const showToast = (severity, summary, detail) => {
    toastRef.current?.show({severity, summary, detail, life: 3500})
  }

  const onCreate = () => {
    setEditing({
      asset_id: '', asset_name: '', user_name: '', project: '', site: '', note: '',
      priority: 'normal', status: 'requested',
      start_date: new Date(),
      end_date: new Date(Date.now() + 24 * 3600 * 1000),
    })
    setShowForm(true)
  }

  const saveReservation = async (payload) => {
    try {
      const body = {
        ...payload,
        start_date: new Date(payload.start_date).toISOString(),
        end_date: new Date(payload.end_date).toISOString(),
      }
      const isEdit = !!payload.id
      const url = isEdit ? `${API}/reservations/${payload.id}` : `${API}/reservations`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({detail: 'Erreur inconnue'}))
        throw new Error(err.detail || 'Erreur de sauvegarde')
      }
      showToast('success', isEdit ? 'Réservation modifiée' : 'Réservation créée',
        `${payload.asset_name} · ${fmtDate(body.start_date)} → ${fmtDate(body.end_date)}`)
      setShowForm(false); setEditing(null)
      loadData()
    } catch (e) {
      showToast('error', 'Impossible de sauvegarder', e.message || String(e))
    }
  }

  const doAction = async (url, method, okMsg, body) => {
    try {
      const res = await fetch(url, {
        method, headers: {'Content-Type': 'application/json'},
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Action impossible')
      }
      showToast('success', okMsg, '')
      setSelectedRes(null)
      loadData()
    } catch (e) {
      showToast('error', 'Erreur', e.message || String(e))
    }
  }

  const approveRes = (r) => doAction(`${API}/reservations/${r.id}/approve`, 'POST', 'Réservation validée')

  // ── Drag & drop on Gantt: move a reservation in time ──
  const dragReservation = async (reservation, deltaMs) => {
    try {
      const newStart = new Date(new Date(reservation.start_date).getTime() + deltaMs).toISOString()
      const newEnd = new Date(new Date(reservation.end_date).getTime() + deltaMs).toISOString()
      const res = await fetch(`${API}/reservations/${reservation.id}/drag`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({start_date: newStart, end_date: newEnd}),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Déplacement impossible')
      }
      showToast('success', 'Réservation déplacée',
        `${reservation.asset_name} · ${fmtDate(newStart)} → ${fmtDate(newEnd)}`)
      loadData()
    } catch (e) {
      showToast('error', 'Déplacement refusé', e.message || String(e))
      loadData()
    }
  }

  // ── Resize (left or right edge): keep the opposite edge fixed, update dates ──
  const resizeReservation = async (reservation, edge, deltaMs) => {
    try {
      let newStart = reservation.start_date
      let newEnd = reservation.end_date
      if (edge === 'left') {
        newStart = new Date(new Date(reservation.start_date).getTime() + deltaMs).toISOString()
      } else {
        newEnd = new Date(new Date(reservation.end_date).getTime() + deltaMs).toISOString()
      }
      // Guard: ensure start < end with at least 30 min
      if (new Date(newEnd).getTime() - new Date(newStart).getTime() < 30 * 60 * 1000) {
        showToast('warn', 'Durée minimale', 'La réservation doit durer au moins 30 minutes.')
        return
      }
      const res = await fetch(`${API}/reservations/${reservation.id}/drag`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({start_date: newStart, end_date: newEnd}),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Redimensionnement impossible')
      }
      showToast('success', 'Réservation redimensionnée',
        `${reservation.asset_name} · ${fmtDate(newStart)} → ${fmtDate(newEnd)}`)
      loadData()
    } catch (e) {
      showToast('error', 'Redimensionnement refusé', e.message || String(e))
      loadData()
    }
  }
  const exportCsv = async () => {
    try {
      const url = filterStatus
        ? `${API}/reservations/export/csv?status=${encodeURIComponent(filterStatus)}`
        : `${API}/reservations/export/csv`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Export impossible')
      const blob = await res.blob()
      const a = document.createElement('a')
      const href = URL.createObjectURL(blob)
      a.href = href
      a.download = `reservations_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(href)
      showToast('success', 'Export lancé', 'Téléchargement CSV en cours…')
    } catch (e) {
      showToast('error', 'Erreur export', e.message || String(e))
    }
  }
  const rejectRes = (r) => confirmDialog({
    message: `Refuser la réservation de ${r.asset_name} ?`, header: 'Confirmer', icon: 'pi pi-times-circle',
    acceptLabel: 'Refuser', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
    accept: () => doAction(`${API}/reservations/${r.id}/reject`, 'POST', 'Réservation refusée'),
  })
  const cancelRes = (r) => confirmDialog({
    message: `Annuler la réservation de ${r.asset_name} ?`, header: 'Confirmer', icon: 'pi pi-ban',
    acceptLabel: "Oui, annuler", rejectLabel: 'Non',
    accept: () => doAction(`${API}/reservations/${r.id}/cancel`, 'POST', 'Réservation annulée'),
  })
  const checkoutRes = (r) => doAction(`${API}/reservations/${r.id}/checkout`, 'POST', 'Check-out effectué',
    {user_name: r.user_name || 'Opérateur', condition: 'good'})
  const checkinRes = (r) => doAction(`${API}/reservations/${r.id}/checkin`, 'POST', 'Check-in effectué',
    {user_name: r.user_name || 'Opérateur', condition: 'good'})

  // ── Render ──
  return (
    <div className='lt-res-page' data-testid='reservation-page'>
      <Toast ref={toastRef} />
      <ConfirmDialog />

      {/* ── Header ── */}
      <div className='lt-res-header'>
        <div className='lt-res-header-left'>
          <div className='lt-res-title-block'>
            <h1 className='lt-res-title'><i className='pi pi-calendar'></i> Réservations</h1>
            <p className='lt-res-subtitle'>Planifiez et suivez l'utilisation de vos engins en temps réel.</p>
          </div>
        </div>
        <div className='lt-res-header-right'>
          <Button
            label='Exporter CSV' icon='pi pi-download'
            className='lt-res-btn-secondary' onClick={exportCsv}
            data-testid='reservation-export-btn'
          />
          <Button
            label='Nouvelle réservation' icon='pi pi-plus'
            className='lt-res-btn-primary' onClick={onCreate}
            data-testid='reservation-new-btn'
          />
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className='lt-res-kpis'>
        <ReservationKpi icon='pi-clock' label="En attente" value={kpis.requested || pendingReservations.length} color='#F59E0B' bg='#FEF3C7'
          active={filterStatus === 'requested'} onClick={() => {setTab('list'); setFilterStatus('requested')}} />
        <ReservationKpi icon='pi-check-circle' label='Validées' value={kpis.confirmed || 0} color='#10B981' bg='#D1FAE5'
          active={filterStatus === 'confirmed'} onClick={() => {setTab('list'); setFilterStatus('confirmed')}} />
        <ReservationKpi icon='pi-play-circle' label='En cours' value={kpis.active || 0} color='#3B82F6' bg='#DBEAFE'
          active={filterStatus === 'in_progress'} onClick={() => {setTab('list'); setFilterStatus('in_progress')}} />
        <ReservationKpi icon='pi-calendar-minus' label="Aujourd'hui" value={kpis.today || 0} color='#6366F1' bg='#E0E7FF' />
        <ReservationKpi icon='pi-exclamation-triangle' label='En retard' value={kpis.overdue || 0} color='#EF4444' bg='#FEE2E2'
          active={filterStatus === 'overdue'} onClick={() => setTab('list')} />
        <ReservationKpi icon='pi-flag-fill' label='Terminées' value={kpis.completed || 0} color='#64748B' bg='#F1F5F9'
          active={filterStatus === 'completed'} onClick={() => {setTab('list'); setFilterStatus('completed')}} />
      </div>

      {/* ── Tabs ── */}
      <div className='lt-res-tabs'>
        <button className={`lt-res-tab ${tab === 'planning' ? 'is-active' : ''}`} onClick={() => setTab('planning')} data-testid='reservation-tab-planning'>
          <i className='pi pi-calendar'></i> Planning
        </button>
        <button className={`lt-res-tab ${tab === 'list' ? 'is-active' : ''}`} onClick={() => setTab('list')} data-testid='reservation-tab-list'>
          <i className='pi pi-list'></i> Liste
          {reservations.length > 0 && <span className='lt-res-tab-badge'>{reservations.length}</span>}
        </button>
        <button className={`lt-res-tab ${tab === 'pending' ? 'is-active' : ''}`} onClick={() => setTab('pending')} data-testid='reservation-tab-pending'>
          <i className='pi pi-clock'></i> À valider
          {pendingReservations.length > 0 && <span className='lt-res-tab-badge lt-res-tab-badge-warn'>{pendingReservations.length}</span>}
        </button>
      </div>

      {/* ── Content ── */}
      {tab === 'planning' && (
        <PlanningView
          assets={ganttAssets}
          view={view} setView={setView}
          anchorDate={anchorDate} shiftAnchor={shiftAnchor} setAnchorDate={setAnchorDate}
          dateRange={dateRange}
          onSelect={setSelectedRes}
          onDrag={dragReservation}
          onResize={resizeReservation}
          userOptions={userOptions} siteOptions={siteOptions}
          filterUser={filterUser} setFilterUser={setFilterUser}
          filterSite={filterSite} setFilterSite={setFilterSite}
          loading={loading}
        />
      )}

      {tab === 'list' && (
        <ListView
          reservations={filteredReservations}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          search={search} setSearch={setSearch}
          onSelect={setSelectedRes}
          onApprove={approveRes} onReject={rejectRes} onCancel={cancelRes}
          onCheckout={checkoutRes} onCheckin={checkinRes}
        />
      )}

      {tab === 'pending' && (
        <ListView
          reservations={pendingReservations}
          filterStatus={null} setFilterStatus={() => {}}
          search={search} setSearch={setSearch}
          onSelect={setSelectedRes}
          onApprove={approveRes} onReject={rejectRes} onCancel={cancelRes}
          onCheckout={checkoutRes} onCheckin={checkinRes}
          emptyText='Aucune réservation en attente de validation.'
        />
      )}

      {/* ── Form Dialog ── */}
      {showForm && editing && (
        <ReservationForm
          initial={editing} engines={engines} staffs={staffs}
          onClose={() => {setShowForm(false); setEditing(null)}}
          onSave={saveReservation}
        />
      )}

      {/* ── Detail Drawer ── */}
      {selectedRes && (
        <ReservationDrawer
          reservation={selectedRes} onClose={() => setSelectedRes(null)}
          onApprove={approveRes} onReject={rejectRes} onCancel={cancelRes}
          onCheckout={checkoutRes} onCheckin={checkinRes}
          onEdit={(r) => {setEditing(r); setSelectedRes(null); setShowForm(true)}}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// KPI Card
// ══════════════════════════════════════════════════════════════
const ReservationKpi = ({icon, label, value, color, bg, active, onClick}) => (
  <button
    className={`lt-res-kpi ${active ? 'is-active' : ''} ${onClick ? 'is-clickable' : ''}`}
    onClick={onClick} disabled={!onClick}
    data-testid={`reservation-kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <span className='lt-res-kpi-ico' style={{background: bg, color}}><i className={`pi ${icon}`}></i></span>
    <span className='lt-res-kpi-body'>
      <span className='lt-res-kpi-val'>{value}</span>
      <span className='lt-res-kpi-lbl'>{label}</span>
    </span>
  </button>
)

// ══════════════════════════════════════════════════════════════
// Planning View (Gantt)
// ══════════════════════════════════════════════════════════════
const PlanningView = ({
  assets, view, setView, anchorDate, shiftAnchor, setAnchorDate, dateRange,
  onSelect, onDrag, onResize,
  userOptions, siteOptions, filterUser, setFilterUser, filterSite, setFilterSite,
  loading,
}) => {
  const rangeMs = dateRange.end.getTime() - dateRange.start.getTime()
  const [drag, setDrag] = useState(null) // { id, reservation, mode: 'move' | 'resize-left' | 'resize-right', startX, dxPx, trackWidth, isDragging }
  const justDraggedRef = useRef(false)

  const startDrag = (e, r, trackEl, mode = 'move') => {
    // Only left-click
    if (e.button !== 0) return
    if (mode === 'move' && !onDrag) return
    if (mode !== 'move' && !onResize) return
    const trackRect = trackEl.getBoundingClientRect()
    setDrag({id: r.id, reservation: r, mode, startX: e.clientX, dxPx: 0, trackWidth: trackRect.width, isDragging: false})
    e.stopPropagation()
    e.preventDefault()
  }
  useEffect(() => {
    if (!drag) return
    const onMove = (e) => {
      const dx = e.clientX - drag.startX
      if (!drag.isDragging && Math.abs(dx) < 4) return
      setDrag((p) => p ? {...p, dxPx: dx, isDragging: true} : null)
    }
    const onUp = () => {
      if (drag.isDragging && Math.abs(drag.dxPx) > 4) {
        const deltaMs = (drag.dxPx / drag.trackWidth) * rangeMs
        const slot = dateRange.unit === 'hour' ? 3600 * 1000 : 24 * 3600 * 1000
        const snapped = Math.round(deltaMs / slot) * slot
        if (snapped !== 0) {
          if (drag.mode === 'move') onDrag(drag.reservation, snapped)
          else if (drag.mode === 'resize-left') onResize(drag.reservation, 'left', snapped)
          else if (drag.mode === 'resize-right') onResize(drag.reservation, 'right', snapped)
        }
        justDraggedRef.current = true
        setTimeout(() => { justDraggedRef.current = false }, 120)
      }
      setDrag(null)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [drag, rangeMs, dateRange.unit, onDrag, onResize])

  const headerLabel = useMemo(() => {
    if (view === 'day') return anchorDate.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})
    if (view === 'month') return anchorDate.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})
    return `${dateRange.start.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})} — ${new Date(dateRange.end.getTime() - 1).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}`
  }, [view, anchorDate, dateRange])

  // Build column headers
  const columns = useMemo(() => {
    const cols = []
    for (let i = 0; i < dateRange.count; i++) {
      const d = new Date(dateRange.start.getTime() + i * (dateRange.unit === 'hour' ? 3600 * 1000 : 24 * 3600 * 1000))
      let label = ''
      let sublabel = ''
      if (dateRange.unit === 'hour') {
        label = `${d.getHours().toString().padStart(2, '0')}h`
      } else {
        label = d.toLocaleDateString('fr-FR', {weekday: 'short'}).slice(0, 3)
        sublabel = d.getDate().toString()
      }
      const isToday = new Date().toDateString() === d.toDateString()
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      cols.push({label, sublabel, isToday, isWeekend})
    }
    return cols
  }, [dateRange])

  return (
    <div className='lt-res-panel' data-testid='reservation-planning-view'>
      <div className='lt-res-planning-toolbar'>
        <div className='lt-res-planning-nav'>
          <Button icon='pi pi-chevron-left' className='lt-res-nav-btn' onClick={() => shiftAnchor(-1)} />
          <button className='lt-res-today-btn' onClick={() => setAnchorDate(new Date())}>
            Aujourd'hui
          </button>
          <Button icon='pi pi-chevron-right' className='lt-res-nav-btn' onClick={() => shiftAnchor(1)} />
          <span className='lt-res-planning-label'>{headerLabel}</span>
        </div>
        <div className='lt-res-planning-filters'>
          <Dropdown
            value={filterUser} options={userOptions}
            onChange={(e) => setFilterUser(e.value)}
            placeholder='Utilisateur' showClear
            className='lt-res-planning-filter' filter
            data-testid='planning-filter-user'
          />
          <Dropdown
            value={filterSite} options={siteOptions}
            onChange={(e) => setFilterSite(e.value)}
            placeholder='Site' showClear
            className='lt-res-planning-filter' filter
            data-testid='planning-filter-site'
          />
        </div>
        <div className='lt-res-view-switch'>
          {['day', 'week', 'month'].map((v) => (
            <button key={v}
              className={`lt-res-view-btn ${view === v ? 'is-active' : ''}`}
              onClick={() => setView(v)} data-testid={`reservation-view-${v}`}>
              {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      <div className='lt-res-gantt'>
        <div className='lt-res-gantt-head'>
          <div className='lt-res-gantt-rowhead'>Engin</div>
          <div className='lt-res-gantt-cols' style={{gridTemplateColumns: `repeat(${dateRange.count}, 1fr)`}}>
            {columns.map((c, i) => (
              <div key={i} className={`lt-res-gantt-col ${c.isToday ? 'is-today' : ''} ${c.isWeekend ? 'is-weekend' : ''}`}>
                <div className='lt-res-gantt-col-lbl'>{c.label}</div>
                {c.sublabel && <div className='lt-res-gantt-col-sub'>{c.sublabel}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className='lt-res-gantt-body'>
          {assets.length === 0 && !loading && (
            <div className='lt-res-gantt-empty'>
              <i className='pi pi-calendar-times'></i>
              <div className='lt-res-gantt-empty-title'>Aucune réservation sur cette période</div>
              <div className='lt-res-gantt-empty-sub'>Cliquez sur "Nouvelle réservation" pour démarrer.</div>
            </div>
          )}
          {assets.map((asset) => (
            <div key={asset.id} className='lt-res-gantt-row'>
              <div className='lt-res-gantt-rowlabel'>
                <span className='lt-res-gantt-ico'><i className='pi pi-truck'></i></span>
                <span className='lt-res-gantt-rowname'>{asset.name || asset.id.slice(0, 8)}</span>
              </div>
              <div className='lt-res-gantt-track' ref={(el) => { if (el) asset._trackEl = el }}>
                {asset.reservations.map((r) => {
                  const s = new Date(r.start_date).getTime()
                  const e = new Date(r.end_date).getTime()
                  const clampStart = Math.max(s, dateRange.start.getTime())
                  const clampEnd = Math.min(e, dateRange.end.getTime())
                  if (clampEnd <= dateRange.start.getTime() || clampStart >= dateRange.end.getTime()) return null
                  const left = ((clampStart - dateRange.start.getTime()) / rangeMs) * 100
                  const width = ((clampEnd - clampStart) / rangeMs) * 100
                  const meta = STATUS_META[r.status] || STATUS_META.confirmed
                  const isDragging = drag?.id === r.id && drag.isDragging
                  const canDrag = !['completed', 'cancelled', 'rejected'].includes(r.status)
                  // Visual preview during resize: change left/width live
                  let previewLeft = left + (drag?.id === r.id && drag.isDragging && drag.mode === 'move' ? (drag.dxPx / drag.trackWidth) * 100 : 0)
                  let previewWidth = width
                  if (isDragging && drag.mode === 'resize-left') {
                    const pct = (drag.dxPx / drag.trackWidth) * 100
                    previewLeft = left + pct
                    previewWidth = Math.max(1, width - pct)
                  } else if (isDragging && drag.mode === 'resize-right') {
                    previewWidth = Math.max(1, width + (drag.dxPx / drag.trackWidth) * 100)
                  }
                  return (
                    <div
                      key={r.id}
                      className={`lt-res-gantt-bar ${isDragging ? 'is-dragging' : ''} ${canDrag ? 'is-draggable' : ''}`}
                      style={{
                        left: `${previewLeft}%`, width: `${previewWidth}%`,
                        background: meta.bg, borderColor: meta.color, color: meta.color,
                        cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                      }}
                      onClick={(ev) => { if (justDraggedRef.current || isDragging) { ev.preventDefault(); return; } onSelect(r) }}
                      onMouseDown={(ev) => canDrag && startDrag(ev, r, asset._trackEl, 'move')}
                      data-testid={`reservation-bar-${r.id}`}
                      title={`${r.asset_name} · ${fmtDateTime(r.start_date)} → ${fmtDateTime(r.end_date)} · ${r.user_name || 'N/A'}${canDrag ? ' · (glisser pour déplacer, bords pour redimensionner)' : ''}`}
                    >
                      {canDrag && (
                        <span
                          className='lt-res-gantt-handle lt-res-gantt-handle-l'
                          onMouseDown={(ev) => { ev.stopPropagation(); startDrag(ev, r, asset._trackEl, 'resize-left') }}
                          title='Changer la date de début'
                          data-testid={`reservation-handle-left-${r.id}`}
                        />
                      )}
                      <i className={`pi ${meta.icon}`} style={{fontSize: '0.68rem'}}></i>
                      <span className='lt-res-gantt-bar-lbl'>{r.user_name || r.project || meta.label}</span>
                      {canDrag && (
                        <span
                          className='lt-res-gantt-handle lt-res-gantt-handle-r'
                          onMouseDown={(ev) => { ev.stopPropagation(); startDrag(ev, r, asset._trackEl, 'resize-right') }}
                          title='Changer la date de fin'
                          data-testid={`reservation-handle-right-${r.id}`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// List View
// ══════════════════════════════════════════════════════════════
const ListView = ({reservations, filterStatus, setFilterStatus, search, setSearch, onSelect, onApprove, onReject, onCancel, onCheckout, onCheckin, emptyText}) => {
  const statusOptions = [
    {label: 'Tous', value: null},
    ...Object.entries(STATUS_META).map(([k, v]) => ({label: v.label, value: k})),
  ]

  return (
    <div className='lt-res-panel' data-testid='reservation-list-view'>
      <div className='lt-res-list-toolbar'>
        <span className='p-input-icon-left' style={{flex: 1}}>
          <i className='pi pi-search'></i>
          <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Rechercher engin, utilisateur, site…' style={{width: '100%', minWidth: 280}} />
        </span>
        <Dropdown value={filterStatus} options={statusOptions} onChange={(e) => setFilterStatus(e.value)} placeholder='Statut' className='lt-res-list-dropdown' />
      </div>

      <div className='lt-res-table'>
        <div className='lt-res-table-head'>
          <div>Engin</div>
          <div>Utilisateur</div>
          <div>Site / Projet</div>
          <div>Période</div>
          <div>Statut</div>
          <div style={{textAlign: 'right'}}>Actions</div>
        </div>

        {reservations.length === 0 && (
          <div className='lt-res-empty'>
            <i className='pi pi-inbox'></i>
            <div>{emptyText || 'Aucune réservation trouvée.'}</div>
          </div>
        )}

        {reservations.map((r) => {
          const meta = STATUS_META[r.status] || STATUS_META.confirmed
          return (
            <div key={r.id} className='lt-res-table-row' onClick={() => onSelect(r)} data-testid={`reservation-row-${r.id}`}>
              <div className='lt-res-table-cell'>
                <div className='lt-res-asset-cell'>
                  <span className='lt-res-asset-ico'><i className='pi pi-truck'></i></span>
                  <div><div className='lt-res-asset-name'>{r.asset_name}</div>
                    <div className='lt-res-asset-sub'>#{r.id?.slice(0, 8)}</div></div>
                </div>
              </div>
              <div className='lt-res-table-cell'>{r.user_name || <span style={{color: '#94A3B8'}}>—</span>}</div>
              <div className='lt-res-table-cell'>
                {r.site && <div style={{fontWeight: 600}}>{r.site}</div>}
                {r.project && <div style={{fontSize: '0.72rem', color: '#64748B'}}>{r.project}</div>}
                {!r.site && !r.project && <span style={{color: '#94A3B8'}}>—</span>}
              </div>
              <div className='lt-res-table-cell'>
                <div style={{fontSize: '0.78rem'}}>{fmtDateTime(r.start_date)}</div>
                <div style={{fontSize: '0.72rem', color: '#64748B'}}>→ {fmtDateTime(r.end_date)}</div>
              </div>
              <div className='lt-res-table-cell'>
                <span className='lt-res-chip' style={{background: meta.bg, color: meta.color}}>
                  <i className={`pi ${meta.icon}`}></i> {meta.label}
                </span>
              </div>
              <div className='lt-res-table-cell' style={{textAlign: 'right'}} onClick={(e) => e.stopPropagation()}>
                {r.status === 'requested' && (
                  <>
                    <Button icon='pi pi-check' className='lt-res-act-btn lt-res-act-approve' tooltip='Valider' onClick={() => onApprove(r)} />
                    <Button icon='pi pi-times' className='lt-res-act-btn lt-res-act-reject' tooltip='Refuser' onClick={() => onReject(r)} />
                  </>
                )}
                {r.status === 'confirmed' && (
                  <Button icon='pi pi-play' className='lt-res-act-btn lt-res-act-primary' tooltip='Check-out' onClick={() => onCheckout(r)} />
                )}
                {r.status === 'in_progress' && (
                  <Button icon='pi pi-check-circle' className='lt-res-act-btn lt-res-act-primary' tooltip='Check-in' onClick={() => onCheckin(r)} />
                )}
                {['requested', 'confirmed'].includes(r.status) && (
                  <Button icon='pi pi-ban' className='lt-res-act-btn lt-res-act-cancel' tooltip='Annuler' onClick={() => onCancel(r)} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Form Dialog — Create / Edit
// ══════════════════════════════════════════════════════════════
const ReservationForm = ({initial, engines, staffs, onClose, onSave}) => {
  const [form, setForm] = useState(initial)
  const [availability, setAvailability] = useState(null) // null | 'checking' | 'available' | 'conflict'
  const [availabilityMsg, setAvailabilityMsg] = useState('')

  const set = (k, v) => setForm((p) => ({...p, [k]: v}))

  // Engine options (normalize)
  const engineOptions = (engines || []).map((e) => ({
    label: `${e.reference || e.nom || e.id}${e.etatenginname ? ' · ' + e.etatenginname : ''}`,
    value: e.id,
    raw: e,
  }))

  // Staff options — built from staffs API, supports prénom+nom+rôle, avatar, email
  const staffOptions = useMemo(() => {
    const list = Array.isArray(staffs) ? staffs : []
    const byName = new Map()
    list.forEach((s) => {
      const first = (s?.firstname || s?.firstName || '').trim()
      const last = (s?.lastname || s?.lastName || '').trim()
      const combo = [first, last].filter(Boolean).join(' ').trim()
      const name = combo || s?.name || s?.fullname || s?.login || s?.username || s?.email
      const role = s?.famille || s?.role || s?.typeName || ''
      const email = s?.addrMail || s?.email || s?.login || ''
      const active = s?.active === 1 || s?.active === true || s?.active === '1'
      if (name && !byName.has(name)) {
        byName.set(name, {label: name, value: name, raw: s, role, email, image: s?.image, active})
      }
    })
    const arr = Array.from(byName.values())
      // Active users first, then alphabetical
      .sort((a, b) => (b.active === a.active ? a.label.localeCompare(b.label) : (b.active ? 1 : -1)))
    // Ensure current value present
    if (initial?.user_name && !byName.has(initial.user_name)) {
      arr.unshift({label: initial.user_name, value: initial.user_name})
    }
    return arr
  }, [staffs, initial])

  const staffItemTemplate = (opt) => {
    if (!opt) return null
    const initials = (opt.label || '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
    return (
      <div className='lt-res-staff-opt'>
        <span className={`lt-res-staff-av ${opt.active ? '' : 'is-inactive'}`}>{initials}</span>
        <div className='lt-res-staff-txt'>
          <span className='lt-res-staff-name'>{opt.label}</span>
          {(opt.role || opt.email) && (
            <span className='lt-res-staff-sub'>
              {opt.role && <span className='lt-res-staff-role'>{opt.role}</span>}
              {opt.role && opt.email && <span className='lt-res-staff-sep'>·</span>}
              {opt.email && <span className='lt-res-staff-mail'>{opt.email}</span>}
            </span>
          )}
        </div>
        {!opt.active && opt.active !== undefined && (
          <span className='lt-res-staff-badge-off'>Inactif</span>
        )}
      </div>
    )
  }

  // Check availability whenever key fields change
  useEffect(() => {
    if (!form.asset_id || !form.start_date || !form.end_date) {setAvailability(null); return}
    let cancelled = false
    setAvailability('checking')
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const s = new Date(form.start_date).toISOString()
        const e = new Date(form.end_date).toISOString()
        const r = await fetch(
          `${API}/reservations/availability/${encodeURIComponent(form.asset_id)}?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`,
          {signal: controller.signal}
        )
        const data = await r.json()
        if (cancelled) return
        if (data.available) {setAvailability('available'); setAvailabilityMsg('Engin disponible sur cette période.')}
        else if (data.maintenance) {setAvailability('conflict'); setAvailabilityMsg('Engin en maintenance sur cette période.')}
        else if (data.conflict) {setAvailability('conflict'); setAvailabilityMsg(`Conflit avec ${data.conflict.asset_name} (${fmtDate(data.conflict.start_date)} → ${fmtDate(data.conflict.end_date)}).`)}
        else {setAvailability('available'); setAvailabilityMsg('Disponible.')}
      } catch (_) { /* ignore */ }
    }, 350)
    return () => {cancelled = true; clearTimeout(t); controller.abort()}
  }, [form.asset_id, form.start_date, form.end_date])

  const onAssetChange = (v) => {
    const raw = engineOptions.find((o) => o.value === v)?.raw
    set('asset_id', v)
    set('asset_name', raw?.reference || raw?.nom || '')
  }

  const canSave = !!form.asset_id && !!form.start_date && !!form.end_date &&
    new Date(form.end_date) > new Date(form.start_date) && availability !== 'conflict'

  return (
    <Dialog
      visible onHide={onClose}
      header={form.id ? 'Modifier la réservation' : 'Nouvelle réservation'}
      style={{width: '640px', maxWidth: '95vw'}}
      className='lt-res-dialog'
      data-testid='reservation-form-dialog'
      footer={
        <div className='lt-res-form-footer'>
          <Button label='Annuler' className='p-button-text' onClick={onClose} />
          <Button label={form.id ? 'Enregistrer' : 'Créer'} icon='pi pi-check'
            className='lt-res-btn-primary' disabled={!canSave} onClick={() => onSave(form)}
            data-testid='reservation-form-save'
          />
        </div>
      }
    >
      <div className='lt-res-form'>
        <div className='lt-res-form-field'>
          <label>Engin *</label>
          <Dropdown value={form.asset_id} options={engineOptions} filter
            onChange={(e) => onAssetChange(e.value)}
            placeholder='Sélectionner un engin' className='w-full'
            data-testid='reservation-form-asset'
          />
        </div>

        <div className='lt-res-form-row'>
          <div className='lt-res-form-field'>
            <label>Date et heure de début *</label>
            <Calendar value={form.start_date ? new Date(form.start_date) : null}
              onChange={(e) => set('start_date', e.value)}
              showTime hourFormat='24' dateFormat='dd/mm/yy' showIcon className='w-full'
              data-testid='reservation-form-start' />
          </div>
          <div className='lt-res-form-field'>
            <label>Date et heure de fin *</label>
            <Calendar value={form.end_date ? new Date(form.end_date) : null}
              onChange={(e) => set('end_date', e.value)}
              showTime hourFormat='24' dateFormat='dd/mm/yy' showIcon className='w-full'
              minDate={form.start_date ? new Date(form.start_date) : null}
              data-testid='reservation-form-end' />
          </div>
        </div>

        {availability && (
          <div className={`lt-res-avail lt-res-avail-${availability}`}>
            <i className={`pi ${availability === 'available' ? 'pi-check-circle' : availability === 'conflict' ? 'pi-times-circle' : 'pi-spin pi-spinner'}`}></i>
            <span>{availability === 'checking' ? 'Vérification…' : availabilityMsg}</span>
          </div>
        )}

        <div className='lt-res-form-row'>
          <div className='lt-res-form-field'>
            <label>Utilisateur</label>
            <Dropdown
              value={form.user_name || null} options={staffOptions}
              onChange={(e) => set('user_name', e.value)}
              itemTemplate={staffItemTemplate}
              editable filter showClear
              placeholder='Sélectionner ou saisir…'
              className='w-full lt-res-staff-dropdown' data-testid='reservation-form-user'
              emptyMessage='Aucun utilisateur'
              emptyFilterMessage='Aucun résultat'
            />
          </div>
          <div className='lt-res-form-field'>
            <label>Équipe</label>
            <InputText value={form.team || ''} onChange={(e) => set('team', e.target.value)}
              placeholder='ex: Travaux BTP' className='w-full' />
          </div>
        </div>

        <div className='lt-res-form-row'>
          <div className='lt-res-form-field'>
            <label>Site / Zone</label>
            <InputText value={form.site || ''} onChange={(e) => set('site', e.target.value)}
              placeholder='ex: Chantier Nord' className='w-full' data-testid='reservation-form-site' />
          </div>
          <div className='lt-res-form-field'>
            <label>Projet</label>
            <InputText value={form.project || ''} onChange={(e) => set('project', e.target.value)}
              placeholder='ex: Projet Marina' className='w-full' />
          </div>
        </div>

        <div className='lt-res-form-field'>
          <label>Priorité</label>
          <Dropdown value={form.priority} options={[
            {label: 'Normale', value: 'normal'}, {label: 'Haute', value: 'high'}, {label: 'Urgente', value: 'urgent'},
          ]} onChange={(e) => set('priority', e.value)} className='w-full' />
        </div>

        <div className='lt-res-form-field'>
          <label>Commentaire</label>
          <InputTextarea value={form.note || ''} onChange={(e) => set('note', e.target.value)}
            rows={2} className='w-full' placeholder='Informations complémentaires…' />
        </div>
      </div>
    </Dialog>
  )
}

// ══════════════════════════════════════════════════════════════
// Detail Drawer
// ══════════════════════════════════════════════════════════════
const ReservationDrawer = ({reservation, onClose, onApprove, onReject, onCancel, onCheckout, onCheckin, onEdit}) => {
  const r = reservation
  const meta = STATUS_META[r.status] || STATUS_META.confirmed
  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState('info') // info | history

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${API}/reservations/${r.id}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setLogs(Array.isArray(data.logs) ? data.logs : [])
      } catch (_) { /* ignore */ }
    }
    load()
    return () => { cancelled = true }
  }, [r.id])

  const actionMeta = (action) => {
    const map = {
      created: {label: 'Créée', icon: 'pi-plus-circle', color: '#1D4ED8'},
      updated: {label: 'Modifiée', icon: 'pi-pencil', color: '#64748B'},
      moved: {label: 'Déplacée', icon: 'pi-arrows-alt', color: '#8B5CF6'},
      approved: {label: 'Validée', icon: 'pi-check-circle', color: '#10B981'},
      rejected: {label: 'Refusée', icon: 'pi-times-circle', color: '#EF4444'},
      cancelled: {label: 'Annulée', icon: 'pi-ban', color: '#94A3B8'},
      checkout: {label: 'Check-out', icon: 'pi-sign-out', color: '#3B82F6'},
      checkin: {label: 'Check-in', icon: 'pi-sign-in', color: '#10B981'},
    }
    return map[action] || {label: action, icon: 'pi-circle', color: '#64748B'}
  }

  return (
    <div className='lt-res-drawer-ov' onClick={onClose} data-testid='reservation-drawer'>
      <div className='lt-res-drawer' onClick={(e) => e.stopPropagation()}>
        <div className='lt-res-drawer-head'>
          <div className='lt-res-drawer-head-title'>
            <span className='lt-res-drawer-ico' style={{background: meta.bg, color: meta.color}}><i className='pi pi-truck'></i></span>
            <div>
              <h3>{r.asset_name}</h3>
              <div className='lt-res-drawer-sub'>#{r.id?.slice(0, 8)}</div>
            </div>
          </div>
          <button className='lt-res-drawer-close' onClick={onClose}><i className='pi pi-times'></i></button>
        </div>

        <div className='lt-res-drawer-tabs'>
          <button className={`lt-res-drawer-tab ${tab === 'info' ? 'is-active' : ''}`} onClick={() => setTab('info')} data-testid='drawer-tab-info'>
            <i className='pi pi-info-circle'></i> Détails
          </button>
          <button className={`lt-res-drawer-tab ${tab === 'history' ? 'is-active' : ''}`} onClick={() => setTab('history')} data-testid='drawer-tab-history'>
            <i className='pi pi-history'></i> Historique
            {logs.length > 0 && <span className='lt-res-drawer-tab-count'>{logs.length}</span>}
          </button>
        </div>

        <div className='lt-res-drawer-body'>
          {tab === 'info' && (
            <>
              <div className='lt-res-drawer-status' style={{background: meta.bg, color: meta.color}}>
                <i className={`pi ${meta.icon}`}></i>
                <span>{meta.label}</span>
              </div>

              <DrawerRow label='Utilisateur' val={r.user_name || '—'} icon='pi-user' />
              <DrawerRow label='Équipe' val={r.team || '—'} icon='pi-users' />
              <DrawerRow label='Site' val={r.site || '—'} icon='pi-map-marker' />
              <DrawerRow label='Projet' val={r.project || '—'} icon='pi-briefcase' />
              <DrawerRow label='Début' val={fmtDateTime(r.start_date)} icon='pi-calendar' />
              <DrawerRow label='Fin' val={fmtDateTime(r.end_date)} icon='pi-calendar-times' />
              <DrawerRow label='Priorité' val={r.priority || 'normal'} icon='pi-flag' />
              {r.checkout_at && <DrawerRow label='Check-out' val={`${fmtDateTime(r.checkout_at)} par ${r.checkout_by || '-'}`} icon='pi-sign-out' />}
              {r.checkin_at && <DrawerRow label='Check-in' val={`${fmtDateTime(r.checkin_at)} par ${r.checkin_by || '-'}`} icon='pi-sign-in' />}
              {r.note && (
                <div className='lt-res-drawer-note'>
                  <div className='lt-res-drawer-note-label'>Commentaire</div>
                  <div className='lt-res-drawer-note-txt'>{r.note}</div>
                </div>
              )}
            </>
          )}

          {tab === 'history' && (
            <div className='lt-res-timeline' data-testid='drawer-timeline'>
              {logs.length === 0 && (
                <div className='lt-res-timeline-empty'>
                  <i className='pi pi-history'></i>
                  <div>Aucun historique disponible.</div>
                </div>
              )}
              {logs.map((log, idx) => {
                const am = actionMeta(log.action)
                return (
                  <div key={log.id || idx} className='lt-res-timeline-item'>
                    <div className='lt-res-timeline-dot' style={{background: am.color}}>
                      <i className={`pi ${am.icon}`}></i>
                    </div>
                    <div className='lt-res-timeline-body'>
                      <div className='lt-res-timeline-head'>
                        <span className='lt-res-timeline-action' style={{color: am.color}}>{am.label}</span>
                        <span className='lt-res-timeline-time'>{fmtDateTime(log.created_at)}</span>
                      </div>
                      {log.details && <div className='lt-res-timeline-details'>{log.details}</div>}
                      <div className='lt-res-timeline-user'>
                        <i className='pi pi-user' style={{fontSize: '0.62rem'}}></i>
                        {log.user || 'Système'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className='lt-res-drawer-actions'>
          {r.status === 'requested' && (
            <>
              <Button label='Valider' icon='pi pi-check' className='lt-res-act-approve' onClick={() => onApprove(r)} data-testid='reservation-drawer-approve' />
              <Button label='Refuser' icon='pi pi-times' className='lt-res-act-reject' onClick={() => onReject(r)} />
            </>
          )}
          {r.status === 'confirmed' && (
            <Button label='Check-out' icon='pi pi-play' className='lt-res-btn-primary' onClick={() => onCheckout(r)} />
          )}
          {r.status === 'in_progress' && (
            <Button label='Check-in' icon='pi pi-check-circle' className='lt-res-btn-primary' onClick={() => onCheckin(r)} />
          )}
          {['requested', 'confirmed'].includes(r.status) && (
            <Button label='Modifier' icon='pi pi-pencil' className='p-button-text' onClick={() => onEdit(r)} />
          )}
          {['requested', 'confirmed'].includes(r.status) && (
            <Button label='Annuler' icon='pi pi-ban' className='p-button-text p-button-danger' onClick={() => onCancel(r)} />
          )}
        </div>
      </div>
    </div>
  )
}

const DrawerRow = ({label, val, icon}) => (
  <div className='lt-res-drawer-row'>
    <div className='lt-res-drawer-row-lbl'><i className={`pi ${icon}`}></i>{label}</div>
    <div className='lt-res-drawer-row-val'>{val}</div>
  </div>
)

export default ReservationModule
