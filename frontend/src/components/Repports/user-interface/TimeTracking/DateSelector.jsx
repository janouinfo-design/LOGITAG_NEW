import {useEffect, useState} from 'react'
import {Button} from 'primereact/button'
import {Dropdown} from 'primereact/dropdown'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'
import 'moment/locale/fr'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getTeams} from '../../../Teams/slice/team.slice'
import {MultiSelect} from 'primereact/multiselect'
import {
  generateRapportUser,
  generateRapportUserCsv,
  getLoadingRptUser,
  setLoadingRptUser,
} from '../../slice/rapports.slice'
import {SplitButton} from 'primereact/splitbutton'

const DateSelector = ({startDate, endDate, onDateChange, onEmployeeChange, selectedEmployee}) => {
  const loadingRptUser = useAppSelector(getLoadingRptUser)

  const dispatch = useAppDispatch()
  const teams = useAppSelector(getTeams)

  const handleStartDateChange = (e) => {
    if (e.value instanceof Date) {
      onDateChange(e.value, endDate)
    }
  }

  const handleEndDateChange = (e) => {
    if (e.value instanceof Date) {
      onDateChange(startDate, e.value)
    }
  }
  const saveRapport = () => {
    dispatch(setLoadingRptUser(true))
    let args = {
      dateFrom: moment(startDate).format('YYYY-MM-DD'),
      dateTo: moment(endDate).format('YYYY-MM-DD'),
      staffList: selectedEmployee?.map((e) => e).join(','),
    }
    dispatch(generateRapportUser(args))
  }

  const dropOptionTemplate = (option) => {
    return (
      <div className='flex align-items-center'>
        <strong>{option?.firstname + ' ' + option?.lastname}</strong>
      </div>
    )
  }

  const items = [
    {
      label: 'PDF',
      icon: 'fas fa-solid fa-file-pdf text-red-300',
      command: () => {
        dispatch(setLoadingRptUser(true))
        let args = {
          dateFrom: moment(startDate).format('YYYY-MM-DD'),
          dateTo: moment(endDate).format('YYYY-MM-DD'),
          staffList: selectedEmployee?.map((e) => e).join(','),
          templateName: 'templateStaffCalendar',
        }
        dispatch(generateRapportUser(args))
      },
    },
    {
      label: 'Export CSV',
      icon: 'fas fa-solid fa-file-csv text-green-300',
      command: () => {
        dispatch(setLoadingRptUser(true))
        let args = {
          dateFrom: moment(startDate).format('YYYY-MM-DD'),
          dateTo: moment(endDate).format('YYYY-MM-DD'),
          staffList: selectedEmployee?.map((e) => e).join(','),
          templateName: 'staffCalendarList',
        }
        dispatch(generateRapportUserCsv(args))
      },
    },
  ]

  // // Set initial dates to first and last day of current month on component mount
  // useEffect(() => {
  //   const start = moment()
  //   const end = moment().endOf('month')
  //   onDateChange(start.toDate(), end.toDate())
  // }, [])

  console.log('getLoadingRptUser', getLoadingRptUser)

  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in bg-muted/10 p-4 rounded-lg '>
      <div className='flex items-center gap-2 w-full sm:w-auto '>
        <div className='flex flex-col gap-2'>
          <div className='text-base font-medium text-gray-600'>
            <OlangItem olang='periode' />:
          </div>
          {/* <Button 
            icon="pi pi-chevron-left" 
            onClick={goToPreviousPeriod}
            rounded
          /> */}
          <div className='flex flex-row gap-2 items-center'>
            <Calendar
              className='rounded-3xl'
              value={new Date(startDate)}
              onChange={handleStartDateChange}
              dateFormat='dd/mm/yy'
              showIcon={false}
            />
            <Calendar
              className='rounded-3xl'
              value={new Date(endDate)}
              onChange={handleEndDateChange}
              dateFormat='dd/mm/yy'
              showIcon={false}
            />
          </div>
          {/* <Button 
            icon="pi pi-chevron-right" 
            onClick={goToNextPeriod}
            rounded
          /> */}
        </div>
      </div>

      <div className='flex flex-col gap-2 w-full sm:w-auto'>
        <div className=' text-sm font-medium text-muted-foreground'>
          <OlangItem olang='employe' />:
        </div>
        {/* <Dropdown
          placeholder='Select Employee'
          value={selectedEmployee}
          options={teams}
          onChange={(e) => onEmployeeChange(e.value)}
          className='w-[250px] h-[60px] flex items-center'
          filter
          optionValue='userID'
          optionLabel='firstname'
        /> */}
        <div className='flex flex-row items-center gap-4'>
          <MultiSelect
            placeholder='Select Employee'
            value={selectedEmployee}
            options={teams}
            onChange={(e) => onEmployeeChange(e.value)}
            className='w-[350px] h-[60px] flex items-center'
            filter
            optionValue='id'
            optionLabel='firstname'
            itemTemplate={dropOptionTemplate}
            showClear
            display='chip'
          />
          {/* <Button
            icon='pi pi-download'
            className='p-button-outlined'
            disabled={loadingRptUser}
            onClick={saveRapport}
            loading={loadingRptUser}
          /> */}
          <SplitButton
            text
            label='Export'
            icon='fas fa-solid fa-file-arrow-down'
            model={items}
            className='rounded-2xl h-[50px] border-gray-300 text-gray-400'
            severity='secondary'
            loading={loadingRptUser}
          />
        </div>
      </div>
    </div>
  )
}

export default DateSelector
