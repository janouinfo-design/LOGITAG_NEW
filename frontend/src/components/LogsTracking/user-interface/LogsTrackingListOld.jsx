import React, {useEffect, useMemo, useRef, useState} from 'react'
import CardLogsList from './CardLogsList'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  fetchEnginByTag,
  fetchLogList,
  fetchStaffList,
  getLogList,
  getLogsTrack,
  getStaffList,
  setListDetail,
  setListTagLogs,
  setShowDetail,
} from '../slice/logs.slice'
import DetailLogs from './DetailLogs/DetailLogs'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {setToastParams} from '../../../store/slices/ui.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import _ from 'lodash'
import FilterDialog from './Filter/FilterDialog'
import {Dropdown} from 'primereact/dropdown'
import {MultiSelect} from 'primereact/multiselect'
import './style.css'

const LogsTrackingList = () => {
  const [datetime24h, setDateTime24h] = useState(null)
  const [datetime24hEnd, setDateTime24hEnd] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)

  const indexClick = useRef(null)

  const listLogs = useAppSelector(getLogList)
  const staffList = useAppSelector(getStaffList)

  const dispatch = useAppDispatch()


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


  const formateDate = (date) => {
    const newDate = new Date(date)
    const formattedDate = moment(newDate).format('YYYY-MM-DDTHH:mm:ss')
    return formattedDate
  }


  const onSearch = () => {
    setLoading(true)
    let users = selectedStaff?.map((o) => {
      return {userId: o}
    })
    let obj = {
      maxSecond: 0,
      begDate: formateDate(datetime24h),
      endDate: formateDate(datetime24hEnd),
      userFilter: users || [],
    }
    dispatch(fetchLogList(obj)).then(() => {
      setLoading(false)
    })
  }

  const entries = useMemo(() => Object.entries(listLogs), [listLogs])
  const totalEntries = entries.length

  useEffect(() => {
  }, [entries])

  useEffect(() => {
    const today = moment().add(2, 'hours').format('YYYY-MM-DDTHH:mm:ss')
    const fiveDaysBefore = moment().subtract(6, 'hours').format('YYYY-MM-DDTHH:mm:ss')
    setDateTime24h(new Date(fiveDaysBefore))
    setDateTime24hEnd(new Date(today))
    let obj = {
      maxSecond: 0,
      begDate: fiveDaysBefore,
      endDate: today,
    }
    dispatch(fetchLogList(obj))
    dispatch(fetchStaffList())
  }, [])

  return (
    <>
      <DetailLogs />
      {/* <FilterDialog /> */}
      {/* <div className='w-full'>
        <ButtonComponent>
          <OlangItem olang='add.filters' />
          <i className='pi pi-plus ml-2' />
        </ButtonComponent>
      </div> */}
      <div className='w-full flex flex-row align-items-center justify-content-center p-2'>
        <div style={{width: '20%'}} className='flex flex-row align-items-center'>
          <div className='text-xl text-gray-800 mr-4 font-semibold'>
            <OlangItem olang='User' />
            {' :'}
          </div>
          <MultiSelect
            placeholder='Select User'
            optionLabel='firstname'
            optionValue='userID'
            options={staffList}
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.value)}
            className='w-8'
            display='chip'
            filter
          />
        </div>
        <div style={{width: '20%'}} className='flex flex-row align-items-center'>
          <div className='text-xl text-gray-800 mr-4 font-semibold'>
            <OlangItem olang='From' />:{' '}
          </div>
          <Calendar
            className='text-center text-lg'
            id='calendar-24h'
            value={datetime24h}
            dateFormat='dd/mm/yy'
            onChange={(e) => setDateTime24h(e.value)}
            showTime
            hourFormat='24'
            showIcon
          />
        </div>
        <div style={{width: '20%'}} className='flex flex-row align-items-center'>
          <div className='text-xl text-gray-800 mr-4 font-semibold'>
            <OlangItem olang='To' />:{' '}
          </div>
          <Calendar
            className='text-center text-lg'
            id='calendar-24h'
            value={datetime24hEnd}
            dateFormat='dd/mm/yy'
            onChange={(e) => setDateTime24hEnd(e.value)}
            showTime
            hourFormat='24'
            showIcon
          />
        </div>
        <ButtonComponent
          icon='pi pi-search'
          rounded
          severity='primary'
          aria-label='Search'
          loading={loading}
          disabled={loading}
          onClick={onSearch}
        />
      </div>
      {entries.map(([key, value], index) => (
        <div key={index}>
          <CardLogsList
            key={index}
            address={value?.[0]?.address || 'Address not found'}
            date={value?.[0]?.formatedDate || 'Date not found'}
            lengthScan={_.uniqBy(value, 'macAddr').length || 0}
            userName={value?.[0]?.user || 'User not found'}
            image={value?.[0]?.imageImage || 'Image not found'}
            first={index === 0}
            last={index === totalEntries - 1}
            onShowDetail={() => onShowDetail(value, index)}
            loading={index === indexClick.current && loadingDetail}
          />
        </div>
      ))}
    </>
  )
}

//export default LogsTrackingListOld
