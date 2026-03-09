import React, {useEffect, useMemo, useRef, useState} from 'react'
import CardLogsList from './CardLogsList'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  fetchEnginByTag,
  fetchEnginList,
  fetchLogList,
  fetchStaffList,
  getEnginList,
  getLogList,
  getLogsTrack,
  getStaffList,
  setIsFiltred,
  setListDetail,
  setListTagLogs,
  setLogList,
  setShowDetail,
} from '../slice/logs.slice'
import DetailLogs from './DetailLogs/DetailLogs'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'

import _ from 'lodash'

import {MultiSelect} from 'primereact/multiselect'
import LogMapDetail from './LogMapDetail/LogMapDetail'

import './style.css'
import Subheader from '../../shared/Subheader/Subheader'
import {Button} from 'primereact/button'
import {Chip} from 'primereact/chip'
import {OverlayPanel} from 'primereact/overlaypanel'
import {Checkbox} from 'primereact/checkbox'
import {Divider} from 'primereact/divider'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {Dialog} from 'primereact/dialog'
import {InputNumber} from 'primereact/inputnumber'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {Dropdown} from 'primereact/dropdown'
import {InputSwitch} from 'primereact/inputswitch'
import {fetchEngines, getEngines} from '../../Engin/slice/engin.slice'
import {InputText} from 'primereact/inputtext'
import {Paginator} from 'primereact/paginator'
import {ProgressSpinner} from 'primereact/progressspinner'
import {fetchTrackerVeh, getVehicules} from '../../veh/slice/veh.slice'
import {Ripple} from 'primereact/ripple'
import {classNames} from 'primereact/utils'
const LogsTrackingList = () => {
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [filter, setFilter] = useState({})

  const indexClick = useRef(null)
  let [entries, setEntries] = useState([])
  let [entriesToDisplay, setEntriesToDisplay] = useState([])
  let [selected, setSelected] = useState(null)
  let [sources, setSources] = useState([])
  const [pageIndex, setPageIndex] = useState(0)
  const [dataPerPage, setDataPerPage] = useState(50)
  let [selectedSources, setSelectedSources] = useState([])
  let [selectedSourceNames, setSelectedSourceNames] = useState([])
  let [showSettings, setShowSettings] = useState(false)
  const [selectedEngins, setSelectedEngins] = useState([])
  const [enginFilterText, setEnginFilterText] = useState('')
  const [sourceFilterText, setSourceFilterText] = useState('')
  const [paginationNextDate, setPaginationNextDate] = useState(null)

  let [selectedEnginNames, setSelectedEnginNames] = useState([])


  const usersRef = useRef()
  const dateFromRef = useRef()
  const dateToRef = useRef()
  const enginRef = useRef()
  const calendarRefFrom = useRef()
  const calendarRefTo = useRef()

  const listLogs = useAppSelector(getLogList)
  const staffList = useAppSelector(getStaffList)
  const engins = useAppSelector(getEnginList)
  const vehicules = useAppSelector(getVehicules)

  const dispatch = useAppDispatch()


  const deviceTypes = [
    {label: 'GPS', value: 'gps'},
    {label: 'Gateway', value: 'gateway'},
    {label: 'Mobile', value: 'mobile'},
  ]

  const onShowDetail = (list, index) => {
    indexClick.current = index
    setLoadingDetail(true)
    dispatch(setListDetail(list))
    const uniqueTg = _.uniqBy(list, 'macAddr')
    dispatch(setListTagLogs(uniqueTg))
    const tags = list?.map((o) => {
      return {
        macAddr: o.macAddr,
      }
    })
    dispatch(fetchEnginByTag(tags)).then(({payload}) => {
      if (payload) {
        dispatch(setShowDetail(true))
        setLoadingDetail(false)
      } else {
        setLoadingDetail(false)
      }
    })
    // dispatch(setListDetail(list))
    // dispatch(setShowDetail(true))
  }

  const footerTemplate = (src) => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px'}}>
      <Button
        label='Clear'
        onClick={() => {
          onInput(src == 'from' ? 'from' : 'to', '')
        }}
        className='p-button-secondary p-button-sm'
      />
      {/* <Button
        label='Today'
        onClick={() => formik.setFieldValue('date', formateDate)}
        className='p-button-primary'
      /> */}
      <Button
        label='OK'
        onClick={() => {
          if (src === 'from') dateFromRef.current.hide()
          if (src === 'to') dateToRef.current.hide()
          // onConfirmDate.current = true
        }}
        className='p-button-success p-button-sm'
      />
    </div>
  )

  const toggleAllSources = () => {
    if (selectedSources.length === deviceTypes.length) {
      setSelectedSources([])
      setSelectedSourceNames([])
    } else {
      setSelectedSources(deviceTypes.map((o) => o.value))
      setSelectedSourceNames(deviceTypes.map((o) => o.label))
    }
  }

  const fetchFromPagination = () => {
    if (!paginationNextDate) return
    let startDate = moment(paginationNextDate).subtract(3, 'hours').format()
    let options = {
      begDate: startDate,
      endDate: paginationNextDate,
      limit: 2000,
      deviceType: selectedSources || [],
      enginId: selectedEngins || [],
    }

    fetchLogs(options).then((o) => {
      if (entriesToDisplay.length < dataPerPage && o?.length > 0) {
        setPageIndex((prev) => prev - 1)
      }
    })
  }

  const fetchLogs = (options) => {
    setLoading(true)
    options.reverse = 1

    return dispatch(fetchLogList(options)).then(({payload}) => {

      if (Array.isArray(payload) && payload.length > 0) {
        // Parse and filter logs
        const logs = payload.filter((log) => {
          const logDate = moment(log.dateFormated) // Parse log's dateFormated with Moment.js
          const startDate = moment(options.begDate)
          const endDate = moment(options.endDate)
          return logDate.isBetween(startDate, endDate, null, '[]')
        })

        dispatch(setLogList(logs))
      }

      setLoading(false)
      return payload
    })
  }

  const onSearch = (fromPagination) => {
    // let users = (selectedEngins || [])
    //   .filter((o) => o)
    //   .map((o) => {
    //     return {userId: o}
    //   })
    // if(options.)
    if (filter.from || filter.to) dispatch(setIsFiltred(true))
    else dispatch(setIsFiltred(false))
    let options = {
      deviceType: selectedSources || [],
      enginId: selectedEngins || [],
      maxSecond: 0,
      limit: 2000,
    }
    if (filter.from && typeof filter.from != 'string')
      options.begDate = moment(filter.from).format()
    if (filter.to && typeof filter.to != 'string') options.endDate = moment(filter.to).format()
    fetchLogs(options)
  }

  const toggleSelectSource = (item) => {
    setSelectedSources((prev) => {
      let t = _.cloneDeep(prev)
      if (!Array.isArray(t)) t = []

      if (t.includes(item.value)) t = item.value === '' ? [] : t.filter((i) => i != item.value)
      else {
        if (item === '') {
          t = [...sources.map((o) => o.value), item.value]
        } else t.push(item.value)
      }
      setSelectedSourceNames(t)
      return t
    })
  }

  const toggleSelectEngin = (id) => {
    setSelectedEngins((prev) => {
      let t = _.cloneDeep(prev)
      if (!Array.isArray(t)) t = []
      if (t.includes(id)) t = id === '' ? [] : t.filter((i) => i != id)
      else {
        if (id === '') t = [...engins.map((o) => +o.id), id]
        else t.push(+id)
      }
      return t
    })
  }

  useEffect(() => {
    const today = moment().format()
    const fiveDaysBefore = moment().subtract(3, 'hours').format()
    let options = {
      begDate: fiveDaysBefore,
      endDate: today,
      limit: 500,
    }
    fetchLogs(options)
    dispatch(fetchStaffList())
    dispatch(fetchEngines())
  }, [])

  const toggleOverlay = (ref, e) => {
    if (!ref?.current) return
    ref.current.toggle(e)
  }

  const onInput = (key, value) => {
    let prevFilter = _.cloneDeep(filter)
    if (!_.isPlainObject(prevFilter)) prevFilter = {}
    setFilter({...prevFilter, [key]: value})
  }

  const saveSettings = () => {
    setShowSettings(false)
  }
  const onPageChange = (data) => {
    setPageIndex(data.page)
    setDataPerPage(data.rows)
    setTimeout(() => {
      if (data.page == data.pageCount - 1) {
        fetchFromPagination()
      }
    }, 300)
  }
  const settingsModalFooter = (
    <div>
      <Divider />
      <Button onClick={saveSettings}>Enregistrer</Button>
    </div>
  )

  const template = {
    layout: 'RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport',
    PrevPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <span>
            {' '}
            <i className='pi pi-angle-left'></i>{' '}
          </span>
          <Ripple />
        </Button>
      )
    },
    PageLinks(options) {
      if (
        (options.view.startPage === options.page && options.view.startPage !== 0) ||
        (options.view.endPage === options.page && options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, {'p-disabled': true})

        return (
          <span className={className} style={{userSelect: 'none'}}>
            ...
          </span>
        )
      }

      return (
        <span type='button' className={options.className} onClick={options.onClick}>
          {options.page + 1}
          <Ripple />
        </span>
      )
    },
    NextPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <i className='pi pi-angle-right'></i>
          <Ripple />
        </Button>
      )
    },
    RowsPerPageDropdown(options) {
      const dropOptions = [
        {label: 10, value: 10},
        {label: 20, value: 20},
        {label: 50, value: 50},
        {label: 100, value: 100},
        // {label: 'All', value: options.totalRecords},
      ]

      return (
        <div className='mr-5'>
          <Dropdown value={options.value} onChange={options.onChange} options={dropOptions} />
        </div>
      )
    },
    CurrentPageReport(options) {
      return (
        <span className='mx-2'>
          {options.first} à {options.last} de {options.totalRecords} élément
        </span>
      )
    },
  }

  // useEffect(() => {
  //   if (Array.isArray(listLogs) && listLogs?.length > 0) {
  //     let dt = _.cloneDeep(listLogs)
  //     let $filter =
  //       selectedSources?.length == 0 || !Array.isArray(selectedSources)
  //         ? dt
  //         : dt.filter((log) => selectedSources.includes(+log.userID || log.gateway || log.deviceId))
  //     if (Array.isArray(selectedEngins) && selectedEngins?.length > 0)
  //       $filter = $filter.filter((log) => selectedEngins.includes(+log.enginId))
  //     $filter = $filter.sort((a, b) => b.date - a.date)
  //     const groupedByDate = _.groupBy($filter, (s) => `${s.date}_${s.userID}`)
  //     setEntries(Object.entries(groupedByDate).filter(([, val]) => val.length > 0))
  //   } else {
  //     setEntries([])
  //   }
  // }, [selectedSources, selectedEngins, listLogs])

  useEffect(() => {
    if (Array.isArray(listLogs) && listLogs?.length > 0) {
      let dt = _.cloneDeep(listLogs)
      let $filter = dt
      // selectedSources?.length == 0 || !Array.isArray(selectedSources)
      //   ? dt
      //   : dt.filter((log) => selectedSources.includes(+log.userID || log.gateway || log.deviceId))
      if (Array.isArray(selectedSources) && selectedSources?.length > 0)
        $filter = $filter.filter((log) => selectedSources.includes(log.deviceType))
      if (Array.isArray(selectedEngins) && selectedEngins?.length > 0)
        $filter = $filter.filter((log) => selectedEngins.includes(+log.enginId))
      $filter = $filter.sort((a, b) => b.date - a.date)
      const groupedByDate = _.groupBy($filter, (s) => `${s.date}_${s.userID}`)
      setEntries(Object.entries(groupedByDate).filter(([, val]) => val.length > 0))
    } else {
      setEntries([])
    }
  }, [listLogs, selectedSources, selectedEngins])

  useEffect(() => {
    if (Array.isArray(listLogs) && listLogs?.length > 0) {
      let lastLogDate = listLogs[listLogs.length - 1].dateFormated
      if (lastLogDate) {
        setPaginationNextDate(moment(lastLogDate).subtract(1, 'seconds').format())
      }
    }
  }, [listLogs])

  // useEffect(() => {
  //   setSelectedSourceNames(
  //     sources.filter((o) => selectedSources.includes(o.id)).map((o) => o.label)
  //   )
  // }, [selectedSources, sources])

  useEffect(() => {
    setSelectedEnginNames(
      Array.isArray(engins)
        ? engins?.filter((o) => selectedEngins?.includes(+o.id)).map((o) => o?.reference)
        : []
    )
  }, [selectedEngins, engins])

  useEffect(() => {
    let dt = _.cloneDeep(listLogs)
    if (!Array.isArray(dt)) dt = []
    let gateways = dt.filter((o) => o.gateway).map((o) => o.gateway)
    gateways = _.uniq(gateways).map((o) => ({
      id: o,
      type: 'gateway',
      label: o,
    }))

    let users = staffList.map((o) => ({
      id: +o.userID,
      type: 'user',
      label: (o.firstname + ' ' + o.lastname).trim(),
    }))
    let veh = vehicules.map((o) => ({
      id: o.deviceId,
      type: 'gps',
      label: o.deviceId,
    }))

    setSources([...veh, ...users, ...gateways])
  }, [staffList, listLogs])

  useEffect(() => {
    if (Array.isArray(entries) && !isNaN(pageIndex) && !isNaN(dataPerPage)) {
      let data = _.cloneDeep(entries).slice(pageIndex * dataPerPage, (pageIndex + 1) * dataPerPage)
      setEntriesToDisplay(data)
    }
  }, [entries, pageIndex, dataPerPage])

  useEffect(() => {
    dispatch(fetchTrackerVeh())
    dispatch(fetchEnginList({page: 1, PageSize: 15, filterPosition: 1, displayMap: 1}))
  }, [])

  return (
    <div
      className='flex flex-column w-full lg:flex-row xl:flex-row'
      style={{gap: 3, height: '85vh'}}
    >
      <Dialog
        //  modal={false}
        footer={settingsModalFooter}
        onHide={() => setShowSettings(false)}
        visible={showSettings}
      >
        <div className='mt-2 ' style={{width: '400px', minHeight: '200px'}}>
          <div
            className='flex mb-5 align-items-center justify-content-center text-orange-200'
            style={{gap: 10}}
          >
            <span className='fas fa-info text-xxl'></span>
            <strong className='text-gray-500'>Fonctionnalité en cours de développement</strong>
          </div>
          <div className='flex flex-column' style={{gap: 10}}>
            <div className='flex ' style={{gap: 10}}>
              <span className='w-5 block'>Nombre d'element a afficher</span>
              <InputNumber className='w-12' />
            </div>
            <div className='flex ' style={{gap: 10}}>
              <span className='w-5 block'>Traker uniquement les engins</span>
              <Dropdown showFilterClear filter className='w-12' />
            </div>
            <div className='flex' style={{gap: 10}}>
              <span className='w-5 block'>Desactiver les elements sans engin</span>
              <div className='w-12'>
                <InputSwitch className='' />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <Subheader>
        <div
          className='h-3rem p-1 bg-gra-100 d-flex justify-content-end align-items-center'
          style={{gap: 6}}
        >
          <div>
            <span
              onClick={() => setShowSettings(true)}
              className='pi pi-cog text-xl text-gray-600 cursor-pointer hover:text-blue-300'
            ></span>
          </div>
          <Divider layout='vertical' style={{height: '100%'}} />
          <div>
            <Chip
              title={selectedEnginNames.join(',') || 'Engins'}
              icon={'fas fa-engine-warning'}
              label={
                selectedEngins.includes('')
                  ? 'Tout'
                  : selectedEnginNames.slice(0, 4).join(',') || 'Engins'
              }
              onClick={(e) => toggleOverlay(enginRef, e)}
              className='cursor-pointer hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
            <OverlayPanel ref={enginRef} className='p-0'>
              <div className='flex gap-2 align-items-center'>
                <Checkbox
                  onChange={() => toggleSelectEngin('')}
                  checked={selectedEngins.includes('')}
                />
                <span className='p-input-icon-right'>
                  <InputText
                    value={enginFilterText}
                    onChange={(e) => setEnginFilterText(e.target.value)}
                    className='p-inputtext-sm'
                    style={{minHeight: '40px'}}
                  />
                  <i
                    onClick={() => {
                      setSelectedEnginNames([])
                      setSelectedEngins([])
                      setEnginFilterText('')
                    }}
                    className='pi pi-times-circle hover:text-red-400'
                  />
                </span>
              </div>
              <Divider className='my-1' />
              <div className='' style={{maxHeight: '300px', overflow: 'auto', minWidth: '150px'}}>
                {(Array.isArray(engins) ? engins : [])
                  .filter((o) =>
                    o.reference.toString().toLowerCase().includes(enginFilterText.toLowerCase())
                  )
                  .map((s, i) => (
                    <div
                      key={s.id}
                      onClick={(e) => {
                        toggleSelectEngin(s.id == '' ? s.id : +s.id)
                        // toggleOverlay(usersRef , e)
                      }}
                      className={`p-2 flex gap-2 align-items-center hover:bg-blue-100 border-top-${
                        i != 0 && 1
                      } border-gray-200 cursor-pointer`}
                    >
                      <Checkbox checked={selectedEngins.includes(s.id == '' ? '' : +s.id)} />
                      <div className='flex align-items-center' style={{gap: 5}}>
                        <span> {s.reference} </span>
                      </div>
                    </div>
                  ))}
              </div>
            </OverlayPanel>
          </div>
          <div>
            <Chip
              title={selectedSourceNames.join(',') || 'Source'}
              icon={'fas fa-boxes-stacked'}
              label={
                selectedSources.includes('')
                  ? 'Tout'
                  : selectedSourceNames.slice(0, 4).join(',') || 'Source'
              }
              onClick={(e) => toggleOverlay(usersRef, e)}
              className='cursor-pointer hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
            <OverlayPanel ref={usersRef} className='p-0'>
              <div className='flex gap-2 align-items-center'>
                <Checkbox
                  onChange={() => toggleAllSources()}
                  checked={selectedSources.length == sources.length}
                />
                <span className='p-input-icon-right'>
                  <InputText
                    value={sourceFilterText}
                    onChange={(e) => setSourceFilterText(e.target.value)}
                    className='p-inputtext-sm'
                    style={{minHeight: '40px'}}
                  />
                  <i
                    onClick={() => {
                      setSelectedSources([])
                      setSourceFilterText('')
                      setSelectedSourceNames([])
                    }}
                    className='pi pi-times-circle hover:text-red-400'
                  />
                </span>
              </div>
              <Divider className='my-1' />
              <div style={{maxHeight: '300px', overflow: 'auto', minWidth: '150px' }}>
                {(Array.isArray(deviceTypes) ? deviceTypes : [])
                  .filter((o) => o.label.toLowerCase().includes(sourceFilterText))
                  .map((s, i) => (
                    <div
                      onClick={(e) => {
                        toggleSelectSource(s)
                        // toggleOverlay(usersRef , e)
                      }}
                      className={`p-2 flex gap-2 align-items-center hover:bg-blue-100 border-top-${
                        i != 0 && 1
                      } border-gray-200 cursor-pointer`}
                    >
                      <Checkbox checked={selectedSources.includes(s.value)} />
                      <div className='flex align-items-center' style={{gap: 5}}>
                        <span
                          className={`fa fa-${
                            s.type == 'gps'
                              ? 'location-crosshairs'
                              : s.type == 'gateway'
                              ? 'signal-stream'
                              : s.type == 'user'
                              ? 'user'
                              : ''
                          }  text-${s.type == 'user' ? 'gray' : 'blue'}-400`}
                        ></span>
                        <span> {s.label} </span>
                      </div>
                    </div>
                  ))}
              </div>
            </OverlayPanel>
          </div>
          <div>
            <Chip
              icon={'pi pi-calendar'}
              label={filter.from ? moment(filter.from).format('DD/MM/YYYY HH:mm') : 'Début'}
              onClick={(e) => toggleOverlay(dateFromRef, e)}
              className='cursor-pointer hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
            <OverlayPanel ref={dateFromRef} className='p-0'>
              <div>
                <Calendar
                  ref={calendarRefFrom}
                  showTime
                  dateFormat='24'
                  value={filter.from}
                  onChange={(e) => {
                    onInput('from', e.value)
                  }}
                  footerTemplate={() => footerTemplate('from')}
                  inline
                />
              </div>
            </OverlayPanel>
          </div>
          <div>
            <Chip
              icon={'pi pi-calendar'}
              label={filter.to ? moment(filter.to).format('DD/MM/YYYY HH:mm') : 'Fin'}
              onClick={(e) => toggleOverlay(dateToRef, e)}
              className='cursor-pointer hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
            <OverlayPanel ref={dateToRef} className='p-0'>
              <div className='-m-3'>
                <Calendar
                  ref={calendarRefTo}
                  hourFormat='24'
                  showTime
                  value={filter.to}
                  footerTemplate={() => footerTemplate('to')}
                  onChange={(e) => {
                    onInput('to', e.value)
                    // toggleOverlay(dateToRef , e)
                  }}
                  inline
                />
              </div>
            </OverlayPanel>
          </div>
          <Button
            loading={loading}
            disabled={loading}
            icon='pi pi-search'
            outlined
            rounded
            style={{width: '30px', height: '30px'}}
            className='p-1'
            onClick={onSearch}
          />
        </div>
      </Subheader>
      <div className='d-flex'>
        <div className='w-full lg:w-3 xl:w-4'>
          {/* <Divider /> */}
          <div style={{maxHeight: '80vh', height: '80vh', overflowY: 'auto'}}>
            {entriesToDisplay.map(([key, value], index) => (
              <div
                onClick={() => {
                  setSelectedGroup(value)
                  setSelected(key)
                }}
                key={index}
              >
                <CardLogsList
                  key={index}
                  items={value}
                  selected={selected == key}
                  address={value?.[0]?.address || 'Address not found'}
                  date={value?.[0]?.dateFormated || 'Date not found'}
                  lengthScan={_.uniqBy(value, 'macAddr').length || 0}
                  userName={value?.[0]?.user || value?.[0]?.deviceId}
                  image={value?.[0]?.imageImage || 'Image not found'}
                  first={index === 0}
                  last={index === entries?.length - 1}
                  onShowDetail={() => setSelectedGroup(value) /*onShowDetail(value, index)*/}
                  loading={index === indexClick.current && loadingDetail}
                />
              </div>
            ))}
            {entriesToDisplay.length == 0 && (
              <div className='h-full w-12 flex align-items-center justify-content-center'>
                {loading && <ProgressSpinner strokeWidth={3} />}
                {!loading && (
                  <strong style={{fontSize: '20px'}} className='text-gray-400'>
                    Aucune données
                  </strong>
                )}
              </div>
            )}
          </div>
          <div className='card'>
            <Paginator
              first={pageIndex * dataPerPage}
              rows={dataPerPage}
              totalRecords={entries.length + dataPerPage}
              rowsPerPageOptions={[30, 50, 100]}
              pageLinkSize={3}
              alwaysShow={false}
              // template={template}
              onPageChange={onPageChange}
            />
          </div>
        </div>
        <div className='w-full border-left-1 border-gray-200' style={{height: '80vh'}}>
          <LogMapDetail
            items={selectedGroup}
            className='relative'
            style={{height: '100%', overflow: 'hidden'}}
          />
        </div>
      </div>
      
    </div>
  )
}

export default LogsTrackingList
