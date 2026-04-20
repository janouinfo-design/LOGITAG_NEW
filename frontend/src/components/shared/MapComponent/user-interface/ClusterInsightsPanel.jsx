import React, {useEffect, useMemo, useState} from 'react'
import moment from 'moment'

/*
 * ClusterInsightsPanel — Drawer latéral premium pour l'exploration d'un cluster de la carte.
 * Aucune modification API/backend. Utilise uniquement les champs déjà présents sur chaque engin :
 *  reference, LocationObjectname, enginAddress, etatenginname, etatbgColor, etatIconName,
 *  statusname, statuslabel, statusbgColor, iconName, batteries, lastSeenAt, locationDate,
 *  lastSeenDevice, lastSeenRssi, famille, lastUser, image
 */

const COLORS = {
  present: '#10B981',   // vert — sur site
  arrived: '#F59E0B',   // orange — arrivé récemment
  exited: '#EF4444',    // rouge — sorti récemment / anomalie
  special: '#7C3AED',   // violet — zone spéciale / accent
  muted: '#94A3B8',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
}

/** Calcule l'état temporel d'un engin (présent / arrivé récemment / sorti / ancien) */
const computeTiming = (item) => {
  const now = moment()
  const ref = item.lastSeenAt ? moment.utc(item.lastSeenAt) : null
  if (!ref || !ref.isValid()) return {bucket: 'unknown', minutes: null}
  const diffMin = now.diff(ref, 'minutes')
  let bucket = 'present'
  if (diffMin > 60 * 24 * 3) bucket = 'exited'       // > 3 j : considéré sorti / inactif
  else if (diffMin > 60 * 24) bucket = 'stale'        // > 1 j : ancien
  else if (diffMin <= 60) bucket = 'arrived'          // <= 1h : arrivé récemment
  return {bucket, minutes: diffMin, ref}
}

