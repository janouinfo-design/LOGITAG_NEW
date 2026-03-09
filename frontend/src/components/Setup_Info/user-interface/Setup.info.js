import React, {useEffect, useState} from 'react'
import {Divider} from 'primereact/divider'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {createOrUpdateCompany, fetchCompany, getCompany} from '../../Company/slice/company.slice'
import {useFormik} from 'formik'
import {createOrUpdateSetupInfo, setSelectedCompany} from '../Slice/setupInfo.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const SetupInfo = () => {
  const [disabled, setDisabled] = useState(false)

  const dispatch = useAppDispatch()

  let company = useAppSelector(getCompany)

  const formik = useFormik({
    initialValues: {
      ...company[0],
    },
    onSubmit: (values) => {
      dispatch(createOrUpdateSetupInfo({values: values, company: company[0]})).then((res) => {
        // if (res.payload) {
        //   dispatch(fetchCompany())
        // }
      })
    },
  })

  const Language = [
    {name: 'English', code: 'EG'},
    {name: 'French', code: 'FR'},
    {name: 'Arabic', code: 'AR'},
  ]
  const timeZones = [
    {name: 'Pacific Standard Time', offset: '-08:00'},
    {name: 'Mountain Standard Time', offset: '-07:00'},
    {name: 'Central Standard Time', offset: '-06:00'},
    {name: 'Eastern Standard Time', offset: '-05:00'},
    {name: 'Atlantic Standard Time', offset: '-04:00'},
    {name: 'Greenwich Mean Time', offset: '+00:00'},
    {name: 'Central European Time', offset: '+01:00'},
    {name: 'Eastern European Time', offset: '+02:00'},
    {name: 'Indian Standard Time', offset: '+05:30'},
    {name: 'China Standard Time', offset: '+08:00'},
  ]
  const distanceUnits = [
    {name: 'Kilometer', abbreviation: 'km'},
    {name: 'Meter', abbreviation: 'm'},
    {name: 'Mile', abbreviation: 'mi'},
    {name: 'Yard', abbreviation: 'yd'},
    {name: 'Foot', abbreviation: 'ft'},
    {name: 'Inch', abbreviation: 'in'},
    {name: 'Nautical Mile', abbreviation: 'nm'},
  ]
  const volumeUnits = [
    {name: 'Liter', abbreviation: 'L'},
    {name: 'Milliliter', abbreviation: 'mL'},
    {name: 'Cubic Meter', abbreviation: 'm³'},
    {name: 'Cubic Centimeter', abbreviation: 'cm³'},
    {name: 'Gallon', abbreviation: 'gal'},
    {name: 'Quart', abbreviation: 'qt'},
    {name: 'Pint', abbreviation: 'pt'},
    {name: 'Fluid Ounce', abbreviation: 'fl oz'},
  ]
  const temperatureUnits = [
    {name: 'Celsius', abbreviation: '°C'},
    {name: 'Fahrenheit', abbreviation: '°F'},
    {name: 'Kelvin', abbreviation: 'K'},
  ]

  useEffect(() => {
    dispatch(fetchCompany())
  }, [])

  return (
    <div>
      <header className=' p-3'>
        <p className='ml-4 font-bold'>
          <OlangItem olang='Setup.Info' />
        </p>
        <Divider />
      </header>
      <section className='p-14'>
        <div className='mr-5 mt-5 flex justify-content-between align-items-center'>
          <span style={{userSelect: 'none'}}>
            <OlangItem olang='Setup.Language' />
          </span>
          <Dropdown
            onChange={(e) => {
              setDisabled(true)
              formik.setFieldValue('language', e.value)
            }}
            name='Language'
            options={Language}
            value={formik.values.language}
            optionLabel='name'
            placeholder={`${company[0]?.language || 'Select language'}`}
            className='w-6 ml-8'
          />
        </div>
        <div className='mr-5 mt-5 flex justify-content-between align-items-center'>
          <span style={{userSelect: 'none'}}>
            <OlangItem olang='Setup.timeZoneOffset' />
          </span>
          <Dropdown
            onChange={(e) => {
              setDisabled(true)
              formik.setFieldValue('timezone', e.value)
            }}
            name='timeZone'
            options={timeZones}
            value={formik.values.timezone}
            optionLabel='name'
            placeholder={`${company[0]?.timezone || 'Select timeZone'}`}
            className='w-6 ml-8'
          />
        </div>
        <div className='mr-5 mt-5 flex justify-content-between align-items-center'>
          <span style={{userSelect: 'none'}}>
            <OlangItem olang='Setup.distanceUnit' />
          </span>
          <Dropdown
            onChange={(e) => {
              setDisabled(true)
              formik.setFieldValue('distanceunit', e.value)
            }}
            name='distanceUnit'
            options={distanceUnits}
            value={formik.values.distanceunit}
            optionLabel='name'
            placeholder={`${company[0]?.distanceunit || 'Select distance Unit'}`}
            className='w-6 ml-8'
          />
        </div>
        <div className='mr-5 mt-5 flex justify-content-between align-items-center'>
          <span style={{userSelect: 'none'}}>
            <OlangItem olang='Setup.VolumeUnit' />
          </span>
          <Dropdown
            value={formik.values.volumeunit}
            onChange={(e) => {
              setDisabled(true)
              formik.setFieldValue('volumeunit', e.value)
            }}
            options={volumeUnits}
            optionLabel='name'
            placeholder={`${company[0]?.volumeunit || 'Select a Volume Unit'}`}
            className='w-6'
          />
        </div>
        <div className='mr-5 mt-5 flex justify-content-between align-items-center'>
          <span style={{userSelect: 'none'}}>
            <OlangItem olang='Setup.temperatureUnit' />
          </span>
          <Dropdown
            value={formik.values.temperatureunit}
            onChange={(e) => {
              setDisabled(true)
              formik.setFieldValue('temperatureunit', e.value)
            }}
            options={temperatureUnits}
            optionLabel='name'
            placeholder={`${company[0]?.temperatureunit || 'Select a Temperature Unit'}`}
            className='w-6'
          />
        </div>
        <div className='flex justify-content-end mt-6 mr-4'>
          <ButtonComponent
            onClick={formik.handleSubmit}
            className={'w-11rem flex align-items-center justify-content-center'}
            disabled={!disabled}
          >
            <OlangItem olang='Enregistrer' />
          </ButtonComponent>
        </div>
      </section>
    </div>
  )
}

export default SetupInfo
