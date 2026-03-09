import {
  Circle,
  FeatureGroup,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  ZoomControl,
  useMapEvent,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import './Style.css'
import {useEffect, useRef, useState, memo} from 'react'
import L, {Icon} from 'leaflet'
import ReactDomServer from 'react-dom/server'
// import Search from 'react-leaflet-search'

import markerIcon from './icon/marker.png'
import {EditControl} from 'react-leaflet-draw'
import GeofencingEditor from './GeofencingEditor/GeofencingEditor'
import GeofencingList from './GeofencingList/GeofencingList'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {
  fetchListNavixyLink,
  fetchPointGeoLocal,
  getGeoPointLocal,
  getGeofences,
  getSelectedGeofenceId,
  removeGeofencing,
  saveGeofencing,
} from '../../store/slices/geofencing.slice'
import {Chip} from 'primereact'
import {Button} from 'react-bootstrap'

import useMapHook from '../shared/MapHook/MapHook'
import {getNewTags, getSelectedVehicle} from '../Vehicle/slice/vehicle.slice'
import GeoList from '../Site/user-interface/SiteDetail/GeoList'
import {
  fetchPointsGeo,
  getGeofencing,
  getHashs,
  getPointGeo,
  getSelectedGeo,
  getUserAuth,
} from '../Navigxy/slice/navixy.slice'
import LinkTo from '../Site/user-interface/SiteDetail/LinkTo'
import {getGeoSite} from '../Site/slice/site.slice'

const GeofencingComponent = (props) => {
  let [input, setInput] = useState('')
  let [isLocate, setIsLocate] = useState(true)
  let selectedGeo = useAppSelector(getSelectedGeo)
  let geoPoints = useAppSelector(getPointGeo)
  let hash = useAppSelector(getHashs)
  let pointGeoLocal = useAppSelector(getGeoPointLocal)

  const ref = useRef(null)
  let geoRef = useRef(null)
  const mapRef = useRef(null)
  const [currentGeo, setCurrentGeo] = useState(null)
  const [pointsGeo, setPointsGeo] = useState()
  const [circle, setCircle] = useState(null)
  const [isEdit, setIsEdit] = useState(null)
  const [geoLayers, setGeoLayers] = useState({})

  const editorRef = useRef(null)

  const geofences = useAppSelector(getGeofences)
  const selectedGeofence = useAppSelector(getSelectedGeofenceId)
  let geoWorkSite = useAppSelector(getGeoSite)

  const [center, setCenter] = useState({lat: 46.8182, lng: 8.2275})
  const [polygonPositions, setPolygonPositions] = useState([])
  const [zoom, setZoom] = useState(13)

  const dispatch = useAppDispatch()
  const selectedVehicule = useAppSelector(getSelectedVehicle)

  const onCreated = (e) => {
    ref.current.addLayer(e.layer)
    setCurrentGeo(e)

    // setTimeout(()=> e.layer.editing.enable() , 1000 )
  }

  const onEdited = (e) => {
  }
  const onDeleted = (e) => {
    if (!e.layers?._layers) return
    const ids = []
    for (let [k, v] of Object.entries(e.layers._layers)) {
      ids.push(v?.options?.id)
    }


    dispatch(removeGeofencing(ids))
  }

  useEffect(() => {
    if (ref.current) ref.current.flyTo(center, zoom, {})
  }, [center])

  const onFormEditCanceled = () => {
    if (currentGeo) currentGeo?.layer?.remove()
    setCurrentGeo(null)
  }

  const saveGeo = (inputs) => {
    if (!currentGeo?.layer?.toGeoJSON && !currentGeo?.feature) return


    let layer = (currentGeo?.layer || currentGeo)?.toGeoJSON()
    layer.properties = {...inputs, tags: inputs.tags.join('|'), type: currentGeo.layerType}

    if (currentGeo.layerType == 'circle') {
      layer.properties.radius = currentGeo?.layer?.options?.radius
    }


    dispatch(saveGeofencing(layer)).then(({payload}) => {
      if (!payload?.error) {
        if (currentGeo) currentGeo?.layer?.remove()
        setCurrentGeo(null)
      }
    })
  }

  useEffect(() => {
    setTimeout(() => {
      if (geoRef.current) {
        geoRef.current.eachLayer((layer) => {
          if (!layer.setStyle) return
          if (layer.options.id == selectedGeofence) {
            layer.setStyle({weight: 3})
            if (geoRef.current) {
              geoRef.current.fitBounds(layer.getBounds())
            }
          } else {
            layer.setStyle({weight: 0.7})
          }
        })
      }
    }, 1000)
  }, [selectedGeofence])

  useEffect(() => {
    if (selectedVehicule?.lat && selectedVehicule?.lng && typeof ref.current?.flyTo == 'function')
      ref.current.flyTo([selectedVehicule?.lat, selectedVehicule?.lng])
  }, [selectedVehicule])

  const remove = (data) => {
    return
    dispatch(removeGeofencing(data))
  }

  const onEditStop = (e) => {
  }

  const buildPopup = (r) => (
    <div style={{width: '200px'}} className='text-start'>
      <h3>
        {r.label} |
        <i className='pi pi-edit text-primary'></i>
      </h3>
      <p className='text-gray-400'>{r.description}</p>
      <div>
        {(r.tags || '').split('|').map((o) => (
          <Chip label={'#' + o} />
        ))}
      </div>
      <hr />
      <div></div>
    </div>
  )

  function displayGeofences() {
    if (Array.isArray(geofences)) {
      setGeoLayers({})

      setTimeout(() => {
        try {
          if (!geoRef.current) geoRef.current.clearLayers()
          let locals = geofences.filter((geo) => geo.idnavixy == null)
          let layers = {}
          for (let o of locals) {
            if ((o.type || '').toLowerCase() == 'circle') {
              const layer = L.circle([...o.geometry.geometry.coordinates].reverse(), {
                radius: o.geometry?.properties?.radius,
                color: 'red',
                weight: 0.7,
                id: o.id,
              })
              layer.bindPopup(ReactDomServer.renderToString(buildPopup(o)))
              layer.on('edit', (e) => {
                e.target.layerType = o.type
                e.target.feature = {
                  properties: {
                    id: o.id,
                    tags: o.tags,
                    label: o.label,
                    description: o.description,
                  },
                }
                ref?.current?.editing?.enable(false)
                setCurrentGeo(e.target)
              })
              ref.current.addLayer(layer)
              layers[o.id] = layer
              continue
            }
            let geo = L.geoJSON(o.geometry, {color: 'red', weight: 0.7, id: o.id})
            geo.eachLayer((layer) => {
              layer.bindPopup(ReactDomServer.renderToString(buildPopup(o)))
              layer.on('edit', (e) => {
                e.target.layerType = o.type
                setCurrentGeo(e.target)
              })
              geoRef.current.addLayer(layer)
              ref.current.fitBounds(layer.getBounds())

              layers[o.id] = layer
            })
          }

          setGeoLayers(layers)
        } catch (e) {
        }
      }, 300)
    }
  }

  const flyGeoNavixy = (selected) => {
    if (ref.current && selected) {
      const {se, nw} = selected
      const lat = (se.lat + nw.lat) / 2
      const lng = (se.lng + nw.lng) / 2
      const map = ref.current
      map.flyTo([lat, lng], 18, {
        duration: 5,
      })
    }
  }
  useEffect(() => {
    dispatch(fetchListNavixyLink())
  }, [])

  useEffect(() => {
    if (selectedGeo?.idnavixy === null) {
      if (ref.current) {
        let geoJson = L.geoJSON(selectedGeo.geometry)
        ref.current.fitBounds(geoJson.getBounds())
      }
    } else if (selectedGeo?.idnavixy !== null && selectedGeo?.type === 'polygon') {
      const fetchDataAndHandleMap = async () => {
        try {
          await dispatch(fetchPointsGeo({hash: hash, geoId: +selectedGeo?.idnavixy})).then((e) => {
            if (e.meta.requestStatus === 'fulfilled') {
              const newPositions = e.payload.map((point) => [point?.lat, point?.lng])
              setPolygonPositions(newPositions)
              const parsedBoundsPoly = JSON.parse(selectedGeo?.bounds)
              setPointsGeo(geoPoints?.list)
              flyGeoNavixy(parsedBoundsPoly)
            }
          })
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          // setLoading(false)
        }
      }
      fetchDataAndHandleMap()
    } else if (selectedGeo?.idnavixy !== null && selectedGeo?.type === 'circle') {
      const parsedBoundsCir = JSON.parse(selectedGeo?.bounds)
      const center = JSON.parse(selectedGeo?.center)
      flyGeoNavixy(parsedBoundsCir)
      setCircle({center: center, radius: +selectedGeo?.radius})
    }
  }, [selectedGeo])


  useEffect(() => {
    dispatch(getGeofencing(hash))
    setCurrentGeo(null)
    setIsEdit(false)
  }, [])

  useEffect(() => {
    displayGeofences()
  }, [geofences])

  const returnPolygonNavixy = () => {
    return (
      <Polygon
        // pathOptions={{color: `#${selectedGeo.color}`}}
        positions={polygonPositions}
      />
    )
  }

  const returnPolygonLocal = () => {
    return (
      <Polygon
        // pathOptions={{color: `#${selectedGeo.color}`}}
        positions={
          selectedGeo?.geometry?.geometry?.coordinates[0].map((point) => [point[1], point[0]]) || []
        }
      />
    )
  }

  return (
    <div {...props} className='position-relative'>
      <LinkTo labelSite={selectedGeo?.label} />
      <div
        className='position-absolute bg-white  shadow'
        style={{top: '10px', left: '10px', zIndex: '3', width: '300px'}}
      ></div>
      <div
        className='position-absolute bg-white p-4 shadow'
        style={{top: '50px', right: '10px', zIndex: '3', width: '300px'}}
      >
        {currentGeo ? (
          <GeofencingEditor
            inputs={{
              ...(currentGeo?.feature?.properties || {}),
              tags: currentGeo?.feature?.properties?.tags
                ? (currentGeo?.feature?.properties?.tags || '').split('|')
                : null,
              id: currentGeo?.feature?.properties?.id || currentGeo?.options?.id || 0,
            }}
            onCancel={onFormEditCanceled}
            onSave={saveGeo}
          />
        ) : (
          <GeoList />
        )}
      </div>
      <MapContainer
        zoomControl={false}
        maxZoom={20}
        zoom={zoom}
        ref={ref}
        center={center}
        className=''
        style={{zIndex: '2', width: '100%', height: '85vh', ...(props?.mapStyle || {})}}
      >
        <ZoomControl position='bottomright' />
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy openstreetmap'
        />
        <FeatureGroup ref={geoRef}>
          <EditControl
            position='topright'
            onCreated={onCreated}
            onEdited={onEdited}
            onDeleted={onDeleted}
            onDeleteStop={onEditStop}
            onEditStart={() => setIsEdit(true)}
            onEditStop={() => setCurrentGeo(null)}
            className='editor-container'
            ref={editorRef}
          />
        </FeatureGroup>
        {selectedGeo?.type === 'circle' && (
          <Circle center={circle?.center || {lat: 4, lng: 7}} radius={circle?.radius || 1} />
        )}

        {/* Conditionally render Polygon based on idNavixy */}
        {selectedGeo?.idnavixy === null ? returnPolygonLocal() : returnPolygonNavixy()}
      </MapContainer>
    </div>
  )
}

export default memo(GeofencingComponent)
