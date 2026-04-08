import React, {useEffect, useRef, useState} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'
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
  const calendarRef = useRef(null)
  const onConfirmDate = useRef(false)
  const dispatch = useAppDispatch()
  const dateNow = Date.now()
  const formateDate = moment(dateNow).format('YYYY-MM-DD')
  const loading = useAppSelector(getLoadingRapport)
  const selectedRapport = useAppSelector(getSelectedRapport)

  const generateRandomText = () => {
    const num = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    return `${selectedRapport?.decs === 'engin' ? 'Engin_Rapport' : 'Site_Rapport'}_${num}`
  }

  const formik = useFormik({
    initialValues: { title: '', date: '' },
    validate: (data) => {
      let errors = {}
      if (!data.title) errors.title = 'Titre requis'
      if (!data.date) errors.date = 'Plage de dates requise'
      return errors
    },
    onSubmit: (data) => {
      dispatch(saveRapport(data))
      formik.resetForm()
    },
  })

  const isInvalid = (name) => !!(formik.touched[name] && formik.errors[name])

  useEffect(() => {
    formik.setFieldValue('title', generateRandomText())
  }, [selectedRapport])

  return (
    <div className='lt-rpt-config-panel' data-testid="rapport-config-panel">
      <div className='lt-rpt-config-header'>
        <i className='pi pi-cog' style={{fontSize: '0.9rem'}}></i>
        <span>Configuration</span>
      </div>

      <div className='lt-rpt-config-body'>
        {/* Title */}
        <div className='lt-rpt-config-field'>
          <label className='lt-rpt-config-label'>Titre du rapport</label>
          <input
            type='text'
            id='title'
            name='title'
            className={`lt-rpt-config-input ${isInvalid('title') ? 'lt-rpt-config-input--error' : ''}`}
            placeholder='Titre...'
            value={formik.values.title}
            onChange={formik.handleChange}
            data-testid="rapport-title-input"
          />
          {isInvalid('title') && <small className='lt-rpt-config-error'>{formik.errors.title}</small>}
        </div>

        {/* Date Range */}
        <div className='lt-rpt-config-field'>
          <label className='lt-rpt-config-label'>Plage de dates</label>
          <Calendar
            ref={calendarRef}
            className={classNames({'p-invalid': isInvalid('date'), 'w-full': true})}
            inputId='cal_date'
            name='date'
            value={formik.values.date}
            onChange={(e) => formik.setFieldValue('date', e.target.value)}
            selectionMode='range'
            dateFormat='dd/mm/yy'
            readOnlyInput
            hideOnRangeSelection
            placeholder={formateDate}
            style={{borderRadius: 10}}
          />
          {isInvalid('date') && <small className='lt-rpt-config-error'>{formik.errors.date}</small>}
        </div>

        {/* Info Card */}
        <div className='lt-rpt-info-card' data-testid="rapport-info-card">
          <i className='pi pi-info-circle' style={{color: '#3B82F6', fontSize: '1rem'}}></i>
          <div>
            <div style={{fontWeight: 700, fontSize: '0.78rem', color: 'var(--lt-text-primary)', marginBottom: 2}}>
              {selectedRapport?.decs === 'engin' ? 'Rapport par Engin' : 'Rapport par Site'}
            </div>
            <div style={{fontSize: '0.72rem', color: 'var(--lt-text-muted)', lineHeight: 1.4}}>
              {selectedRapport?.decs === 'engin'
                ? 'Affiche le temps de présence de chaque engin sur les sites/adresses avec un résumé total.'
                : 'Affiche le temps de présence de chaque engin dans le site sélectionné avec un résumé total.'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='lt-rpt-config-actions'>
        <button
          className='lt-rpt-config-cancel'
          onClick={() => dispatch(setShowSettingRapport(false))}
          data-testid="rapport-cancel-btn"
        >
          Annuler
        </button>
        <button
          className='lt-vcard-geo'
          style={{width: 'auto', padding: '10px 24px', borderRadius: 10, opacity: loading ? 0.6 : 1}}
          onClick={formik.handleSubmit}
          disabled={loading}
          data-testid="rapport-build-btn"
        >
          {loading ? <i className='pi pi-spin pi-spinner' style={{marginRight: 6}}></i> : <i className='pi pi-play' style={{fontSize: '0.75rem'}}></i>}
          Construire le rapport
        </button>
      </div>
    </div>
  )
}

export default DateSettings