const humanize = (minutes) => {
  if (minutes == null || isNaN(minutes)) return '—'
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} j`
  const mo = Math.floor(d / 30)
  return `${mo} mois`
}

const batteryState = (b) => {
  const v = Number(b)
  if (isNaN(v)) return {level: 'unknown', color: COLORS.muted, label: '—'}
  if (v <= 15) return {level: 'low', color: COLORS.exited, label: `${Math.round(v)}%`}
  if (v <= 40) return {level: 'mid', color: COLORS.arrived, label: `${Math.round(v)}%`}
  return {level: 'good', color: COLORS.present, label: `${Math.min(100, Math.round(v))}%`}
}

const BUCKET_META = {
  present: {label: 'Sur site', color: COLORS.present, icon: 'pi-check-circle'},
  arrived: {label: 'Arrivé récemment', color: COLORS.arrived, icon: 'pi-arrow-down-right'},
  stale:   {label: 'Ancien', color: COLORS.muted, icon: 'pi-clock'},
  exited:  {label: 'Sorti / inactif', color: COLORS.exited, icon: 'pi-arrow-up-right'},
  unknown: {label: '—', color: COLORS.muted, icon: 'pi-question'},
}

const ClusterInsightsPanel = ({open, items, onClose, onSelectItem, singleMode}) => {
  const isSingle = singleMode || (items && items.length === 1)
  const [filter, setFilter] = useState('all')           // all | present | exited | battery
  const [familyFilter, setFamilyFilter] = useState('all')
  const [sort, setSort] = useState('recent')           // recent | name | duration | status
  const [expanded, setExpanded] = useState(null)       // id of expanded card

  // Auto-expand the single item when in single mode
  useEffect(() => {
    if (isSingle && items && items.length === 1) {
      setExpanded(items[0]?.id ?? 'single')
    } else if (!open) {
      setExpanded(null)
      setFilter('all')
      setFamilyFilter('all')
      setSort('recent')
    }
  }, [isSingle, items, open])

  const enriched = useMemo(() => {
    return (items || []).map((it) => {
      const timing = computeTiming(it)
      const bat = batteryState(it.batteries)
      return {...it, _timing: timing, _bat: bat}
    })
  }, [items])

  const zoneInfo = useMemo(() => {
    if (!enriched.length) return {name: '—', address: '', counts: {total: 0, present: 0, arrived: 0, exited: 0, lowBattery: 0}, avgMinutes: null}
    const byZone = {}
    enriched.forEach((e) => {
      const k = e.LocationObjectname || e.enginAddress || 'Zone inconnue'
      byZone[k] = (byZone[k] || 0) + 1
    })
    const topZone = Object.entries(byZone).sort((a, b) => b[1] - a[1])[0][0]
    const counts = {total: enriched.length, present: 0, arrived: 0, exited: 0, lowBattery: 0}
    let totalMin = 0, cntMin = 0
    enriched.forEach((e) => {
      if (e._timing.bucket === 'present' || e._timing.bucket === 'stale') counts.present++
      if (e._timing.bucket === 'arrived') counts.arrived++
      if (e._timing.bucket === 'exited') counts.exited++
      if (e._bat.level === 'low') counts.lowBattery++
      if (e._timing.minutes != null) { totalMin += e._timing.minutes; cntMin++ }
    })
    const avgMinutes = cntMin ? Math.round(totalMin / cntMin) : null
    const addrSample = enriched.find((e) => e.enginAddress)?.enginAddress || ''
    return {name: topZone, address: addrSample, counts, avgMinutes}
  }, [enriched])

  const families = useMemo(() => {
    const set = new Set()
    enriched.forEach((e) => { if (e.famille) set.add(e.famille) })
    return ['all', ...Array.from(set)]
  }, [enriched])

  const visible = useMemo(() => {
    let list = enriched
    if (filter === 'present') list = list.filter((e) => e._timing.bucket === 'present' || e._timing.bucket === 'stale')
    if (filter === 'exited') list = list.filter((e) => e._timing.bucket === 'exited')
    if (filter === 'battery') list = list.filter((e) => e._bat.level === 'low')
    if (familyFilter !== 'all') list = list.filter((e) => e.famille === familyFilter)
    const sorted = [...list]
    if (sort === 'name') sorted.sort((a, b) => String(a.reference || '').localeCompare(String(b.reference || '')))
    else if (sort === 'duration') sorted.sort((a, b) => (b._timing.minutes || 0) - (a._timing.minutes || 0))
    else if (sort === 'status') sorted.sort((a, b) => String(a.statuslabel || '').localeCompare(String(b.statuslabel || '')))
    else sorted.sort((a, b) => (a._timing.minutes || 0) - (b._timing.minutes || 0)) // recent
    return sorted
  }, [enriched, filter, familyFilter, sort])

  if (!open) return null

  // ═══ SINGLE MODE: dedicated layout for a single engin ═══
  if (isSingle && items && items[0]) {
    const it = items[0]
    const timing = computeTiming(it)
    const bat = batteryState(it.batteries)
    const meta = BUCKET_META[timing.bucket] || BUCKET_META.unknown
    return (
      <>
        <div className='lt-cluster-backdrop' onClick={onClose} data-testid='engin-panel-backdrop' />
        <aside className='lt-cluster-panel' data-testid='engin-detail-panel' role='dialog' aria-label="Détails de l'engin">
          <header className='lt-cp-head' style={{paddingBottom: 18}}>
            <div className='lt-cp-head-row'>
              <span
                className='lt-cp-single-badge'
                style={{background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}DD 100%)`}}
              >
                <i className={`pi ${meta.icon}`} />
                {meta.label}
              </span>
              <button className='lt-cp-close' onClick={onClose} aria-label='Fermer' data-testid='engin-panel-close'>
                <i className='pi pi-times' />
              </button>
            </div>
            <h2 className='lt-cp-title' style={{marginTop: 16}} title={it.reference}>
              {it.reference || '—'}
            </h2>
            <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap'}}>
              {it.famille && <span className='lt-cp-chip'>{it.famille}</span>}
              {it.statuslabel && (
                <span className='lt-cp-status' style={{color: it.statusbgColor || COLORS.subtext, fontSize: '0.75rem'}}>
                  <i className='pi pi-circle-fill' style={{fontSize: '0.42rem'}} />
                  {it.statuslabel}
                </span>
              )}
            </div>
            <div className='lt-cp-stats' style={{marginTop: 16}}>
              <div className='lt-cp-stat'>
                <span className='lt-cp-stat-dot' style={{background: meta.color}} />
                <div>
                  <div className='lt-cp-stat-val'>{humanize(timing.minutes)}</div>
                  <div className='lt-cp-stat-lbl'>Dernier signal</div>
                </div>
              </div>
              <div className='lt-cp-stat'>
                <span className='lt-cp-stat-dot' style={{background: bat.color}} />
                <div>
                  <div className='lt-cp-stat-val'>{bat.label}</div>
                  <div className='lt-cp-stat-lbl'>Batterie</div>
                </div>
              </div>
              <div className='lt-cp-stat' style={{gridColumn: 'span 2'}}>
                <span className='lt-cp-stat-dot' style={{background: COLORS.special}} />
                <div>
                  <div className='lt-cp-stat-val' style={{fontSize: '0.8rem'}}>
                    {it.LocationObjectname || it.enginAddress || '—'}
                  </div>
                  <div className='lt-cp-stat-lbl'>Zone actuelle</div>
                </div>
              </div>
            </div>
          </header>

          <div className='lt-cp-list' data-testid='engin-detail-content'>
            <div className='lt-cp-section-title'>
              <i className='pi pi-history' /> Timeline récente
            </div>
            <div className='lt-cp-card' style={{border: 'none', boxShadow: 'none'}}>
              <div className='lt-cp-card-body' style={{paddingTop: 0, border: 'none', background: 'transparent'}}>
                <div className='lt-cp-timeline'>
                  {timing.ref && (
                    <>
                      <div className='lt-cp-tl-item'>
                        <span className='lt-cp-tl-dot' style={{background: meta.color}} />
                        <div>
                          <div className='lt-cp-tl-lbl'>{meta.label}</div>
                          <div className='lt-cp-tl-val'>{timing.ref.local().format('DD/MM/YYYY HH:mm')}</div>
                        </div>
                      </div>
                      <div className='lt-cp-tl-item'>
                        <span className='lt-cp-tl-dot' style={{background: COLORS.muted}} />
                        <div>
                          <div className='lt-cp-tl-lbl'>Durée depuis</div>
                          <div className='lt-cp-tl-val'>{humanize(timing.minutes)}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {it.locationDate && (
                    <div className='lt-cp-tl-item'>
                      <span className='lt-cp-tl-dot' style={{background: COLORS.special}} />
                      <div>
                        <div className='lt-cp-tl-lbl'>Position GPS enregistrée</div>
                        <div className='lt-cp-tl-val'>{it.locationDate}</div>
                      </div>
                    </div>
                  )}
                  {!timing.ref && (
                    <div className='lt-cp-tl-item'>
                      <span className='lt-cp-tl-dot' style={{background: COLORS.muted}} />
                      <div>
                        <div className='lt-cp-tl-lbl'>Aucune donnée temporelle disponible</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='lt-cp-section-title' style={{marginTop: 6}}>
              <i className='pi pi-info-circle' /> Informations
            </div>
            <div className='lt-cp-meta' style={{padding: '4px 6px 12px'}}>
              {it.enginAddress && (
                <div className='lt-cp-meta-row'>
                  <i className='pi pi-map-marker' />
                  <span>{it.enginAddress}</span>
                </div>
              )}
              {it.etatenginname && (
                <div className='lt-cp-meta-row'>
                  <i
                    className={it.etatIconName || 'pi pi-tag'}
                    style={{color: it.etatbgColor || COLORS.subtext}}
                  />
                  <span>État : <strong>{it.etatenginname}</strong></span>
                </div>
              )}
              {it.lastSeenDevice && (
                <div className='lt-cp-meta-row'>
                  <i className='pi pi-wifi' />
                  <span>Détecté via <strong>{it.lastSeenDevice}</strong>{it.lastSeenRssi ? ` · RSSI ${it.lastSeenRssi}` : ''}</span>
                </div>
              )}
              {it.lastUser && (
                <div className='lt-cp-meta-row'>
                  <i className='pi pi-user' />
                  <span>Dernier utilisateur : <strong>{it.lastUser}</strong></span>
                </div>
              )}
              {(it.last_lat && it.last_lng) && (
                <div className='lt-cp-meta-row'>
                  <i className='pi pi-compass' />
                  <span>GPS : {Number(it.last_lat).toFixed(5)}, {Number(it.last_lng).toFixed(5)}</span>
                </div>
              )}
            </div>

            {onSelectItem && (
              <button
                className='lt-cp-card-action'
                style={{marginLeft: 6, marginTop: 4}}
                onClick={() => onSelectItem(it)}
                data-testid='engin-detail-focus'
              >
                <i className='pi pi-arrow-right' /> Centrer la vue sur la carte
              </button>
            )}
          </div>
        </aside>
      </>
    )
  }

  return (
    <>
      <div className='lt-cluster-backdrop' onClick={onClose} data-testid='cluster-panel-backdrop' />
      <aside className='lt-cluster-panel' data-testid='cluster-insights-panel' role='dialog' aria-label='Détails du cluster'>
        {/* ══════ HEADER ══════ */}
        <header className='lt-cp-head'>
          <div className='lt-cp-head-row'>
            <div className='lt-cp-count-badge'>
              <span className='lt-cp-count-num'>{zoneInfo.counts.total}</span>
              <span className='lt-cp-count-lbl'>engins</span>
            </div>
            <button className='lt-cp-close' onClick={onClose} aria-label='Fermer' data-testid='cluster-panel-close'>
              <i className='pi pi-times' />
            </button>
          </div>
          <h2 className='lt-cp-title' title={zoneInfo.name}>{zoneInfo.name}</h2>
          {zoneInfo.address && zoneInfo.address !== zoneInfo.name && (
            <p className='lt-cp-address'>
              <i className='pi pi-map-marker' style={{fontSize: '0.7rem'}} />
              {zoneInfo.address}
            </p>
          )}
          {/* Stat row */}
          <div className='lt-cp-stats'>
            <div className='lt-cp-stat'>
              <span className='lt-cp-stat-dot' style={{background: COLORS.present}} />
              <div>
                <div className='lt-cp-stat-val'>{zoneInfo.counts.present}</div>
                <div className='lt-cp-stat-lbl'>Sur site</div>
              </div>
            </div>
            <div className='lt-cp-stat'>
              <span className='lt-cp-stat-dot' style={{background: COLORS.arrived}} />
              <div>
                <div className='lt-cp-stat-val'>{zoneInfo.counts.arrived}</div>
                <div className='lt-cp-stat-lbl'>Arrivés 1h</div>
              </div>
            </div>
            <div className='lt-cp-stat'>
              <span className='lt-cp-stat-dot' style={{background: COLORS.exited}} />
              <div>
                <div className='lt-cp-stat-val'>{zoneInfo.counts.exited}</div>
                <div className='lt-cp-stat-lbl'>Sortis récents</div>
              </div>
            </div>
            <div className='lt-cp-stat'>
              <span className='lt-cp-stat-dot' style={{background: COLORS.special}} />
              <div>
                <div className='lt-cp-stat-val'>{humanize(zoneInfo.avgMinutes)}</div>
                <div className='lt-cp-stat-lbl'>Durée moy.</div>
              </div>
            </div>
          </div>
        </header>

        {/* ══════ FILTRES ══════ */}
        <div className='lt-cp-filters'>
          <div className='lt-cp-seg'>
            {[
              {key: 'all', label: 'Tous', count: zoneInfo.counts.total},
              {key: 'present', label: 'Sur site', count: zoneInfo.counts.present},
              {key: 'exited', label: 'Sortis', count: zoneInfo.counts.exited},
              {key: 'battery', label: 'Batt. faible', count: zoneInfo.counts.lowBattery},
            ].map((f) => (
              <button
                key={f.key}
                className={`lt-cp-seg-btn ${filter === f.key ? 'is-active' : ''}`}
                onClick={() => setFilter(f.key)}
                data-testid={`cluster-filter-${f.key}`}
              >
                {f.label}
                <span className='lt-cp-seg-count'>{f.count}</span>
              </button>
            ))}
          </div>
          <div className='lt-cp-controls'>
            {families.length > 2 && (
              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className='lt-cp-select'
                data-testid='cluster-family-filter'
              >
                {families.map((f) => (
                  <option key={f} value={f}>{f === 'all' ? 'Toutes familles' : f}</option>
                ))}
              </select>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className='lt-cp-select'
              data-testid='cluster-sort'
            >
              <option value='recent'>Récent en 1er</option>
              <option value='name'>Nom (A-Z)</option>
              <option value='duration'>Durée présence</option>
              <option value='status'>Statut</option>
            </select>
          </div>
        </div>

        {/* ══════ LISTE ══════ */}
        <div className='lt-cp-list' data-testid='cluster-items-list'>
          {visible.length === 0 && (
            <div className='lt-cp-empty'>
              <i className='pi pi-inbox' />
              <p>Aucun engin ne correspond aux filtres actuels</p>
            </div>
          )}
          {visible.map((item) => {
            const meta = BUCKET_META[item._timing.bucket] || BUCKET_META.unknown
            const isExpanded = expanded === item.id
            return (
              <div
                key={item.id}
                className={`lt-cp-card ${isExpanded ? 'is-expanded' : ''}`}
                data-testid={`cluster-item-${item.id}`}
              >
                <div
                  className='lt-cp-card-head'
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                >
                  <span
                    className='lt-cp-card-dot'
                    style={{background: meta.color}}
                    title={meta.label}
                  />
                  <div className='lt-cp-card-main'>
                    <div className='lt-cp-card-title' title={item.reference}>
                      {item.reference || '—'}
                    </div>
                    <div className='lt-cp-card-sub'>
                      {item.famille && <span className='lt-cp-chip'>{item.famille}</span>}
                      {item.statuslabel && (
                        <span className='lt-cp-status' style={{color: item.statusbgColor || COLORS.subtext}}>
                          <i className={`pi pi-circle-fill`} style={{fontSize: '0.42rem'}} />
                          {item.statuslabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='lt-cp-card-right'>
                    <div className='lt-cp-card-time' style={{color: meta.color}}>
                      <i className={`pi ${meta.icon}`} style={{fontSize: '0.72rem'}} />
                      {humanize(item._timing.minutes)}
                    </div>
                    <div className='lt-cp-card-bat' style={{color: item._bat.color}}>
                      <i className='pi pi-bolt' style={{fontSize: '0.65rem'}} />
                      {item._bat.label}
                    </div>
                  </div>
                  <i className={`pi pi-chevron-${isExpanded ? 'up' : 'down'} lt-cp-card-caret`} />
                </div>

                {isExpanded && (
                  <div className='lt-cp-card-body'>
                    {/* Timeline */}
                    <div className='lt-cp-timeline'>
                      {item._timing.ref && (
                        <>
                          <div className='lt-cp-tl-item'>
                            <span className='lt-cp-tl-dot' style={{background: meta.color}} />
                            <div>
                              <div className='lt-cp-tl-lbl'>{meta.label}</div>
                              <div className='lt-cp-tl-val'>
                                {item._timing.ref.local().format('DD/MM/YYYY HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className='lt-cp-tl-item'>
                            <span className='lt-cp-tl-dot' style={{background: COLORS.muted}} />
                            <div>
                              <div className='lt-cp-tl-lbl'>Durée depuis dernier signal</div>
                              <div className='lt-cp-tl-val'>{humanize(item._timing.minutes)}</div>
                            </div>
                          </div>
                        </>
                      )}
                      {item.locationDate && (
                        <div className='lt-cp-tl-item'>
                          <span className='lt-cp-tl-dot' style={{background: COLORS.special}} />
                          <div>
                            <div className='lt-cp-tl-lbl'>Dernière position</div>
                            <div className='lt-cp-tl-val'>{item.locationDate}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Métadonnées */}
                    <div className='lt-cp-meta'>
                      {item.enginAddress && (
                        <div className='lt-cp-meta-row'>
                          <i className='pi pi-map-marker' />
                          <span>{item.enginAddress}</span>
                        </div>
                      )}
                      {item.lastSeenDevice && (
                        <div className='lt-cp-meta-row'>
                          <i className='pi pi-wifi' />
                          <span>Via {item.lastSeenDevice}{item.lastSeenRssi ? ` · RSSI ${item.lastSeenRssi}` : ''}</span>
                        </div>
                      )}
                      {item.lastUser && (
                        <div className='lt-cp-meta-row'>
                          <i className='pi pi-user' />
                          <span>{item.lastUser}</span>
                        </div>
                      )}
                      {item.etatenginname && (
                        <div className='lt-cp-meta-row'>
                          <i
                            className={item.etatIconName || 'pi pi-tag'}
                            style={{color: item.etatbgColor || COLORS.subtext}}
                          />
                          <span>État : {item.etatenginname}</span>
                        </div>
                      )}
                    </div>

                    {onSelectItem && (
                      <button
                        className='lt-cp-card-action'
                        onClick={(e) => { e.stopPropagation(); onSelectItem(item) }}
                        data-testid={`cluster-item-focus-${item.id}`}
                      >
                        <i className='pi pi-arrow-right' /> Centrer sur la carte
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default ClusterInsightsPanel
