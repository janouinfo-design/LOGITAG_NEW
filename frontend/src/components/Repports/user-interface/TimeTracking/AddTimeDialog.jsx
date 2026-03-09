import React, {useEffect, useState} from 'react'
import {Dialog} from 'primereact/dialog'
import {Button} from 'primereact/button'
import {Dropdown} from 'primereact/dropdown'
import {Toast} from 'primereact/toast'
import {useRef} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Calendar} from 'primereact/calendar'
import {getTeams} from '../../../Teams/slice/team.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getAddTimeVisible,
  getTimeStatus,
  getUpdateTimeSt,
  setAddTimeVisible,
  setUpdateTimeSt,
  updateTimeStatus,
} from '../../slice/rapports.slice'
import {useFormik} from 'formik'
import moment from 'moment'
import {setToastParams} from '../../../../store/slices/ui.slice'
import * as Yup from 'yup'

const addTimeValidation = Yup.object().shape({
  employee: Yup.string().required('Champs obligatoire'),
  status: Yup.string().required('Champs obligatoire'),
  dateFrom: Yup.date().required('Champs obligatoire'),
  dateTo: Yup.date().required('Champs obligatoire'),
})

const AddTimeDialog = ({isOpen, onClose}) => {
  const [saveDisabled, setSaveDisabled] = useState(true)
  // const [dateFrom, setDateFrom] = useLocalStorage(moment().toDate(), 'dateFrom')
  // const [dateTo, setDateTo] = useLocalStorage(moment().endOf('month').toDate(), 'dateTo')

  const toast = useRef(null)

  const staffList = useAppSelector(getTeams)
  const statusList = useAppSelector(getTimeStatus)
  const timeAdd = useAppSelector(getAddTimeVisible)
  const updateData = useAppSelector(getUpdateTimeSt)
  const TIME_RANGE = {from: '08:00', to: '23:59'}
  const ERROR_MESSAGES = {
    END_DATE: 'La date de fin doit être supérieure à la date de début',
    TIME_RANGE: (from, to) => `Le temps doit être entre ${from} et ${to}`,
  }

  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      employee: '',
      status: '',
      dateFrom: null,
      dateTo: null,
    },
    validationSchema: addTimeValidation,
    onSubmit: (values, {resetForm}) => {
      if (
        formik.values.dateFrom &&
        formik.values.dateTo &&
        !moment(formik.values.dateFrom).isSame(formik.values.dateTo, 'day')
      ) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERROR',
            detail:
              'Les dates de d but et de fin ne sont pas identiques, veuillez choisir des dates identiques',
          })
        )
        return
      }

      let args = {
        satId: 0,
        srcId: values.employee,
        status: values.status,
        historyDateFrom: moment(values.dateFrom).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        historyDateTo: moment(values.dateTo).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        command: 'insert',
        srcObject: 'Staff',
      }
      dispatch(updateTimeStatus(args)).then(({payload}) => {
        if (payload) {
          dispatch(setUpdateTimeSt(!updateData))
          resetForm()
          onClose()
        }
      })
      console.log('args onSubmit', args)
    },
  })

  // Helper functions
  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return {hours, minutes}
  }

  const createTimeDate = (baseDate, timeString) => {
    const {hours, minutes} = parseTimeString(timeString)
    const date = new Date(baseDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const handleChangeTime = (e) => {
    const {name, value} = e.target

    // Update form field
    formik.setFieldValue(name, value)

    // Skip validation if dateTo isn't set
    if (!formik.values.dateTo) return

    // Date validation
    const dateFrom = new Date(formik.values.dateFrom)
    const dateTo = new Date(value)

    // if (dateTo < dateFrom) {
    //   dispatch(
    //     setToastParams({
    //       show: true,
    //       severity: 'error',
    //       summary: 'ERROR',
    //       detail: ERROR_MESSAGES.END_DATE,
    //       position: 'top-right',
    //     })
    //   )
    //   return
    // }

    // Time range validation
    const currentDateTime = new Date(value)
    const startTime = createTimeDate(currentDateTime, TIME_RANGE.from)
    const endTime = createTimeDate(currentDateTime, TIME_RANGE.to)

    // if (currentDateTime < startTime || currentDateTime > endTime) {
    //   dispatch(
    //     setToastParams({
    //       show: true,
    //       severity: 'error',
    //       summary: 'ERROR',
    //       detail: ERROR_MESSAGES.TIME_RANGE(TIME_RANGE.from, TIME_RANGE.to),
    //       position: 'top-right',
    //     })
    //   )
    // }
  }
  const onHide = () => {
    setSaveDisabled(true)
    formik.resetForm()
    dispatch(setAddTimeVisible({visible: false, data: null}))
  }

  const renderHeader = () => {
    return (
      <div className='flex items-center justify-between p-4 border-b'>
        <h2 className='text-lg font-medium'>Temps de travail</h2>
      </div>
    )
  }

  const renderFooter = () => {
    return (
      <div className='flex justify-end gap-2 p-4 bg-gray-50'>
        <Button
          label='Annuler'
          onClick={onHide}
          className='p-button-outlined'
          pt={{
            root: {className: 'font-normal rounded-md'},
          }}
        />
        <Button
          label='Enregistrer'
          onClick={formik.handleSubmit}
          pt={{
            root: {className: 'font-normal rounded-md'},
          }}
          disabled={saveDisabled}
        />
      </div>
    )
  }

  const optionDropTemplate = (option) => {
    return <strong>{option?.firstname + ' ' + option?.lastname}</strong>
  }

  const selectedDropTemplate = (option, props) => {
    if (option) {
      return (
        <div className='flex align-items-center'>
          <strong>{option?.firstname + ' ' + option?.lastname}</strong>
        </div>
      )
    }

    return <span>{props.placeholder}</span>
  }

  useEffect(() => {
    const isDisabled = Object.values(formik.values).every((val) => val !== '')
    setSaveDisabled(!isDisabled)
  }, [formik.values])

  useEffect(() => {
    if (timeAdd?.data) {
      console.log('timeAdd useEffect', timeAdd)
      formik.setValues({
        employee: timeAdd.data.srcId,
        dateFrom: moment(timeAdd.data.FromTimeZone).toDate(),
        dateTo: moment(timeAdd.data.ToTimeZone).toDate(),
      })
    }
  }, [timeAdd])

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={isOpen}
        onHide={onHide}
        header={renderHeader}
        footer={renderFooter}
        modal
        className='p-0 animate-fade-in'
        style={{width: '500px'}}
        contentClassName='p-0'
        pt={{
          root: {className: 'rounded-lg overflow-hidden'},
          content: {className: 'gap-0'},
        }}
      >
        <div className='p-4 space-y-6'>
          <div className='space-y-2'>
            <label htmlFor='employee' className='flex items-center text-base font-medium'>
              <OlangItem olang='employee' />
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <Dropdown
              id='employee'
              value={formik.values.employee}
              options={staffList}
              onChange={(e) => formik.setFieldValue('employee', e.value)}
              placeholder='Employé'
              className='w-full'
              optionValue='id'
              optionLabel='firstname'
              itemTemplate={optionDropTemplate}
              valueTemplate={selectedDropTemplate}
              filter
              pt={{
                root: {className: 'w-full'},
                input: {className: 'w-full rounded-md'},
              }}
            />
            {formik.errors.employee && formik.touched.employee && (
              <small className='p-error'>{formik.errors.employee}</small>
            )}
          </div>

          <div className='space-y-2'>
            <label htmlFor='status' className='flex items-center text-base font-medium'>
              <OlangItem olang='status' />
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <Dropdown
              id='status'
              value={formik.values.status}
              options={statusList}
              onChange={(e) => formik.setFieldValue('status', e.value)}
              placeholder='Statut'
              optionLabel='name'
              optionValue='status'
              className='w-full'
              pt={{
                root: {className: 'w-full'},
                input: {className: 'w-full rounded-md'},
              }}
            />
            {formik.errors.status && formik.touched.status && (
              <small className='p-error'>{formik.errors.status}</small>
            )}
          </div>
          <div className='space-y-2'>
            <label htmlFor='status' className='flex items-center text-base font-medium'>
              <OlangItem olang='from' />
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <Calendar
              name='dateFrom'
              value={formik.values.dateFrom}
              onChange={(e) => handleChangeTime(e)}
              showTime
              hourFormat='24'
              className='w-full'
              placeholder='From'
              icon={() => <i className='pi pi-clock' />}
              showIcon
              dateFormat='dd/mm/yy'
            />
            {formik.errors.dateFrom && formik.touched.dateFrom && (
              <small className='p-error'>{formik.errors.dateFrom}</small>
            )}
          </div>
          <div className='space-y-2'>
            <label htmlFor='status' className='flex items-center text-base font-medium'>
              <OlangItem olang='to' />
              <span className='text-red-500 ml-1'>*</span>
            </label>
            <Calendar
              name='dateTo'
              value={formik.values.dateTo}
              onChange={(e) => handleChangeTime(e)}
              showTime
              hourFormat='24'
              className='w-full'
              placeholder='To'
              icon={() => <i className='pi pi-clock' />}
              showIcon
              dateFormat='dd/mm/yy'
            />
            {formik.errors.dateTo && formik.touched.dateTo && (
              <small className='p-error'>{formik.errors.dateTo}</small>
            )}
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default AddTimeDialog
