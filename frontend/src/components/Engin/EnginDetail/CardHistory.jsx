import React from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {formateDate} from '../../../cors/utils/formateDate'
import { Badge } from 'primereact/badge'

const iconsMaping = {
  "mobile": "pi pi-mobile",
  "gateway": "pi pi-wifi",
  "gps": "pi pi-compass",
}
function CardHistory({
  seen,
  duration,
  state,
  iconStat,
  address,
  etatIcon,
  bgEtat,
  selected,
  site,
  dateFin,
  onDisplayGeo,
  item,
  enginState,
  herderDisplay,
}) {
  function truncateText(text) {
    const maxLength = 60
    if (text?.length > maxLength) {
      return text?.substring(0, maxLength) + '...'
    }
    return text
  }

  const deviceNameTemplate = () => {
    if(item?.deviceName){
      return (
        <div className='lt-timeline-device'>
          <i className={`${iconsMaping[item.satMode] || 'pi pi-mobile'}`} style={{fontSize: '0.7rem'}}></i>
          <span>{item.deviceName}</span>
          {item.rssi && <Badge title="force du signal" value={item.rssi} severity="warning" style={{fontSize: '0.6rem', minWidth: '1.2rem', height: '1.2rem', lineHeight: '1.2rem'}}></Badge>}
        </div>
      )
    }
    return null
  }

  const isExit = enginState === 'exit'
  const isPosition = herderDisplay === 'Positions'
  const nodeColor = isExit ? '#EF4444' : '#10B981'
  const nodeIcon = isExit ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-left'

  return (
    <div
      className={`lt-timeline-card ${selected ? 'lt-timeline-card--active' : ''} ${dateFin == 0 ? 'lt-timeline-card--live' : ''}`}
      data-testid="timeline-card"
    >
      {/* Timeline Node */}
      <div className='lt-timeline-node'>
        <div className='lt-timeline-dot' style={{borderColor: nodeColor, background: selected ? nodeColor : '#FFF'}}>
          <i className={nodeIcon} style={{color: selected ? '#FFF' : nodeColor, fontSize: '0.65rem'}}></i>
        </div>
        <div className='lt-timeline-line'></div>
      </div>

      {/* Card Content */}
      <div className='lt-timeline-card-body'>
        {/* Status Badge */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
          <span className='lt-timeline-badge' style={{background: `${nodeColor}14`, color: nodeColor, borderColor: `${nodeColor}30`}}>
            <i className={nodeIcon} style={{fontSize: '0.6rem'}}></i>
            {isExit ? 'Sortie' : isPosition ? 'Position' : 'Entrée'}
          </span>
          {dateFin == 0 && (
            <span className='lt-timeline-live-dot'>
              <span></span> En cours
            </span>
          )}
        </div>

        {/* Dates */}
        <div className='lt-timeline-dates'>
          {isPosition ? (
            <div className='lt-timeline-date-row'>
              <i className='pi pi-calendar' style={{color: '#6366F1', fontSize: '0.75rem'}}></i>
              <span><OlangItem olang='date' /></span>
              <strong>{formateDate(herderDisplay !== 'Positions' ? item?.PeriodStart : item?.PeriodStartIso)}</strong>
            </div>
          ) : (
            <>
              {((isExit && dateFin == 0) || dateFin == 1) && (
                <div className='lt-timeline-date-row'>
                  <i className='pi pi-sign-out' style={{color: '#EF4444', fontSize: '0.75rem'}}></i>
                  <span><OlangItem olang='date.exit' /></span>
                  <strong>
                    {formateDate(isExit ? (herderDisplay !== 'Positions' ? item?.PeriodStart : item?.PeriodStartIso) : (herderDisplay !== 'Positions' ? item?.PeriodEnd : item?.PeriodEndIso))}
                  </strong>
                </div>
              )}
              {((isExit ? false : (dateFin == 0)) || dateFin == 1) && (
                <div className='lt-timeline-date-row'>
                  <i className='pi pi-sign-in' style={{color: '#10B981', fontSize: '0.75rem'}}></i>
                  <span><OlangItem olang={'date.enter'} /></span>
                  <strong>
                    {formateDate(isExit ? item?.PeriodEnd : item?.PeriodStart)}
                  </strong>
                </div>
              )}
            </>
          )}
        </div>

        {/* Duration Pill */}
        <div className='lt-timeline-duration'>
          <i className='pi pi-clock' style={{fontSize: '0.7rem'}}></i>
          <strong>{item?.DurationFormatted || duration}</strong>
        </div>

        {/* Site */}
        {!isExit && (item?.locationName || item?.worksiteLabel) && (
          <div className='lt-timeline-site' onClick={(e) => { e.stopPropagation(); onDisplayGeo(); }}>
            <i className='pi pi-map-marker' style={{color: '#3B82F6', fontSize: '0.75rem'}}></i>
            <span>{item?.locationName || item?.worksiteLabel}</span>
          </div>
        )}

        {/* Device Info */}
        {deviceNameTemplate()}

        {/* Address */}
        {(item?.address || item?.enginAddress) && (
          <div className='lt-timeline-address'>
            <i className='pi pi-compass' style={{fontSize: '0.7rem'}}></i>
            <span>{truncateText(item?.address || item?.enginAddress)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardHistory
