import {useRef, useState} from 'react'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import IconMap from '../../shared/MapComponent/assets/icons/redMarker.png'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getTagHistory,
  getTagHistoryShow,
  getTagLocation,
  setTagHistory,
  setTagHistoryShow,
  setTagLocation,
  setTagLocationShow,
} from '../../Tag/slice/tag.slice'
import {Image} from 'primereact/image'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem'
import {Divider} from 'primereact/divider'
import CardHistory from './CardHistory'
import {ScrollPanel} from 'primereact/scrollpanel'
import {Button} from 'primereact/button'
import {setToastParams} from '../../../store/slices/ui.slice'

const customIcon = new L.Icon({
  iconUrl: IconMap,
  iconSize: [40, 40],
})

const MapHistoryComponent = (props) => {
  const mapRef = useRef(null)
  const selectedLocation = useAppSelector(getTagLocation)
  const tagHistory = useAppSelector(getTagHistory)
  const show = useAppSelector(getTagHistoryShow)

  const [position, setPosition] = useState([
    selectedLocation?.latitude,
    selectedLocation?.longitude,
  ])
  const dispatch = useAppDispatch()

  const onHide = () => {
    dispatch(setTagHistoryShow(false))
    dispatch(setTagLocation(null))
  }

  const onShow = () => {
    dispatch(setTagHistoryShow(true))
  }

  const onHandleOnClickLayer = (e) => {
    if (e.lat == 0 || e.lng == 0) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'Error',
          detail: 'Position not found',
          position: 'top-right',
        })
      )
      return
    }
    mapRef.current.setView({lat: e.lat, lng: e.lng}, 20)
    setPosition([e.lat, e.lng])
  }

  return (
    <div className='w-full relative'>
      {show ? (
        <div
          style={{zIndex: '10', top: '10px', right: '10px', width: '350px', height: '75vh'}}
          className='bg-white p-2 absolute border-round-lg shadow-lg'
        >
          <div className='w-full flex flex-row justify-content-between align-items-center px-2'>
            <div className='text-2xl text-center text-gray-400 font-semibold'>
              <OlangItem olang='History' />
            </div>
            <Button
              icon='pi pi-times'
              size='large'
              rounded
              text
              severity='danger'
              aria-label='Cancel'
              onClick={onHide}
            />
          </div>
          <Divider />
          <ScrollPanel style={{width: '100%', height: '70vh'}}>
            {Array.isArray(tagHistory) &&
              tagHistory?.map((tag, index) => (
                <CardHistory
                  key={index}
                  image={tag?.enginImage}
                  date={tag?.relationDate}
                  famille={selectedLocation?.famille}
                  icon={selectedLocation?.icon}
                  iconBgColor={selectedLocation?.iconBgColor}
                  enginName={tag?.enginName}
                  onClick={() => onHandleOnClickLayer(tag)}
                />
              ))}
          </ScrollPanel>
        </div>
      ) : (
        <div
          style={{
            top: '10px',
            right: '10px',
            zIndex: '10',
            width: '40px',
            height: '40px',
            backgroundColor: '#D64B70',
          }}
          onClick={onShow}
          className='flex justify-content-center border-3 border-white align-items-center absolute border-circle cursor-pointer'
        >
          <i className='pi pi-align-right text-xl text-white'></i>
        </div>
      )}

      <MapContainer
        zoomControl={true}
        zoom={15}
        ref={mapRef}
        center={position}
        className=''
        style={{zIndex: '2', width: '100%', height: '78vh', ...(props?.mapStyle || {})}}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy openstreetmap'
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className='flex flex-row'>
              <Image
                src={API_BASE_URL_IMAGE + selectedLocation?.image}
                alt='EngineImage'
                width='50'
                height='50'
                style={{borderRadius: '10px'}}
                preview
              />
              <div className='flex flex-column pl-3 text-left'>
                <strong className='text-xl'>{selectedLocation?.enginName}</strong>
                <strong className='text-xl'>{selectedLocation?.tagName}</strong>
                <div
                  style={{backgroundColor: selectedLocation?.iconBgColor, width: '80px'}}
                  className='p-2 border-round-3xl flex flex-row justify-content-center align-items-center'
                >
                  <i className={`fa-solid ${selectedLocation?.icon} text-2xl text-white`} />
                  <strong className='text-lg pl-2 text-white'>{selectedLocation?.famille}</strong>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default MapHistoryComponent
