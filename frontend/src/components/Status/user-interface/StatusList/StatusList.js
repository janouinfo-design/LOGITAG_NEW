import React, {memo, useEffect, useMemo, useRef, useState} from 'react'
import ReactDOM from 'react-dom'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchObject,
  fetchStatus,
  getObject,
  getSelectedObject,
  getStatus,
  setEditStatus,
  setSelectedObject,
  setSelectedStatus,
  setShow,
} from '../../slice/status.slice'

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '10px 14px', background: '#FFF', border: 'none', cursor: 'pointer',
  fontSize: '0.82rem', color: '#0F172A', fontWeight: 500, textAlign: 'left',
}

const KebabMenu = ({row, onDetail, onDelete}) => {
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
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        data-testid={`status-actions-${row.id}`}
        style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
      >
        <i className='pi pi-ellipsis-v' style={{fontSize: '0.85rem'}}></i>
      </button>
      {open && ReactDOM.createPortal(
        <div
          style={{position: 'fixed', top: pos.top, left: pos.left, width: 160, background: '#FFF', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)', zIndex: 10000, overflow: 'hidden'}}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { setOpen(false); onDetail(row) }} style={dropdownItemStyle}>
            <i className='pi pi-pencil' style={{color: '#6366F1', fontSize: '0.8rem'}}></i>Modifier
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
const tdStyle = {padding: '16px', verticalAlign: 'middle'}
const SortIcon = () => (<span style={{marginLeft: 4, color: '#CBD5E1', fontSize: '0.65rem'}}><i className='pi pi-sort-alt'></i></span>)

const StatusList = ({detailView}) => {
  const statusData = useAppSelector(getStatus)
  const objectData = useAppSelector(getObject)
  const selectedObject = useAppSelector(getSelectedObject)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const tabs = useMemo(() => (objectData || []).map((o) => ({
    uid: o.uid, label: o.label, code: o.name,
  })), [objectData])

  const activateTab = (tab) => {
    setLoading(true)
    const sel = {uid: tab.uid, name: tab.code}
    dispatch(setSelectedObject(sel))
    dispatch(fetchStatus(sel)).finally(() => setLoading(false))
  }

  useEffect(() => {
    dispatch(fetchObject())
    dispatch(fetchStatus())
  }, [])

  useEffect(() => {
    if (!selectedObject && tabs.length > 0) activateTab(tabs[0])
  }, [tabs])

  const onDetail = (row) => {
    if (detailView === 'Edit') {
      dispatch(setSelectedStatus(row))
      dispatch(setEditStatus(true))
    } else {
      dispatch(setSelectedStatus(row))
      dispatch(setShow(false))
    }
  }

  const onCreate = () => {
    dispatch(setSelectedStatus(null))
    dispatch(setEditStatus(true))
  }

  const onDelete = (row) => {
    dispatch(setSelectedStatus(row))
  }

  const filtered = useMemo(() => {
    const list = Array.isArray(statusData) ? statusData : []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter((s) => (s.label || s.code || '').toLowerCase().includes(q))
  }, [statusData, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)
  const fromIdx = filtered.length === 0 ? 0 : (page - 1) * perPage + 1
  const toIdx = Math.min(page * perPage, filtered.length)
  const tabLabel = (objectData?.find((o) => o.name === selectedObject?.name)?.label) || 'Engin'

  return (
    <div className='lt-page' data-testid='status-list-page'>
      {/* ── Header ── */}
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16}}>
        <div>
          <h1 style={{margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em'}}>Statuts</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.78rem', color: '#94A3B8'}}>
            <i className='pi pi-cog' style={{fontSize: '0.7rem'}}></i>
            <span>Configuration</span>
            <i className='pi pi-chevron-right' style={{fontSize: '0.6rem'}}></i>
            <span style={{color: '#475569', fontWeight: 600}}>Statuts</span>
          </div>
        </div>
        <button
          data-testid='status-create-btn'
          onClick={onCreate}
          style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35)', transition: 'all 0.18s'}}
          onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.45)'}}
          onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.35)'}}
        >
          <i className='pi pi-plus' style={{fontSize: '0.8rem'}}></i>
          Nouveau statut
        </button>
      </div>

      {/* ── Tab Selector ── */}
      <div style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          {tabs.map((tab) => {
            const isActive = selectedObject?.uid === tab.uid
            return (
              <button
                key={tab.uid}
                onClick={() => activateTab(tab)}
                data-testid={`status-tab-${tab.code}`}
                disabled={loading}
                style={{padding: '10px 22px', borderRadius: 10, border: isActive ? '1px solid #C4B5FD' : '1px solid #E2E8F0', background: isActive ? '#F5F3FF' : '#FFF', color: isActive ? '#6D28D9' : '#475569', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s'}}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
        <div style={{padding: 16, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
          <button style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFF', color: '#475569', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'}}>
            <i className='pi pi-filter' style={{fontSize: '0.8rem'}}></i>Filtres
          </button>
          <div style={{display: 'flex', gap: 10, alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
            <div style={{position: 'relative', maxWidth: 340, flex: 1}}>
              <i className='pi pi-search' style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem'}}></i>
              <input
                type='text'
                data-testid='status-search'
                placeholder='Rechercher un statut...'
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                style={{width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '0.82rem', outline: 'none', background: '#FFF', color: '#0F172A'}}
              />
            </div>
            <button style={{width: 38, height: 38, borderRadius: 10, border: '1px solid #C4B5FD', background: '#F5F3FF', color: '#6D28D9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className='pi pi-cog' style={{fontSize: '0.95rem'}}></i>
            </button>
          </div>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#FAFBFC', borderBottom: '1px solid #F1F5F9'}}>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Couleur <SortIcon /></th>
                <th style={thStyle}>Icône</th>
                <th style={thStyle}>Nom du statut <SortIcon /></th>
                <th style={thStyle}>Type <SortIcon /></th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Statut <SortIcon /></th>
                <th style={{...thStyle, width: 40}}></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{padding: 60, textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem'}}>
                    <i className='pi pi-inbox' style={{fontSize: '1.6rem', color: '#CBD5E1', display: 'block', marginBottom: 8}}></i>
                    Aucun statut pour cette catégorie
                  </td>
                </tr>
              )}
              {pageRows.map((row) => {
                const bg = row.backgroundColor ? (String(row.backgroundColor).startsWith('#') ? row.backgroundColor : `#${row.backgroundColor}`) : '#CBD5E1'
                const isActive = row.active == null || row.active == 1 || row.active === true
                return (
                  <tr key={row.id || row.code} style={{borderBottom: '1px solid #F8FAFC', transition: 'background 0.12s'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFBFC'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      data-testid={`status-row-${row.id}`}>
                    <td style={tdStyle}><KebabMenu row={row} onDetail={onDetail} onDelete={onDelete} /></td>
                    <td style={tdStyle}>
                      <div style={{width: 28, height: 28, borderRadius: 6, background: bg}}></div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{width: 36, height: 36, borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF'}}>
                        <i className={row.icon || 'pi pi-circle'} style={{color: '#475569', fontSize: '0.95rem'}}></i>
                      </div>
                    </td>
                    <td style={{...tdStyle, fontWeight: 600, color: '#0F172A'}}>{row.label || row.code || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{display: 'inline-flex', padding: '4px 12px', borderRadius: 8, background: '#F5F3FF', color: '#6D28D9', fontSize: '0.74rem', fontWeight: 700}}>
                        {tabLabel}
                      </span>
                    </td>
                    <td style={{...tdStyle, color: '#64748B', fontFamily: 'monospace', fontSize: '0.82rem'}}>{row.code || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: isActive ? '#DCFCE7' : '#F1F5F9', color: isActive ? '#16A34A' : '#64748B'}}>
                        <span style={{width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16A34A' : '#94A3B8'}}></span>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => onDetail(row)} style={{width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer'}}>
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
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1}}>
              <i className='pi pi-chevron-left' style={{fontSize: '0.7rem'}}></i>
            </button>
            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{minWidth: 32, height: 32, borderRadius: 8, border: 'none', background: p === page ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' : '#FFF', color: p === page ? '#FFF' : '#475569', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', boxShadow: p === page ? '0 4px 10px rgba(124, 58, 237, 0.3)' : 'none'}}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1}}>
              <i className='pi pi-chevron-right' style={{fontSize: '0.7rem'}}></i>
            </button>
          </div>
          <div style={{fontSize: '0.8rem', color: '#64748B'}}>
            {fromIdx} à {toIdx} de {filtered.length} éléments
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(StatusList)
