import {Chip, Checkbox, Button} from 'primereact'

import {useEffect, useState, memo, useRef} from 'react'

import {ProgressSpinner} from 'primereact/progressspinner'
import {ConfirmDialog} from 'primereact/confirmdialog'
import {Toast} from 'primereact/toast'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem'
import SateliteDataCard from '../SateliteDataCard/SateliteDataCard'
import CardHistory from '../../Engin/EnginDetail/CardHistory'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getGeoByIdGeo,
  getGeoByIdSite,
  getParamCardHis,
  getSelectedEngine,
  getSelectedHistory,
  setGeoByIdSite,
  setParamCadHis,
} from '../../Engin/slice/engin.slice'

const HistoryListComponent = (props) => {
  const toast = useRef(null)

  const [filterText, setFilterText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedHisto = useAppSelector(getSelectedHistory)
  const paramList = useAppSelector(getParamCardHis)
  const selectedEng = useAppSelector(getSelectedEngine)

  const dispatch = useAppDispatch()

  const filter = (val) => {
    setFilterText(val)
  }

  const hidList = () => {
    dispatch(setParamCadHis({showList: false}))
  }

  const showList = () => {
    dispatch(setParamCadHis({showList: true}))
  }

  const getGeo = (item) => {
    // if (item?.locationGeometry) {
    //   dispatch(setGeoByIdSite(item?.locationGeometry))
    // }
    if (item?.geofenceID) {
      dispatch(getGeoByIdGeo({id: item?.geofenceID}))
      return
    }
    dispatch(getGeoByIdSite(item?.worksiteId))
  }



  return (
    <>
      {paramList?.showList ? (
        <div
          className='lt-timeline-panel scalein animation-duration-1000'
          data-testid="timeline-panel"
        >
          <div className='lt-timeline-panel-header'>
            <div className='lt-timeline-panel-title'>
              <i className='pi pi-history' style={{fontSize: '1rem'}}></i>
              <span>{paramList.title || 'Journal d\'activité'}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <div className="lt-timeline-filters" data-testid="timeline-filters">
                <button className={`lt-timeline-filter-pill ${!props.timelineFilter || props.timelineFilter === 'all' ? 'lt-timeline-filter-pill--active' : ''}`} onClick={() => props.onFilterChange && props.onFilterChange('all')} data-testid="timeline-filter-all">Tout</button>
                <button className={`lt-timeline-filter-pill ${props.timelineFilter === 'reception' ? 'lt-timeline-filter-pill--active' : ''}`} onClick={() => props.onFilterChange && props.onFilterChange('reception')} data-testid="timeline-filter-entry">Entrées</button>
                <button className={`lt-timeline-filter-pill ${props.timelineFilter === 'exit' ? 'lt-timeline-filter-pill--active' : ''}`} onClick={() => props.onFilterChange && props.onFilterChange('exit')} data-testid="timeline-filter-exit">Sorties</button>
              </div>
              <button
                onClick={hidList}
                className='lt-timeline-close-btn'
                data-testid="timeline-close-btn"
              >
                <i className='pi pi-times'></i>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{display: 'flex', justifyContent: 'center', padding: '40px 0'}}>
              <ProgressSpinner
                style={{width: '40px', height: '40px'}}
              />
            </div>
          ) : props.allGeo?.length === 0 ? (
            <div className='lt-timeline-empty'>
              <i className='pi pi-inbox' style={{fontSize: '2rem', color: 'var(--lt-text-muted)'}}></i>
              <p><OlangItem olang='No.Data' /></p>
            </div>
          ) : (
            <div>
              <Toast ref={toast} />
              <ConfirmDialog />
              {!props.history && props?.allGeo?.length > 1 && (
                <div style={{padding: '0 16px 12px'}}>
                  <div className='lt-timeline-search'>
                    <i className='pi pi-search' style={{fontSize: '0.8rem', color: 'var(--lt-text-muted)'}}></i>
                    <input
                      type='text'
                      placeholder='Rechercher...'
                      value={filterText}
                      onChange={(e) => filter(e.target.value)}
                      className='lt-timeline-search-input'
                      data-testid="timeline-search"
                    />
                    {filterText && (
                      <i className='pi pi-times-circle' style={{cursor: 'pointer', color: 'var(--lt-text-muted)', fontSize: '0.8rem'}} onClick={() => setFilterText('')} />
                    )}
                  </div>
                </div>
              )}

              <div
                className='lt-timeline-list'
                data-testid="timeline-list"
              >
                {props.allGeo?.length > 0 &&
                  props.allGeo?.map((o, index) => (
                    <div
                      className='lt-timeline-item-wrap'
                      onClick={() => {
                        props.handleOnClickLayer(o, index)
                      }}
                      key={o.id}
                    >
                      <CardHistory
                        item={o}
                        state={o.etatLabel}
                        address={o.enginAddress}
                        seen={o.PeriodEnd}
                        duration={o.DurationFormatted || '---'}
                        etatIcon={o.iconName}
                        bgEtat={o.bgColor}
                        iconStat={o.etatIconName}
                        site={o.worksiteLabel}
                        selected={selectedHisto === index}
                        dateFin={o.dateFin}
                        onDisplayGeo={() => getGeo(o)}
                        enginState={o?.etatenginname}
                        herderDisplay={paramList?.title}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='w-full flex flex-row justify-content-end align-items-center'>
          <button
            onClick={showList}
            className='lt-timeline-toggle-btn'
            data-testid="timeline-toggle-btn"
          >
            <i className='pi pi-history' style={{fontSize: '1rem'}}></i>
          </button>
        </div>
      )}
    </>
  )
}

export default memo(HistoryListComponent)
