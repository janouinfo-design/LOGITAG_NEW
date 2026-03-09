import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Avatar} from 'primereact/avatar'
import {cn} from '../../../../lib/utils'
import moment from 'moment'
import 'moment/locale/fr'
import {Image} from 'primereact/image'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {Chip} from 'primereact/chip'
import {Button} from 'primereact/button'
import {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import MapUserTracking from './MapUserTracking'
import {Dialog} from 'primereact/dialog'
import {fetchUserHistoric, getUserHistoric} from '../../slice/rapports.slice'

moment.locale('fr')

const TimeTable = ({startDate, endDate, employees, onClickAlert}) => {
  const [showMap, setShowMap] = useState(false)

  const dispatch = useAppDispatch()

  const dt = useRef(null)

  const userHist = useAppSelector(getUserHistoric)
  const days = []
  let currentDate = moment(startDate)
  let endMoment = moment(endDate)
  while (currentDate <= endMoment) {
    days.push(currentDate.format('YYYY-MM-DD'))
    currentDate = currentDate.add(1, 'day')
  }

  const createTableData = () => {
    return employees.map((employee) => {
      const rowData = {
        id: employee.UserId,
        name: employee.Name,
        initials: employee.initials,
        avatar: employee.Avatar,
        totalWorkTime: employee.TotalWorkHours,
        breakTime: employee.TotalPauseHours,
        total: employee.TotalHours,
        statusColor: employee.statusColor,
        isError: employee.isError,
      }

      days.forEach((day, index) => {
        rowData[`day${index + 1}`] = employee.timeEntries[day] || '0.00;0.00;0.00'
      })
      return rowData
    })
  }

  const tableData = createTableData()

  const showLocations = (rowData) => {
    let args = {
      srcId: rowData.id,
    }
    dispatch(fetchUserHistoric(args)).then(({payload}) => {
      console.log('payload', payload)
      if (!payload) return
      setShowMap(true)
    })
  }

  // Templates for columns
  const employeeTemplate = (rowData) => {
    return (
      <div className='flex items-center gap-2'>
        {/* <Avatar 
          label={rowData.initials} 
          shape="circle" 
          size="normal" 
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
          className="border p-4"
        /> */}
        <Avatar
          style={{borderColor: rowData?.statusColor, borderWidth: '3px'}}
          image={`${API_BASE_URL_IMAGE}${rowData?.avatar}`}
          size='xlarge'
          shape='circle'
          onClick={() => showLocations(rowData)}
          className='cursor-pointer'
        />
        <span className='font-medium'>{rowData.name}</span>
        {rowData?.isError == 1 && (
          <i
            onClick={() => onClickAlert(rowData)}
            className='cursor-pointer fa-solid fa-sensor-triangle-exclamation text-red-500'
          ></i>
        )}
      </div>
    )
  }

  const headerDay = (options) => {
    const splitVal = moment(options).format('dddd DD MMMM')
    return (
      <div className='w-[110px]'>
        <div className='text-base font-medium text-gray-800'>{splitVal}</div>
      </div>
    )
  }

  const scrollLeft = () => {
    if (dt.current) {
      const scrollContainer = dt.current.getElement().querySelector('.p-datatable-wrapper')
      scrollContainer.scrollLeft -= 200 // Scroll 200px to the left
    }
  }

  const scrollRight = () => {
    if (dt.current) {
      const scrollContainer = dt.current.getElement().querySelector('.p-datatable-wrapper')
      scrollContainer.scrollLeft += 200 // Scroll 200px to the right
    }
  }

  const headerTb = (
    <div className='flex  items-center justify-end '>
      <div className='flex align-items-center'>
        <Button
          icon='pi pi-chevron-left'
          onClick={scrollLeft}
          className='p-button-rounded p-button-text'
        />
        <Button
          icon='pi pi-chevron-right'
          onClick={scrollRight}
          className='p-button-rounded p-button-text ml-2'
        />
      </div>
    </div>
  )

  const onHideMap = () => {
    setShowMap(false)
  }

  const dayTemplate = (rowData, options) => {
    const dayValue = rowData[options.field]
    const split = dayValue.split(';')
    const workTime = split[0]
    const pauseTime = split[1]
    const total = split[2]
    return (
      <div
        className={cn(
          'flex flex-col gap-2 items-center justify-center p-2 rounded-lg',
          dayValue !== '0' ? 'bg-white shadow-sm border border-zinc-100' : 'text-muted-foreground'
        )}
      >
        <Chip
          icon='fas fa-clock'
          label={'Work ' + workTime}
          className='w-[110px] bg-blue-50 border border-blue-100'
          style={{
            color: +workTime !== 0 ? '#3b82f6' : '#9ca3af',
          }}
        />
        <Chip
          icon='fas fa-pause-circle'
          label={'Pause ' + pauseTime}
          className='w-[110px] bg-orange-50 border border-orange-100'
          style={{
            color: +workTime !== 0 ? '#ea580c' : '#9ca3af',
          }}
        />
        <Chip
          icon='fas fa-clock'
          label={'Total ' + total}
          className='w-[110px] bg-blue-50 text-gray-600 border border-blue-100'
        />
      </div>
    )
  }

  return (
    <div className='w-full overflow-x-auto animate-fade-in'>
      <Dialog visible={showMap} onHide={onHideMap} className='w-[70vw]' position='right'>
        <MapUserTracking />
      </Dialog>
      <DataTable
        ref={dt}
        header={headerTb}
        value={tableData}
        className='table-container min-w-[800px] rounded-xl border border-zinc-100 shadow-sm'
        scrollable
        pt={{
          root: {className: 'rounded-xl overflow-hidden'},
          table: {className: 'border-collapse'},
          thead: {className: 'bg-muted/30'},
          headerRow: {className: 'bg-muted/30'},
          header: {
            cell: {
              className:
                'text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3',
            },
          },
          bodyRow: {className: 'hover:bg-muted/20 border-b border-zinc-100'},
          body: {
            cell: {className: 'px-4 py-3 text-sm'},
          },
        }}
      >
        <Column
          field='name'
          header='Employés'
          body={employeeTemplate}
          frozen
          style={{width: '200px'}}
          pt={{
            headerCell: {className: 'text-left sticky left-0 bg-muted/30 z-10'},
            bodyCell: {className: 'sticky left-0 bg-white z-10'},
          }}
        />
        <Column
          field='totalWorkTime'
          header='Temps de travail'
          style={{width: '140px'}}
          pt={{
            headerCell: {className: 'text-center'},
            bodyCell: {className: 'text-center font-medium'},
          }}
          body={(rowData) => (
            <strong className='text-base text-blue-500'>{rowData.totalWorkTime}</strong>
          )}
        />

        <Column
          field='breakTime'
          header='Pause'
          style={{width: '120px'}}
          pt={{
            headerCell: {className: 'text-center'},
            bodyCell: {className: 'text-center'},
          }}
          body={(rowData) => (
            <strong className='text-base text-orange-500'>{rowData.breakTime}</strong>
          )}
        />

        <Column
          field='total'
          header='Total'
          style={{width: '120px'}}
          pt={{
            headerCell: {className: 'text-center'},
            bodyCell: {className: 'text-center font-medium'},
          }}
          body={(rowData) => <strong>{rowData.total}</strong>}
        />

        {days.map((day, index) => (
          <Column
            key={index}
            field={`day${index + 1}`}
            header={() => headerDay(day)}
            body={(rowData) => dayTemplate(rowData, {field: `day${index + 1}`})}
            style={{width: '200px', textAlign: 'center'}}
            // pt={{
            //   headerCell: {className: 'text-center'},
            //   bodyCell: {className: 'text-center py-2'},
            // }}
          />
        ))}
      </DataTable>
    </div>
  )
}

export default TimeTable
