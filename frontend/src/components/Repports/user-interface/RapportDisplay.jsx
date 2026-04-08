import React, {useMemo, useState} from 'react'
import {useAppSelector} from '../../../hooks'
import {getDataRapport, getSelectedRapport} from '../slice/rapports.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const RapportDisplay = () => {
  const rapportList = useAppSelector(getDataRapport)
  const selectedRapport = useAppSelector(getSelectedRapport)
  const [expandedGroups, setExpandedGroups] = useState({})

  const isEnginReport = selectedRapport?.decs === 'engin'

  /* Group data for summary */
  const groupedData = useMemo(() => {
    if (!rapportList?.length) return {groups: {}, totalDuration: ''}
    const groups = {}
    rapportList.forEach(item => {
      const key = isEnginReport
        ? (item.reference || item.label || 'Inconnu')
        : (item.Resource || item.worksiteLabel || item.address || 'Inconnu')
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [rapportList, isEnginReport])

  /* Calculate total duration from all entries */
  const totalMinutes = useMemo(() => {
    if (!rapportList?.length) return 0
    let total = 0
    rapportList.forEach(item => {
      const dur = item.DurationFormatted || ''
      const dayMatch = dur.match(/(\d+)\s*day/i) || dur.match(/(\d+)\s*jour/i)
      const hrMatch = dur.match(/(\d+)\s*h/i)
      const minMatch = dur.match(/(\d+)\s*min/i)
      total += (dayMatch ? parseInt(dayMatch[1]) * 1440 : 0) + (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0)
    })
    return total
  }, [rapportList])

  const formatMinutes = (mins) => {
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    const minutes = mins % 60
    let parts = []
    if (days > 0) parts.push(`${days}j`)
    if (hours > 0) parts.push(`${hours}h`)
    parts.push(`${minutes}min`)
    return parts.join(' ')
  }

  const calcGroupMinutes = (items) => {
    let total = 0
    items.forEach(item => {
      const dur = item.DurationFormatted || ''
      const dayMatch = dur.match(/(\d+)\s*day/i) || dur.match(/(\d+)\s*jour/i)
      const hrMatch = dur.match(/(\d+)\s*h/i)
      const minMatch = dur.match(/(\d+)\s*min/i)
      total += (dayMatch ? parseInt(dayMatch[1]) * 1440 : 0) + (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0)
    })
    return total
  }

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({...prev, [key]: !prev[key]}))
  }

  if (!rapportList?.length) {
    return (
      <div className='lt-rpt-display-empty' data-testid="rapport-display-empty">
        <i className='pi pi-chart-bar' style={{fontSize: '3rem', color: '#E2E8F0'}}></i>
        <h3 style={{color: 'var(--lt-text-primary)', fontFamily: 'var(--lt-font-heading)', margin: '12px 0 4px'}}>
          {rapportList[0]?.title || <OlangItem olang='Rapport.list' />}
        </h3>
        <p style={{color: 'var(--lt-text-muted)', fontSize: '0.85rem'}}>Sélectionnez un rapport ou générez-en un nouveau</p>
      </div>
    )
  }

  const groupKeys = Object.keys(groupedData)

  return (
    <div className='lt-rpt-display' data-testid="rapport-display">
      {/* Header */}
      <div className='lt-rpt-display-header' data-testid="rapport-display-header">
        <div>
          <h2 className='lt-rpt-display-title'>
            <i className={isEnginReport ? 'pi pi-box' : 'pi pi-building'} style={{color: '#3B82F6'}}></i>
            {rapportList[0]?.title || 'Rapport de présence'}
          </h2>
          <p className='lt-rpt-display-sub'>
            {isEnginReport ? 'Temps de présence par engin' : 'Temps de présence par site'}
            {' • '}{rapportList.length} entrées • {groupKeys.length} {isEnginReport ? 'engins' : 'sites'}
          </p>
        </div>
        <div className='lt-rpt-display-tabs'>
          <div className='lt-rpt-tab lt-rpt-tab--active'>Résumé</div>
        </div>
      </div>

      {/* Summary Table */}
      <div className='lt-rpt-summary-table' data-testid="rapport-summary-table">
        <div className='lt-rpt-summary-thead'>
          <div className='lt-rpt-summary-th' style={{flex: 3}}>{isEnginReport ? 'Engin' : 'Site / Adresse'}</div>
          <div className='lt-rpt-summary-th' style={{flex: 2}}>{isEnginReport ? 'Site / Adresse' : 'Engin'}</div>
          <div className='lt-rpt-summary-th' style={{flex: 1, textAlign: 'center'}}>Entrées</div>
          <div className='lt-rpt-summary-th' style={{flex: 2, textAlign: 'right'}}>Durée totale</div>
        </div>

        {groupKeys.map((key, idx) => {
          const items = groupedData[key]
          const groupMins = calcGroupMinutes(items)
          const isExpanded = expandedGroups[key]
          return (
            <div key={idx} className='lt-rpt-group' data-testid="rapport-group">
              {/* Group Header */}
              <div className='lt-rpt-group-header' onClick={() => toggleGroup(key)}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 3}}>
                  <i className={`pi ${isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'}`} style={{fontSize: '0.7rem', color: '#94A3B8'}}></i>
                  <i className={isEnginReport ? 'pi pi-box' : 'pi pi-building'} style={{color: '#6366F1', fontSize: '0.85rem'}}></i>
                  <strong>{key}</strong>
                </div>
                <div style={{flex: 2}}></div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <span className='lt-rpt-count-pill'>{items.length}</span>
                </div>
                <div style={{flex: 2, textAlign: 'right'}}>
                  <span className='lt-rpt-duration-pill'>{formatMinutes(groupMins)}</span>
                </div>
              </div>

              {/* Group Detail Rows */}
              {isExpanded && items.map((item, ri) => (
                <div key={ri} className='lt-rpt-detail-row'>
                  <div style={{flex: 3, paddingLeft: 38}}>
                    <div style={{fontSize: '0.72rem', color: 'var(--lt-text-muted)'}}>
                      {item.start} → {item.end}
                    </div>
                  </div>
                  <div style={{flex: 2}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                      <i className='pi pi-map-marker' style={{fontSize: '0.65rem', color: '#10B981'}}></i>
                      <span style={{fontSize: '0.78rem', color: 'var(--lt-text-primary)'}}>
                        {isEnginReport
                          ? (item.Resource || item.worksiteLabel || item.address || 'Adresse inconnue')
                          : (item.reference || item.label || 'Engin inconnu')}
                      </span>
                    </div>
                  </div>
                  <div style={{flex: 1}}></div>
                  <div style={{flex: 2, textAlign: 'right'}}>
                    <span style={{fontSize: '0.78rem', fontWeight: 600, color: 'var(--lt-text-primary)', fontFamily: 'var(--lt-font)'}}>
                      {item.DurationFormatted || '---'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Au Total Card */}
      <div className='lt-rpt-total-card' data-testid="rapport-total-card">
        <div className='lt-rpt-total-label'>Au total</div>
        <div className='lt-rpt-total-grid'>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value'>{groupKeys.length}</div>
            <div className='lt-rpt-total-desc'>{isEnginReport ? 'Engins' : 'Sites'}</div>
          </div>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value'>{rapportList.length}</div>
            <div className='lt-rpt-total-desc'>Entrées</div>
          </div>
          <div className='lt-rpt-total-item'>
            <div className='lt-rpt-total-value lt-rpt-total-value--accent'>{formatMinutes(totalMinutes)}</div>
            <div className='lt-rpt-total-desc'>Temps total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RapportDisplay
