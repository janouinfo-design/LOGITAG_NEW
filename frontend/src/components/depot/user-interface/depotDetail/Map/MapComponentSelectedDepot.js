import {useCallback, useEffect, useRef, useState} from 'react'
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

import _ from 'lodash'
import '../../../../shared/MapComponent/user-interface/style.css'
import {useDispatch} from 'react-redux'

import {
  fetchGeofencingsSelectedDepot,
  getGeofencesSelectedDepot,
} from '../../../../shared/MapComponent/slice/geofencing.slice'
import * as turf from '@turf/turf'
import markerIcon from '../../../assets/marker.png'
import GeomanComponent from '../../../../shared/MapComponent/user-interface/GeomanComponent/GeomanComponent'
import {saveGeofencingDepot} from '../../../../../store/slices/geofencing.slice'
import {
  fetchAllGeo,
  fetchGeoForDepot,
  getGeoDepot,
  getGeoDepotSelectedDepot,
  getSelectedDepot,
} from '../../../slice/depot.slice'
import {useSelector} from 'react-redux'
import {setAlertError, setAlertParams} from '../../../../../store/slices/alert.slice'
import {getAddresses} from '../../../slice/addressDepot.slice'
import {useAppSelector} from '../../../../../hooks'
import GeofenceListSelectedDepotComponent from './List/GeofenceListSelectedDepotComponent'
import GeofenceEditorComponent from './Editor/GeofenceEditorComponent'
import BaseMapLayerComponent from '../../../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import {getListGeo} from '../../../../Site/slice/site.slice'

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
const MapComponentSelectedDepot = ({
  layers,
  markerNameKey,
  itemDetailTemplate,
  children,
  groups,
  pios,
  piosPosition,
  groupPioBy,
  onSaveGeofence,
  addresses,
}) => {
  const dispatch = useDispatch()

  const selectedLocation = useAppSelector(getAddresses)

  const [geoList, setGeoList] = useState([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [currentLayer, setCurrentLayer] = useState(null)
  const [piosList, setPiosList] = useState([])
  const [geoNavixy, setGeoNavixy] = useState([])
  const [showPios, setShowPios] = useState(true)
  const geofences = useAppSelector(getGeofencesSelectedDepot)
  const listGeo = useSelector(getListGeo)
  const getDepot = useSelector(getGeoDepot)
  const selectedGeo = useSelector(getGeoDepotSelectedDepot)
  const [inputsProps, setInputProps] = useState(null)
  const [selectedPioIds, setSelectedPioIds] = useState([])
  const [selectedPioGroups, setSelectedPioGroups] = useState([])
  const [geoLayers, setGeoLayers] = useState({})

  const [center, setCenter] = useState([0, 0])

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
  const selectedDepot = useAppSelector(getSelectedDepot)

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
        const geo = layer.geometry.coordinates[0].map((coords) => [coords[1], coords[0]])
        const pl = turf.polygon([geo])
        const checkInterSec = checkIntersection(listGeo, pl, e.layer)
        if (checkInterSec) {
          // editorRef.current.removeLayer(polygonFilterLayer)

          return
        }

        let isInside = turf.booleanPointInPolygon(pt, pl)
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
    if (editorRef.current) {
      // currentLayer.layer.remove()
      editorRef.current.clearLayers()
      setCurrentLayer(null)
    }
    if (currentLayer?.layer) {
      currentLayer.layer.remove()
    }
    dispatch(fetchAllGeo())
  }
  const getPiosInPolygon = () => {
    if (typeof polygonFilterLayer?.layer?.toGeoJSON != 'function') return _.cloneDeep(realList)

    let geojsonLayer = polygonFilterLayer?.layer?.toGeoJSON()
    let layer = polygonFilterLayer?.layer
    let options = {
      type: polygonFilterLayer.shape.toLowerCase(),
      radius: layer?.options?.radius,
      center: layer?._latlng,
    }

    let containedPios = findPointsInLayer(_.cloneDeep(realList), geojsonLayer, options)

    return containedPios
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

  const onFilter = (text) => {
    filterList({
      type: 'text',
      val: text,
    })
  }

  const toggleSelectPio = (id, add, item) => {
    setSelectedPioIds((prev) => {
      if (add) return [...prev, id]
      return prev.filter((pio) => pio != id)
    })
  }

  const toggleSelectPioGroup = (group, select) => {
    let groupItem = piosList.find((f) => f.label == group)
    if (groupItem) {
      let ids = groupItem.items.map((o) => o.id)
      setSelectedPioIds((prev) => {
        if (select) return [...prev, ...ids]
        return prev.filter((pio) => !ids.includes(pio))
      })

      setSelectedPioGroups((prev) => {
        if (select) return [...prev, group]
        return prev.filter((pio) => pio != group)
      })
    }
  }

  const checkIntersection = (geofencesArray, geofenceToCheck, layer) => {
    try {
      if (Array.isArray(geofenceToCheck?.geometry?.coordinates)) {
        geofenceToCheck.geometry.coordinates[0] = geofenceToCheck.geometry.coordinates[0].map(
          (o) => [o[1], o[0]]
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
                  message: `You have intersected with the Position of ${geofence?.label}!`,
                  acceptClassName: 'p-button-success',
                  icon: 'pi pi-exclamation-triangle',
                  visible: true,
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
      return false
    } catch (e) {
      return -1
    }
  }

  const filterList = (options) => {
    if (!Array.isArray(realList)) return
    let filtredList = []

    switch (options?.type) {
      case 'text':
        filtredList = realList.filter((pio) => pio.name.includes(options?.val))
        break
      default:
        filtredList = null
    }

    setSelectedPioIds((prev) => filtredList.filter((o) => prev.includes(o.id)).map((o) => o.id))
    setPiosList(group(filtredList))
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
          if (selectedGeo && selectedGeo?.geometry?.type == 'Feature') {
            let coordinates = selectedGeo.geometry.geometry.coordinates.map((o) => [o[1], o[0]])

            mapRef.current.fitBounds(L.latLngBounds(coordinates))
            editorRef.current.addLayer(
              L.geoJSON(selectedGeo.geometry, {color: 'green', weight: 0.7})
            )
            let getCenterOfGeo = turf.centerOfMass(selectedGeo.geometry)

            mapRef.current.setView(
              [getCenterOfGeo.geometry.coordinates[1], getCenterOfGeo.geometry.coordinates[0]],
              20
            )
          } else if (Array.isArray(getDepot) && getDepot?.[0]?.geometry?.type == 'Feature') {
            let coordinates = getDepot[0].geometry.geometry.coordinates.map((o) => [o[1], o[0]])
            mapRef.current.fitBounds(L.latLngBounds(coordinates))
            editorRef.current.addLayer(
              L.geoJSON(getDepot[0].geometry, {color: 'green', weight: 0.7})
            )
            let getCenterOfGeo = turf.centerOfMass(getDepot[0].geometry)

            mapRef.current.setView(
              [getCenterOfGeo.geometry.coordinates[1], getCenterOfGeo.geometry.coordinates[0]],
              20
            )
          }
        } catch (e) {
        }
      }, 300)
    }
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
        id: getDepot?.[0]?.id || 0,
        properties: {
          ...layer.properties,
          depositId: selectedDepot?.id,
        },
      }

      // return
      dispatch(saveGeofencingDepot(newObj)).then((res) => {
        if (res?.payload) {
          if (currentLayer.layer) currentLayer.layer.remove()
          setShowEditForm(false)
          setCurrentLayer(null)
          dispatch(fetchGeoForDepot(selectedDepot?.id))
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

  const toggleOverlay = (ref, e) => {
    ref.current.toggle(e)
  }

  const sortByNearest = (list) => {
    let lst = _.cloneDeep(list || realList)
    if (pointFilterLatLng == null) return lst

    lst.forEach((l) => {
      let distance = turf.distance([l.lat, l.lng], [pointFilterLatLng.lat, pointFilterLatLng.lng], {
        units: 'meters',
      })
      l.realDistance = distance
      l.distanceTo = distance >= 1000 ? (distance / 1000).toFixed(2) : distance.toFixed(2)
      l.distanceUnit = distance >= 1000 ? 'km' : 'm'
    })

    lst.sort((a, b) => a.realDistance - b.realDistance)

    return lst
  }

  const groupPiosBy = (group) => {
    setGroupBy(group)
  }

  const toggleLocation = () => {
    if (mapRef.current) {
      mapRef.current.setView([+selectedLocation[0]?.lat, +selectedLocation[0]?.lng], 20)
    }
  }

  const toggleFeatureFilterType = (type) => {
    setFeatureFilterType((prev) => (prev == type ? '' : type))
  }

  useEffect(() => {
    if (selectedLocation && selectedLocation[0]?.lat) {
      setCenter([+selectedLocation[0]?.lat || 0, +selectedLocation[0]?.lng || 0])
      toggleLocation()
    }
  }, [mapRef.current])

  useEffect(() => {
    if (editorRef.current) {
      displayGeofences()
    }
  }, [selectedGeo, editorRef, getDepot])

  // useEffect(() => {
  //   if (Array.isArray(realList) && realList?.length > 0) {
  //     let list = getPiosInPolygon()
  //     list = sortByNearest(list)
  //     list = group(list)
  //     setPiosList(list)
  //   } else setPiosList([])
  // }, [realList, groupBy, polygonFilterLayer, pointFilterLatLng])

  // useEffect(() => {
  //   setGroupBy(groupPioBy || '')
  // }, [groupPioBy])

  // useEffect(() => {
  //   if (mapRef.current && piosRef.current && selectedPioIds.length && selectedPioGroups.length) {
  //     mapRef.current.fitBounds(piosRef.current.getBounds())
  //   }
  // }, [selectedPioIds, selectedPioGroups])
  // useEffect(() => {
  //   if (featureFilterType !== 'polygon' && polygonFilterLayer != null) {
  //     polygonFilterLayer?.layer?.remove()
  //     setPolygonFilterLayer(null)
  //   }
  //   if (featureFilterType !== 'point' && pointFilterLatLng) {
  //     setPointFilterLatLng(null)
  //   }
  // }, [featureFilterType, polygonFilterLayer, pointFilterLatLng])

  // useEffect(() => {
  //   if (Array.isArray(pios)) {
  //     let lst = _.cloneDeep(pios)
  //     setRealList(lst)
  //   } else {
  //     setRealList([])
  //   }
  // }, [pios])

  // useEffect(() => {
  //   let infos = null

  //   if (selectedPio?.id) {
  //     infos = {...selectedPio}

  //     infos.info = JSON.parse(infos.info)

  //     if (infos.info) {
  //       infos.info = infos.info.reduce((c, v) => {
  //         c[v.title.replace(/\s/g, '_')] = v.description
  //         return c
  //       }, {})
  //     }
  //   }

  //   setPioInfos(infos)
  // }, [selectedPio])

  useEffect(() => {
    //dispatch(fetchAddresses(selectedDepot?.id))
    dispatch(fetchGeofencingsSelectedDepot())
    dispatch(fetchAllGeo())
  }, [])

  // useEffect(() => {
  //   const test = isPointInLayer(selectedLocation, currentLayer)
  // }, [currentLayer])

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
    dispatch(fetchGeoForDepot(selectedDepot?.id))
  }, [selectedDepot])

  // useEffect(() => {
  //   const list = getDepot?.length === 0 || null ? listGeo : getDepot
  //   setGeoList(list)
  // }, [listGeo, getDepot])

  useEffect(() => {
    toggleButtons()
  }, [featureFilterType])

  return (
    <div className='relative'>
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
              <GeofenceListSelectedDepotComponent
                onClickGeo={displayGeofences}
                mapRef={mapRef}
                removeLayer={removeLayer}
              />
            </div>
          </div>
        )}

        <div
          onClick={toggleLocation}
          style={{
            position: 'absolute',
            top: '40%',
            width: '60px',
            height: '60px',
            right: '16px',
            zIndex: 2,
          }}
          className='border-circle border-2 border-white hover:shadow-4 bg-blue-100 flex justify-content-center align-items-center cursor-pointer'
        >
          <i className='pi pi-map-marker text-3xl text-blue-600'></i>
        </div>
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

export default MapComponentSelectedDepot
