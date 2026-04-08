import React, {useEffect, useState} from 'react'
import {Dropdown} from 'primereact/dropdown'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchCompany, getCompany} from '../../Company/slice/company.slice'
import {useFormik} from 'formik'
import {createOrUpdateSetupInfo} from '../Slice/setupInfo.slice'
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

  const settingsItems = [
    {
      icon: 'pi pi-globe',
      label: <OlangItem olang='Setup.Language' />,
      color: '#3B82F6',
      field: 'language',
      options: Language,
      optionLabel: 'name',
      placeholder: company[0]?.language || 'Select language',
    },
    {
      icon: 'pi pi-clock',
      label: <OlangItem olang='Setup.timeZoneOffset' />,
      color: '#8B5CF6',
      field: 'timezone',
      options: timeZones,
      optionLabel: 'name',
      placeholder: company[0]?.timezone || 'Select timeZone',
    },
    {
      icon: 'pi pi-arrows-h',
      label: <OlangItem olang='Setup.distanceUnit' />,
      color: '#10B981',
      field: 'distanceunit',
      options: distanceUnits,
      optionLabel: 'name',
      placeholder: company[0]?.distanceunit || 'Select distance Unit',
    },
    {
      icon: 'pi pi-box',
      label: <OlangItem olang='Setup.VolumeUnit' />,
      color: '#F59E0B',
      field: 'volumeunit',
      options: volumeUnits,
      optionLabel: 'name',
      placeholder: company[0]?.volumeunit || 'Select a Volume Unit',
    },
    {
      icon: 'pi pi-sun',
      label: <OlangItem olang='Setup.temperatureUnit' />,
      color: '#EF4444',
      field: 'temperatureunit',
      options: temperatureUnits,
      optionLabel: 'name',
      placeholder: company[0]?.temperatureunit || 'Select a Temperature Unit',
    },
  ]

  return (
    <div className="lt-page" data-testid="settings-page">
      <div className="lt-page-header" data-testid="settings-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #64748B, #475569)'}}>
            <i className="pi pi-cog"></i>
          </div>
          <div>
            <h1 className="lt-page-title"><OlangItem olang='Setup.Info' /></h1>
            <p className="lt-page-subtitle">Configuration globale de la plateforme</p>
          </div>
        </div>
      </div>

      <div className="lt-settings-grid" data-testid="settings-grid">
        {settingsItems.map((item, idx) => (
          <div key={idx} className="lt-settings-card" data-testid={`settings-card-${item.field}`}>
            <div className="lt-settings-card-icon" style={{background: `${item.color}12`, color: item.color}}>
              <i className={item.icon}></i>
            </div>
            <div className="lt-settings-card-body">
              <label className="lt-settings-label">{item.label}</label>
              <Dropdown
                onChange={(e) => {
                  setDisabled(true)
                  formik.setFieldValue(item.field, e.value)
                }}
                name={item.field}
                options={item.options}
                value={formik.values[item.field]}
                optionLabel={item.optionLabel}
                placeholder={item.placeholder}
                className='lt-settings-dropdown'
                style={{width: '100%', borderRadius: 10}}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 24}}>
        <button
          className="lt-vcard-geo"
          onClick={formik.handleSubmit}
          disabled={!disabled}
          style={{
            width: 'auto',
            padding: '10px 32px',
            borderRadius: 10,
            opacity: disabled ? 1 : 0.5,
            cursor: disabled ? 'pointer' : 'not-allowed',
          }}
          data-testid="settings-save-btn"
        >
          <i className="pi pi-check"></i>
          <OlangItem olang='Enregistrer' />
        </button>
      </div>
    </div>
  )
}

export default SetupInfo
