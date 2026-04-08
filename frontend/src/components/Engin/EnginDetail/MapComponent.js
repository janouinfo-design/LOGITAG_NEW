import React, {forwardRef, memo, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {
  FeatureGroup,
  LayerGroup,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMapEvent,
  ZoomControl,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import HistoryList from '../../shared/HistoryComponent/HistoryList'
import GeofenceListSelectedSiteComponent from '../../Site/user-interface/SiteDetail/Map/List/GeofenceListSelectedSiteComponent'
import HistoryListComponent from '../../shared/HistoryComponent/HistoryListComponent'
import {Message} from 'primereact/message'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {setAlertParams} from '../../../store/slices/alert.slice'
import {Toast} from 'primereact/toast'
import {
  getGeoByIdPos,
  getSelectedEngine,
  getShowHistory,
  setSelectedHistory,
} from '../slice/engin.slice'
import CardHistory from './CardHistory'
import L from 'leaflet'
import * as turf from '@turf/turf'
import BaseMapLayerComponent from '../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import RedMarker from '../../../assets/icons/redMarker (2).png'
import {setToastParams} from '../../../store/slices/ui.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {arrowPolyline} from './util'

const redIcon = new L.Icon({
  iconUrl: RedMarker,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
})

const MapComponent = forwardRef((props) => {
  const toast = useRef(null)
  const [polygonCoordinates, setPolygonCoordinates] = useState(null)

  const [routeLine, setRouteLine] = useState(null)
  const [timelineFilter, setTimelineFilter] = useState('all')

  const [zoom, setZoom] = useState(20)
  const ref = useRef(null)
  const editorRef = useRef(null)
  const routeLayer = useRef(null)
  const geometryFeature = useRef()
  const dispatch = useAppDispatch()
  const [center, setCenter] = useState({
    lat: props.position.last_lat || 46.8182,
    lng: props.position.last_lng || 8.2275,
  })
  const [enginCenter, setEnginCenter] = useState({
    lat: props.position.last_lat || 46.8182,
    lng: props.position.last_lng || 8.2275,
  })

  const showHistoryList = useAppSelector(getShowHistory)
  const selectedGeoPos = useAppSelector(getGeoByIdPos)
  const selectedEng = useAppSelector(getSelectedEngine)

  const MapEvents = (props) => {
    useMapEvent('click', (e) => {})
    useMapEvent('overlayadd', (e) => {})
    useMapEvent('pm:create', (e) => {})
    useMapEvent('pm:globaleditmodetoggled', (e) => {})
    useMapEvent('pm:globalremovalmodetoggled', (e) => {})
  }

  const onHandleOnClickLayer = (e, index) => {
    if (e.satlat == 0 || e.satlng == 0) {
      return
    }
    let latitude = +e?.satlat || +e.lat
    let longitude = +e?.satlng || +e.lng
    const currentZoom = ref.current.getZoom()
    ref.current.setView({lat: latitude, lng: longitude}, currentZoom)
    setEnginCenter({lat: latitude, lng: longitude})
    // geometryFeature.current.clearLayers()
    dispatch(setSelectedHistory(index))
  }

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

  const displayLastSeen = () => {
    if (selectedEng?.last_lat == 0 || selectedEng?.last_lng == null) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERREUR',
          detail: 'Erreur de position',
          position: 'top-right',
        })
      )
      return
    }
    if (!geometryFeature.current || !ref.current) return
    const currentZoom = ref.current.getZoom()
    ref.current.setView([selectedEng.last_lat, selectedEng.last_lng], currentZoom)
    setCenter({lat: selectedEng.last_lat, lng: selectedEng.last_lng})
  }

  const displayGeoLog = (selectedGeoPos) => {
    if (selectedGeoPos?.coordinates) {
      let geoJson = {
        type: 'Feature',
        properties: {},
        geometry: selectedGeoPos,
      }
      let feature = L.geoJson(geoJson)
      geometryFeature.current.addLayer(feature)
      ref.current.fitBounds(feature.getBounds())
    } else if (selectedGeoPos?.length) {
      const polygon = selectedGeoPos[0]?.geometry
      if (!geometryFeature.current) return
      geometryFeature.current.clearLayers()
      let polygonGeoJson = {
        type: 'Feature',
        properties: {},
        geometry: polygon?.geometry,
      }
      let feature = L.geoJson(polygonGeoJson)
      geometryFeature.current.addLayer(feature)
      const bounds = calculateBounds(polygon)
      const center = calculateCenter(polygon)
      if (ref.current && center) {
        ref.current.fitBounds(bounds, {padding: [50, 50], maxZoom: 24})
      }
    }
  }

  useEffect(() => {
    displayLastSeen()
  }, [props.onClickLast])

  useEffect(() => {
    displayGeoLog(selectedGeoPos)
  }, [selectedGeoPos])

  useEffect(() => {
    setTimeout(() => {
      if (routeLayer.current) {
        // routeLayer.current.setLatLngs([])
        // if(Array.isArray(props.routePositions) && props.routePositions?.length> 1){
        //   routeLayer.current.setLatLngs(props.routePositions)
        //   ref.current.setBounds(routeLayer.current.getBounds())
        // }

        if (Array.isArray(props.routePositions) && props.routePositions?.length > 1) {
          let line = new arrowPolyline(props.routePositions, {
            weight: 5,
          }).addTo(ref.current, {
            arrowUrll: 'https://icon-library.com/images/top-view-car-icon/top-view-car-icon-18.jpg',
          })
          ref.current.fitBounds(line.getBounds())
          setRouteLine(line)
        }
      }
    }, 3000)
  }, [props.routePositions])

  return (
    <div
      className='flex flex-column'
      style={{display: 'flex', position: 'relative', width: '100%'}}
    >
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '75vh',
          zIndex: 10,
          padding: '3px',
          top: '0.5rem',
          right: '0.5rem',
        }}
      >
        <HistoryListComponent
          mapRef={ref}
          allGeo={timelineFilter === 'all' ? props.locationHistory : props.locationHistory?.filter(item => item?.etatenginname === timelineFilter)}
          history={true}
          onDisplayGeo={(e) => {}}
          handleOnClickLayer={(e, index) => {
            onHandleOnClickLayer(e, index)
          }}
          timelineFilter={timelineFilter}
          onFilterChange={setTimelineFilter}
        />
      </div>
      <MapContainer
        zoomControl={true}
        scrollWheelZoom={true}
        zoom={zoom}
        ref={ref}
        center={center}
        className=''
        style={{
          width: props.width ? props.width : '100%',
          height: props.height ? props.height : '70vh',
          ...(props?.mapStyle || {}),
        }}
      >
        {/* <ZoomControl  /> */}
        {/* <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy openstreetmap'
        /> */}
        <FeatureGroup ref={editorRef}></FeatureGroup>
        <BaseMapLayerComponent top={60} right={15} />
        <FeatureGroup ref={geometryFeature} />
        {enginCenter?.lat != 0 && (
          <Marker position={enginCenter} icon={props.icon}>
            {props?.popupTitle === '' ? <Popup>No tag</Popup> : <Popup>{props.popupTitle}</Popup>}
          </Marker>
        )}
        <MapEvents />
        <FeatureGroup positions={[]} ref={routeLayer} />

        {center?.lat != 0 && <Marker position={center} icon={redIcon}></Marker>}
        {Array.isArray(polygonCoordinates) && <Polygon positions={polygonCoordinates} />}
      </MapContainer>
      <Toast ref={toast} />
    </div>
  )
})

export default MapComponent
