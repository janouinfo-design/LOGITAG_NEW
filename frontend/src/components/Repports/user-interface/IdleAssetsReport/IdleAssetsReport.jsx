import React, {useMemo, useState, useRef} from 'react'
import {useSelector} from 'react-redux'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {Toast} from 'primereact/toast'
import {Dropdown} from 'primereact/dropdown'
import {InputText} from 'primereact/inputtext'
import {getEngines, fetchEngines} from '../../../Engin/slice/engin.slice'
import {useAppDispatch} from '../../../../hooks'
import './IdleAssetsReport.css'

/* ─── Helpers ─── */
const STATUS_COLORS = {
  immobilized: '#DC2626',
  underutilized: '#F59E0B',
  active: '#16A34A',
  unknown: '#94A3B8',
}
const STATUS_LABELS = {
  immobilized: 'Immobilisé',
  underutilized: 'Sous-utilisé',
  active: 'Actif',
  unknown: 'Inconnu',
}
const THRESHOLD_OPTIONS = [
  {label: '3 jours', value: 3},
  {label: '7 jours', value: 7},
  {label: '14 jours', value: 14},
  {label: '30 jours', value: 30},
]

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

const fmtDateTime = (d) =>
  d ? d.toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—'

const computeDaysOnPosition = (lastDate) => {
  if (!lastDate) return null
  return Math.max(0, Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)))
}

/* Compute status from threshold + days + state */
const computeStatus = (engin, days, threshold) => {
  if (days === null) return 'unknown'
  // "Sous-utilisé" : explicitly marked inactive/exit and not seen since threshold
  if ((engin.etatenginname === 'nonactive' || engin.etatenginname === 'exit') && days >= threshold) {
    return 'underutilized'
  }
  if (days >= threshold) return 'immobilized'
  return 'active'
}

