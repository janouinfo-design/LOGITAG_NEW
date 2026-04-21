import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  useMapEvent,
  TileLayer,
  ZoomControl,
  Popup,
  FeatureGroup,
  Polygon,
  Polyline,
  Marker,
} from 'react-leaflet'
import GeomanComponent from './GeomanComponent/GeomanComponent'
import {Checkbox} from 'primereact/checkbox'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../ButtonComponent/ButtonComponent'
import tagIconImg from '../../../../assets/icons/tag-icon.gif'
import locationIcon from '../assets/icons/location.png'
import _ from 'lodash'
import './style.css'
import GeofenceEditorComponent from './Editors/GeofenceEditorComponent'
import {useDispatch} from 'react-redux'
import {saveGeofencing} from '../../../../store/slices/geofencing.slice'
import GeofenceListComponent from './List/GeofenceListComponent'
import {useAppSelector} from '../../../../hooks'
import IconMap from '../assets/icons/marker.png'
import RedMarker from '../assets/icons/redMarker.png'
import assetConfigs from '../../../../configs/index'

import {
  fetchGeofencings,
  getEnginSelected,
  getGeofences,
  getSelectedEngMap,
  getSelectedGeoClient,
  getSelectedGeofenceId,
  getSelectedGeofenceIds,
} from '../slice/geofencing.slice'
import {Chip} from 'primereact/chip'
import {OverlayPanel} from 'primereact/overlaypanel'
import * as turf from '@turf/turf'
import {
  fetchEngById,
  fetchEngines,
  fetchEnginesMap,
  fetchVehiculePositionsHistory,
  getGeoByIdSite,
  getLastEnginsUpdates,
  getSelectedEnginMap,
  getVehiculeHistoryRoute,
  setSelectedEnginMap,
} from '../../../Engin/slice/engin.slice'
import {fetchPointsGeo} from '../slice/navixy.slice'
import {fetchSites, getSelectedSite, getSites} from '../../../Site/slice/site.slice'
import GeocodingComponent from '../../GeocodingComponent/GeocodingComponent'
import {OlangItem} from '../../Olang/user-interface/OlangItem/OlangItem'
import BaseMapLayerComponent from '../../BaseMapLayerComponent/BaseMapLayerComponent'
import {useLocalStorage} from 'primereact/hooks'
import {Image} from 'primereact/image'
import moment from 'moment'
import {
  fetchCompanyAddresses,
  getCompanyAddresses,
  getSelectedAddress,
  getSelectedCompany,
} from '../../../Company/slice/company.slice'
import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {Paginator} from 'primereact/paginator'
import {ProgressSpinner} from 'primereact/progressspinner'
import {setToastParams} from '../../../../store/slices/ui.slice'
import NavixyVehiclesListComponent from './List/NavixyVehiclesListComponent'
import {classNames} from 'primereact/utils'
import {calculateDistance} from '../../../../cors/utils/geometry'
import {Divider} from 'primereact/divider'
import {Calendar} from 'primereact/calendar'
import LastSeenComponent from '../../../Engin/EnginDetail/LastSeenComponent'
import {Badge} from 'primereact/badge'
import ClusterInsightsPanel from './ClusterInsightsPanel'

const layers = [
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
]

let tagIcon = new L.Icon({
  iconUrl: locationIcon,
  // iconSize: [30, 30],
  // shadowSize: [50, 64],
  // iconAnchor: [22, 94],
  // shadowAnchor: [4, 62],
  // popupAnchor: [-15, -90],
  // iconSize: [30, 30],
  // shadowSize:   [50, 64],
  // iconAnchor:   [22, 94],
  // shadowAnchor: [4, 62],
  // popupAnchor:  [-15, -90]
})

const customIcon = new L.Icon({
  iconUrl: IconMap,
  iconSize: [60, 60],
})
const redIcon = new L.Icon({
  iconUrl: RedMarker,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
})
// ${
//   options?.showMarker !== false
//     ? `<img src="${IconMap}" width="30" height="30" alt="icon"/>`
//     : ''
// }${
// options?.showMarker !== false ? 'flex' : 'block'
//} ;

