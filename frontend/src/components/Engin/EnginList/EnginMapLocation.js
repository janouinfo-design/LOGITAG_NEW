import {Dialog} from 'primereact/dialog'
import MapComponent from '../EnginDetail/MapComponent'
import logoBlack from '../assets/LOGITAGBLACK.png'
import logoColor from '../assets/LOGITAGCMYK.png'
import L, {Icon} from 'leaflet'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getEnginListHistory,
  getHistoryRoute,
  getSelectedEngine,
  setGeoByIdSite,
  setSelectedEngine,
  setShowHistory,
} from '../slice/engin.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useEffect, useMemo, useRef, useState} from 'react'
import moment from 'moment'
import { useLeafletContext } from '@react-leaflet/core'
import { Polyline } from 'react-leaflet'
import LastSeenComponent from '../EnginDetail/LastSeenComponent'

const EnginMapLocation = ({dialogVisible, setDialogVisible}) => {
  const [childDisplayLastSeen, setChildDisplayLastSeen] = useState(true)

  const selectedEngin = useAppSelector(getSelectedEngine)
  const customIcon = new Icon({
    iconUrl: selectedEngin?.tagId != 0 ? logoColor : logoBlack,
    iconSize: [30, 40],
  })
  const dispatch = useAppDispatch()

  const enginesHistory = useAppSelector(getEnginListHistory)
  const historyRoute = useAppSelector(getHistoryRoute)

  
  const handleLastSeen = () => {
    setChildDisplayLastSeen((prev) => !prev)
  }

  const dateFormatted = (date) => {
    return  <LastSeenComponent data={selectedEngin} />
     
    if (!date?.lastSeenAt || typeof date?.lastSeenAt != 'string') return '_'
    if (date?.lastSeenAt?.includes('+')) return moment(date?.lastSeenAt).format('DD/MM/YYYY HH:mm')
    return moment.utc(date?.lastSeenAt).format('DD/MM/YYYY HH:mm')
  }

  useEffect(()=>{
  }, [historyRoute])

  const dialogTemplate = () => {
    return (
      <div className='lt-journal-header' data-testid="journal-header">
        <div className='lt-journal-header-left'>
          <div className='lt-journal-asset-icon'>
            <i className='pi pi-box'></i>
          </div>
          <div>
            <h2 className='lt-journal-asset-name'>{selectedEngin?.reference || selectedEngin?.label}</h2>
            <p className='lt-journal-asset-sub'>Journal d'activité</p>
          </div>
        </div>
        <div
          onClick={handleLastSeen}
          className='lt-journal-lastseen'
          data-testid="journal-lastseen"
        >
          <div className='lt-journal-lastseen-dot'></div>
          <div className='lt-journal-lastseen-info'>
            {dateFormatted(selectedEngin)}
          </div>
          <i className='pi pi-map-marker' style={{color: '#EF4444', fontSize: '1.1rem'}}></i>
        </div>
      </div>
    )
  }

  const onHide = () => {
    try {
      setDialogVisible(false)
      dispatch(setShowHistory(true))
      dispatch(setGeoByIdSite(null))
      // dispatch(setSelectedEngine(null))
    } catch (error) {
    }
  }

  useEffect(()=>{
  },[historyRoute])

  // useEffect(() => {
  //   dispatch(fetchEnginListHistory(historySrc))
  // }, [])

  return (
    <Dialog
      header={dialogTemplate}
      visible={dialogVisible}
      className='lt-journal-dialog'
      style={{
        width: '82vw',
        height: '88vh',
      }}
      onHide={onHide}
      position='bottom-right'
    >
      <div
        style={{height: '78vh', width: '100%'}}
        className='flex flex-column justify-content-center'
      >
        <MapComponent
          position={{last_lat: selectedEngin?.last_lat, last_lng: selectedEngin?.last_lng}}
          icon={customIcon}
          routePositions = {historyRoute}
          popupTitle={
            selectedEngin?.labeltag === null ||
            selectedEngin?.labeltag === '' ||
            selectedEngin?.labeltag == undefined
              ? selectedEngin?.tagname
              : selectedEngin?.labeltag
          }
          locationHistory={enginesHistory}
          onClickLast={childDisplayLastSeen}
        />
      </div>
    </Dialog>
  )
}

export default EnginMapLocation
