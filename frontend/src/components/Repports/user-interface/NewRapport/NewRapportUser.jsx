import React, {useEffect, useState} from 'react'
import Header from '../TimeTracking/Header'
import TabsSection from '../TimeTracking/TabsSection'
import DateSelector from '../TimeTracking/DateSelector'
import TimeTable from '../TimeTracking/TimeTable'
import AddTimeDialog from '../TimeTracking/AddTimeDialog'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchCalendarWork,
  fetchTimeStatus,
  getAddTimeVisible,
  getCalendarWork,
  setAddTimeVisible,
  setDataFilter,
} from '../../slice/rapports.slice'
import moment from 'moment'
import TimeTableCalendar from '../TimeTracking/TimeTableCalendar'
import {fetchTeams} from '../../../Teams/slice/team.slice'
import {TabPanel, TabView} from 'primereact/tabview'
import ActivitiesTab from '../TimeTracking/ActivitiesTab'
import {useLocalStorage} from 'primereact/hooks'

const NewRapportUser = () => {
  const [activeTab, setActiveTab] = useState('apercu')
  const [startDate, setStartDate] = useLocalStorage(moment().toDate(), 'startDate')

  const [endDate, setEndDate] = useLocalStorage(moment().endOf('month').toDate(), 'endDate')
  const [dateFrom, setDateFrom] = useLocalStorage(moment().toDate(), 'dateFrom')
  const [dateTo, setDateTo] = useLocalStorage(moment().endOf('month').toDate(), 'dateTo')

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // const [isAddTimeDialogOpen, setIsAddTimeDialogOpen] = useState(false)
  const dispatch = useAppDispatch()
  const dataCalendar = useAppSelector(getCalendarWork)
  const addTimeVisible = useAppSelector(getAddTimeVisible)
  const handleDateChange = (start, end) => {
    setStartDate(start)
    setEndDate(end)
  }

  const clickAlert = (rowData) => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? 1 : 0))
    let dt = {
      startDate: startDate,
      endDate: endDate,
      ...rowData,
    }
    dispatch(setDataFilter(dt))
  }

  const handleChangeEmployee = (e) => {
    setSelectedEmployee(e)
  }

  useEffect(() => {
    const fetchData = () => {
      let args = {
        dateFrom: moment(startDate).format('YYYY-MM-DD'),
        dateTo: moment(endDate).format('YYYY-MM-DD'),
        staffList: selectedEmployee?.map((e) => e).join(','),
      }
      console.log('args useEffect', args)
      dispatch(fetchCalendarWork(args))
    }

    // Initial fetch
    fetchData()

    // Set up 5-minute interval
    const intervalId = setInterval(fetchData, 5 * 60 * 1000)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [startDate, selectedEmployee, endDate, dispatch])

  useEffect(() => {
    let start = moment().toDate()
    let end = moment().endOf('month').toDate()
    setDateFrom(start)
    setDateTo(end)
    setStartDate(start)
    setEndDate(end)
    const fetchData = () => {
      let args = {
        dateFrom: moment().format('YYYY-MM-DD'),
        dateTo: moment().endOf('month').format('YYYY-MM-DD'),
        staffList: selectedEmployee?.map((e) => e).join(','),
      }
      console.log('args useEffect', args)
      dispatch(fetchCalendarWork(args))
    }

    // Initial fetch
    fetchData()
    dispatch(fetchTeams())
    let args = {
      id: 0,
      src: 'staff',
    }
    dispatch(fetchTimeStatus(args))
  }, [])

  return (
    <div className='min-h-screen flex justify-center pt-4 bg-background'>
      <div className='w-11/12'>
        <Header onAddTime={() => dispatch(setAddTimeVisible({visible: true}))} />

        <div>
          <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            {/* <TabPanel header="Chiftes">
            <div>Test</div>
          </TabPanel> */}
            <TabPanel header='Aperçu'>
              <DateSelector
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                selectedEmployee={selectedEmployee}
                onEmployeeChange={handleChangeEmployee}
              />
              <TimeTable
                onClickAlert={clickAlert}
                startDate={startDate}
                endDate={endDate}
                employees={dataCalendar}
              />
            </TabPanel>
            <TabPanel header='Activités suivies'>
              <ActivitiesTab />
            </TabPanel>
            {/* <TimeTableCalendar /> */}
          </TabView>
        </div>
        <AddTimeDialog
          isOpen={addTimeVisible.visible}
          onClose={() => dispatch(setAddTimeVisible({visible: false}))}
        />
      </div>
    </div>
  )
}

export default NewRapportUser
