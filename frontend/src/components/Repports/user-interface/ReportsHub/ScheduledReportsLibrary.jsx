import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Toast} from 'primereact/toast'
import {InputText} from 'primereact/inputtext'
import {FLAT_REPORTS} from './reportCatalog'
import './ScheduledReportsLibrary.css'

const STORAGE_KEY = 'lt-scheduled-reports'

const FREQ_LABELS = {daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel'}
const FREQ_COLORS = {daily: '#1D4ED8', weekly: '#7C3AED', monthly: '#0EA5E9'}

const computeNextSend = (item) => {
  /* Naive next-send computation: from createdAt + interval, find next future tick */
  const created = new Date(item.createdAt || Date.now()).getTime()
  const now = Date.now()
  const stepMs = item.frequency === 'daily' ? 86400000
              : item.frequency === 'weekly' ? 604800000
              : 30 * 86400000
  let next = created
  while (next <= now) next += stepMs
  return new Date(next)
}

const fmtDateTime = (d) =>
  d.toLocaleString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})

const fmtRelative = (d) => {
  const diff = d.getTime() - Date.now()
  if (diff < 0) return 'En retard'
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Dans moins d\'1h'
  if (h < 24) return `Dans ${h}h`
  const days = Math.floor(h / 24)
  return `Dans ${days} jour${days > 1 ? 's' : ''}`
}