const IdleAssetsReport = () => {
  const dispatch = useAppDispatch()
  const enginesRaw = useSelector(getEngines)
  const engines = Array.isArray(enginesRaw) ? enginesRaw : []
  const toast = useRef(null)

  /* Filters */
  const [threshold, setThreshold] = useState(7)
  const [zoneFilter, setZoneFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [clientFilter, setClientFilter] = useState(null)
  const [search, setSearch] = useState('')

  /* Lazy-fetch if Redux is empty */
  React.useEffect(() => {
    if (!engines || engines.length === 0) {
      dispatch(fetchEngines({page: 1, PageSize: 5000, SortDirection: 'DESC', SortColumn: 'lastSeenAt'}))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Compute report rows */
  const rows = useMemo(() => {
    return (engines || []).map((e) => {
      const lastDate =
        parseDate(e.lastSeenAt) ||
        parseDate(e.locationDate) ||
        parseDate(e.statusDate) ||
        parseDate(e.tagDate)
      const days = computeDaysOnPosition(lastDate)
      const status = computeStatus(e, days, threshold)
      return {
        id: e.id || e.uid,
        name: e.reference || e.label || e.name || '—',
        category: e.types || e.familleNom || e.familleName || '—',
        position: e.LocationObjectname || e.lastSeenAddress || e.enginAddress || '—',
        zone: e.LocationObjectname || e.zoneName || '—',
        client: e.customerName || e.clientName || e.entrepriseName || '—',
        lastSeen: lastDate,
        days,
        status,
        battery: e.batteries,
      }
    })
  }, [engines, threshold])

  /* Distinct values for filter dropdowns */
  const zoneOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.zone).filter((v) => v && v !== '—'))).sort().map((v) => ({label: v, value: v})),
    [rows]
  )
  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter((v) => v && v !== '—'))).sort().map((v) => ({label: v, value: v})),
    [rows]
  )
  const clientOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.client).filter((v) => v && v !== '—'))).sort().map((v) => ({label: v, value: v})),
    [rows]
  )

  /* Apply filters */
  const filteredRows = useMemo(() => {
    let list = rows
    if (zoneFilter) list = list.filter((r) => r.zone === zoneFilter)
    if (categoryFilter) list = list.filter((r) => r.category === categoryFilter)
    if (statusFilter) list = list.filter((r) => r.status === statusFilter)
    if (clientFilter) list = list.filter((r) => r.client === clientFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.position.toLowerCase().includes(q))
    }
    return list.sort((a, b) => (b.days || 0) - (a.days || 0))
  }, [rows, zoneFilter, categoryFilter, statusFilter, clientFilter, search])

  /* KPIs */
  const kpis = useMemo(() => {
    const k = {immobilized: 0, underutilized: 0, active: 0, unknown: 0}
    filteredRows.forEach((r) => {
      k[r.status] = (k[r.status] || 0) + 1
    })
    return k
  }, [filteredRows])

  /* Reset filters */
  const resetFilters = () => {
    setZoneFilter(null); setCategoryFilter(null); setStatusFilter(null)
    setClientFilter(null); setSearch('')
    toast.current?.show({severity: 'info', summary: 'Filtres réinitialisés', life: 1500})
  }

  /* Exports */
  const exportPdf = () => {
    if (filteredRows.length === 0) {
      toast.current?.show({severity: 'warn', summary: 'Aucune donnée à exporter', life: 2500})
      return
    }
    const doc = new jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'})
    doc.setFontSize(18); doc.text('Outils immobilisés et sous-utilisés', 40, 50)
    doc.setFontSize(10); doc.setTextColor(120)
    doc.text(
      `Seuil: ${threshold} jours · Total: ${filteredRows.length} outils · Généré le ${new Date().toLocaleString('fr-FR')}`,
      40,
      68
    )
    autoTable(doc, {
      startY: 90,
      head: [['Outil', 'Catégorie', 'Position', 'Zone', 'Dernière détection', 'Temps sur position', 'Statut']],
      body: filteredRows.map((r) => [
        r.name, r.category, r.position, r.zone,
        fmtDateTime(r.lastSeen),
        r.days !== null ? `${r.days} jours` : '—',
        STATUS_LABELS[r.status],
      ]),
      headStyles: {fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 9},
      styles: {fontSize: 8, cellPadding: 5, overflow: 'linebreak'},
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const status = filteredRows[data.row.index]?.status
          const c = STATUS_COLORS[status] || '#94A3B8'
          const rgb = c.match(/\w\w/g).map((h) => parseInt(h, 16))
          data.cell.styles.textColor = rgb
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    const filename = `outils-immobilises-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
    toast.current?.show({severity: 'success', summary: 'PDF exporté', detail: filename, life: 2500})
  }

  const exportExcel = () => {
    if (filteredRows.length === 0) {
      toast.current?.show({severity: 'warn', summary: 'Aucune donnée à exporter', life: 2500})
      return
    }
    const data = filteredRows.map((r) => ({
      Outil: r.name,
      Catégorie: r.category,
      Position: r.position,
      Zone: r.zone,
      Client: r.client,
      'Dernière détection': fmtDateTime(r.lastSeen),
      'Temps sur position (jours)': r.days !== null ? r.days : '',
      Statut: STATUS_LABELS[r.status],
      'Batterie (%)': r.battery || '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{wch: 20}, {wch: 22}, {wch: 28}, {wch: 22}, {wch: 18}, {wch: 18}, {wch: 14}, {wch: 14}, {wch: 12}]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Immobilisés')
    const filename = `outils-immobilises-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, filename)
    toast.current?.show({severity: 'success', summary: 'Excel exporté', detail: filename, life: 2500})
  }

  return (
    <div className='lt-page' data-testid='idle-assets-report'>
      <Toast ref={toast} position='top-right' />

      {/* Header */}
      <div className='lt-page-header'>
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #DC2626, #F59E0B)'}}>
            <i className='pi pi-clock'></i>
          </div>
          <div>
            <h1 className='lt-page-title'>Outils immobilisés et sous-utilisés</h1>
            <p className='lt-page-subtitle'>
              Identifier le matériel inutilisé pour optimiser la rotation et éviter les achats inutiles
            </p>
          </div>
        </div>
        <div className='lt-page-header-right'>
          <button
            type='button'
            className='lt-idle-btn lt-idle-btn--ghost'
            onClick={() => dispatch(fetchEngines({page: 1, PageSize: 5000}))}
            data-testid='idle-refresh'
          >
            <i className='pi pi-refresh' /> Actualiser
          </button>
          <button type='button' className='lt-idle-btn lt-idle-btn--secondary' onClick={exportExcel} data-testid='idle-export-excel'>
            <i className='pi pi-file-excel' /> Excel
          </button>
          <button type='button' className='lt-idle-btn lt-idle-btn--primary' onClick={exportPdf} data-testid='idle-export-pdf'>
            <i className='pi pi-file-pdf' /> PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className='lt-idle-kpis'>
        {[
          {key: 'immobilized', label: 'Immobilisés', icon: 'pi-pause-circle', desc: `≥ ${threshold} jours`},
          {key: 'underutilized', label: 'Sous-utilisés', icon: 'pi-exclamation-circle', desc: 'Disponibles non utilisés'},
          {key: 'active', label: 'Actifs', icon: 'pi-check-circle', desc: `< ${threshold} jours`},
          {key: 'unknown', label: 'Sans signal', icon: 'pi-question-circle', desc: 'Aucune date GPS'},
        ].map((k) => (
          <div
            key={k.key}
            className={`lt-idle-kpi ${statusFilter === k.key ? 'is-active' : ''}`}
            style={{'--ac': STATUS_COLORS[k.key]}}
            onClick={() => setStatusFilter(statusFilter === k.key ? null : k.key)}
            data-testid={`idle-kpi-${k.key}`}
          >
            <div className='lt-idle-kpi-ico' style={{background: `${STATUS_COLORS[k.key]}15`, color: STATUS_COLORS[k.key]}}>
              <i className={`pi ${k.icon}`} />
            </div>
            <div className='lt-idle-kpi-num' style={{color: STATUS_COLORS[k.key]}}>{kpis[k.key] || 0}</div>
            <div className='lt-idle-kpi-lbl'>{k.label}</div>
            <div className='lt-idle-kpi-desc'>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className='lt-idle-filters'>
        <div className='lt-idle-filter-group'>
          <label className='lt-idle-filter-label'>Seuil d'immobilisation</label>
          <Dropdown
            value={threshold}
            options={THRESHOLD_OPTIONS}
            onChange={(e) => setThreshold(e.value)}
            className='lt-idle-dd'
            data-testid='idle-threshold'
          />
        </div>
        <div className='lt-idle-filter-group'>
          <label className='lt-idle-filter-label'>Zone</label>
          <Dropdown
            value={zoneFilter}
            options={[{label: 'Toutes les zones', value: null}, ...zoneOptions]}
            onChange={(e) => setZoneFilter(e.value)}
            placeholder='Toutes'
            className='lt-idle-dd'
            filter
            data-testid='idle-zone-filter'
          />
        </div>
        <div className='lt-idle-filter-group'>
          <label className='lt-idle-filter-label'>Catégorie</label>
          <Dropdown
            value={categoryFilter}
            options={[{label: 'Toutes catégories', value: null}, ...categoryOptions]}
            onChange={(e) => setCategoryFilter(e.value)}
            placeholder='Toutes'
            className='lt-idle-dd'
            filter
            data-testid='idle-category-filter'
          />
        </div>
        <div className='lt-idle-filter-group'>
          <label className='lt-idle-filter-label'>Client / Chantier</label>
          <Dropdown
            value={clientFilter}
            options={[{label: 'Tous clients', value: null}, ...clientOptions]}
            onChange={(e) => setClientFilter(e.value)}
            placeholder='Tous'
            className='lt-idle-dd'
            filter
            data-testid='idle-client-filter'
          />
        </div>
        <div className='lt-idle-filter-group lt-idle-filter-group--search'>
          <label className='lt-idle-filter-label'>Recherche</label>
          <span className='p-input-icon-left'>
            <i className='pi pi-search' />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Nom ou position…'
              className='lt-idle-search'
              data-testid='idle-search-input'
            />
          </span>
        </div>
        <button
          type='button'
          className='lt-idle-btn lt-idle-btn--ghost lt-idle-btn--sm'
          onClick={resetFilters}
          data-testid='idle-reset'
        >
          <i className='pi pi-filter-slash' /> Réinitialiser
        </button>
      </div>

      {/* Results count */}
      <div className='lt-idle-results-head'>
        <strong>{filteredRows.length}</strong> outil{filteredRows.length > 1 ? 's' : ''}
        {filteredRows.length !== rows.length && <span className='lt-idle-results-total'> sur {rows.length}</span>}
      </div>

      {/* Table */}
      <div className='lt-idle-table-wrap'>
        <table className='lt-idle-table' data-testid='idle-table'>
          <thead>
            <tr>
              <th>Outil / Équipement</th>
              <th>Catégorie</th>
              <th>Dernière position</th>
              <th>Zone</th>
              <th>Dernière détection</th>
              <th>Temps sur position</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className='lt-idle-empty'>
                  <i className='pi pi-inbox' /> Aucun outil ne correspond aux filtres
                </td>
              </tr>
            )}
            {filteredRows.slice(0, 500).map((r) => (
              <tr key={r.id} data-testid={`idle-row-${r.id}`}>
                <td className='lt-idle-name'>{r.name}</td>
                <td>{r.category}</td>
                <td>{r.position}</td>
                <td>{r.zone}</td>
                <td>{fmtDateTime(r.lastSeen)}</td>
                <td>
                  <span className={`lt-idle-days ${r.status === 'immobilized' ? 'is-warn' : ''}`}>
                    {r.days !== null ? `${r.days} jour${r.days > 1 ? 's' : ''}` : '—'}
                  </span>
                </td>
                <td>
                  <span
                    className='lt-idle-status'
                    style={{background: `${STATUS_COLORS[r.status]}15`, color: STATUS_COLORS[r.status]}}
                  >
                    <span className='lt-idle-status-dot' style={{background: STATUS_COLORS[r.status]}} />
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length > 500 && (
          <div className='lt-idle-table-more'>
            <i className='pi pi-info-circle' /> Affichage limité à 500 lignes — exportez en Excel/PDF pour la liste complète ({filteredRows.length} outils).
          </div>
        )}
      </div>
    </div>
  )
}

export default IdleAssetsReport