let dvIcon = (options) => {
  return L.divIcon({
    html: `
         <div class="bg-transparent flex align-items-center gap-2" style="width: 150px">
            <div class="bg-blue-500 flex align-items-center justify-content-center" style="width: 50px ; height: 50px;border-radius: 50%">
              <span class="pi pi-truck text-white text-2xl" />
            </div>
            <div class="p-1 bg-blue-500 text-white shadow-2 " style="${options?.style}">
              <strong class="text-lg">${options.label}</strong>
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

const createClusterCustomIcon = (cluster) => {
  const n = cluster.getChildCount()
  const size = n < 10 ? 42 : n < 50 ? 50 : n < 100 ? 58 : 66
  const sizeClass = n < 10 ? 'lt-cluster-icon--sm' : n < 50 ? 'lt-cluster-icon--md' : n < 100 ? 'lt-cluster-icon--lg' : 'lt-cluster-icon--xl'
  return L.divIcon({
    html: `<span>${n}</span>`,
    className: `my-custom-cluster lt-cluster-icon ${sizeClass}`,
    iconSize: L.point(size, size, true),
  })
}

const locationGroupIcon = (cluster) => {
  return L.divIcon({
    html: `<div class="bg-blue-500 text-white flex justify-content-center align-items-center" 
            style=" width: 30px ; height: 30px ; border-radius: 50% ">
       <span class="pi pi-info-circle text-2xl"></span>
    </div>`,
    className: 'bg-transparent',
    iconSize: L.point(30, 30, true), // Set the size of the cluster icon
  })
}

const createTrackerClusterCustomIcon = (cluster) => {
  return L.divIcon({
    html: `
    <span style="font-size: 30px">${cluster.getChildCount()}</span>
    `,
    className: 'my-custom-cluster bg-orange-500',
    // Apply custom CSS styles
    iconSize: L.point(50, 50, true), // Set the size of the cluster icon
  })
}
const MapComponent = ({
  layers,
  actions,
  showToolbar,
  markerNameKey,
  itemDetailTemplate,
  itemTemplate,
  children,
  groups,
  groupsEnter,
  groupsStatus,
  pios,
  piosPosition,
  toolbarOptions,
  groupPioBy,
  onSaveGeofence,
  type,
  pioPopupTemplate,
  loadingShowMore,
  showMoreClick,
  onChangePagination,
  totalRecords,
  onSearch,
  isLastPage,
  filterSt,
  statusVal,
  etatVal,
  filterEt,
}) => {
  console.log('groupsStatus', groupsStatus)
  const [showGeoman, setShowGeoman] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showVehicles, setShowVehicles] = useState(false)
  const [showGeofences, setShowGeofences] = useState(false)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [currentLayer, setCurrentLayer] = useState(null)
  const [piosList, setPiosList] = useState([])
  const [showPios, setShowPios] = useState(true)
  const [currentHoveredItem, setCurrentHoveredItem] = useState(null)
  const [selectedPioIds, setSelectedPioIds] = useState([])
  const [selectedPioGroups, setSelectedPioGroups] = useState([])
  const [geoNavixy, setGeoNavixy] = useState([])
  const [geoLayers, setGeoLayers] = useState({})
  const sites = useAppSelector(getSites)
  const [geofences, setGeofences] = useState([])
  const [groupBy, setGroupBy] = useState('')
  const [groupByName, setGroupByName] = useState('')
  const [filterPioBy, setFilterPioBy] = useState('')
  const [filterByName, setFilterByName] = useState('')
  const [filterEtat, setFilterEtat] = useState({label: 'All', value: 'All'}, 'state')
  const [filterStatus, setFilterStatus] = useState({status: 'All', label: 'All'}, 'status')
  const [featureFilterType, setFeatureFilterType] = useState('')
  const [inputFilter, setInputFilter] = useState('')
  const [pointFilterLatLng, setPointFilterLatLng] = useState('')
  const [polygonFilterLayer, setPolygonFilterLayer] = useState([])
  const [filteredPiosList, setFilteredPiosList] = useState([])
  const [enginMarker, setEnginMarker] = useState(null)
  const [navCenter, setNavCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(false)
  const [first, setFirst] = useState(0)
  const [rows, setRows] = useState(10)
  const [zoom, setZoom] = useState(0)
  const [selectedGeo, setSelectedGeo] = useState(null)
  const [engMap, setEngMap] = useState([])
  const [trackers, setTrackers] = useState([])
  const [filtredTrackers, setFilteredTrackers] = useState([])
  const [currentTracker, setCurrentTracker] = useState(null)
  const [hideClusters, setHideClusters] = useState(false)
  const [clusterPopup, setClusterPopup] = useState(null)
  const [clickType, setClickType] = useState(null)
  const [lastSeenFrom, setLastSeenFrom] = useState(null)
  const [locationGroupData, setLocationGroupData] = useState([])

  const [expandedPioUid, setExpandedPioUid] = useState(null)
  const [popupPioUid, setPopupPioUid] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  // List enhancements: quick filter, sort, pagination
  const [listQuickFilter, setListQuickFilter] = useState('all') // all | onsite | exited | battery
  const [listSort, setListSort] = useState('name_asc') // name_asc | name_desc | status | activity
  const [listPage, setListPage] = useState(1)
  const [listPageSize, setListPageSize] = useState(10)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [listDensity, setListDensity] = useState(() => {
    try { return localStorage.getItem('lt_map_list_density') || 'compact' } catch { return 'compact' }
  }) // 'compact' | 'detailed'
  const assetListScrollRef = useRef(null)
  const assetRowRefs = useRef({})
  const assetMarkerRefs = useRef({})
  const sortMenuRef = useRef(null)

  const selectedGeofence = useAppSelector(getSelectedGeoClient)
  const vehiculeHistoryRoute = useAppSelector(getVehiculeHistoryRoute)
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const [selectedGeofencePropreties, setSelectedGeofencePropreties] = useState(null)

  const [realList, setRealList] = useState([])
  const mapRef = useRef(null)
  const piosRef = useRef(null)
  const editorRef = useRef(null)
  const pioDetailMap = useRef(null)
  const groupOverlayRef = useRef(null)
  const geoClustersRef = useRef(null)
  const filterOverlayRef = useRef(null)
  const filterOverRefEtat = useRef(null)
  const filterOverRefStatus = useRef(null)
  const lastSeenDateRef = useRef(null)
  const getDetailRef = useRef(null)
  const enginMapOld = useRef([])
  const trackerRef = useRef()

  const dispatch = useDispatch()

  const [poiInfos, setPioInfos] = useState(null)
  const [selectedPio, setSelectedPio] = useState(null)
  const [geofencesClusters, setGeofencesClusters] = useState([])

  const selectedEnginMap = useAppSelector(getSelectedEnginMap)
  const lastEnginsUpdates = useAppSelector(getLastEnginsUpdates)
  const addressCompany = useAppSelector(getCompanyAddresses)
  const selectedIdsGeo = useAppSelector(getSelectedGeofenceIds)
  console.log('selectedIdsGeo', selectedIdsGeo)
  const selectedEngMap = useAppSelector(getSelectedEngMap)

  const [centerMap, setCenterMap] = useState([addressCompany?.lat || 0, addressCompany?.lng || 0])

  const flatAssets = useMemo(() => {
    if (!Array.isArray(piosList)) return []
    return piosList.reduce((acc, g) => {
      if (Array.isArray(g?.items)) acc.push(...g.items)
      return acc
    }, [])
  }, [piosList])

  // ─── Asset List: counts, filter, sort, pagination ───
  const classifyAsset = (pio) => {
    // returns {bucket: 'onsite' | 'arrived' | 'exited' | 'offline', color, label}
    const now = moment()
    const etat = `${pio?.etatenginname || pio?.etatengin || ''}`.toLowerCase()
    const status = `${pio?.statusname || pio?.sysStatus || ''}`.toLowerCase()
    if (status.includes('off') || status.includes('dis')) return {bucket: 'offline', color: '#94A3B8', label: 'Hors ligne'}
    if (etat.includes('exit') || etat.includes('sort')) return {bucket: 'exited', color: '#EF4444', label: 'Sorti'}
    if (pio?.lastSeenAt) {
      const diffMin = now.diff(moment.utc(pio.lastSeenAt), 'minutes')
      if (diffMin <= 60) return {bucket: 'arrived', color: '#F59E0B', label: 'Arrivé récemment'}
    }
    return {bucket: 'onsite', color: '#10B981', label: 'Sur site'}
  }

  const listCounts = useMemo(() => {
    const c = {all: flatAssets.length, onsite: 0, arrived: 0, exited: 0, battery: 0, offline: 0}
    flatAssets.forEach((p) => {
      const cl = classifyAsset(p)
      c[cl.bucket]++
      const b = Number(p?.batteries)
      if (!isNaN(b) && b > 0 && b <= 20) c.battery++
    })
    return c
  }, [flatAssets])

  const visibleAssets = useMemo(() => {
    let list = flatAssets
    if (listQuickFilter !== 'all') {
      list = list.filter((p) => {
        const cl = classifyAsset(p)
        if (listQuickFilter === 'battery') {
          const b = Number(p?.batteries)
          return !isNaN(b) && b > 0 && b <= 20
        }
        return cl.bucket === listQuickFilter
      })
    }
    const sorted = [...list]
    if (listSort === 'name_asc') sorted.sort((a, b) => String(a.reference || a.label || '').localeCompare(String(b.reference || b.label || '')))
    else if (listSort === 'name_desc') sorted.sort((a, b) => String(b.reference || b.label || '').localeCompare(String(a.reference || a.label || '')))
    else if (listSort === 'status') sorted.sort((a, b) => String(a.statuslabel || '').localeCompare(String(b.statuslabel || '')))
    else if (listSort === 'activity') {
      sorted.sort((a, b) => {
        const ta = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0
        const tb = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0
        return tb - ta
      })
    }
    return sorted
  }, [flatAssets, listQuickFilter, listSort])

  const totalListPages = Math.max(1, Math.ceil(visibleAssets.length / listPageSize))
  const currentListPage = Math.min(listPage, totalListPages)
  const pagedAssets = useMemo(() => {
    const start = (currentListPage - 1) * listPageSize
    return visibleAssets.slice(start, start + listPageSize)
  }, [visibleAssets, currentListPage, listPageSize])

  useEffect(() => { setListPage(1) }, [listQuickFilter, listPageSize])

  const getAssetState = (pio) => {
    const status = `${pio?.statusname || pio?.sysStatus || ''}`.toLowerCase()
    const etat = `${pio?.etatenginname || pio?.etatengin || ''}`.toLowerCase()

    if (status.includes('off') || status.includes('dis') || status === 'offline') {
      return {label: 'Offline', color: '#ef4444'}
    }
    if (etat.includes('mov') || status.includes('mov')) {
      return {label: 'Moving', color: '#22c55e'}
    }
    return {label: 'Idle', color: '#f59e0b'}
  }

  const MapEvents = () => {
    useMapEvent('click', (e) => {
      try {
        if (popupPioUid) {
          const marker = assetMarkerRefs.current?.[popupPioUid]
          const leafletMarker = marker?.closePopup ? marker : marker?.leafletElement
          if (leafletMarker && typeof leafletMarker.closePopup === 'function') {
            leafletMarker.closePopup()
          }
        }
      } catch (err) {}

      setPopupPioUid(null)
      if (featureFilterType == 'point') {
        setPointFilterLatLng(e.latlng)
        mapRef.current.flyTo(e.latlng)
      } else if (featureFilterType == 'polygon') {
      }
    })
    useMapEvent('zoom', (e) => {
      setZoom(e.target._zoom)
    })
    useMapEvent('overlayadd', (e) => {})
    useMapEvent('pm:create', (e) => {
      if (featureFilterType !== 'polygon') {
        setShowEditForm(true)
        setCurrentLayer(e)
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
      if (!e.enabled) {
        setShowEditForm(true)
        // setCurrentLayer(e)
        setSelectedGeofencePropreties({})
      }
    })
    useMapEvent('pm:globalremovalmodetoggled', (e) => {})
  }

  const getPiosInPolygon = () => {
    if (getDetailRef.current) return
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

  const onClickMarker = (pio, type) => {
    dispatch(setSelectedEnginMap(pio))
    setClickType(type)
    if (type == 'cluster') {
      getDetailEngin(pio)
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(!!mq.matches)
    onChange()
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange)
    else mq.addListener(onChange)

    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    if (!showPios) return
    const key = selectedEnginMap?.uid || selectedEnginMap?.id
    if (!key) return
    const el = assetRowRefs.current?.[key]
    if (el && typeof el.scrollIntoView === 'function') {
      setTimeout(() => {
        try {
          el.scrollIntoView({block: 'nearest'})
        } catch (e) {}
      }, 50)
    }
  }, [selectedEnginMap, showPios])

  useEffect(() => {
    if (!popupPioUid) return
    const marker = assetMarkerRefs.current?.[popupPioUid]
    const leafletMarker = marker?.openPopup ? marker : marker?.leafletElement
    if (leafletMarker && typeof leafletMarker.openPopup === 'function') {
      setTimeout(() => {
        try {
          leafletMarker.openPopup()
        } catch (e) {}
      }, 0)
    }
  }, [popupPioUid])

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

  function formatLastSeen(lastSeenAt) {
    let lastSeenLabel = '-'
    let lastSeenColor = 'gray'
    let diff = null
    if (lastSeenAt) {
      diff = moment().utc().startOf('day').diff(moment(lastSeenAt).utc().startOf('day'), 'days')
      if (diff == 0) {
        lastSeenLabel = "Vu aujourd'hui"
        lastSeenColor = '#47ad53'
      } else if (diff == 1) {
        lastSeenLabel = 'Vu hier'
      } else if (diff < 5) {
        lastSeenLabel = `Vu il y a ${diff} jours`
      } else {
        lastSeenLabel = 'Vu le ' + moment(lastSeenAt).utc().format('DD/MM/YYYY HH:mm')
      }
    }
    return {lastSeenLabel, lastSeenColor, lastSeenAt, dayDiff: diff}
  }

  function clusterPopupItemTemplate(item) {
    if (!item) return
    let {lastSeenLabel, lastSeenColor} = formatLastSeen(item.lastSeenAt)

    return (
      <div
        key={item.id}
        onClick={(e) => onClickMarker(item, 'cluster')}
        className='flex align-items-center gap-3 justify-content-between mr-2 p-2 border-bottom-1 border-gray-300 cursor-pointer'
      >
        <div
          className='info flex flex-column align-items-start mx-2'
          style={{width: '140px', height: 'fit-content'}}
        >
          <strong className='text-m text-left' style={{fontSize: '14px'}}>
            {item.reference}
          </strong>
          <div className='flex flex-row gap-2'>
            <strong
              style={{
                maxWidth: '120px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: '9px',
              }}
              className='text-gray-500'
            >
              {item.LocationObjectname}
            </strong>
            <span style={{color: item.etatbgColor}} className={item.etatIconName}></span>
            <span style={{color: item.statusbgColor}} className={item.iconName}></span>
          </div>
          {/* <div style={{fontSize: '10px',}} >{lastSeenBodyTemplate(item)}</div> */}
        </div>
        <div className='text-right' style={{width: '10rem'}}>
          <strong className='text-s' style={{fontSize: '11px', color: lastSeenColor}}>
            {lastSeenLabel}
            <div className='text-sm text-gray-600 flex gap-1 align-items-center'>
              <span>{item.lastSeenDevice}</span>
              {item.lastSeenRssi && (
                <Badge title='force du signal' value={item.lastSeenRssi} severity='warning'></Badge>
              )}
            </div>
            {/* <LastSeenComponent data={item} /> */}
          </strong>
        </div>
      </div>
    )
  }

  function findPointsInLayer(featuresPoint, layer, options) {
    let insides = []
    for (let point of featuresPoint) {
      if (isPointInLayer(point, layer, options)) insides.push(point)
    }
    return insides
  }
  const onFilter = (text) => {
    const trimmedText = text.trim().toLowerCase()
    setInputFilter(text)
    onSearch(text)
    if (trimmedText !== '') {
      let normalizedText = trimmedText.toLowerCase().trim()
      let filterData = _.cloneDeep(enginMapOld.current).filter((item) =>
        item.reference.toLowerCase().startsWith(normalizedText)
      )
      if (etatVal && etatVal.value !== 'all') {
        filterData = filterData.filter((item) => item.etatenginname === etatVal.value)
      }

      if (statusVal && statusVal.value !== 'all') {
        filterData = filterData.filter((item) => item.statusname === statusVal.value)
      }
      filterData = _.uniqBy(filterData, 'id')
      setEngMap(filterData)
    } else {
      // Reset to original data
      const getUnique = _.uniqBy(enginMapOld.current, 'id')
      setEngMap(getUnique)
    }
  }

  const onPageChange = (event) => {
    setFirst(event.first)
    setRows(event.rows)
    onChangePagination(event.page + 1, event.rows)
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

  const toggleFilter = (list) => {
    // Deep clone and filter out items with lat of 0
    const itemsList = _.cloneDeep(list).filter((item) => item?.lat !== 0)

    // Helper functions for filtering by status and state
    const filterByStatus = (item) =>
      filterStatus?.label === 'All' || item.sysStatus === filterStatus?.status
    const filterByEtat = (item) =>
      filterEtat?.label === 'All' || item.etatenginname === filterEtat?.value

    // Filter items based on both status and state
    const filteredItems = itemsList.filter((item) => filterByStatus(item) && filterByEtat(item))

    // Extract IDs and update selected items
    const selectedIds = filteredItems.map((item) => item.uid)
    setSelectedPioIds(selectedIds)

    // Create a new list with the filtered items and update state
    const updatedList = {
      ...piosList[0],
      items: filteredItems,
    }
    setPiosList([updatedList])

    // Debug log for filtered items
  }

  function handleClusterClick(clusterEvent) {
    // setHideClusters(true)
    const cluster = clusterEvent.layer
    const markers = cluster.getAllChildMarkers()

    // Extract positions
    const positions = markers.map((m) => JSON.stringify(m.getLatLng()))

    let distances = markers
      .map((m) => calculateDistance(cluster.getLatLng(), m.getLatLng()))
      .filter((d) => d > 0.01)
    console.log('Cluster positions:', positions, markers, distances)

    // Check if all positions equal
    const allSame = positions.every((p) => p === positions[0])

    // Open the rich Cluster Insights panel whenever multiple markers are clustered
    const ids = markers.map((m) => m.options?.id)
    const marker_pios = engMap.filter((o) => ids.includes(o.id))

    if (distances.length === 0) {
      // Perfectly stacked — always open the panel
      setClusterPopup({
        position: {...cluster.getLatLng()},
        items: marker_pios,
      })
    } else if (markers.length >= 2 && distances.length && Math.max(...distances) < 50) {
      // Very close (<50m) — spiderfy is hard to read, show enriched panel instead
      setClusterPopup({
        position: {...cluster.getLatLng()},
        items: marker_pios,
      })
    } else {
      cluster.spiderfy()
    }
  }

  const filterList = (list, options) => {
    if (!Array.isArray(list || realList)) return
    let filtredList = []
    let filter = filterPioBy || 'label'
    switch (options?.type) {
      case 'text':
        filtredList = (list || realList).filter(
          (pio) =>
            options?.val == '' ||
            (pio?.[filter] || '').toLowerCase().includes(options?.val?.toLowerCase())
        )
        break
      default:
        filtredList = null
    }

    return filtredList
    setSelectedPioIds((prev) => filtredList.filter((o) => prev.includes(o.id)).map((o) => o.id))
    setPiosList(group(filtredList))
  }

  const group = (_list) => {
    let list = _.cloneDeep(_list)
    if (!Array.isArray(list)) list = []
    let isPointFilter =
      (featureFilterType == 'point' && pointFilterLatLng != null) ||
      (featureFilterType == 'polygon' && polygonFilterLayer != null)
    list.forEach((o) => {
      o[groupBy] =
        o[groupBy] == undefined || isPointFilter
          ? 'Non groupé' // groupBy !== 'Tout' && groupByName && !isPointFilter ? groupByName+ ' inconnu(e)': 'Principal'
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

    const noGroup = groupList.find((g) => g.label == 'Non groupé')
    if (noGroup) {
      groupList = groupList.filter((g) => g.label != 'Non groupé').concat([noGroup])
    }
    return groupList
  }

  function displayGeofences() {
    if (Array.isArray(geofences)) {
      setGeoLayers({})
      if (geoClustersRef.current) geoClustersRef.current.clearLayers()
      setTimeout(() => {
        try {
          if (editorRef.current) editorRef.current.clearLayers()
          let locals = geofences.filter((geo) => geo.idnavixy == null)
          let layers = {}
          for (let o of locals) {
            let _layer = null
            if ((o.type || '').toLowerCase() == 'circle') {
              _layer = L.circle([...o.geometry.geometry.coordinates].reverse(), {
                radius: o.geometry?.properties?.radius,
                color: 'red',
                weight: 0.7,
                id: o.id,
                type: 'circle',
              })

              editorRef.current.addLayer(_layer)
              layers[o.id] = _layer
              continue
            }
            let geo = L.geoJSON(o.geometry, {color: 'red', weight: 0.7, id: o.id})
            geo.eachLayer((layer) => {
              _layer = layer
            })
            if (!_layer) continue
            _layer.on('pm:edit', (e) => {
              setCurrentLayer(e)
              // setShowEditForm(true)
            })
            _layer.on('pm:change', (e) => {
              if (Array.isArray(geofences)) {
                let dt = geofences.find((o) => o.id == e.layer?.options?.id)
                let id = dt.geoid
                dt = _.cloneDeep(dt)
                dt = dt?.properties
                if (dt) {
                  dt.id = id
                  if (typeof dt?.tags == 'string') dt.tags = dt.tags.split('|')
                }
                setSelectedGeofencePropreties(dt)
              }
              setCurrentLayer(e)
              // setShowEditForm(true)
            })
            _layer.on('pm:remove', (e) => {})
            //   editorRef.current.addLayer(_layer)
            layers[o.id] = _layer

            // mapRef.current.fitBounds(_layer.getBounds())
          }
          setGeoLayers(layers)
        } catch (e) {}
      }, 300)
    }
  }
  const getGeoAndDisplay = async (item) => {
    try {
      editorRef.current.clearLayers()
      const {payload} = await dispatch(getGeoByIdSite(item?.LocationID))
      if (Array.isArray(payload) && payload?.[0]?.geometry?.geometry) {
        const geometry = payload?.[0]?.geometry?.geometry
        const centerOfGeo = turf.centerOfMass(geometry).geometry.coordinates
        if (mapRef.current) mapRef.current.setView(centerOfGeo.reverse(), 11)
        if (geometry) {
          setSelectedGeo(item?.uid)
          let _layer = L.geoJSON(geometry, {color: 'red', weight: 0.7, id: item?.LocationID})
          if (editorRef.current) editorRef.current.addLayer(_layer)
        }
      } else {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERREUR',
            detail: 'Erreur lors de la recuperation de la geofence',
            position: 'top-right',
          })
        )
      }
    } catch (e) {}
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

      // return
      dispatch(saveGeofencing(layer)).then(({payload}) => {
        if (!payload?.error) {
          _layer.remove()
          setShowEditForm(false)
          setCurrentLayer(null)
          dispatch(fetchGeofencings())
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
  //test
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

  const groupPiosBy = (group, name) => {
    setGroupBy(group)
    setGroupByName(name)
  }

  const toggleFeatureFilterType = (type) => {
    setFeatureFilterType((prev) => (prev == type ? '' : type))
  }

  const displayGeoClusters = () => {
    let clusters = []
    let i = 0
    for (let [k, v] of Object.entries(geoLayers)) {
      let cpt = 0
      let _pioIds = []
      let _pios = []
      for (let o of filteredPiosList) {
        if (
          isPointInLayer([o.lng, o.lat], v.toGeoJSON(), {
            type: v?.options?.type,
            center: v?.options?.type == 'circle' ? v?._latlng : null,
            radius: v?.options?.radius,
          })
        ) {
          cpt++
          _pioIds.push(o.id)
          _pios.push(o)
        }
      }
      if (typeof v.getBounds == 'function') {
        let latlng = v?._latlng || v.getBounds().getCenter()
        clusters.push({
          latlng: latlng,
          count: cpt,
          layer: k,
          poiIds: _pioIds,
          pios: _pios,
        })
      }
      i++
    }

    setGeofencesClusters(clusters)
  }
  const onVehicleFiltered = (data) => {
    setFilteredTrackers(data)
  }

  const onVehiclesSelected = (data) => {
    if (!Array.isArray(data)) return
    data = data.filter((o) => o.state?.gps?.location?.lat && o?.state?.gps?.location?.lng)
    setTrackers(data)
    if (data.length > 0) {
      let first = data[0]
      mapRef.current.flyTo({
        lat: first.state?.gps?.location?.lat,
        lng: first?.state?.gps?.location?.lng,
      })
    }
  }

  const onVehicleSelected = (data) => {
    setCurrentTracker(data)
  }

  useEffect(() => {
    setShowGeoman(
      !showEditForm &&
        showToolbar !== false &&
        (type != 'main' || (type == 'main' && featureFilterType == 'polygon'))
    )
  }, [showEditForm, showToolbar, type, featureFilterType])

  useEffect(() => {
    if (Array.isArray(realList) && realList?.length > 0) {
      let list = getPiosInPolygon()
      // list = filterList(list, {type: 'text', val: inputFilter})
      list = sortByNearest(list)
      list = group(list)
      setPiosList(list)
      setMapZoom(true)
    } else {
      setPiosList([])
      setMapZoom(false)
    }
  }, [realList, groupBy, polygonFilterLayer, pointFilterLatLng])

  useEffect(() => {
    setGroupBy(groupPioBy || '')
  }, [groupPioBy])

  useEffect(() => {}, [filtredTrackers])

  useEffect(() => {
    if (mapRef.current && piosRef.current && mapZoom) {
      const tid = setTimeout(() => {
        try {
          if (!mapRef.current || !piosRef.current) return
          const bounds = piosRef.current.getBounds && piosRef.current.getBounds()
          if (bounds && bounds.isValid && bounds.isValid()) {
            mapRef.current.fitBounds(bounds)
          }
        } catch (err) {
          // Silent: refs may be torn down during unmount or re-render
        }
      }, 1000)
      return () => clearTimeout(tid)
    }
  }, [mapZoom, filterStatus, filterEtat])

  useEffect(() => {
    if (featureFilterType !== 'polygon' && polygonFilterLayer != null) {
      polygonFilterLayer?.layer?.remove()
      setPolygonFilterLayer(null)
    }
    if (featureFilterType !== 'point' && pointFilterLatLng) {
      setPointFilterLatLng(null)
    }
  }, [featureFilterType, polygonFilterLayer, pointFilterLatLng])

  useEffect(() => {
    if (Array.isArray(pios)) {
      let lst = _.cloneDeep(pios)
      setRealList(lst)
    } else {
      setRealList([])
    }
  }, [pios])

  useEffect(() => {
    if (Array.isArray(pios) && pios?.length > 0) {
      setTimeout(() => {
        const ids = pios.map((o) => o.id)
        setSelectedPioIds(ids)
      }, 500)
    }
  }, [pios])

  useEffect(() => {
    if (poiInfos) {
      let eng = lastEnginsUpdates.find((o) => o.id == poiInfos?.id)
      if (eng && eng.lastSeenAt != poiInfos?.lastSeenAt) {
        setPioInfos((prev) => ({...prev, lastSeenAt: eng.lastSeenAt}))
      }
    }
  }, [lastEnginsUpdates, poiInfos])

  useEffect(() => {
    localStorage.setItem('selected-engin-in-map', poiInfos?.id || 0)
  }, [poiInfos])

  function getDetailEngin(o) {
    dispatch(getEnginSelected({id: o.id}))
    setPioInfos(o)
    dispatch(setSelectedEnginMap(null))
    if (o.lat != 0 && o.lat != -1 && mapRef.current) {
      setEnginMarker([o.lat, o.lng])
      // const getZomm = mapRef.current.getZoom()
      mapRef.current.closePopup()
      mapRef.current.flyTo({lat: o.lat, lng: o.lng}, 17, {duration: 0.8})
    }
  }

  const getDesktopLeftPanelWidth = () => {
    if (!showPios || isMobile) return 0
    try {
      const el = document.querySelector(
        '.asset-panel-shell.asset-panel-open.asset-panel-desktop .asset-panel'
      )
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      return rect?.width || 0
    } catch (e) {
      return 0
    }
  }

  const panMarkerIntoViewWithOffset = (latlng) => {
    const map = mapRef.current
    if (!map || !latlng) return

    const panelWidth = getDesktopLeftPanelWidth()
    const padding = 16

    const size = map.getSize?.()
    if (!size) return

    const point = map.latLngToContainerPoint(latlng)

    // Safe visible area: avoid the left overlay panel.
    const safeLeft = panelWidth ? panelWidth + padding : padding
    const safeRight = size.x - padding
    const safeTop = padding
    const safeBottom = size.y - padding

    const isAlreadyVisible =
      point.x >= safeLeft && point.x <= safeRight && point.y >= safeTop && point.y <= safeBottom

    if (isAlreadyVisible) return

    // Horizontal offset only: move marker slightly to the RIGHT of center.
    // This is achieved by shifting the map center to the LEFT in projected space.
    let offsetX = 0
    if (panelWidth) {
      // keep it in a natural range
      offsetX = Math.max(200, Math.min(320, Math.round(panelWidth * 0.75)))
    }

    const desiredContainerPoint = L.point(size.x / 2 + offsetX, size.y / 2)
    const currentMarkerPoint = map.project(latlng)

    // Compute new center so that marker ends up at desiredContainerPoint.
    const delta = L.point(size.x / 2, size.y / 2).subtract(desiredContainerPoint)
    const targetCenterPoint = currentMarkerPoint.add(delta)
    const targetCenter = map.unproject(targetCenterPoint)

    map.panTo(targetCenter, {animate: true, duration: 0.3})
  }

  const formatDate = (data) => {
    if (!data.lastSeenAt || typeof data.lastSeenAt != 'string') return '_'
    if (data.lastSeenAt.includes('+')) return moment(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
    return moment.utc(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
  }

  const setDataForFilter = () => {
    if (!etatVal && !statusVal) return
    if (!Array.isArray(enginMapOld.current)) return

    const filterByEtat = (item) => etatVal.value === 'all' || item.etatenginname === etatVal.value

    const filterByStatus = (item) =>
      statusVal.value === 'all' || item.statusname === statusVal.value

    const filteredData = enginMapOld.current.filter(
      (item) => filterByEtat(item) && filterByStatus(item)
    )
    setEngMap(filteredData)
  }

  const fetchRoute = (date, id) => {
    const dateBefore2Hour = moment(date).subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
    const dateAfter2Hour = moment(date).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
    const cleanId = typeof id === 'string' ? id.replace(/^gps:/i, '') : id
    setIsFetchingRoute(true)
    dispatch(
      fetchVehiculePositionsHistory({label: cleanId, from: dateBefore2Hour, to: dateAfter2Hour})
    ).finally(() => setIsFetchingRoute(false))
  }

  useEffect(() => {
    if (!Array.isArray(vehiculeHistoryRoute)) return
    const coords = vehiculeHistoryRoute.map((p) => {
      const lat = p?.satlat || p?.lat
      const lng = p?.satlng || p?.lng
      return lat && lng ? [lat, lng] : null
    })
    console.log('coords', coords)
    if (coords?.[0]?.length >= 2) {
      const map = mapRef.current
      console.log('mappppp', map)
      if (map) {
        map.setView(coords[0], 11)
      }
    } else if (vehiculeHistoryRoute.length === 0) {
      dispatch(
        setToastParams({
          severity: 'warn',
          summary: 'No Route Data',
          detail: 'No route found for this asset in the selected time range.',
          life: 4000,
        })
      )
    }
  }, [vehiculeHistoryRoute])

  useEffect(() => {
    if (inputFilter.trim() !== '') return
    setDataForFilter()
  }, [filterEt, filterSt])

  function fetchEnginMap() {
    let obj = {page: 1, PageSize: 10, filterPosition: 1, displayMap: 1}
    if (lastSeenFrom) {
      obj.LastSeenFrom = moment(lastSeenFrom).utc().format('YYYY-MM-DD')
    }
    dispatch(fetchEnginesMap(obj)).then(({payload}) => {
      console.log('payloaddddd:', payload)
      if (payload) {
        setEngMap(payload)
        enginMapOld.current = payload
      }
    })
  }

  useEffect(() => {
    dispatch(fetchGeofencings())
    dispatch(fetchSites())
    dispatch(fetchCompanyAddresses())
    dispatch(fetchEnginesMap({page: 1, PageSize: 15, filterPosition: 1, displayMap: 1})).then(
      ({payload}) => {
        if (payload) {
          setEngMap(payload)
          enginMapOld.current = payload
        }
      }
    )
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
    toggleButtons()
  }, [featureFilterType])

  useEffect(() => {
    if (!mapRef.current || !editorRef.current) return

    const editor = editorRef.current
    const map = mapRef.current
    // Handle the selected geofence
    const layer = geoLayers?.[selectedGeofence?.id]
    if (layer) {
      if (selectedIdsGeo?.includes(selectedGeofence?.id)) {
        // Add the layer to the map
        editor.addLayer(layer)

        // Fit the map bounds to the layer
        map.fitBounds(layer.getBounds())

        // Add a popup to the layer
        const popupOptions = {
          closeButton: false,
          autoClose: false,
          offset: [0, -10],
        }
        const popupContent = `<div style="font-size: 12px; font-weight: bold;">${selectedGeofence?.name}</div>`
        layer.bindPopup(popupContent, popupOptions)
      } else {
        // Remove the layer and close its popup if not selected
        editor.removeLayer(layer)
        if (layer.getPopup()) layer.closePopup()
      }
    }

    // Handle additional layers for selected IDs
    if (selectedIdsGeo?.length > 0) {
      const geoLayersToAdd =
        sites
          ?.filter((site) => site?.geofence?.[0]?.geometry?.type === 'Feature')
          ?.filter((site) => selectedIdsGeo.includes(site?.id)) || []

      geoLayersToAdd.forEach((site) => {
        const geometry = site?.geofence?.[0]?.geometry
        const newLayer = L.geoJSON(geometry, {
          style: {color: 'red', weight: 0.7},
          id: site.id, // Optional: attach site ID to the layer for tracking
        })

        editor.addLayer(newLayer)
        newLayer.on('click', (e) => {
          const popupOptions = {
            closeButton: false,
            autoClose: false,
            offset: [0, -10],
          }

          const popupContent = `<div style="font-size: 12px; font-weight: bold;">${
            site?.label || site?.name
          }</div>`
          newLayer.bindPopup(popupContent, popupOptions)

          newLayer.openPopup()
        })
      })
    } else {
      // Clear all layers if no IDs are selected
      editor.clearLayers()
    }
  }, [selectedGeofence, geoLayers, selectedIdsGeo, mapRef, editorRef, sites])

  useEffect(() => {
    const filter = sites
      ?.filter((o) => {
        return o?.geofence.length > 0
      })
      .map((o) => ({...o?.geofence[0]?.geometry, id: o.id, geoid: o?.geofence[0]?.id}))
    setGeofences(filter)
  }, [sites])

  useEffect(() => {
    displayGeoClusters()
  }, [geoLayers, filteredPiosList])

  useEffect(() => {
    console.log('selectedEnginMap changed:', selectedEnginMap)
    if (selectedEnginMap !== null && piosList.length > 0) {
      const findObject = piosList[0]?.items?.find((o) => o.uid === selectedEnginMap.uid)
      const index = piosList[0]?.items?.findIndex((o) => o.uid === selectedEnginMap.uid)
      if (index !== -1 && findObject) {
        const updatedPiosList = [
          findObject,
          ...(piosList[0]?.items?.slice(0, index) || []),
          ...(piosList[0]?.items?.slice(index + 1) || []),
        ]

        setPiosList([{...piosList[0], items: updatedPiosList}, ...piosList.slice(1)])
      }
      console.log('findObject:', findObject)
      if (!findObject) {
        dispatch(fetchEngById({id: selectedEnginMap.uid}))
      }
    }
  }, [selectedEnginMap])

  useEffect(() => {
    let timer = setTimeout(() => {
      let groups = piosList.map((o) => o.label)
      let infos = piosList.reduce(
        (c, v) => {
          c.ids = [...c.ids, ...v.items.map((t) => t.id)]
          c.list = [...c.list, ...v.items]
          return c
        },
        {ids: [], list: []}
      )
      let etatConvert = etatVal.label === 'Exit' ? 'exit' : 'reception'
      let filtredId = infos.list.filter((o) => o?.etatenginname == etatConvert).map((o) => o.id)
      setSelectedPioGroups(groups)
      setFilteredPiosList(infos.list)
      if (etatVal?.label === 'All' && statusVal?.label === 'All') return
      setSelectedPioIds(filtredId)
    }, 100)

    return () => clearTimeout(timer)
  }, [piosList])

  useEffect(() => {
    displayGeofences()
  }, [geofences, editorRef.current])

  useEffect(() => {
    if (Array.isArray(engMap)) {
      let enters = engMap.filter((o) => o.LocationID && o.LocationID != 0 && o.LocationActif == 7)
      let groupes = _.groupBy(enters, 'LocationID')
      let groupList = Object.entries(groupes).map(([k, v]) => {
        let items = v
          .map((o) => {
            let lastSeenInfos = formatLastSeen(o.lastSeenAt)
            return {
              ...o,
              ...lastSeenInfos,
            }
          })
          .sort((a, b) => a.diff - b.diff)

        let geometry = sites?.find((o) => o.id == k)?.geofence?.[0]?.geometry
        let position = {
          lat: +items[0].last_lat + 0.00001,
          lng: +items[0].last_lng + 0.00001,
        }
        if (geometry) {
          try {
            let centroid = turf.centroid(geometry)
            let pos = centroid.geometry.coordinates
            position = {
              lat: pos[1],
              lng: pos[0],
            }
          } catch (e) {
            console.log('enters err:', e)
          }
        }
        let stats = [
          {
            label: 'Vu il y a moin de 3 jours',
            count: items.filter((o) => o.dayDiff !== null && o.dayDiff <= 3).length,
          },
        ]
        return {
          id: +k,
          position,
          stats,
          count: items.length,
          recentCount: items.filter((o) => o.dayDiff !== null && o.dayDiff <= 3).length,
          label: items[0]?.LocationObjectname,
          items: items,
        }
      })
      setLocationGroupData(groupList)
    }
  }, [engMap, sites])

  useEffect(() => {
    console.log('lastSeenFrom', lastSeenFrom)
    fetchEnginMap()
  }, [lastSeenFrom])

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
                _inputs={selectedGeofencePropreties}
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
              top: showGeoman ? '4rem' : '0.5rem',
              width: 'auto',
              boxSizing: 'border-box',
              right: '0.5rem',
            }}
          >
            <div
              className=''
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
              {!showVehicles && !showGeofences && (
                <div className={`flex gap-2 align-items-center justify-content-end`}>
                  {
                    <ButtonComponent
                      title='Liste des sites'
                      icon={`pi pi-list`}
                      onClick={() => setShowGeofences(true)}
                    />
                  }
                  {
                    <ButtonComponent
                      title='Liste des vehicules'
                      icon={`pi pi-truck`}
                      onClick={() => setShowVehicles(true)}
                    />
                  }
                </div>
              )}
              {showGeofences && (
                <div>
                  <div className='bg-white text-right p-2 border-bottom-1 border-gray-100'>
                    <span
                      title='Cacher'
                      className='pi pi-align-right'
                      onClick={() => setShowGeofences(false)}
                    ></span>
                  </div>
                  <div>{showGeofences && <GeofenceListComponent />}</div>
                </div>
              )}
              {showVehicles && (
                <div className='mt-2'>
                  <div className='text-right bg-white p-2 border-bottom-1 border-gray-100'>
                    <span
                      title='Cacher'
                      className='pi pi-align-right'
                      onClick={() => setShowVehicles(false)}
                    ></span>
                  </div>
                  <div style={{width: '300px'}}>
                    <NavixyVehiclesListComponent
                      onVehicleSelected={onVehicleSelected}
                      onVehicleFiltered={onVehicleFiltered}
                      onVehiclesSelected={onVehiclesSelected}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className='map-shell' style={{position: 'relative', width: '100%'}}>
          <div>
            {!showPios && (
              <div
                className='asset-list-toggle'
                style={{position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 1200}}
              >
                <Button
                  icon='pi pi-list'
                  className='p-button-rounded p-button-text asset-toggle-btn'
                  onClick={() => setShowPios(true)}
                  aria-label='Open asset list'
                />
              </div>
            )}

            {Array.isArray(flatAssets) && Array.isArray(pios) && (
              <div
                className={classNames('asset-panel-shell', {
                  'asset-panel-open': showPios,
                  'asset-panel-mobile': isMobile,
                  'asset-panel-desktop': !isMobile,
                })}
                style={{position: 'absolute', inset: 0, zIndex: 1100, pointerEvents: 'none'}}
              >
                <div
                  className='asset-panel'
                  style={{
                    pointerEvents: 'auto',
                    background: '#ffffff',
                    borderRadius: isMobile ? '16px 16px 0 0' : '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  <div className='lt-asset-panel-head'>
                    <div className='lt-asset-panel-title'>
                      <i className='pi pi-bars' />
                      <div>
                        <strong>Liste des engins <span className='lt-asset-panel-total'>{flatAssets.length}</span></strong>
                        <span className='lt-asset-panel-sub'>
                          Page {currentListPage} / {totalListPages} · {listPageSize}/page
                        </span>
                      </div>
                    </div>
                    <Button
                      icon='pi pi-times'
                      className='p-button-rounded p-button-text p-button-secondary'
                      onClick={() => setShowPios(false)}
                      aria-label='Close asset list'
                    />
                  </div>

                  <div className='lt-asset-searchbar'>
                    <span className='lt-asset-search-inner'>
                      <i className='pi pi-search' />
                      <InputText
                        onChange={(e) => onFilter(e.target.value)}
                        placeholder='Rechercher un engin…'
                        data-testid='asset-search'
                      />
                    </span>
                    <div className='lt-asset-sort-wrap' ref={sortMenuRef}>
                      <button
                        className={`lt-asset-sort-btn ${showSortMenu ? 'is-open' : ''}`}
                        onClick={() => setShowSortMenu((v) => !v)}
                        aria-label='Trier'
                        data-testid='asset-sort-btn'
                        title='Trier'
                      >
                        <i className='pi pi-sort-alt' />
                      </button>
                      {showSortMenu && (
                        <div className='lt-asset-sort-menu' data-testid='asset-sort-menu'>
                          <div className='lt-asset-sort-title'>Trier</div>
                          {[
                            {key: 'name_asc', label: 'Par nom (A-Z)'},
                            {key: 'name_desc', label: 'Par nom (Z-A)'},
                            {key: 'status', label: 'Par statut'},
                            {key: 'activity', label: 'Par dernière activité'},
                          ].map((s) => (
                            <label key={s.key} className='lt-asset-sort-opt' data-testid={`sort-${s.key}`}>
                              <input
                                type='radio'
                                checked={listSort === s.key}
                                onChange={() => { setListSort(s.key); setShowSortMenu(false) }}
                              />
                              <span>{s.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className={`lt-asset-density-btn ${listDensity === 'detailed' ? 'is-detailed' : ''}`}
                      onClick={() => {
                        const next = listDensity === 'compact' ? 'detailed' : 'compact'
                        setListDensity(next)
                        try { localStorage.setItem('lt_map_list_density', next) } catch {}
                      }}
                      aria-label={listDensity === 'compact' ? 'Afficher plus d\u2019infos' : 'Afficher en mode compact'}
                      title={listDensity === 'compact' ? 'Afficher plus d\u2019infos' : 'Mode compact'}
                      data-testid='asset-density-toggle'
                    >
                      <i className={`pi ${listDensity === 'compact' ? 'pi-list' : 'pi-th-large'}`} />
                    </button>
                  </div>

                  <div className='lt-asset-quick-filters' data-testid='asset-quick-filters'>
                    {[
                      {key: 'all', label: 'Tous', count: listCounts.all, color: '#0F172A'},
                      {key: 'onsite', label: 'Sur site', count: listCounts.onsite, color: '#10B981'},
                      {key: 'exited', label: 'Sortis', count: listCounts.exited, color: '#EF4444'},
                      {key: 'battery', label: 'Batt. faible', count: listCounts.battery, color: '#F59E0B'},
                    ].map((f) => (
                      <button
                        key={f.key}
                        className={`lt-asset-qf ${listQuickFilter === f.key ? 'is-active' : ''}`}
                        onClick={() => setListQuickFilter(f.key)}
                        data-testid={`asset-qf-${f.key}`}
                        style={{'--qf-color': f.color}}
                      >
                        <span className='lt-asset-qf-dot' style={{background: f.color}} />
                        {f.label}
                        <span className='lt-asset-qf-count'>{f.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className='asset-filterbar px-3 py-2 border-bottom-1 border-gray-100' style={{display: 'none'}}>
                    <div className='flex flex-wrap gap-2 align-items-center'>
                      <Chip
                        onClick={(e) => toggleOverlay(filterOverRefEtat, e)}
                        label={<OlangItem olang={etatVal?.label} />}
                        icon='fas fa-regular fa-filter-list'
                        className='cursor-pointer asset-filter-chip'
                      />
                      <OverlayPanel
                        className='p-0 asset-filter-overlay'
                        ref={filterOverRefEtat}
                        appendTo={document.body}
                        baseZIndex={3000}
                      >
                        <div className={`-m-3`} style={{minWidth: '140px'}}>
                          {[
                            {label: <OlangItem olang='All' />, value: 'all', icon: 'fa-ban'},
                            ...(groupsEnter || []),
                          ].map((s, i) => (
                            <div
                              key={i}
                              onClick={(e) => {
                                const label =
                                  s.value === 'exit'
                                    ? 'Exit'
                                    : s.value === 'reception'
                                    ? 'Enter'
                                    : 'All'
                                filterEt({label: label, value: s.value})
                                toggleOverlay(filterOverRefEtat, e)
                              }}
                              className={`p-2 flex gap-2 align-items-center hover:bg-blue-100 border-top-${
                                i != 0 && 1
                              } border-gray-200 cursor-pointer`}
                            >
                              <i
                                className={`fas fa-solid ${s?.icon} ${'text-' + s?.color + '-300'}`}
                              ></i>
                              <span>{s?.label || s} </span>
                            </div>
                          ))}
                        </div>
                      </OverlayPanel>

                      <Chip
                        onClick={(e) => toggleOverlay(filterOverRefStatus, e)}
                        label={<OlangItem olang={statusVal?.label} />}
                        icon='fas fa-regular fa-filter-list'
                        className='cursor-pointer asset-filter-chip'
                      />
                      <OverlayPanel
                        className='p-0 asset-filter-overlay'
                        ref={filterOverRefStatus}
                        appendTo={document.body}
                        baseZIndex={3000}
                      >
                        <div className={`-m-3`} style={{minWidth: '140px'}}>
                          {[
                            {label: 'All', status: 'all', icon: 'fa-ban'},
                            ...(groupsStatus || []),
                          ].map((s, i) => (
                            <div
                              key={i}
                              onClick={(e) => {
                                const label = typeof s?.label === 'object' ? 'All' : s?.label
                                const obj = {
                                  label: label,
                                  status: s?.name || 'all',
                                }
                                filterSt(obj)
                                toggleOverlay(filterOverRefStatus, e)
                              }}
                              className={`p-2 flex gap-2 align-items-center hover:bg-blue-100 border-top-${
                                i != 0 && 1
                              } border-gray-200 cursor-pointer`}
                            >
                              <i
                                style={{color: s?.backgroundColor}}
                                className={`fas fa-solid ${s?.icon}`}
                              ></i>
                              <span>{s?.label || ''} </span>
                            </div>
                          ))}
                        </div>
                      </OverlayPanel>

                      {/* <Chip
                        onClick={(e) => toggleOverlay(lastSeenDateRef, e)}
                        label={
                          'Vu depuis: ' +
                          (lastSeenFrom ? moment(lastSeenFrom).format('DD/MM/YYYY') : 'Tous')
                        }
                        icon='fas fa-regular fa-filter-list'
                        className='cursor-pointer asset-filter-chip'
                      /> */}
                      {/* <OverlayPanel
                        className='p-0 asset-filter-overlay'
                        ref={lastSeenDateRef}
                        appendTo={document.body}
                        baseZIndex={3000}
                      >
                        <Calendar
                          value={lastSeenFrom}
                          onChange={(e) => setLastSeenFrom(e.value)}
                          inline
                        />
                      </OverlayPanel> */}
                    </div>
                  </div>

                  <div
                    ref={assetListScrollRef}
                    className='asset-panel-body '
                  >
                    {pagedAssets.map((pio) => {
                      const key = pio?.uid || pio?.id
                      const isSelected =
                        (selectedEnginMap?.uid ||
                          selectedEnginMap?.id ||
                          poiInfos?.uid ||
                          poiInfos?.id) === key
                      const isExpanded = expandedPioUid === key
                      const st = getAssetState(pio)
                      const cl = classifyAsset(pio)
                      const bat = Number(pio?.batteries)
                      const batLabel = (!isNaN(bat) && bat > 0) ? `${Math.round(bat)}%` : null
                      const batColor = (!isNaN(bat) && bat <= 20 && bat > 0) ? '#EF4444' : (!isNaN(bat) && bat <= 40) ? '#F59E0B' : '#10B981'
                      const timeFromNow = pio?.lastSeenAt ? moment.utc(pio.lastSeenAt).fromNow() : null

                      return (
                        <div key={key}>
                          <div
                            ref={(el) => {
                              if (key && el) assetRowRefs.current[key] = el
                            }}
                            className={classNames(
                              'asset-row flex align-items-center rounded-lg pb-4 justify-content-between px-3 py-2 cursor-pointer lt-asset-row-v2',
                              {
                                'asset-row-selected': isSelected,
                                'lt-asset-row-detailed': listDensity === 'detailed',
                              }
                            )}
                            style={{'--row-accent': cl.color, position: 'relative'}}
                            onClick={() => {
                              dispatch(setSelectedEnginMap(pio))
                              // Open the rich single-engin side panel
                              setClusterPopup({
                                position: {lat: pio?.last_lat || 0, lng: pio?.last_lng || 0},
                                items: [pio],
                                _single: true,
                              })
                              // Auto zoom street-level onto the engin position
                              try {
                                const lat = parseFloat(pio?.last_lat ?? pio?.lat)
                                const lng = parseFloat(pio?.last_lng ?? pio?.lng)
                                if (
                                  !isNaN(lat) && !isNaN(lng) &&
                                  lat !== 0 && lng !== 0 && lat !== -1 &&
                                  mapRef.current && mapRef.current.flyTo
                                ) {
                                  mapRef.current.closePopup && mapRef.current.closePopup()
                                  mapRef.current.flyTo([lat, lng], 17, {duration: 0.8})
                                }
                              } catch (err) {}
                              setExpandedPioUid((prev) => {
                                const next = prev === key ? null : key
                                if (next) getDetailEngin(pio)
                                return next
                              })
                            }}
                            // style={{borderBottom: '1px solid #f1f5f9'}}
                          >
                            <div className='lt-asset-row-main lt-asset-row-compact'>
                              <div className='lt-asset-row-title' title={pio.reference || pio.label}>
                                {typeof itemTemplate == 'function'
                                  ? itemTemplate(pio)
                                  : pio.reference || pio.label}
                              </div>
                              {listDensity === 'detailed' && (
                                <div className='lt-asset-row-sub' data-testid={`asset-row-sub-${key}`}>
                                  <span className='lt-asset-row-sub-status' style={{color: cl.color}}>
                                    <span className='lt-asset-row-sub-dot' style={{background: cl.color}} />
                                    {cl.label || pio.statuslabel || '\u2014'}
                                  </span>
                                  {batLabel && (
                                    <span className='lt-asset-row-sub-bat' style={{color: batColor}}>
                                      <i className='pi pi-bolt' />{batLabel}
                                    </span>
                                  )}
                                  {timeFromNow && (
                                    <span className='lt-asset-row-sub-time' title={pio.lastSeenAt}>
                                      <i className='pi pi-clock' />{moment.utc(pio.lastSeenAt).fromNow()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className='lt-asset-row-right'>
                              {listDensity === 'compact' && timeFromNow && (
                                <span className='lt-asset-row-compact-time' title={pio.lastSeenAt}>
                                  <i className='pi pi-clock' />{moment.utc(pio.lastSeenAt).fromNow(true)}
                                </span>
                              )}
                              {listDensity === 'compact' && batLabel && (
                                <span className='lt-asset-row-bat' style={{color: batColor}}>
                                  <i className='pi pi-bolt' />{batLabel}
                                </span>
                              )}
                              <i
                                className={classNames(
                                  'pi lt-asset-row-caret',
                                  isExpanded ? 'pi-chevron-up' : 'pi-chevron-right'
                                )}
                              />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className='lt-asset-row-expand' data-testid={`asset-expand-${key}`}>
                              <div className='lt-asset-exp-top'>
                                {pio?.image ? (
                                  <Image
                                    src={assetConfigs.asset_server_url + pio.image}
                                    alt='Asset'
                                    width='60'
                                    height='60'
                                    imageStyle={{objectFit: 'cover', borderRadius: 10}}
                                    preview
                                    className='cursor-pointer'
                                  />
                                ) : (
                                  <div className='lt-asset-exp-ph'><i className='pi pi-box' /></div>
                                )}
                                <div className='lt-asset-exp-head'>
                                  <span className='lt-asset-row-badge' style={{background: `${cl.color}1A`, color: cl.color}}>
                                    <span className='lt-asset-row-dot' style={{background: cl.color}} />
                                    {cl.label}
                                  </span>
                                  {pio?.statuslabel && (
                                    <span className='lt-asset-row-chip' title={pio.statuslabel}>
                                      <i className={pio.iconName || 'pi pi-tag'} style={{color: pio.statusbgColor || '#64748B'}} />
                                      {pio.statuslabel}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    fetchRoute(pio?.lastSeenAt, pio?.lastSeenDevice)
                                  }}
                                  title='Show Route'
                                  className='lt-asset-exp-route'
                                  rounded
                                >
                                  <i className='fas fa-solid fa-route' style={{fontSize: 11, color: '#FFF'}} />
                                </Button>
                              </div>
                              <div className='lt-asset-exp-grid'>
                                <div className='lt-asset-exp-row'>
                                  <i className='pi pi-map-marker' />
                                  <span>{pio?.enginAddress || pio?.LocationObjectname || '—'}</span>
                                </div>
                                <div className='lt-asset-exp-row'>
                                  <i className='pi pi-eye' />
                                  <LastSeenComponent data={pio} />
                                </div>
                                {timeFromNow && (
                                  <div className='lt-asset-exp-row'>
                                    <i className='pi pi-clock' />
                                    <span>Durée : {timeFromNow}</span>
                                  </div>
                                )}
                                {batLabel && (
                                  <div className='lt-asset-exp-row'>
                                    <i className='pi pi-bolt' style={{color: batColor}} />
                                    <span style={{color: batColor, fontWeight: 700}}>Batterie : {batLabel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {pagedAssets.length === 0 && (
                      <div className='lt-asset-row-empty'>
                        <i className='pi pi-inbox' /> Aucun engin ne correspond aux filtres
                      </div>
                    )}
                  </div>

                  {/* Client-side pagination for quick filters */}
                  <div className='lt-asset-pagination' data-testid='asset-pagination'>
                    <div className='lt-asset-pagination-info'>
                      {visibleAssets.length > 0
                        ? `${(currentListPage - 1) * listPageSize + 1}–${Math.min(currentListPage * listPageSize, visibleAssets.length)} sur ${visibleAssets.length}`
                        : '0 élément'}
                    </div>
                    <div className='lt-asset-pagination-ctrls'>
                      <button
                        className='lt-asset-pg-btn'
                        onClick={() => setListPage(Math.max(1, currentListPage - 1))}
                        disabled={currentListPage === 1}
                        aria-label='Précédent'
                        data-testid='asset-pg-prev'
                      ><i className='pi pi-chevron-left' /></button>
                      <span className='lt-asset-pg-num'>
                        {currentListPage} / {totalListPages}
                      </span>
                      <button
                        className='lt-asset-pg-btn'
                        onClick={() => setListPage(Math.min(totalListPages, currentListPage + 1))}
                        disabled={currentListPage >= totalListPages}
                        aria-label='Suivant'
                        data-testid='asset-pg-next'
                      ><i className='pi pi-chevron-right' /></button>
                      <select
                        className='lt-asset-pg-size'
                        value={listPageSize}
                        onChange={(e) => setListPageSize(Number(e.target.value))}
                        data-testid='asset-pg-size'
                      >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                    </div>
                  </div>

                  {false && (inputFilter.trim().length == 0 ||
                    (Array.isArray(piosList?.[0]?.items) && piosList?.[0]?.items?.length > 0)) && (
                    <div className='asset-panel-footer flex justify-content-center align-items-center'>
                      <Paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        rowsPerPageOptions={[10, 20, 30]}
                        onPageChange={onPageChange}
                        style={{width: '100%'}}
                        className='asset-paginator'
                        template={{
                          layout: 'PrevPageLink PageLinks NextPageLink CurrentPageReport',
                          CurrentPageReport(options) {
                            return (
                              <span className='mx-2'>
                                {options.first} à {options.last} de {options.totalRecords} élément
                              </span>
                            )
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Dialog
            visible={isFetchingRoute}
            modal
            closable={false}
            showHeader={false}
            style={{width: '160px', background: 'transparent', boxShadow: 'none'}}
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem 1rem',
              gap: '10px',
            }}
          >
            <ProgressSpinner style={{width: '40px', height: '40px'}} strokeWidth='4' />
            <span style={{fontSize: '13px', fontWeight: 600, color: '#555'}}>Loading route...</span>
          </Dialog>
          <MapContainer
            ref={mapRef}
            minZoom={1}
            maxZoom={22}
            zoom={10}
            zoomControl={false}
            center={[addressCompany?.[0]?.lat || 0, addressCompany?.[0]?.lng || 0]}
            style={{width: '100%', height: '80vh'}}
          >
            <MapEvents />

            <BaseMapLayerComponent top={60} right={15} />
            <FeatureGroup ref={editorRef}></FeatureGroup>

            <MarkerClusterGroup
              ref={piosRef}
              maxClusterRadius={150}
              iconCreateFunction={createClusterCustomIcon}
              // spiderfyOnMaxZoom={true}
              // showCoverageOnHover={false}
              eventHandlers={{
                clusterclick: handleClusterClick,
                popupopen: () => setHideClusters(true),
                popupclose: () => setHideClusters(false),
              }}
              zoomToBoundsOnClick={false}
              spiderfyOnMaxZoom={false}
              showCoverageOnHover={false}
            >
              {useMemo(
                () =>
                  engMap?.map((pio) => {
                    if (
                      pio &&
                      pio?.last_lat !== 0 &&
                      pio?.last_lat !== -1 &&
                      !isNaN(pio?.last_lat) &&
                      !isNaN(pio?.last_lng)
                    )
                      return (
                        <Marker
                          key={pio?.id}
                          id={pio?.id}
                          position={{lat: pio?.last_lat, lng: pio?.last_lng}}
                          icon={redIcon}
                          eventHandlers={{
                            click: (e) => {
                              // Prevent native popup — use the rich side panel instead
                              try { e.target.closePopup && e.target.closePopup() } catch (err) {}
                              setClusterPopup({
                                position: {lat: pio?.last_lat, lng: pio?.last_lng},
                                items: [pio],
                                _single: true,
                              })
                              onClickMarker(pio)
                            },
                          }}
                        />
                      )
                  }),
                [engMap]
              )}
            </MarkerClusterGroup>

            {/* Cluster insights opens via side panel (ClusterInsightsPanel), see below */}
            <MarkerClusterGroup
              ref={trackerRef}
              maxClusterRadius={150}
              iconCreateFunction={createTrackerClusterCustomIcon}
            >
              {trackers.map((o) => (
                <Marker
                  eventHandlers={{
                    click: (e) => {
                      // onClickMarker(o)
                    },
                  }}
                  position={{lat: o.state?.gps.location.lat, lng: o.state.gps.location.lng}}
                  icon={dvIcon(o)}
                ></Marker>
              ))}
            </MarkerClusterGroup>
            {/* {enginMarker ? <Marker position={enginMarker} icon={customIcon} /> : null} */}
            <FeatureGroup>
              {/* <Polygon positions={[polygonFilterLatLngs]} /> */}
              {pointFilterLatLng && <Marker position={pointFilterLatLng} icon={tagIcon} />}
            </FeatureGroup>
            <FeatureGroup>
              {/* <Polygon positions={[polygonFilterLatLngs]} /> */}
              {locationGroupData.map((item, idx) => {
                const selectedIds = Array.isArray(selectedIdsGeo)
                  ? selectedIdsGeo.map((id) => String(id))
                  : []
                const markerId = String(item.id ?? '')
                if (!selectedIds.includes(markerId)) return null

                return (
                  <Marker
                    key={item.id + '-' + idx}
                    position={item.position}
                    icon={locationGroupIcon()}
                  >
                    <Popup>
                      <div class='flex justify-content-start flex-column'>
                        <div>
                          <h1 className='text-left'>{item.label}</h1>
                          <h3
                            style={{margin: '0', color: '#007bff'}}
                            className='flex align-items-center gap-2 mb-2'
                          >
                            <div
                              className='bg-blue-500 text-white flex justify-content-center align-items-center'
                              style={{width: '40px', height: '40px', borderRadius: '50%'}}
                            >
                              {item.count}
                            </div>
                            <div className='text-left'>
                              Bouteilles
                              {item.recentCount > 0 ? (
                                <span style={{fontSize: '12px'}} className='block text-gray-500'>
                                  {item.recentCount} vu il y a moin de 3 jours
                                </span>
                              ) : null}
                            </div>
                          </h3>
                        </div>
                        <Divider className='mt-0' />
                        <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                          {item.items.map(clusterPopupItemTemplate)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </FeatureGroup>
            <GeomanComponent
              actions={Array.isArray(actions) ? actions : ['polygon']}
              show={showGeoman}
            />
            {Array.isArray(vehiculeHistoryRoute) &&
              vehiculeHistoryRoute.length > 1 &&
              (() => {
                const coords = vehiculeHistoryRoute
                  .map((p) => {
                    const lat = p?.satlat || p?.lat
                    const lng = p?.satlng || p?.lng
                    return lat && lng ? [lat, lng] : null
                  })
                  .filter(Boolean)
                if (coords.length < 2) return null
                return (
                  <>
                    <Polyline
                      positions={coords}
                      pathOptions={{color: '#D64B70', weight: 4, opacity: 0.85}}
                    />
                    <Marker
                      position={coords[0]}
                      icon={L.divIcon({
                        html: `<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid #fff"></div>`,
                        className: '',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    />
                    <Marker
                      position={coords[coords.length - 1]}
                      icon={L.divIcon({
                        html: `<div style="background:#D64B70;width:12px;height:12px;border-radius:50%;border:2px solid #fff"></div>`,
                        className: '',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    />
                  </>
                )
              })()}
            <ZoomControl position='bottomright' />
            {children}
          </MapContainer>
        </div>
      </div>
      <ClusterInsightsPanel
        open={!!clusterPopup}
        items={clusterPopup?.items || []}
        singleMode={!!clusterPopup?._single}
        onClose={() => setClusterPopup(null)}
        onSelectItem={(item) => {
          try {
            const lat = parseFloat(item.last_lat ?? item.lat)
            const lng = parseFloat(item.last_lng ?? item.lng)
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && mapRef.current && mapRef.current.flyTo) {
              // Street-level zoom for precise address visibility
              mapRef.current.flyTo([lat, lng], 18, {duration: 0.8})
            }
            dispatch(setSelectedEnginMap(item))
            // Keep the panel open so the user can cross-check the info
          } catch (e) {}
        }}
      />
    </div>
  )
}

export default MapComponent
