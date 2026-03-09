import React, {useCallback, useEffect, useRef, useState} from 'react'
import MapComponent from '../../shared/MapComponent/user-interface/MapComponent'
import {useSelector} from 'react-redux'
import {fetchTags, getTags} from '../../Tag/slice/tag.slice'
import {useDispatch} from 'react-redux'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import _ from 'lodash'
import assetConfigs from '../../../configs/index'
import {
  fetchEngines,
  fetchStatusList,
  fetchTypesList,
  getEngines,
  getStatusList,
} from '../../Engin/slice/engin.slice'
import {MapContainer, TileLayer} from 'react-leaflet'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {Image} from 'primereact/image'
import {Avatar} from 'primereact/avatar'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import moment from 'moment'
import LastSeenComponent from '../../Engin/EnginDetail/LastSeenComponent'

const TagMapViewComponent = ({type}) => {
  const [formatedList, setFormatedList] = useState([])
  const [isLastPage, setIsLastPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(0)
  const [filterSt, setFilterSt] = useState({label: 'All', value: 'all'})
  const [filterEt, setFilterEt] = useState({label: 'All', value: 'all'})
  const filterRef = useRef({etat: 'all', status: 'all'})

  const searchRef = useRef('')

  const list = useAppSelector(getEngines)
  const statusList = useAppSelector(getStatusList)

  const dispatch = useAppDispatch()

  // const page = useRef(1)
  const pioDetailMap = useRef(null)

  let groupEnter = [
    {
      label: <OlangItem olang='Enter' />,
      value: 'reception',
      icon: 'fa-down-to-bracket',
      color: 'green',
    },

    {label: <OlangItem olang='Exit' />, value: 'exit', icon: 'fa-up-from-bracket', color: 'red'},
  ]

  const itemTemplate = (item) => {
    return (
      <div className='flex'>
        <div className='info flex flex-column gap-1 mx-2'>
          <strong className='text-m' style={{fontSize: '14px'}}>
            {item.reference}
          </strong>
          <div className='flex flex-row gap-2'>
            <strong className='text-xs text-gray-600'>{item.famille}</strong>
          </div>
        </div>
      </div>
    )
  }

  const filterEtat = (item) => {
    setFilterEt({label: item.label, value: item.value})
    filterRef.current = {etat: item.value, status: filterSt?.value}
    let obj = {
      page: 1,
      search: searchRef.current || undefined,
      statutEngin: item.value === 'all' ? null : item.value,
      tatEngin: filterSt?.value === 'all' ? null : filterSt?.value,
      filterPosition: 1,
      SortDirection: 'DESC',
      SortColumn: 'lastSeenAt',
    }
    dispatch(fetchEngines(obj)).then(({payload}) => {
      if (payload) {
        setTotalRecords(payload[0]?.TotalEngins || 0)
        setPage(0)
      }
    })
  }

  const filterStatus = (item) => {
    let obj = {
      page: 1,
      statutEngin: filterEt?.value === 'all' ? '' : filterEt?.value,
      tatEngin: item?.status === 'all' ? '' : item.status,
      filterPosition: 1,
      search: searchRef.current || undefined,
      SortDirection: 'DESC',
      SortColumn: 'lastSeenAt',
    }
    filterRef.current = {etat: filterEt?.value, status: item.status}
    setFilterSt({label: item.label, value: item.status})
    dispatch(fetchEngines(obj)).then(({payload}) => {
      if (payload) {
        setTotalRecords(payload[0]?.TotalEngins || 0)
        setPage(0)
      }
    })
  }

  const itemDetailTemplate = (poiInfos) => {
    return (
      <div>
        <span
          className='pi pi-times absolute text-white '
          onClick={(e) => {
            // setPioInfos(null)
            // setSelectedPio(null)
          }}
          style={{top: '10px', right: '10px', fontSize: '20px', zIndex: 10}}
        ></span>
        <div className=' bg-white' style={{width: '400px'}}>
          <div>
            <MapContainer
              minZoom={1}
              maxZoom={22}
              zoom={15}
              zoomControl={false}
              center={[poiInfos.last_lat, poiInfos.last_lng]}
              ref={pioDetailMap}
              style={{width: '100%', height: '170px'}}
            >
              <TileLayer
                maxNativeZoom={18}
                minZoom={1}
                maxZoom={22}
                attribution='&copy openstreetmap'
                url='http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              />
            </MapContainer>
          </div>
          <div className='p-2'>
            <div className='flex justify-content-between'>
              <strong>{poiInfos?.reference}</strong>
              <div>
                <span className='pi pi-cog'></span>
              </div>
            </div>
            <div className='flex gap-4 flex-wrap mt-4'>
              <div className='flex gap-2 align-items-center'>
                <span
                  style={{color: poiInfos?.statusbgColor}}
                  className='pi pi-circle-fill tex-lg'
                ></span>
                <strong>{poiInfos?.statuslabel}</strong>
              </div>

              <div className='flex gap-2  align-items-center'>
                <i className='fa-solid fa-battery-full text-green-500'></i>
                <strong>{poiInfos?.batteries}</strong>
              </div>
              <div className='flex gap-2 align-items-center'>
                <span className='pi pi-wifi  text-green-500'></span>
                <strong>{'Good'}</strong>
              </div>
            </div>
            <div className='mt-4'>
              <div className='flex gap-2 mb-3 align-items-center'>
                <div className='w-1'>
                  <span className='pi pi-map-marker  text-gray-500'></span>
                </div>
                <div className='w-11'>
                  <strong className='block text-lg'>{poiInfos?.enginAddress}</strong>
                  <span className='text-gray-600'>{poiInfos?.locationDate}</span>
                </div>
              </div>
              <div className='flex gap-2 mb-3 align-items-center'>
                <div className='w-1'>
                  <span className='pi pi-truck  text-gray-500'></span>
                </div>
                {false && (
                  <div className='w-11'>
                    <strong className='block text-lg'>Test</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (data) => {
    if (!data.lastSeenAt || typeof data.lastSeenAt != 'string') return '_'
    if (data.lastSeenAt.includes('+')) return moment(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
    return moment.utc(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
  }

  const pioPopupTemplate = (poiInfos) => {
    return (
      <div className='text-left '>
        <div className='flex gap-2 flex-wrap align-items-center'>
          {poiInfos?.image && (
            <img
              alt=''
              style={{borderRadius: '50%'}}
              width={50}
              height={50}
              src={API_BASE_URL_IMAGE + poiInfos.image}
            />
          )}
          <strong>{poiInfos?.reference}</strong>
        </div>
        <div className='flex gap-3 flex-wrap mt-4'>
          <div className='flex gap-2 align-items-center'>
            <i
              title={poiInfos?.statuslabel}
              className={poiInfos.iconName + ' text-xl'}
              style={{color: poiInfos.statusbgColor}}
            />
          </div>

          <div className='flex gap-2  align-items-center'>
            <i className='fa-solid fa-battery-full text-green-500'></i>
            <strong>{poiInfos?.batteries >= 100 ? 100 : poiInfos?.batteries}%</strong>
          </div>
          <div className='flex gap-2 align-items-center'>
            <span className='pi pi-wifi  text-green-500'></span>
            <strong>{'Good'}</strong>
          </div>
          {poiInfos?.lastSeenAt && (
            <LastSeenComponent data={poiInfos} />
            // <div className='flex gap-2 align-items-center'>
            //   <strong>{formatDate(poiInfos)}</strong>
            //   <div>
            //     (<OlangItem olang='last.seen' />)
            //   </div>
            // </div>
          )}
          {!poiInfos?.sysMode === 'gateway' && (
            <div className='flex gap-2 align-items-center'>
              <i className='pi pi-user text-gray-500'></i>
              <strong className='text-base pl-2'>{poiInfos?.lastUser}</strong>
            </div>
          )}
        </div>
        <div className='mt-4'>
          <div className='flex gap-2 mb-3 align-items-center'>
            <div className='w-1'>
              <i
                title={poiInfos?.etatengin}
                className={poiInfos.etatIconName + ' text-2xl'}
                style={{color: poiInfos.etatbgColor}}
              ></i>
            </div>
            <div className='w-11'>
              <strong className='text-lg'>{poiInfos?.LocationObjectname}</strong>
              <span className='text-gray-600 pl-2'>{poiInfos?.locationDate}</span>
            </div>
          </div>

          <div className='flex gap-2 mb-3 align-items-center'>
            <OlangItem olang='Address' />
            <strong className='pl-2'>{poiInfos?.enginAddress}</strong>
          </div>
          {/* <div className='flex gap-2 mb-3 align-items-center'>
            <div className='w-1'>
              <span className='pi pi-truck  text-black'></span>
            </div>
            {false && (
              <div className='w-11'>
                <strong className='block text-lg'>Test</strong>
              </div>
            )}
          </div> */}
        </div>
      </div>
    )
  }

  const onPageChange = (page) => {
    dispatch(
      fetchEngines({
        page: page,
        filterPosition: 1,
        statutEngin: filterEt?.value === 'all' ? '' : filterEt?.value,
        tatEngin: filterSt?.status === 'all' ? '' : filterSt.status,
        SortDirection: 'DESC',
        SortColumn: 'lastSeenAt',
      })
    ).then(({payload}) => {
      setTotalRecords(payload[0]?.TotalEngins || 0)
      // setIsLastPage(payload)
    })
  }

  const fetchAndSetEngines = (searchTerm) => {
    const params = {
      search: searchTerm || undefined,
      page: 1,
      tatEngin: filterRef.current?.status === 'all' ? '' : filterRef.current?.status,
      statutEngin: filterRef.current?.etat === 'all' ? '' : filterRef.current.etat,
      filterPosition: 1,
    }
    dispatch(fetchEngines(params))
      .then(({payload}) => {
        if (payload) {
          setTotalRecords(payload[0]?.TotalEngins || 0)
          setPage(0)
        }
      })
      .catch((error) => {
        console.error('Error fetching engines:', error)
      })
  }

  const debouncedSearch = useCallback(
    _.debounce((searchTerm) => {
      fetchAndSetEngines(searchTerm.trim())
    }, 300),
    []
  )

  const handleSearch = (event) => {
    searchRef.current = event
    debouncedSearch(event)
  }

  const showMore = () => {
    setLoading(true)
    dispatch(fetchEngines()).then(() => {
      setLoading(false)
      // setIsLastPage(payload)
    })
  }

  useEffect(() => {
    dispatch(
      fetchEngines({page: 1, filterPosition: 1, SortDirection: 'DESC', SortColumn: 'lastSeenAt', PageSize: 10})
    ).then(({payload}) => {
      setTotalRecords(payload[0]?.TotalEngins || 0)
      setPage(0)
      // setIsLastPage(payload)
    })
    dispatch(fetchStatusList())
  }, [])

  useEffect(() => {
    if (Array.isArray(list)) {
      let lst = _.cloneDeep(list)
      let cp = 0
      lst?.forEach((o) => {
        if (!o) return
        o.lat = o.last_lat
        o.lng = o.last_lng
        if (o.lat == 0 || o.lng == 0) {
          // if (cp >= defaultLatLngs.length) cp = 0
          // let latlng = defaultLatLngs[cp]
          // o.lat = latlng.lat
          // o.lng = latlng.lng
          // cp++
        }
        if (o) {
          o.label = o.reference
          o.category = o.famille
          // o.image = o.engin.image
        }
        o.famille = o.category || o.famille
        // o.label = o.label || o.name || o.macAddr
      })

      setFormatedList(lst)
    } else {
      setFormatedList([])
    }
  }, [list])

  return (
    <MapComponent
      markerNameKey={'label'}
      groups={['famille', {label: 'Zone', value: 'LocationObjectname'}]}
      groupPioBy={'status'}
      piosPosition={'topleft'}
      pios={formatedList}
      itemTemplate={itemTemplate}
      pioPopupTemplate={pioPopupTemplate}
      groupsEnter={groupEnter}
      groupsStatus={statusList}
      showMoreClick={showMore}
      loadingShowMore={loading}
      isLastPage={isLastPage}
      onChangePagination={onPageChange}
      totalRecords={totalRecords}
      onSearch={handleSearch}
      // itemDetailTemplate={itemDetailTemplate}
      type={type || 'main'}
      filterSt={filterStatus}
      filterEt={filterEtat}
      statusVal={filterSt}
      etatVal={filterEt}
    />
  )
}

export default TagMapViewComponent
