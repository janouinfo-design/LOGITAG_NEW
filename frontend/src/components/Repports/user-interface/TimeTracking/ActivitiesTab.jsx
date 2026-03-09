import React, {useEffect, useState} from 'react'
import {Calendar} from 'primereact/calendar'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'
import {Dropdown} from 'primereact/dropdown'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Card} from 'primereact/card'
import {Tooltip} from 'primereact/tooltip'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchDetailPresence,
  fetchTimeStatus,
  generateRapportUser,
  generateRapportUserCsv,
  getDataFilter,
  getDetailPresence,
  getLoadingRptUser,
  getTimeStatus,
  getUpdateTimeSt,
  setAddTimeVisible,
  setDataFilter,
  setLoadingRptUser,
  setSelectedDataUser,
  updateTimeStatus,
} from '../../slice/rapports.slice'
import moment from 'moment'
import {getTeams} from '../../../Teams/slice/team.slice'
import {Chip} from 'primereact/chip'
import {formateDate} from '../../../../cors/utils/formateDate'
import {MultiSelect} from 'primereact/multiselect'
import {SplitButton} from 'primereact/splitbutton'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {useLocalStorage} from 'primereact/hooks'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {Avatar} from 'primereact/avatar'

const ActivitiesTab = () => {
  const [employee, setEmployee] = useState([])
  const [client, setClient] = useState('tous')
  const [project, setProject] = useState('tous')
  // const [dateFrom, setDateFrom] = useState(moment())
  // const [dateTo, setDateTo] = useState(moment().endOf('month'))
  const [employees, setEmployees] = useState([])
  const [editingRows, setEditingRows] = useState({})
  const [activeError, setActiveError] = useState(false)
  const [dateFrom, setDateFrom] = useLocalStorage(moment().toDate(), 'dateFrom')
  const [dateTo, setDateTo] = useLocalStorage(moment().endOf('month').toDate(), 'dateTo')
  const [products, setProducts] = useState(null)

  const dispatch = useAppDispatch()
  const teams = useAppSelector(getTeams)
  const detailPresence = useAppSelector(getDetailPresence)
  const loadingRptUser = useAppSelector(getLoadingRptUser)
  const statusList = useAppSelector(getTimeStatus)
  console.log('statusList', statusList)
  const updateTime = useAppSelector(getUpdateTimeSt)
  const dataFilter = useAppSelector(getDataFilter)

  // Sample data
  const statistics = {
    workTime: '0min 54s',
    pauseTime: '4min 8s',
    offlineTime: '0min',
    trackedPeriods: '5',
  }

  const shiftWork = {
    work: '08:00 AM',
    end: '18:00 AM',
  }

  const fetchData = () => {
    if (dataFilter?.id) {
      setEmployee([dataFilter?.id])
      setDateFrom(dataFilter?.startDate)
      setDateTo(dataFilter?.endDate)
      setActiveError(true)
      let args = {
        staffList: dataFilter.id,
        dateFrom: moment(dataFilter.startDate).format('YYYY-MM-DD'),
        dateTo: moment(dataFilter.endDate).format('YYYY-MM-DD'),
        filterIsError: 1,
      }

      dispatch(setDataFilter(null))
      return dispatch(fetchDetailPresence(args))
    }
    let checkArr =
      Array.isArray(employee) && employee.length > 0 ? employee?.map((e) => e).join(',') : ''
    let args = {
      staffList: checkArr,
      dateFrom: moment(dateFrom).format('YYYY-MM-DD'),
      dateTo: moment(dateTo).format('YYYY-MM-DD'),
      filterIsError: activeError ? 1 : 0,
    }
    return dispatch(fetchDetailPresence(args))
  }

  // Templates pour les colonnes du DataTable
  const statusTemplate = (rowData) => {
    return (
      <div className='flex items-center gap-2'>
        <span
          className={`
          ${rowData.name === 'work' ? 'text-emerald-600' : ''}
          ${rowData.name === 'pause' ? 'text-blue-600' : ''}
          ${rowData.name === 'conge' ? 'text-orange-600' : ''}
        `}
        >
          <Chip
            icon={
              rowData.name === 'work'
                ? 'fas fa-clock'
                : rowData.name === 'pause'
                ? 'fas fa-pause-circle'
                : 'fas fa-clock'
            }
            label={rowData.name}
            style={{
              color:
                rowData.name === 'work' ? '#2563eb' : rowData.name === 'pause' ? '#ea580c' : 'red',
            }}
          />
        </span>
        {rowData.hasCheckmark && (
          <div className='h-5 w-5 flex items-center justify-center bg-emerald-500 rounded-full text-white'>
            ✓
          </div>
        )}
        {rowData.name === 'conge' && (
          <div className='h-5 w-5 flex items-center justify-center'>—</div>
        )}
      </div>
    )
  }

  const dateTemplate = (rowData) => {
    return (
      <div className='flex items-center'>
        <Chip className='text-gray-800 text-base' label={formateDate(rowData)}></Chip>
      </div>
    )
  }

  const onClickAdd = (rowData) => {
    dispatch(setAddTimeVisible({visible: true, data: rowData}))
  }

  const addTemplate = (rowData) => {
    return (
      <div className='flex items-center'>
        <Button
          rounded
          size='large'
          text
          className='p-button-success'
          icon='fas fa-solid fa-circle-plus'
          onClick={() => onClickAdd(rowData)}
        ></Button>
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
          dateFrom: moment(dateFrom).format('YYYY-MM-DD'),
          dateTo: moment(dateTo).format('YYYY-MM-DD'),
          staffList: employee?.map((e) => e).join(','),
          templateName: 'templateStaffCalendarHistory',
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
          dateFrom: moment(dateFrom).format('YYYY-MM-DD'),
          dateTo: moment(dateTo).format('YYYY-MM-DD'),
          staffList: employee?.map((e) => e).join(','),
          templateName: 'staffCalendarListHistory',
        }
        dispatch(generateRapportUserCsv(args))
      },
    },
  ]

  const addressTemplate = (address) => {
    return (
      <>
        <div
          className='p-tooltip-target max-w-xs truncate'
          data-pr-tooltip={address}
          data-pr-position='top'
        >
          {address}
        </div>
      </>
    )
  }

  const actionTemplate = () => {
    return (
      <Button
        icon='pi pi-pencil'
        className='p-button-text p-button-rounded p-button-sm'
        pt={{
          root: {className: 'p-2'},
          icon: {className: 'text-gray-500 text-sm'},
        }}
      />
    )
  }

  const onRowEditInit = (event) => {
    const {index} = event
    let _editingRows = {...editingRows, [index]: true}
    setEditingRows(_editingRows)
  }

  const onRowEditCancel = (event) => {
    const {index} = event
    let _editingRows = {...editingRows}
    delete _editingRows[index]
    setEditingRows(_editingRows)
  }

  const onRowEditSave = async (event) => {
    const {newData, index} = event

    console.log('newData onRowEditSave', newData)

    let args = {
      satId: newData.satIdFrom,
      satIdTo: newData.satIdTo,
      historyDateFrom: moment(newData.FromTimeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      historyDateTo: moment(newData.ToTimeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      command: 'update',
      srcId: newData.srcId,
      srcObject: 'Staff',
      status: newData.status,
    }

    try {
      // Update the time status
      dispatch(updateTimeStatus(args)).then(({payload}) => {
        console.log('payload updateTimeStatus', payload)
        if (payload) {
          fetchData()
        }
      })
    } catch (error) {
      console.error('Error updating time status:', error)
    }
  }

  const textEditor = (options) => {
    return (
      <InputText
        type='text'
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    )
  }

  const selectedStatusTemplate = (option, props) => {
    const selectedOption = statusList.find((item) => item.status == option)
    if (option) {
      return (
        <div className='flex align-items-center'>
          <Chip
            icon={selectedOption.icon}
            label={selectedOption.name}
            style={{color: selectedOption.backgroundColor}}
          />
        </div>
      )
    }

    return <span>{props.placeholder}</span>
  }

  const nameTemplate = (rowData) => {
    return (
      <div className='flex items-center gap-2'>
        <Avatar icon='pi pi-user' size='large' shape='circle' />
        <strong className='text-gray-800 text-base'>{rowData?.fullname || ''}</strong>
        {rowData?.isError == 1 && (
          <i class='fa-solid fa-sensor-triangle-exclamation text-red-500'></i>
        )}
      </div>
    )
  }

  const dropdownEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        onChange={(e) => options.editorCallback(e.value)}
        options={statusList}
        optionLabel='name'
        optionValue='status'
        placeholder='Select'
        className='w-full'
        valueTemplate={() => selectedStatusTemplate(options.value)}
        itemTemplate={(option) => {
          return (
            <div className='flex align-items-center'>
              <Chip
                icon={'fas fa-pause-circle'}
                label={option.name}
                style={{color: option.backgroundColor}}
              />
            </div>
          )
        }}
      />
    )
  }

  const onChangeTime = (e, options) => {
    if (!e.value) return

    // 1. Get the edited local time from Calendar
    const localMoment = moment(e.value)

    // 2. Convert to UTC
    const utcMoment = localMoment.utc()

    // 3. Get original datetime's timezone offset
    const originalMoment = moment.parseZone(options.value)
    const originalOffset = originalMoment.utcOffset()

    // 4. Apply original offset to UTC time
    const adjustedMoment = utcMoment.utcOffset(originalOffset)

    // 5. Format back to original string format
    const formattedValue = adjustedMoment.format('YYYY-MM-DD HH:mm ZZ')
    let shifts = options.rowData.Shift // "08:00-23:59"
    console.log(shifts, 'shifts moment')
    // if (shifts) {
    //   const [from, to] = shifts.split('-')
    //   const fromTime = moment(formattedValue).set({
    //     hour: parseInt(from.split(':')[0], 10),
    //     minute: parseInt(from.split(':')[1], 10),
    //   })
    //   const toTime = moment(formattedValue).set({
    //     hour: parseInt(to.split(':')[0], 10),
    //     minute: parseInt(to.split(':')[1], 10),
    //   })
    //   if (!moment(formattedValue).isBetween(fromTime, toTime, 'minute', '[]')) {
    //     dispatch(
    //       setToastParams({
    //         show: true,
    //         severity: 'error',
    //         summary: 'ERROR',
    //         detail: 'Le temps doit etre entre ' + from + ' et ' + to,
    //         position: 'top-right',
    //       })
    //     )
    //     console.log('Is not between shift')
    //   }
    // }
    options.editorCallback(formattedValue)
  }

  const dateEditor = (options) => {
    let initialValue

    try {
      // Convert original datetime to local time for display
      const parsedMoment = moment.parseZone(options.value).local()
      initialValue = parsedMoment.toDate()
    } catch (e) {
      console.error('Date parse error:', e)
      initialValue = new Date()
    }

    return (
      <Calendar
        value={initialValue}
        onChange={(e) => onChangeTime(e, options)}
        showTime
        hourFormat='24'
        timeOnly
        stepHour={1}
        stepMinute={1}
        required
      />
    )
  }

  const deleteLine = (rowData) => {
    let args = {
      satId: rowData?.satIdFrom,
      satIdTo: rowData?.satIdTo,
      command: 'delete',
      historyDateFrom: '2025-04-17T10:25:40.000',
      historyDateTo: '2025-04-17T10:25:40.000',
    }
    dispatch(updateTimeStatus(args)).then(({payload}) => {
      if (payload) {
        fetchData()
      }
    })
  }

  const onDelete = (rowData) => {
    dispatch(
      setAlertParams({
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimer cette ligne?',
        acceptClassName: 'p-button-danger',
        visible: true,
        accept: () => {
          deleteLine(rowData)
        },
      })
    )
  }

  const dropOptionTemplate = (option) => {
    return (
      <div className='flex align-items-center'>
        <strong>{option?.firstname + ' ' + option?.lastname}</strong>
      </div>
    )
  }

  const findStatus = (code) => {
    return statusList.find((s) => s.status == code)
  }

  const deleteTemplate = (rowData) => {
    return (
      <Button
        icon='pi pi-trash'
        className='p-button-text p-button-rounded p-button-sm '
        pt={{
          root: {className: 'p-2'},
          icon: {className: 'text-gray-500 text-sm hover:text-red-500'},
        }}
        onClick={() => onDelete(rowData)}
      />
    )
  }

  const allowedGroupFields = ['fullname', 'status', 'FromTimeZone', 'ToTimeZone']

  const rowGroupTemplates = {
    fullname: (rowData) => {
      return <Chip label={rowData?.fullname} style={{color: 'white', backgroundColor: '#3b82f6'}} />
    },
    status: (rowData) => {
      return (
        <Chip
          icon={findStatus(rowData?.status)?.icon}
          style={{backgroundColor: findStatus(rowData?.status)?.backgroundColor, color: 'white'}}
          label={findStatus(rowData?.status)?.name}
        />
      )
    },
    FromTimeZone: (rowData) => {
      return dateTemplate(rowData?.FromTimeZone)
    },
    ToTimeZone: (rowData) => {
      return dateTemplate(rowData?.ToTimeZone)
    },
  }

  const columns = [
    {field: 'fullname', header: 'fullname', olang: 'fullname', body: nameTemplate},
    {
      field: 'FromTimeZone',
      header: 'Date de début',
      olang: 'DateFrom',
      body: (rowData) => dateTemplate(rowData?.FromTimeZone),
      editor: dateEditor,
    },
    {
      field: 'ToTimeZone',
      header: 'Date de fin',
      olang: 'DateTo',
      body: (rowData) => dateTemplate(rowData?.ToTimeZone),
      editor: dateEditor,
    },
    {
      field: 'status',
      header: 'Statut',
      olang: 'status',
      body: statusTemplate,
      editor: dropdownEditor,
    },
    {field: 'add', header: 'add', olang: 'add', body: addTemplate},
    {field: 'delete', header: 'delete', olang: 'delete', body: deleteTemplate},
  ]

  useEffect(() => {
    if (!Array.isArray(teams)) return
    let employeesArr = teams ? [{id: 0, firstname: 'Tous'}, ...teams] : [{id: 0, name: 'Tous'}]
    setEmployees(employeesArr)
  }, [teams])

  useEffect(() => {
    fetchData()
  }, [dateFrom, dateTo, employee, activeError, updateTime])

  useEffect(() => {
    // Reset editing state when new data arrives
    setEditingRows({})
  }, [detailPresence])

  return (
    <div className='animate-fade-in w-full'>
      <Tooltip target='.p-tooltip-target' />
      <div className='flex flex-row gap-4 items-center mb-4'>
        <div className='flex flex-col items-start'>
          <div className='text-sm font-medium text-gray-500 mb-1'>
            <OlangItem olang='Period' />
          </div>
          <div className='flex items-center gap-2 w-full'>
            <Calendar
              value={new Date(dateFrom)}
              onChange={(e) => setDateFrom(e.value)}
              className='w-full'
              inputStyle={{width: '100%'}}
              selectionMode='single'
              placeholder='Select Date From'
              dateFormat='dd/mm/yy'
            />
            <Calendar
              value={new Date(dateTo)}
              onChange={(e) => setDateTo(e.value)}
              className='w-full'
              inputStyle={{width: '100%'}}
              selectionMode='single'
              placeholder='Select Date To'
              dateFormat='dd/mm/yy'
            />
          </div>
        </div>
        <div className='w-full '>
          <div className='text-sm font-medium text-gray-500 mb-1'>
            <OlangItem olang='Employee' />
          </div>
          {/* <Dropdown
            placeholder="Select Employee"
            value={employee}
            options={employees}
            onChange={(e) => setEmployee(e.value)}
            className='w-[250px] h-[60px] flex items-center'
            optionValue='id'
            optionLabel='firstname'
            filter
          /> */}
          <div className='flex flex-row items-center gap-4  w-full'>
            <MultiSelect
              placeholder='Select Employees'
              value={employee}
              options={teams}
              onChange={(e) => setEmployee(e.value)}
              className='w-[350px] h-[60px] flex items-center'
              optionValue='id'
              optionLabel='firstname'
              filter
              itemTemplate={dropOptionTemplate}
              showClear
              display='chip'
            />
            <SplitButton
              text
              label='Export'
              icon='fas fa-solid fa-file-arrow-down'
              model={items}
              className='rounded-2xl h-[50px] border-gray-300 text-gray-400'
              severity='secondary'
              loading={loadingRptUser}
            />
            <i
              onClick={() => setActiveError(!activeError)}
              className={`fa-solid fa-sensor-triangle-exclamation cursor-pointer ${
                activeError ? 'text-red-500' : 'text-red-100'
              } text-4xl`}
            ></i>
          </div>
        </div>

        {/* <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Client</div>
          <Dropdown
            value={client}
            options={clientOptions}
            onChange={(e) => setClient(e.value)}
            className="w-full"
            disabled={true}
          />
        </div> */}

        {/* <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Projet</div>
            <Button
              icon="pi pi-download"
              className="p-button-outlined"
              disabled={false}
            />
        </div> */}
      </div>

      {/* <DataTable
        key={detailPresence.length} // Add this line
        value={detailPresence}
        className='w-full'
        scrollable
        editMode='row'
        onRowEditInit={onRowEditInit}
        onRowEditCancel={onRowEditCancel}
        onRowEditComplete={onRowEditSave}
        dataKey='srcId'
        editingRows={editingRows}
      >
        <Column field='fullname' header='Employé' className='font-medium' body={nameTemplate} />
        <Column
          field='status'
          header='Statut'
          body={statusTemplate}
          editor={(options) => dropdownEditor(options)}
        />
        <Column
          field='FromTimeZone'
          header='De'
          body={(rowData) => dateTemplate(rowData.FromTimeZone)}
          editor={(options) => dateEditor(options)}
        />
        <Column
          field='ToTimeZone'
          header='à'
          body={(rowData) => dateTemplate(rowData.ToTimeZone)}
          editor={(options) => dateEditor(options)}
        />
        <Column field='Duration' header='Durée' />
        <Column
          rowEditor
          headerStyle={{width: '10%', minWidth: '8rem'}}
          bodyStyle={{textAlign: 'center'}}
        />
        <Column field='add' body={(rowData) => addTemplate(rowData)} />
        <Column field='delete' body={(rowData) => deleteTemplate(rowData)} />
      </DataTable> */}
      <DatatableComponent
        dataKey='ID'
        tableId='activitiesTab'
        columns={columns}
        data={detailPresence}
        className='table-container min-w-[800px] rounded-xl border border-zinc-100 shadow-sm'
        scrollable
        notSortedColumns={['delete', 'add']}
        editMode='row'
        // onRowEditComplete={onRowEditComplete}
        onRowEditInit={onRowEditInit}
        onRowEditCancel={onRowEditCancel}
        onRowEditComplete={onRowEditSave}
        editingRows={editingRows}
        allowedGroupFields={allowedGroupFields}
        rowGroupTemplates={rowGroupTemplates}
      ></DatatableComponent>
    </div>
  )
}

export default ActivitiesTab
