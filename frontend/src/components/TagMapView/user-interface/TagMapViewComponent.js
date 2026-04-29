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
  const [flowFilter, setFlowFilter] = useState('all') // all | onsite | arrived | exited
  const [zoneFilter, setZoneFilter] = useState([]) // array of LocationID (numbers)
  const [showZoneDD, setShowZoneDD] = useState(false)
  const [zoneSearch, setZoneSearch] = useState('')
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
      icon: 'pi pi-arrow-down',
      color: 'green',
    },

    {label: <OlangItem olang='Exit' />, value: 'exit', icon: 'pi pi-arrow-up', color: 'red'},
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
    // Skip fetch if Redux cache already has engines (avoids 30s wait when arriving fresh on /tour/index).
    // Same pattern as CalendarView: stale-while-revalidate via shared backend cache (TTL 60s).
    if (Array.isArray(list) && list.length > 0) {
      setTotalRecords(list.length)
      setPage(0)
    } else {
      dispatch(
        fetchEngines({
          page: 1,
          filterPosition: 1,
          SortDirection: 'DESC',
          SortColumn: 'lastSeenAt',
          PageSize: 5000,
        })
      ).then(({payload}) => {
        setTotalRecords(payload?.[0]?.TotalEngins || (Array.isArray(payload) ? payload.length : 0))
        setPage(0)
      })
    }
    dispatch(fetchStatusList())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (Array.isArray(list)) {
      let lst = _.uniqBy(_.cloneDeep(list), 'id')
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

  // ── Flow filter counts & filtered list ──
  const flowCounts = React.useMemo(() => {
    const now = moment()
    const counts = {all: 0, onsite: 0, arrived: 0, exited: 0, zones: new Set()}
    ;(formatedList || []).forEach((o) => {
      counts.all++
      if (o.LocationID && o.LocationID != 0 && o.LocationActif == 7) counts.onsite++
      if (o.LocationID) counts.zones.add(o.LocationID)
      if (o.lastSeenAt) {
        const diffMin = now.diff(moment.utc(o.lastSeenAt), 'minutes')
        if (diffMin <= 60) counts.arrived++
        else if (diffMin > 60 * 24 * 3) counts.exited++
      }
    })
    return {...counts, zones: counts.zones.size}
  }, [formatedList])

  // ── Build zones list (LocationID + name + count) ──
  const zonesList = React.useMemo(() => {
    const byZone = {}
    ;(formatedList || []).forEach((o) => {
      if (o.LocationID && o.LocationID != 0) {
        const k = String(o.LocationID)
        if (!byZone[k]) byZone[k] = {id: o.LocationID, name: o.LocationObjectname || 'Zone #' + o.LocationID, count: 0}
        byZone[k].count++
      }
    })
    return Object.values(byZone).sort((a, b) => b.count - a.count)
  }, [formatedList])

  const filteredZonesList = React.useMemo(() => {
    if (!zoneSearch) return zonesList
    const q = zoneSearch.toLowerCase()
    return zonesList.filter((z) => (z.name || '').toLowerCase().includes(q))
  }, [zonesList, zoneSearch])

  const filteredPios = React.useMemo(() => {
    let list = formatedList || []
    if (zoneFilter && zoneFilter.length > 0) {
      const set = new Set(zoneFilter.map(String))
      list = list.filter((o) => o.LocationID && set.has(String(o.LocationID)))
    }
    if (flowFilter === 'all') return list
    const now = moment()
    return list.filter((o) => {
      if (flowFilter === 'onsite') return o.LocationID && o.LocationID != 0 && o.LocationActif == 7
      if (!o.lastSeenAt) return false
      const diffMin = now.diff(moment.utc(o.lastSeenAt), 'minutes')
      if (flowFilter === 'arrived') return diffMin <= 60
      if (flowFilter === 'exited') return diffMin > 60 * 24 * 3
      return true
    })
  }, [formatedList, flowFilter, zoneFilter])

  const toggleZone = (id) => {
    setZoneFilter((prev) => prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id])
  }
  const clearZones = () => setZoneFilter([])
  const selectAllZones = () => setZoneFilter(filteredZonesList.map((z) => z.id))

  return (
    <div className="lt-page" data-testid="map-page">
      <div className="lt-page-header" data-testid="map-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #10B981, #059669)'}}>
            <i className="pi pi-map"></i>
          </div>
          <div>
            <h1 className="lt-page-title">Carte des Assets</h1>
            <p className="lt-page-subtitle">Localisation GPS en temps réel</p>
          </div>
        </div>
        <div className="lt-page-header-right" style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <button
            className={`lt-flow-pill ${flowFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFlowFilter('all')}
            data-testid='flow-pill-all'
          >
            <span className='lt-flow-dot' style={{background: '#0F172A'}} />
            <strong>{flowCounts.all}</strong> Tous
          </button>
          <button
            className={`lt-flow-pill ${flowFilter === 'onsite' ? 'is-active' : ''}`}
            onClick={() => setFlowFilter('onsite')}
            data-testid='flow-pill-onsite'
          >
            <span className='lt-flow-dot' style={{background: '#10B981'}} />
            <strong>{flowCounts.onsite}</strong> Sur site
          </button>
          <button
            className={`lt-flow-pill ${flowFilter === 'arrived' ? 'is-active' : ''}`}
            onClick={() => setFlowFilter('arrived')}
            data-testid='flow-pill-arrived'
          >
            <i className='pi pi-arrow-down-right' style={{color: '#F59E0B', fontSize: '0.75rem'}} />
            <strong>{flowCounts.arrived}</strong> Entrées 1h
          </button>
          <button
            className={`lt-flow-pill ${flowFilter === 'exited' ? 'is-active' : ''}`}
            onClick={() => setFlowFilter('exited')}
            data-testid='flow-pill-exited'
          >
            <i className='pi pi-arrow-up-right' style={{color: '#EF4444', fontSize: '0.75rem'}} />
            <strong>{flowCounts.exited}</strong> Sorties
          </button>
          <div className='lt-flow-zone-wrap' style={{position: 'relative'}}>
            <button
              className={`lt-flow-pill ${zoneFilter.length > 0 ? 'is-active' : 'lt-flow-pill--info'}`}
              onClick={() => setShowZoneDD((v) => !v)}
              data-testid='flow-pill-zones'
              aria-expanded={showZoneDD}
            >
              <i className='pi pi-map-marker' style={{fontSize: '0.75rem'}} />
              <strong>{zoneFilter.length > 0 ? `${zoneFilter.length}/${flowCounts.zones}` : flowCounts.zones}</strong>
              Zones
              <i className={`pi pi-chevron-${showZoneDD ? 'up' : 'down'}`} style={{fontSize: '0.6rem', opacity: 0.7}} />
            </button>
            {showZoneDD && (
              <div className='lt-zone-dd' data-testid='zones-dropdown'>
                <div className='lt-zone-dd-head'>
                  <i className='pi pi-search' />
                  <input
                    type='text'
                    placeholder='Rechercher une zone…'
                    value={zoneSearch}
                    onChange={(e) => setZoneSearch(e.target.value)}
                    autoFocus
                    data-testid='zone-search'
                  />
                </div>
                <div className='lt-zone-dd-toolbar'>
                  <span className='lt-zone-dd-count'>
                    {zoneFilter.length} / {zonesList.length} sélectionnée{zoneFilter.length > 1 ? 's' : ''}
                  </span>
                  <div style={{display: 'flex', gap: 6}}>
                    <button
                      className='lt-zone-dd-quick'
                      onClick={selectAllZones}
                      disabled={filteredZonesList.length === 0}
                      data-testid='zones-select-all'
                    >Tout</button>
                    <button
                      className='lt-zone-dd-quick'
                      onClick={clearZones}
                      disabled={zoneFilter.length === 0}
                      data-testid='zones-clear'
                    >Effacer</button>
                  </div>
                </div>
                <div className='lt-zone-dd-list'>
                  {filteredZonesList.length === 0 && (
                    <div className='lt-zone-dd-empty'>
                      <i className='pi pi-inbox' /> Aucune zone trouvée
                    </div>
                  )}
                  {filteredZonesList.map((z) => {
                    const checked = zoneFilter.includes(z.id)
                    return (
                      <label key={z.id} className={`lt-zone-dd-row ${checked ? 'is-checked' : ''}`} data-testid={`zone-row-${z.id}`}>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={() => toggleZone(z.id)}
                        />
                        <span className='lt-zone-dd-name'>{z.name}</span>
                        <span className='lt-zone-dd-badge'>{z.count}</span>
                      </label>
                    )
                  })}
                </div>
                <div className='lt-zone-dd-footer'>
                  <button
                    className='lt-zone-dd-apply'
                    onClick={() => setShowZoneDD(false)}
                    data-testid='zones-apply'
                  >
                    <i className='pi pi-check' /> Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lt-table-wrap" style={{overflow: 'visible', minHeight: '70vh'}} data-testid="map-wrap">
        <MapComponent
          markerNameKey={'label'}
          groups={['famille', {label: 'Zone', value: 'LocationObjectname'}]}
          groupPioBy={'status'}
          piosPosition={'topleft'}
          pios={filteredPios}
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
          type={type || 'main'}
          filterSt={filterStatus}
          filterEt={filterEtat}
          statusVal={filterSt}
          etatVal={filterEt}
        />
      </div>
    </div>
  )
}

export default TagMapViewComponent
