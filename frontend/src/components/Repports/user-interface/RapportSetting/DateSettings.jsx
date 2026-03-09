import React, {useEffect, useRef, useState} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import {Calendar} from 'primereact/calendar'
import {Slider} from 'primereact/slider'
import moment from 'moment'
import {Button} from 'primereact/button'
import {
  getLoadingRapport,
  getSelectedRapport,
  saveRapport,
  setShowSettingRapport,
} from '../../slice/rapports.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {useFormik} from 'formik'
import {classNames} from 'primereact/utils'

const DateSettings = ({style}) => {
  const [dates, setDates] = useState(null)
  const [value, setValue] = useState([360, 1440])
  const [selectSlider, setSelectSlider] = useState('')
  const [title, setTitle] = useState('')

  const onConfirmDate = useRef(false)
  const calendarRef = useRef(null)

  const dispatch = useAppDispatch()

  const dateNow = Date.now()
  const formateDate = moment(dateNow).format('YYYY-MM-DD')
  const loading = useAppSelector(getLoadingRapport)
  const selectedRapport = useAppSelector(getSelectedRapport)

  const convertTimeToSliderValue = (time) => {
    const [hours, minutes] = time.split(':')
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
  }

  const generateRandomNumberString = () => {
    return Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')
  }

  const generateRandomText = () => {
    const randomNumberString = generateRandomNumberString()
    return `${
      selectedRapport?.decs === 'engin' ? 'Engin_Rapport' : 'Worksite_Rapport'
    }_${randomNumberString}`
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      date: '',
    },
    validate: (data) => {
      let errors = {}

      if (!data.title) {
        errors.title = 'Title - is required.'
      }
      if (!data.date) {
        errors.date = 'Date - is required.'
      }

      return errors
    },
    onSubmit: (data) => {
      dispatch(saveRapport(data))
      formik.resetForm()
    },
  })

  const convertSliderValueToTime = (value) => {
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    return hours == 24
      ? '00:00'
      : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const handleDayClick = () => {
    setSelectSlider('day')
    setValue([360, 1080])
  }

  const handleNightClick = () => {
    setSelectSlider('night')
    setValue([1080, 1440])
  }

  const handleAllDayClick = () => {
    setSelectSlider('all')
    setValue([360, 1440])
  }

  const footerTemplate = () => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px'}}>
      <Button
        label='Clear'
        onClick={() => {
          onConfirmDate.current = false
          formik.setFieldValue('date', '')
        }}
        className='p-button-secondary'
      />
      {/* <Button
        label='Today'
        onClick={() => formik.setFieldValue('date', formateDate)}
        className='p-button-primary'
      /> */}
      <Button
        label='OK'
        onClick={() => {
          calendarRef.current.hide()
          onConfirmDate.current = true
        }}
        className='p-button-success'
      />
    </div>
  )

  const isFormFieldInvalid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldInvalid(name) ? (
      <small className='p-error'>{formik.errors[name]}</small>
    ) : (
      <small className='p-error'>&nbsp;</small>
    )
  }
  useEffect(() => {
    const randomText = generateRandomText()
    formik.setFieldValue('title', randomText)
  }, [selectedRapport])

  return (
    <div className='bg-gray-200 w-15rem lg:w-20rem xl:w-25rem md:w-20rem ' style={style}>
      <div
        style={{backgroundColor: 'rgba(82, 63, 141, 0.7)'}}
        className='flex flex-row  align-items-center w-full h-3rem text-lg'
      >
        <div className='text-xl font-semibold text-white pl-2'>
          <OlangItem olang='dateStg' />
        </div>
        <i className='fas fa-duotone fa-calendar-days text-3xl text-white pl-3'></i>
      </div>
      <div>
        <div className='bg-white px-2 pt-3'>
          <div className='text-lg  pb-1'>
            <OlangItem olang='rptTitle' /> :
          </div>
          <InputText
            id='title'
            name='title'
            className={classNames({'p-invalid': isFormFieldInvalid('title'), 'w-full': true})}
            placeholder='Report Title'
            value={formik.values.title}
            onChange={formik.handleChange}
          />
          {getFormErrorMessage('title')}
        </div>
        <div className='bg-white px-2 py-3'>
          <div className='text-lg  pb-1'>
            <OlangItem olang='rptRange' /> :
          </div>
          <Calendar
            ref={calendarRef}
            className={classNames({'p-invalid': isFormFieldInvalid('date'), 'w-full': true})}
            inputId='cal_date'
            name='date'
            value={formik.values.date}
            onChange={(e) => {
              formik.setFieldValue('date', e.target.value)
            }}
            selectionMode='range'
            dateFormat='mm/dd/yy'
            readOnlyInput
            hideOnRangeSelection
            footerTemplate={footerTemplate}
            placeholder={formateDate}
          />
          {getFormErrorMessage('date')}
        </div>
        {/* <div className='bg-white px-2 py-3'>
          <div className='text-lg  pb-1'>
            <OlangItem olang='ctrTime' /> : {convertSliderValueToTime(value[0])} -{' '}
            {convertSliderValueToTime(value[1])}
          </div>
          <div className='p-2'>
            <Slider
              value={value}
              onChange={(e) => setValue(e.value)}
              range
              min={360}
              max={1440}
              step={15}
              className='w-full'
            />
          </div>
          <div className='flex flex-row align-items-center justify-content-center bg-white p-1'>
            <div
              className='flex flex-row align-items-center justify-content-between'
              style={{width: '45%'}}
            >
              <div
                style={{color: selectSlider === 'day' && 'blue'}}
                onClick={handleDayClick}
                className='cursor-pointer text-lg hover:text-blue-400'
              >
                <OlangItem olang='Day' />
              </div>
              <div
                onClick={handleNightClick}
                style={{color: selectSlider === 'night' && 'blue'}}
                className='cursor-pointer text-lg hover:text-blue-400'
              >
                <OlangItem olang='Night' />
              </div>
              <div
                style={{color: selectSlider === 'all' && 'blue'}}
                onClick={handleAllDayClick}
                className='cursor-pointer text-lg hover:text-blue-400'
              >
                <OlangItem olang='Always' />
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <div className='flex flex-row align-items-center justify-content-end bg-white p-2'>
        <div
          className='flex flex-row align-items-center justify-content-between'
          style={{width: '100%'}}
        >
          <Button
            severity='danger'
            onClick={() => {
              dispatch(setShowSettingRapport(false))
            }}
          >
            <OlangItem olang='cancel' />
          </Button>
          <Button
            severity='success'
            loading={loading}
            disabled={loading}
            onClick={formik.handleSubmit}
          >
            <OlangItem olang='build' />
          </Button>
        </div>
      </div>
    </div>
  )
}
export default DateSettings
