import React, {useRef, useState, useEffect} from 'react'
import {MapContainer, Marker, Popup, useMap} from 'react-leaflet'
import BaseMapLayerComponent from '../../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import WorkEventCard from './WorkEventCard'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapUserTracking.css'
import {sampleWorkEvents} from './sampleWorkEvents'
import {ScrollPanel} from 'primereact/scrollpanel'
import {useAppSelector} from '../../../../hooks'
import {getUserHistoric} from '../../slice/rapports.slice'
import moment from 'moment'

const AnimatedMarker = ({event, isActive}) => {
  const map = useMap()
  const markerRef = useRef(null)

  console.log('event', event)
  console.log('isActive', isActive)

  useEffect(() => {
    if (isActive && markerRef.current) {
      map.setView([event.lat, event.lng], 18, {animate: true})
    }
  }, [isActive, event, map])

  return (
    <Marker
      ref={markerRef}
      position={[event.lat, event.lng]}
      icon={L.divIcon({
        className: 'status-marker status-end',
        html: `<div class="marker-inner ${isActive ? 'active' : ''}"></div>`,
        iconSize: [20, 20],
      })}
    >
      <Popup>
        <div>
          <i className={'fas fa-solid fa-map-location-dot text-lg text-blue-500 mr-2'}></i>
          <div className='flex items-center gap-2'>
            <i
              style={{color: event.backgroundColor}}
              className={'fas text-lg text-blue-500 mr-2' + event.icon}
            ></i>
            <p className='font-medium'>
              {event.etatengin.charAt(0).toUpperCase() + event.etatengin.slice(1)}
            </p>
          </div>
          <p className='text-sm'>{moment(event.posDate).format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </Popup>
    </Marker>
  )
}

const MapUserTracking = ({workEvents = sampleWorkEvents, width, height, mapStyle}) => {
  const ref = useRef(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const userHist = useAppSelector(getUserHistoric)
  console.log('userHist MapUserTracking', userHist)

  const center = workEvents.length > 0 ? workEvents[0].location : {lat: 46.8182, lng: 8.2275}

  const handleEventClick = (event) => {
    setActiveEvent(event)
    setSelectedDate(new Date(event.timestamp))
  }

  return (
    <div className='flex gap-4 h-full'>
      <div className='flex-1'>
        <MapContainer
          zoomControl={true}
          scrollWheelZoom={true}
          zoom={15}
          ref={ref}
          center={[center.lat, center.lng]}
          className='rounded-lg'
          style={{
            width: width || '100%',
            height: height || '70vh',
            ...(mapStyle || {}),
          }}
        >
          <BaseMapLayerComponent top={60} right={15} />
          {activeEvent && <AnimatedMarker event={activeEvent} isActive={activeEvent} />}
        </MapContainer>
      </div>
      <div className='w-1/4 p-4 bg-gray-50 rounded-lg'>
        <ScrollPanel style={{width: '100%', height: '65vh'}} className='custombar1'>
          {Array.isArray(userHist) &&
            userHist.map((event) => (
              <WorkEventCard
                key={event.uid}
                selected={activeEvent?.uid == event?.uid}
                event={event}
                onClick={handleEventClick}
                duration={event.Duration}
              />
            ))}
        </ScrollPanel>
      </div>
    </div>
  )
}

export default MapUserTracking
