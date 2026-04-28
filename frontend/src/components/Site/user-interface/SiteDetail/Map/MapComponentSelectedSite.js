import React, {useCallback, useEffect, useRef, useState} from 'react'
import L, {Icon} from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  useMapEvent,
  TileLayer,
  ZoomControl,
  FeatureGroup,
  Polygon,
  Marker,
  Circle,
} from 'react-leaflet'

import tagIconImg from '../../../../../assets/icons/tag-icon.gif'
import locationIcon from '../../../../shared/MapComponent/assets/icons/location.png'
import _ from 'lodash'
import '../../../../shared/MapComponent/user-interface/style.css'
import {useDispatch} from 'react-redux'

import {
  fetchGeofencingsSelectedSite,
  getGeofencesSelectedSite,
} from '../../../../shared/MapComponent/slice/geofencing.slice'
import * as turf from '@turf/turf'
import markerIcon from '../../../assets/marker.png'
import GeomanComponent from '../../../../shared/MapComponent/user-interface/GeomanComponent/GeomanComponent'
import {saveGeofencing} from '../../../../../store/slices/geofencing.slice'
import {useAppSelector} from '../../../../../hooks'
import {getAddressesSelectedSite} from '../../../slice/addressSite.slice'
import GeofenceListSelectedSiteComponent from './List/GeofenceListSelectedSiteComponent'
import {
  fetchAllGeo,
  fetchGeoForSite,
  getGeoSite,
  getGeoSiteSelectedSite,
  getListGeo,
  getSelectedSite,
} from '../../../slice/site.slice'
import {useSelector} from 'react-redux'
import {setAlertError, setAlertParams} from '../../../../../store/slices/alert.slice'
import GeofenceEditorComponent from '../../../../shared/MapComponent/user-interface/Editors/GeofenceEditorComponent'
import BaseMapLayerComponent from '../../../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
//import GeofenceListSelectedSiteComponent from './List/GeofenceListSelectedSiteComponent'
const layers = [
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
]

let tagIcon = new L.Icon({
  iconUrl: locationIcon,
  iconSize: [30, 30],
  shadowSize: [50, 64],
  iconAnchor: [22, 94],
  shadowAnchor: [4, 62],
  popupAnchor: [-15, -90],
})

let dvIcon = (options) => {
  return L.divIcon({
    html: `
         <div className="bg-transparent" style="display: flex ; gap: 7px; align-items: center">
            <img src="${tagIconImg}" width="15" height="15" alt="icon"/>
            <div class="p-1 bg-blue-500 text-white shadow-2 ">
              <strong>${options.label}</strong>
            </div>
         </div>
      `,
    iconAnchor: [7, 15],
    shadowAnchor: [4, 62],
    popupAnchor: [0, -15],
    iconSize: [15, 15],
    className: '',
  })
}

const customIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [80, 80],
})
const MapComponentSelectedSite = ({
  layers,
  markerNameKey,
  itemDetailTemplate,
  children,
  groups,
  pios,
  piosPosition,
  groupPioBy,
  onSaveGeofence,
}) => {
  const dispatch = useDispatch()

  const [geoList, setGeoList] = useState([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [currentLayer, setCurrentLayer] = useState(null)
  const [piosList, setPiosList] = useState([])
  const [geoNavixy, setGeoNavixy] = useState([])
  const [showPios, setShowPios] = useState(true)

  const [inputsProps, setInputProps] = useState(null)
  const [selectedPioIds, setSelectedPioIds] = useState([])
  const [selectedPioGroups, setSelectedPioGroups] = useState([])
  const [geoLayers, setGeoLayers] = useState({})

  const selectedLocation = useAppSelector(getAddressesSelectedSite)
  const geofences = useAppSelector(getGeofencesSelectedSite)
  const listGeo = useSelector(getListGeo)
  const geoSite = useSelector(getGeoSite)
  const selectedGeo = useSelector(getGeoSiteSelectedSite)

  const [center, setCenter] = useState([
    selectedLocation?.[0]?.lat || 0,
    selectedLocation?.[0]?.lng || 0,
  ])

  const [groupBy, setGroupBy] = useState('')
  const [featureFilterType, setFeatureFilterType] = useState('')
  const [pointFilterLatLng, setPointFilterLatLng] = useState('')
  const [polygonFilterLayer, setPolygonFilterLayer] = useState([])

  const [realList, setRealList] = useState([])
  const mapRef = useRef(null)

  const piosRef = useRef(null)
  const editorRef = useRef(null)
  const pioDetailMap = useRef(null)
  const groupOverlayRef = useRef(null)

  const [poiInfos, setPioInfos] = useState(null)
  const [selectedPio, setSelectedPio] = useState(null)
  const selectedSite = useAppSelector(getSelectedSite)

  const MapEvents = (props) => {
    useMapEvent('click', (e) => {
      if (featureFilterType == 'point') {
        setPointFilterLatLng(e.latlng)
        mapRef.current.flyTo(e.latlng)
      } else if (featureFilterType == 'polygon') {
        // setPolygonFilterLatLngs( prev => [...prev ,[e.latlng.lat , e.latlng.lng]])
      }
    })
    useMapEvent('overlayadd', (e) => {
    })
    useMapEvent('pm:create', (e) => {
      if (featureFilterType !== 'polygon') {
        setShowEditForm(true)
        let layer = e.layer.toGeoJSON()
        setCurrentLayer(e)
        const pt = turf.point([+center[1], +center[0]])
        const geo = layer.geometry.coordinates[0].map((coords) => [coords[0], coords[1]]) // Keep [lng, lat] format for Turf

        // Create the polygon
        const pl = turf.polygon([geo])

        // Your custom intersection check
        const checkInterSec = checkIntersection(listGeo, pl, e.layer)
        if (checkInterSec) {
          return
        }

        // Check if the point is inside the polygon
        const isInside = turf.booleanPointInPolygon(pt, pl)
        if (!isInside) {
          mapRef.current.removeLayer(e.layer)
          dispatch(
            setAlertError({
              title: 'Alert',
              message: 'You are Note inside the Position',
              acceptClassName: 'p-button-danger',
              icon: 'pi pi-ban',
              visible: true,
              accept: () => {
                dispatch(setAlertError({visible: false}))
                setShowEditForm(false)
                setCurrentLayer(null)
              },
            })
          )
          return
        }
      } else {
        setTimeout(() => {
          setPolygonFilterLayer(e)
        }, 10)

        setTimeout(() => {
          toggleButtons()
        }, 1000)
        e.layer.on('pm:remove', (e) => {
          setPolygonFilterLayer(null)
        })
      }
    })
    useMapEvent('pm:globaleditmodetoggled', (e) => {
      let layer = e.layer.toGeoJSON()
      if (!e.enabled) {
        setShowEditForm(true)
        setCurrentLayer(e)
      }
    })
    useMapEvent('pm:globalremovalmodetoggled', (e) => {
    })
  }

  function removeLayer() {
    setCurrentLayer(null)
    if (currentLayer?.layer) {
      currentLayer.layer.remove()
      mapRef.current.removeLayer(currentLayer.layer)
    }
  }

  function isPointInLayer(latlng, layer, options) {
    latlng = turf.point(Array.isArray(latlng) ? latlng : [latlng.lng, latlng.lat])
    let isInside = false

    if (!/^circle$/.test(options?.type || '')) {
      isInside = turf.inside(latlng, layer)
    } else {
      if (options?.center) {
        // let circle = turf.circle(turf.point(Array.isArray(options?.center) ? options?.center :[options?.center?.lng , options?.center?.lat]) , options?.radius);
        let center = turf.point(
          Array.isArray(options?.center)
            ? options?.center
            : [options?.center?.lng, options?.center?.lat]
        )
        isInside = turf.distance(center, latlng, {units: 'meters'}) <= options?.radius // turf.inside(latlng , circle)
      }
    }
    return isInside
  }

  function findPointsInLayer(featuresPoint, layer, options) {
    let insides = []
    for (let point of featuresPoint) {
      if (isPointInLayer(point, layer, options)) insides.push(point)
    }
    return insides
  }

  const group = (_list) => {
    let list = _.cloneDeep(_list)
    if (!Array.isArray(list)) list = []
    list.forEach((o) => {
      o[groupBy] =
        o[groupBy] === undefined || (featureFilterType == 'point' && pointFilterLatLng != null)
          ? 'Principal'
          : o[groupBy]
    })
    let group = _.groupBy(list, groupBy)
    let groupList = []

    if (Object.keys(group).length == 0)
      group = {
        Principal: list,
      }

    for (let [k, v] of Object.entries(group)) {
      groupList.push({
        label: k,
        items: v,
      })
    }

    return groupList
  }

  function displayGeofences() {
    const displSite = [selectedGeo]
    if (Array.isArray(displSite)) {
      setGeoLayers({})
      setTimeout(() => {
        try {
          if (editorRef.current) editorRef.current.clearLayers()
          // let locals = displSite?.filter((geo) => geo.idnavixy == null)

          // if (displSite[0].from === 'navixy' && displSite[0].geometry.type == 'Polygon') {
          //   let coordinates = displSite[0].geometry.geometry.coordinates
          //   const polygonCoordinates = [...coordinates, coordinates[0]]
          //   const geojson = {
          //     type: 'Feature',
          //     geometry: {
          //       type: 'Polygon',
          //       coordinates: [coordinates],
          //     },
          //     properties: {},
          //   }
          //   const centerNav = turf.centerOfMass(geojson).geometry.coordinates.reverse()
          //   mapRef.current.setView([centerNav[1], centerNav[0]], 18)
          // } else if (displSite[0].from === 'navixy' && displSite[0].geometry.type == 'Circle') {
          //   mapRef.current.setView(selectedGeo?.geometry?.center, 18)
          // }
          let layers = {}
          // for (let o of locals) {
          //   let _layer = null
          //   if ((o.type || '').toLowerCase() == 'circle') {
          //     _layer = L.circle([...o.geometry.geometry.coordinates].reverse(), {
          //       radius: o.geometry?.properties?.radius,
          //       color: 'red',
          //       weight: 0.7,
          //       id: o.id,
          //     })

          //     editorRef.current.addLayer(_layer)
          //     layers[o.id] = _layer
          //     continue
          //   } else {
          //   }
          //   let geo = L.geoJSON(o.geometry, {color: 'red', weight: 0.7, id: o.id})
          //   geo.eachLayer((layer) => {
          //     _layer = layer
          //   })

          //   _layer.on('pm:edit', (e) => {
          //     const layer = e.layer.toGeoJSON()
          //     setInputProps(layer?.properties)
          //     // dispatch(setSelectedGeoEdit(layer))
          //     setCurrentLayer(e)
          //     setShowEditForm(true)
          //   })
          //   _layer.on('pm:change', (e) => {
          //     setCurrentLayer(e)
          //     setShowEditForm(true)
          //   })
          //   _layer.on('pm:remove', (e) => {
          //   })
          //   editorRef.current.addLayer(_layer)
          //   layers[o.id] = _layer

          //   mapRef.current.fitBounds(_layer.getBounds())
          // }

          // setGeoLayers(layers)

          if (selectedGeo && selectedGeo?.geometry?.type == 'Feature') {
            let coordinates = selectedGeo.geometry.geometry.coordinates.map((o) => [o[1], o[0]])

            mapRef.current.fitBounds(L.latLngBounds(coordinates))
            editorRef.current.addLayer(
              L.geoJSON(selectedGeo.geometry, {color: 'green', weight: 0.7})
            )
            let getCenterOfGeo = turf.centerOfMass(selectedGeo.geometry)

            mapRef.current.setView(
              [getCenterOfGeo.geometry.coordinates[1], getCenterOfGeo.geometry.coordinates[0]],
              18
            )
          } else if (Array.isArray(geoSite) && geoSite?.[0]?.geometry?.type == 'Feature') {
            let coordinates = geoSite[0].geometry.geometry.coordinates.map((o) => [o[1], o[0]])
            mapRef.current.fitBounds(L.latLngBounds(coordinates))
            editorRef.current.addLayer(
              L.geoJSON(geoSite[0].geometry, {color: 'green', weight: 0.7})
            )
            let getCenterOfGeo = turf.centerOfMass(geoSite[0].geometry)

            mapRef.current.setView(
              [getCenterOfGeo.geometry.coordinates[1], getCenterOfGeo.geometry.coordinates[0]],
              18
            )
          }
        } catch (e) {
        }
      }, 300)
    }
  }

  const checkIntersection = (geofencesArray, geofenceToCheck, layer) => {
    try {
      if (Array.isArray(geofenceToCheck?.geometry?.coordinates)) {
        geofenceToCheck.geometry.coordinates[0] = geofenceToCheck.geometry.coordinates[0].map(
          (o) => [o[0], o[1]]
        )
      }
      for (let geofence of geofencesArray) {
        if (geofence?.geometry?.type && geofence?.geometry?.type === 'Feature') {
          const geofencePolygon = geofence.geometry
          let intersectFeature = turf.intersect(geofencePolygon, geofenceToCheck)
          if (intersectFeature) {
            let geoJson = L.geoJSON(intersectFeature, {
              color: 'red',
            })
            editorRef.current.addLayer(geoJson)
            mapRef.current.fitBounds(geoJson.getBounds())
            geoJson.bringToFront()
            setTimeout(() => {
              dispatch(
                setAlertError({
                  title: 'Alert',
                  message: `You have intersected with the Position of  `,
                  acceptClassName: 'p-button-success',
                  icon: 'pi pi-exclamation-triangle',
                  visible: true,
                  strongMsg: geofence?.label,
                  accept: () => {
                    dispatch(setAlertError({visible: false}))
                    dispatch(setShowEditForm(false))
                  },
                })
              )
              mapRef.current.removeLayer(layer)
              editorRef.current.clearLayers()
            }, 1000)

            return true
          }
        }
      }
      return false // Return false if none intersect
    } catch (e) {
      return -1
    }
    // Return false if none intersect
  }

  const saveGeofenceEdit = useCallback(
    (data) => {
      let _layer = currentLayer?.layer
      if (!_layer?.toGeoJSON) return

      let layer = _layer.toGeoJSON()
      layer.properties = {...data, type: currentLayer.shape.toLowerCase()}

      if (Array.isArray(data.tags)) layer.properties.tags = data.tags.join('|')
      if (currentLayer.shape.toLowerCase() == 'circle') {
        layer.properties.radius = _layer?.options?.radius
      }

      const newObj = {
        ...layer,
        id: geoSite?.[0]?.id || 0,
        properties: {
          ...layer.properties,
          worksiteId: selectedSite?.id,
        },
      }
      // return
      dispatch(saveGeofencing(newObj)).then((res) => {
        if (res?.payload) {
          if (currentLayer.layer) currentLayer.layer.remove()
          setShowEditForm(false)
          setCurrentLayer(null)
          dispatch(fetchGeoForSite(selectedSite?.id))
        }
      })
      if (typeof onSaveGeofence == 'function') {
        onSaveGeofence(layer, data)
      }
    },
    [onSaveGeofence, currentLayer]
  )
  const cancelGeofenceEdit = useCallback(
    (data) => {
      setShowEditForm(false)
      if (typeof currentLayer?.layer?.remove == 'function') currentLayer.layer.remove()
      setCurrentLayer(null)
    },
    [currentLayer]
  )

  const toggleLocation = () => {
    if (mapRef.current && +selectedLocation[0]?.lat) {
      mapRef.current.setView([+selectedLocation[0]?.lat, +selectedLocation[0]?.lng], 20)
    }
  }

  useEffect(() => {
    // Check if selectedLocation has a value and update center accordingly
    if (selectedLocation && selectedLocation[0]) {
      setCenter([+selectedLocation[0]?.lat || 0, +selectedLocation[0]?.lng || 0])
      toggleLocation()
    }
  }, [selectedLocation])

  useEffect(() => {
    if (editorRef.current) {
      displayGeofences()
    }
  }, [selectedGeo, editorRef, geoSite])

  useEffect(() => {
    dispatch(fetchGeofencingsSelectedSite())
    dispatch(fetchAllGeo())
  }, [])

  const toggleButtons = () => {
    let circleElement = document.querySelector(
      '[title="Draw Circle"] > .leaflet-buttons-control-button'
    )
    let polygonElement = document.querySelector(
      '[title="Draw Polygons"] > .leaflet-buttons-control-button'
    )


    if (circleElement) {
      if (featureFilterType == 'polygon') {
        circleElement.classList.add('bg-blue-300')
      } else {
        circleElement.classList.remove('bg-blue-300')
      }
    }
    if (polygonElement) {
      if (featureFilterType == 'polygon') {
        polygonElement.classList.add('bg-blue-300')
      } else {
        polygonElement.classList.remove('bg-blue-300')
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (editorRef.current) {
        displayGeofences()
      }
    }, 1000)
  }, [])

  useEffect(() => {
    toggleButtons()
  }, [featureFilterType])

  return (
    <div className='relative '>
      <div
        style={{
          position: 'absolute',
          height: '400px',
          minWidth: '100%',
          width: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {showEditForm && (
          <div
            style={{
              position: 'absolute',
              height: '400px',
              minWidth: '100%',
              top: '50px',
              width: 'auto',
              boxSizing: 'border-box',
              right: '7px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 'auto',
                height: 'auto',
                zIndex: 10,
                padding: '3px',
                top: '0.5rem',
                right: '0.5rem',
              }}
            >
              <GeofenceEditorComponent
                _inputs={inputsProps}
                onSave={saveGeofenceEdit}
                onCancel={cancelGeofenceEdit}
              />
            </div>
          </div>
        )}
        {!showEditForm && (
          <div
            style={{
              position: 'absolute',
              height: '400px',
              minWidth: '100%',
              top: '50px',
              width: 'auto',
              boxSizing: 'border-box',
              right: '7px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 'auto',
                height: 'auto',
                zIndex: 10,
                padding: '3px',
                top: '0.5rem',
                right: '0.5rem',
              }}
            >
              <GeofenceListSelectedSiteComponent
                onClickGeo={displayGeofences}
                mapRef={mapRef}
                removeLayer={removeLayer}
              />
            </div>
          </div>
        )}
      </div>

      <div
        onClick={toggleLocation}
        style={{
          position: 'absolute',
          top: '20%',
          width: '60px',
          height: '60px',
          right: '16px',
          zIndex: 2,
        }}
        className='border-circle border-2 border-white hover:shadow-4 bg-blue-100 flex justify-content-center align-items-center cursor-pointer'
      >
        <i className='pi pi-map-marker text-3xl text-blue-600'></i>
      </div>

      <MapContainer
        ref={mapRef}
        minZoom={1}
        maxZoom={22}
        zoom={18}
        zoomControl={false}
        center={center}
        style={{width: '100%', height: '100vh'}}
      >
        <MapEvents />
        {/* <TileLayer
          maxNativeZoom={18}
          minZoom={1}
          maxZoom={22}
          attribution='&copy openstreetmap'
          url='http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        /> */}
        <BaseMapLayerComponent />

        <FeatureGroup ref={editorRef}></FeatureGroup>
        {/* {selectedGeo?.from === 'navixy' && selectedGeo?.geometry?.type === 'Polygon' && (
          <Polygon
            positions={selectedGeo?.geometry?.geometry?.coordinates}
            color='red'
            fillOpacity={0.4}
          />
        )} */}
        {/* <MarkerClusterGroup ref={piosRef}>
          {realList.map((pio) => {
            if (pio && !isNaN(pio?.lat) && !isNaN(pio?.lng) && selectedPioIds.includes(pio.id))
              return (
                <Marker
                  position={{lat: pio?.lat, lng: pio?.lng}}
                  icon={dvIcon({label: pio[markerNameKey] || pio?.label})}
                />
              )
            else return null
          })}
        </MarkerClusterGroup> */}
        <FeatureGroup>
          <Marker position={center} icon={customIcon} />
        </FeatureGroup>
        <GeomanComponent actions={['polygon']} show={!showEditForm} />
        <ZoomControl position='bottomright' />
        {children}
      </MapContainer>
    </div>
  )
}

export default MapComponentSelectedSite