const ScheduledReportsLibrary = () => {
  const toast = useRef(null)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setItems(Array.isArray(raw) ? raw : [])
    } catch {
      setItems([])
    }
  }
  useEffect(() => {
    load()
    const onStorage = (e) => { if (e.key === STORAGE_KEY) load() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = (next) => {
    setItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((i) => (i.reportName || '').toLowerCase().includes(q) || (i.email || '').toLowerCase().includes(q))
  }, [items, search])

  const togglePause = (id) => {
    const next = items.map((i) => i.id === id ? {...i, paused: !i.paused} : i)
    persist(next)
    const target = next.find((i) => i.id === id)
    toast.current?.show({severity: 'info', summary: target.paused ? 'Mis en pause' : 'Réactivé', detail: target.reportName, life: 1800})
  }

  const remove = (id) => {
    const target = items.find((i) => i.id === id)
    persist(items.filter((i) => i.id !== id))
    toast.current?.show({severity: 'success', summary: 'Supprimé', detail: target?.reportName, life: 1800})
  }

  const sendNow = (item) => {
    /* MOCKED — when SMTP backend is wired, POST /api/scheduled-reports/{id}/send-now */
    toast.current?.show({severity: 'info', summary: 'Envoi déclenché', detail: `${item.reportName} → ${item.email}`, life: 2500})
    const next = items.map((i) => i.id === item.id ? {...i, lastSentAt: new Date().toISOString()} : i)
    persist(next)
  }

  const stats = useMemo(() => {
    const active = items.filter((i) => !i.paused).length
    const paused = items.length - active
    return {total: items.length, active, paused}
  }, [items])

  return (
    <div className='lt-srl-root' data-testid='scheduled-reports-library'>
      <Toast ref={toast} position='top-right' />

      {/* Header */}
      <div className='lt-srl-head'>
        <div>
          <h2 className='lt-srl-title'>Mes rapports planifiés</h2>
          <p className='lt-srl-subtitle'>Gérez tous vos envois automatiques en un seul endroit</p>
        </div>
        <div className='lt-srl-stats'>
          <div className='lt-srl-stat'>
            <div className='lt-srl-stat-num' style={{color: '#0F172A'}}>{stats.total}</div>
            <div className='lt-srl-stat-lbl'>Total</div>
          </div>
          <div className='lt-srl-stat'>
            <div className='lt-srl-stat-num' style={{color: '#16A34A'}}>{stats.active}</div>
            <div className='lt-srl-stat-lbl'>Actifs</div>
          </div>
          <div className='lt-srl-stat'>
            <div className='lt-srl-stat-num' style={{color: '#94A3B8'}}>{stats.paused}</div>
            <div className='lt-srl-stat-lbl'>En pause</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className='lt-srl-search-wrap'>
        <i className='fa-solid fa-magnifying-glass' />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Rechercher par nom de rapport ou email…'
          className='lt-srl-search'
          data-testid='scheduled-reports-search'
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className='lt-srl-empty' data-testid='scheduled-reports-empty'>
          <i className='fa-solid fa-clock-rotate-left' />
          <h3>{items.length === 0 ? 'Aucun rapport planifié' : 'Aucun résultat'}</h3>
          <p>
            {items.length === 0
              ? "Allez dans l'onglet « Rapports disponibles », sélectionnez un rapport puis cliquez sur Planifier pour l'ajouter ici."
              : "Essayez avec d'autres mots-clés ou réinitialisez la recherche."}
          </p>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 && (
        <div className='lt-srl-list'>
          {filtered.map((item) => {
            const meta = FLAT_REPORTS.find((r) => r.id === item.reportId)
            const nextSend = computeNextSend(item)
            const isPaused = !!item.paused
            return (
              <div
                key={item.id}
                className={`lt-srl-card ${isPaused ? 'is-paused' : ''}`}
                data-testid={`scheduled-report-card-${item.id}`}
              >
                <div className='lt-srl-card-left'>
                  <div
                    className='lt-srl-card-ico'
                    style={{
                      background: `${meta?.categoryColor || '#1D4ED8'}15`,
                      color: meta?.categoryColor || '#1D4ED8',
                    }}
                  >
                    <i className={`fa-solid ${meta?.icon || 'fa-chart-column'}`} />
                  </div>
                  <div className='lt-srl-card-body'>
                    <div className='lt-srl-card-name'>
                      {item.reportName}
                      {isPaused && <span className='lt-srl-pill lt-srl-pill--paused'>En pause</span>}
                    </div>
                    <div className='lt-srl-card-meta'>
                      <span className='lt-srl-meta-item'>
                        <i className='fa-solid fa-clock' style={{color: FREQ_COLORS[item.frequency]}} />
                        {FREQ_LABELS[item.frequency] || item.frequency}
                      </span>
                      <span className='lt-srl-meta-item'>
                        <i className='fa-solid fa-envelope' /> {item.email}
                      </span>
                      <span className='lt-srl-meta-item'>
                        <i className='fa-solid fa-calendar-plus' /> Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {item.lastSentAt && (
                        <span className='lt-srl-meta-item'>
                          <i className='fa-solid fa-check' style={{color: '#16A34A'}} />
                          Envoyé {new Date(item.lastSentAt).toLocaleString('fr-FR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='lt-srl-card-right'>
                  {!isPaused && (
                    <div className='lt-srl-next' title={fmtDateTime(nextSend)}>
                      <div className='lt-srl-next-lbl'>Prochain envoi</div>
                      <div className='lt-srl-next-val'>{fmtRelative(nextSend)}</div>
                      <div className='lt-srl-next-date'>{fmtDateTime(nextSend)}</div>
                    </div>
                  )}
                  <div className='lt-srl-actions'>
                    <button
                      className='lt-srl-btn lt-srl-btn--ghost'
                      onClick={() => sendNow(item)}
                      title='Envoyer maintenant'
                      data-testid={`scheduled-send-now-${item.id}`}
                    >
                      <i className='fa-solid fa-paper-plane' />
                    </button>
                    <button
                      className='lt-srl-btn lt-srl-btn--ghost'
                      onClick={() => togglePause(item.id)}
                      title={isPaused ? 'Réactiver' : 'Mettre en pause'}
                      data-testid={`scheduled-toggle-${item.id}`}
                    >
                      <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} />
                    </button>
                    <button
                      className='lt-srl-btn lt-srl-btn--danger'
                      onClick={() => remove(item.id)}
                      title='Supprimer'
                      data-testid={`scheduled-delete-${item.id}`}
                    >
                      <i className='fa-solid fa-trash' />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ScheduledReportsLibrary
