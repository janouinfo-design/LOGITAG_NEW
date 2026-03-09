import React, {useEffect, useRef} from 'react'
import {MapContainer, Marker, Polygon, Popup, TileLayer, ZoomControl} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import L, {Icon} from 'leaflet'
import Logo from '../../../../assets/icons/LOGITAGCMYK.png'
import {useAppSelector} from '../../../../hooks'
import {getGeoLogById} from '../../slice/logs.slice'
import * as turf from '@turf/turf'

const MapDetail = ({center, mapStyle, width, height}) => {
  const ref = useRef(null)

  const geoLog = useAppSelector(getGeoLogById)

  const icon = new Icon({
    iconUrl: Logo,
    iconSize: [30, 40],
  })

  const calculateBounds = (polygon) => {
    const bounds = turf.bbox(polygon)
    const leafletBounds = L.latLngBounds([
      [bounds[1], bounds[0]],
      [bounds[3], bounds[2]],
    ])
    return leafletBounds
  }

  const calculateCenter = (polygon) => {
    const centroid = turf.centroid(polygon)
    return centroid.geometry.coordinates
  }

  function displayGeoLog() {
    if (!geoLog?.length) return
    const polygon = geoLog[0]?.geometry
    const bounds = calculateBounds(polygon)
    const center = calculateCenter(polygon)
    if (ref.current && center) {
      ref.current.fitBounds(bounds, {padding: [50, 50], maxZoom: 24})
    }
  }

  const polygonCoordinates = geoLog?.[0]?.geometry?.geometry?.coordinates[0]?.map((coord) => [
    coord[1],
    coord[0],
  ])

  useEffect(() => {
    displayGeoLog()
  }, [geoLog])

  return (
    <MapContainer
      zoomControl={true}
      zoom={18}
      ref={ref}
      center={center}
      className=''
      style={{
        zIndex: '2',
        width: width ? width : '100%',
        height: height ? height : '85vh',
        ...(mapStyle || {}),
      }}
    >
      {/* <ZoomControl position='bottomright' /> */}
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy openstreetmap'
      />
      {center?.lat != 0 && <Marker position={center} icon={icon} />}
      {Array.isArray(polygonCoordinates) ? <Polygon positions={polygonCoordinates} /> : null}
    </MapContainer>
  )
}

export default MapDetail
