import React, {useEffect, useMemo, useRef, useState} from 'react'
import ReactDOM from 'react-dom'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  activateObject,
  deleteEngin,
  fetchObjectsNonActive,
  getObjectsNoActive,
} from '../slice/engin.slice'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {setAlertParams} from '../../../store/slices/alert.slice'

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '10px 14px', background: '#FFF', border: 'none', cursor: 'pointer',
  fontSize: '0.82rem', color: '#0F172A', fontWeight: 500, textAlign: 'left',
}

const KebabMenu = ({row, onActivate, onDelete}) => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({top: 0, left: 0})
  const btnRef = useRef(null)
  const toggle = (e) => {
    e.stopPropagation()
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) setPos({top: rect.bottom + 4, left: rect.right - 160})
    setOpen((o) => !o)
  }
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    window.addEventListener('click', handler)
    window.addEventListener('scroll', handler, true)
    return () => { window.removeEventListener('click', handler); window.removeEventListener('scroll', handler, true) }
  }, [open])
  return (
    <>
      <button ref={btnRef} onClick={toggle} data-testid={`inactive-actions-${row.id}`} style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <i className='pi pi-ellipsis-v' style={{fontSize: '0.85rem'}}></i>
      </button>
      {open && ReactDOM.createPortal(
        <div style={{position: 'fixed', top: pos.top, left: pos.left, width: 170, background: '#FFF', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)', zIndex: 10000, overflow: 'hidden'}} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setOpen(false); onActivate(row) }} style={dropdownItemStyle}>
            <i className='pi pi-replay' style={{color: '#16A34A', fontSize: '0.8rem'}}></i>Réactiver
          </button>
          <button onClick={() => { setOpen(false); onDelete(row) }} style={{...dropdownItemStyle, color: '#EF4444'}}>
            <i className='pi pi-trash' style={{color: '#EF4444', fontSize: '0.8rem'}}></i>Supprimer
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

const thStyle = {padding: '14px 16px', textAlign: 'left', fontSize: '0.74rem', fontWeight: 700, color: '#64748B'}
const tdStyle = {padding: '14px 16px', verticalAlign: 'middle'}
const SortIcon = () => (<span style={{marginLeft: 4, color: '#CBD5E1', fontSize: '0.65rem'}}><i className='pi pi-sort-alt'></i></span>)

const TABLE_STYLES = {
  engin:    {label: 'Engin',    bg: '#DBEAFE', color: '#2563EB', icon: 'pi pi-truck'},
  tag:      {label: 'Tag',      bg: '#EFF6FF', color: '#1D4ED8', icon: 'pi pi-tag'},
  customer: {label: 'Client',   bg: '#DCFCE7', color: '#16A34A', icon: 'pi pi-briefcase'},
  worksite: {label: 'Site',     bg: '#FEF3C7', color: '#D97706', icon: 'pi pi-map-marker'},
  depot:    {label: 'Dépôt',    bg: '#FFE4E6', color: '#E11D48', icon: 'pi pi-home'},
  team:     {label: 'Utilisateur', bg: '#E0E7FF', color: '#4F46E5', icon: 'pi pi-user'},
  default:  {label: 'Objet',    bg: '#F1F5F9', color: '#64748B', icon: 'pi pi-box'},
}
const getStyle = (tableName) => {
  if (!tableName) return TABLE_STYLES.default
  const k = tableName.toLowerCase()
  for (const key of Object.keys(TABLE_STYLES)) if (k.includes(key)) return TABLE_STYLES[key]
  return TABLE_STYLES.default
}

const EnginInactive = () => {
  const objectNoActive = useAppSelector(getObjectsNoActive)
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => { dispatch(fetchObjectsNonActive()) }, [])

  const onActivate = (row) => {
    dispatch(setAlertParams({
      title: 'Réactiver',
      message: `Voulez-vous vraiment réactiver "${row.name || row.label}" ?`,
      acceptClassName: 'p-button-success',
      visible: true,
      accept: () => dispatch(activateObject({srcId: row.id, srcObject: row.tableName})),
    }))
  }
  const onDelete = (row) => {
    dispatch(setAlertParams({
      title: 'Supprimer',
      message: `Supprimer définitivement "${row.name || row.label}" ? Cette action est irréversible.`,
      acceptClassName: 'p-button-danger',
      visible: true,
      accept: () => dispatch(deleteEngin({srcId: row.id, srcObject: row.tableName})),
    }))
  }

  const types = useMemo(() => {
    const set = new Set(['all'])
    ;(objectNoActive || []).forEach((o) => o.tableName && set.add(o.tableName))
    return Array.from(set)
  }, [objectNoActive])

  const filtered = useMemo(() => {
    const list = Array.isArray(objectNoActive) ? objectNoActive : []
    const byType = filterType === 'all' ? list : list.filter((r) => r.tableName === filterType)
    if (!search.trim()) return byType
    const q = search.toLowerCase()
    return byType.filter((r) => (r.name || r.label || '').toLowerCase().includes(q))
  }, [objectNoActive, filterType, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)
  const fromIdx = filtered.length === 0 ? 0 : (page - 1) * perPage + 1
  const toIdx = Math.min(page * perPage, filtered.length)

  return (
    <div className='lt-page' data-testid='engin-inactive-page'>
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <div>
          <h1 style={{margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em'}}>Objets inactifs</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.78rem', color: '#94A3B8'}}>
            <i className='pi pi-cog' style={{fontSize: '0.7rem'}}></i>
            <span>Analyse</span>
            <i className='pi pi-chevron-right' style={{fontSize: '0.6rem'}}></i>
            <span style={{color: '#475569', fontWeight: 600}}>Objets inactifs</span>
          </div>
        </div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: '0.82rem'}}>
          <i className='pi pi-exclamation-triangle' style={{fontSize: '0.85rem'}}></i>
          {(objectNoActive || []).length} objet{(objectNoActive || []).length > 1 ? 's' : ''} archivé{(objectNoActive || []).length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Type filter tabs */}
      {types.length > 2 && (
        <div style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
            {types.map((t) => {
              const isActive = filterType === t
              const s = t === 'all' ? {label: 'Tous', icon: 'pi pi-th-large'} : getStyle(t)
              return (
                <button key={t} onClick={() => { setFilterType(t); setPage(1) }} data-testid={`inactive-tab-${t}`}
                  style={{display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: isActive ? '1px solid #C4B5FD' : '1px solid #E2E8F0', background: isActive ? '#EFF6FF' : '#FFF', color: isActive ? '#1D4ED8' : '#475569', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.15s'}}>
                  <i className={s.icon} style={{fontSize: '0.75rem'}}></i>
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
        <div style={{padding: 16, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
          <button style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFF', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'}}>
            <i className='pi pi-filter' style={{fontSize: '0.8rem'}}></i>Filtres
          </button>
          <div style={{display: 'flex', gap: 10, alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
            <div style={{position: 'relative', maxWidth: 340, flex: 1}}>
              <i className='pi pi-search' style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem'}}></i>
              <input type='text' data-testid='inactive-search' placeholder='Rechercher un objet...' value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                style={{width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '0.82rem', outline: 'none', background: '#FFF', color: '#0F172A'}} />
            </div>
            <button style={{width: 38, height: 38, borderRadius: 10, border: '1px solid #C4B5FD', background: '#EFF6FF', color: '#1D4ED8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className='pi pi-cog' style={{fontSize: '0.95rem'}}></i>
            </button>
          </div>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#FAFBFC', borderBottom: '1px solid #F1F5F9'}}>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Nom <SortIcon /></th>
                <th style={thStyle}>Type <SortIcon /></th>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Statut</th>
                <th style={{...thStyle, width: 40}}></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{padding: 60, textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem'}}>
                    <i className='pi pi-check-circle' style={{fontSize: '1.6rem', color: '#CBD5E1', display: 'block', marginBottom: 8}}></i>
                    Aucun objet inactif — tout est à jour !
                  </td>
                </tr>
              )}
              {pageRows.map((row) => {
                const s = getStyle(row.tableName)
                return (
                  <tr key={`${row.tableName}-${row.id}`} style={{borderBottom: '1px solid #F8FAFC', transition: 'background 0.12s'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFBFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      data-testid={`inactive-row-${row.id}`}>
                    <td style={tdStyle}><KebabMenu row={row} onActivate={onActivate} onDelete={onDelete} /></td>
                    <td style={tdStyle}>
                      {row.image ? (
                        <img src={`${API_BASE_URL_IMAGE}${row.image}`} alt='' style={{width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #E2E8F0'}} />
                      ) : (
                        <div style={{width: 44, height: 44, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className={s.icon} style={{fontSize: '1rem'}}></i>
                        </div>
                      )}
                    </td>
                    <td style={{...tdStyle, fontWeight: 600, color: '#0F172A'}}>{row.name || row.label || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: s.bg, color: s.color, fontSize: '0.74rem', fontWeight: 700}}>
                        <i className={s.icon} style={{fontSize: '0.65rem'}}></i>
                        {s.label}
                      </span>
                    </td>
                    <td style={{...tdStyle, color: '#64748B', fontFamily: 'monospace', fontSize: '0.78rem'}}>#{row.id}</td>
                    <td style={tdStyle}>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: '#F1F5F9', color: '#64748B'}}>
                        <span style={{width: 6, height: 6, borderRadius: '50%', background: '#94A3B8'}}></span>
                        Inactif
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => onActivate(row)} title='Réactiver' style={{width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer'}}>
                        <i className='pi pi-chevron-right' style={{fontSize: '0.75rem'}}></i>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#64748B'}}>
            <span>Éléments par page</span>
            <select value={perPage} onChange={(e) => { setPerPage(+e.target.value); setPage(1) }} style={{padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.8rem', background: '#FFF', color: '#0F172A', cursor: 'pointer'}}>
              <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
            </select>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1}}><i className='pi pi-chevron-left' style={{fontSize: '0.7rem'}}></i></button>
            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{minWidth: 32, height: 32, borderRadius: 8, border: 'none', background: p === page ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFF', color: p === page ? '#FFF' : '#475569', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', boxShadow: p === page ? '0 4px 10px rgba(37, 99, 235, 0.3)' : 'none'}}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1}}><i className='pi pi-chevron-right' style={{fontSize: '0.7rem'}}></i></button>
          </div>
          <div style={{fontSize: '0.8rem', color: '#64748B'}}>{fromIdx} à {toIdx} de {filtered.length} éléments</div>
        </div>
      </div>
    </div>
  )
}

export default EnginInactive
