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
      <div className='flex flex-row justify-content-between align-items-center mx-3'>
        <div>
          <p className='text-2xl'>{selectedEngin?.reference || selectedEngin?.label}</p>
        </div>
        <div
          style={{width: '30%'}}
          className='flex flex-row justify-content-end align-items-center'
        >
          <div
            onClick={handleLastSeen}
            style={{width: '100%'}}
            className='flex flex-row shadow-2 p-ripple justify-content-between cursor-pointer align-items-center bg-white border-round-xl border-2 border-gray-300 h-6rem px-3 rounded-lg'
          >
            <div className='flex flex-row align-items-center gap-2'>
              <i className='fa-solid fa-eye text-2xl text-blue-500'></i>
              <div>
                {/* <OlangItem olang='Last.Seen' />: */}
              </div>
              <strong>{dateFormatted(selectedEngin)}</strong>
            </div>
            <i className='fas fa-solid fa-location-dot text-2xl text-red-500 ml-2'></i>
          </div>
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
      style={{
        width: '78vw',
        height: '85vh',
      }}
      onHide={onHide}
      position='bottom-right'
    >
      <div
        style={{height: '75vh', width: '100%'}}
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
