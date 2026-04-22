/**
 * LOGITAG — Reservations Module
 *
 * All-in-one page: KPIs + Planning (Gantt) + List + Pending Approval
 * Create / Approve / Reject / Cancel / Checkout / Checkin
 *
 * Backend: /api/reservations (FastAPI) — uses REACT_APP_BACKEND_URL
 */
import React, {useEffect, useMemo, useState, useCallback} from 'react'
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

const API = process.env.REACT_APP_BACKEND_URL + '/api'

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

  const toastRef = React.useRef(null)

  // ── Load engines (needed for dropdown and planning rows) ──
  useEffect(() => {
    if (!engines || engines.length === 0) {
      dispatch(fetchEngines())
    }
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

  // ── Filtered lists ──
  const filteredReservations = useMemo(() => {
    let arr = reservations
    if (filterStatus) arr = arr.filter((r) => r.status === filterStatus)
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
  }, [reservations, filterStatus, search])

  const pendingReservations = useMemo(
    () => reservations.filter((r) => r.status === 'requested'),
    [reservations]
  )

  // Assets shown in Gantt: those with at least one reservation in range + always first 20 of fleet
  const ganttAssets = useMemo(() => {
    const inRange = reservations.filter((r) => {
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
  }, [reservations, dateRange])

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
          initial={editing} engines={engines} onClose={() => {setShowForm(false); setEditing(null)}}
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
const PlanningView = ({assets, view, setView, anchorDate, shiftAnchor, setAnchorDate, dateRange, onSelect, loading}) => {
  const rangeMs = dateRange.end.getTime() - dateRange.start.getTime()
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
              <div className='lt-res-gantt-track'>
                {asset.reservations.map((r) => {
                  const s = new Date(r.start_date).getTime()
                  const e = new Date(r.end_date).getTime()
                  const clampStart = Math.max(s, dateRange.start.getTime())
                  const clampEnd = Math.min(e, dateRange.end.getTime())
                  if (clampEnd <= dateRange.start.getTime() || clampStart >= dateRange.end.getTime()) return null
                  const left = ((clampStart - dateRange.start.getTime()) / rangeMs) * 100
                  const width = ((clampEnd - clampStart) / rangeMs) * 100
                  const meta = STATUS_META[r.status] || STATUS_META.confirmed
                  return (
                    <button
                      key={r.id}
                      className='lt-res-gantt-bar' style={{left: `${left}%`, width: `${width}%`, background: meta.bg, borderColor: meta.color, color: meta.color}}
                      onClick={() => onSelect(r)}
                      data-testid={`reservation-bar-${r.id}`}
                      title={`${r.asset_name} · ${fmtDateTime(r.start_date)} → ${fmtDateTime(r.end_date)} · ${r.user_name || 'N/A'}`}
                    >
                      <i className={`pi ${meta.icon}`} style={{fontSize: '0.68rem'}}></i>
                      <span className='lt-res-gantt-bar-lbl'>{r.user_name || r.project || meta.label}</span>
                    </button>
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
const ReservationForm = ({initial, engines, onClose, onSave}) => {
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
            <InputText value={form.user_name || ''} onChange={(e) => set('user_name', e.target.value)}
              placeholder='ex: Jean Dupont' className='w-full' data-testid='reservation-form-user' />
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

        <div className='lt-res-drawer-body'>
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
