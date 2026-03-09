import {
  FeatureGroup,
  MapContainer,
  ZoomControl,
  TileLayer,
  useMapEvent,
  Marker,
  GeoJSON,
  Popup,
  Polygon,
  Circle,
  useMap,
} from 'react-leaflet'
import L, {Icon} from 'leaflet'
import markerIcon from '../../../Vehicle/assets/icons/marker.png'
import {useState, useRef, useEffect} from 'react'
import {EditControl} from 'react-leaflet-draw'
import GeoList from './GeoList'
import LinkTo from './LinkTo'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchPointsGeo,
  getGeofencing,
  getHashs,
  getPointGeo,
  getPointsGeo,
  getSelectedGeo,
  getUserAuth,
} from '../../../Navigxy/slice/navixy.slice'
import GeofencingList from '../../../Geofencing/GeofencingList/GeofencingList'
import {getGeoSite, getSelectedSite, setShowMapSite} from '../../slice/site.slice'
import {getSelectedGeoClient, getSelectedSiteClient} from '../../../../store/slices/customer.slice'
import {fetchPointGeoLocal, getGeoPointLocal} from '../../../../store/slices/geofencing.slice'
import {Button} from 'primereact/button'

const customIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [50, 50],
})

export default function GeofecingSite(props) {
  const [center, setCenter] = useState([46.8182, 8.2275])
  const [zoom, setZoom] = useState(8)
  const [isEdit, setIsEdit] = useState(true)
  const [currentGeo, setCurrentGeo] = useState(null)
  const [polygonPositions, setPolygonPositions] = useState([])
  const [pointsGeo, setPointsGeo] = useState()
  const [circle, setCircle] = useState()
  const [isCircle, setIsCircle] = useState(false)
  const [centerCoordinates, setCenterCoordinates] = useState()

  const editorRef = useRef(null)
  const mapRef = useRef(null)
  const geoRef = useRef(null)

  const dispatch = useAppDispatch()
  let geoPoints = useAppSelector(getPointGeo)
  let hash = useAppSelector(getHashs)
  let selectedGeo = useAppSelector(getSelectedGeoClient)
  let geoWorkSite = useAppSelector(getGeoSite)
  let geoPointsLocal = useAppSelector(getGeoPointLocal)
  let selectedSite = useAppSelector(getSelectedSite)

  const geometryRef = useRef(null)

  const onEdited = (e) => {
  }
  const onDeleted = (e) => {
    if (!e.layers?._layers) return
    const ids = []
    for (let [k, v] of Object.entries(e.layers._layers)) {
      ids.push(v?.options?.id)
    }
  }

  const onEditStop = (e) => {
  }
  const flyGeoNavixy = (selected) => {
    if (mapRef.current && selected) {
      const {se, nw} = selected
      const lat = (se.lat + nw.lat) / 2
      const lng = (se.lng + nw.lng) / 2
      const map = mapRef.current
      map.flyTo([lat, lng], 18, {
        duration: 5,
      })
    }
  }

  const flyGeoLocal = (geometry) => {
    if (geometry && geometry.type === 'Polygon' && geometry.coordinates.length > 0) {
      const vertices = geometry.coordinates[0] // Assuming a single exterior ring
      let sumLat = 0
      let sumLng = 0

      for (const vertex of vertices) {
        sumLat += vertex[1] // Latitude is the second element in the coordinate pair
        sumLng += vertex[0] // Longitude is the first element in the coordinate pair
      }

      const avgLat = sumLat / vertices.length
      const avgLng = sumLng / vertices.length

      if (mapRef.current) {
        const map = mapRef.current
        map.flyTo([avgLat, avgLng], 18, {
          duration: 5,
        })
      }
    }
  }

  const handleGeoOperation = (data) => {
    if (data?.idnavixy === null && data?.type === 'polygon') {
      setPolygonPositions(
        data?.geometry?.geometry?.coordinates?.[0]?.map((point) => [point[1], point[0]])
      )
      setCenterCoordinates(polygonPositions[0])
      setIsCircle(false)
      flyGeoLocal(data?.geometry?.geometry)
    } else if (data?.idnavixy === null && data?.type === 'circle') {
      const center = data?.geometry?.geometry?.coordinates
      const radius = data?.geometry?.data?.properties?.radius
      setCircle({center: [center[0], center[1]], radius: radius})
      setIsCircle(true)
      if (mapRef.current && center) {
        mapRef.current.flyTo(center, 18, {
          duration: 5,
        })
      }
    } else if (data?.idnavixy !== null && data?.type === 'polygon') {
      dispatch(fetchPointsGeo({hash: hash, geoId: data?.idnavixy})).then((e) => {
        if (e.meta.requestStatus === 'fulfilled') {
          const newPositions = e.payload.map((point) => [point?.lat, point?.lng])
          setPolygonPositions(newPositions)
          const parsedBoundsPoly = JSON.parse(data?.bounds)
          setPointsGeo(geoPoints?.list)
          flyGeoNavixy(parsedBoundsPoly)
          setCenterCoordinates(newPositions)
          setIsCircle(false)
        }
      })
      // flyGeoNavixy(parsedBoundsPoly)
    } else if (data?.idnavixy !== null && data?.type === 'circle') {
      const parsedBoundsCir = JSON.parse(data?.bounds)
      const center = JSON.parse(data?.center)
      setPolygonPositions(center)
      setCircle({center: center, radius: +data?.radius})
      setCenterCoordinates([center?.lat, center?.lng])
      setIsCircle(true)
      flyGeoNavixy(parsedBoundsCir)
    }
  }

  useEffect(() => {
    if (geoWorkSite.length > 0) {
      const data = geoWorkSite[0]
      handleGeoOperation(data)
    }
  }, [geoWorkSite])

  useEffect(() => {
    if (selectedGeo !== null) {
      handleGeoOperation(selectedGeo)
    }
  }, [selectedGeo, geoWorkSite])

  const onCreated = (e) => {
    geometryRef.current.addLayer(e.layer)
    setCurrentGeo(e)
  }

  useEffect(() => {
    dispatch(getGeofencing(hash))
  }, [])

  return (
    <>
      {/* <Button
        className='border-1 border-orange-200 m-4'
        icon='pi pi-times'
        rounded
        text
        severity='danger'
        aria-label='Cancel'
        onClick={props.onShowMap}
      /> */}
      <div {...props} className='position-relative'>
        <LinkTo labelSite={selectedGeo?.label} selectedSite={selectedSite} />
        <div
          className='position-absolute bg-white p-4 shadow'
          style={{top: '50px', right: '10px', zIndex: '3', width: '300px'}}
        >
          <GeofencingList />
        </div>
        <MapContainer
          ref={mapRef}
          zoomControl={false}
          zoom={zoom}
          center={center}
          className=''
          style={{zIndex: '2', width: '100%', height: '85vh', ...(props?.mapStyle || {})}}
        >
          <ZoomControl position='bottomright' />
          {/* <MapEvents /> */}
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy openstreetmap'
          />
          <FeatureGroup>
            {isCircle ? (
              <Circle center={circle?.center || [0.1, 0.2]} radius={circle?.radius || 1} />
            ) : (
              <Polygon positions={polygonPositions} />
            )}
            {/* {(getGeoSite || selectedGeo) && <SetViewOnClick center={centerCoordinates} zoom={20} />} */}
          </FeatureGroup>
        </MapContainer>
      </div>
    </>
  )
}

{
  /* <EditControl
            position='topright'
            draw={{
              marker: false,
              circlemarker: false,
            }}
            onCreated={onCreated}
            onEdited={onEdited}
            onDeleted={onDeleted}
            onDeleteStop={onEditStop}
            onEditStart={() => setIsEdit(true)}
            onEditStop={() => setCurrentGeo(null)}
            className='editor-container'
            ref={editorRef}
          /> */
}
