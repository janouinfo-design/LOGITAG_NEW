import React, {useEffect, useState, memo} from 'react'
import {InputText} from 'primereact/inputtext'
import {useFormik} from 'formik'
import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateAddress,
  fetchCompanyAddresses,
  getCompanyAddresses,
  getSelectedAddress,
  setEditAddress,
  setSelectedAddress,
} from '../../slice/company.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {setAddressDetail} from '../../../../store/slices/customer.slice'
import {MapSearchComponent} from '../../../shared/MapSearch/user-interface/MapSearchComponent/MapSearchComponent'

const AddressDetail = ({client, handleSaveAddress}) => {
  const [addressMap, setAddressMap] = useState('')
  const selectedAddress = useAppSelector(getSelectedAddress)
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: _.cloneDeep(selectedAddress) || {},
    enableReinitialize: true,
    onSubmit: (values) => handleSaveAddress && handleSaveAddress(values),
  })

  const onSetSelectedAddress = (addr) => dispatch(setSelectedAddress(addr))

  useEffect(() => {
    let obj = {}
    addressMap?.address_components?.forEach((component) => {
      const {types, long_name} = component
      types.forEach((type) => { obj[type] = long_name })
    })
    formik.setFieldValue('Address', addressMap?.formatted_address || selectedAddress?.Address)
    formik.setFieldValue('town', obj?.locality || selectedAddress?.town)
    formik.setFieldValue('route', obj?.route || selectedAddress?.route)
    formik.setFieldValue('zipCode', obj?.postal_code || selectedAddress?.zipCode)
    formik.setFieldValue('Country', obj?.country || selectedAddress?.Country)
    formik.setFieldValue('lat', addressMap?.geometry?.location?.lat().toString()?.replace('.', ',') || selectedAddress?.lat)
    formik.setFieldValue('lng', addressMap?.geometry?.location?.lng().toString()?.replace('.', ',') || selectedAddress?.lng)
  }, [addressMap])

  const handleBack = () => {
    if (client) dispatch(setAddressDetail(false))
    else dispatch(setEditAddress(false))
  }

  useEffect(() => {
    if (selectedAddress == null) dispatch(setEditAddress(false))
  }, [selectedAddress])

  const isEdit = !!selectedAddress?.id && selectedAddress.id !== 0
  const addrType = selectedAddress?.type || 'Nouvelle adresse'

  return (
    <div className='lt-page' data-testid='address-detail-page'>
      {/* ── Premium Header ── */}
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <button className='lt-back-btn' onClick={handleBack} data-testid='address-back-btn'>
            <i className='pi pi-arrow-left'></i>
            <span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span>
          </button>
          <div className='lt-detail-avatar'>
            <div className='lt-detail-avatar-ph' style={{background: '#EEF2FF', color: '#6366F1'}}>
              <i className='pi pi-map-marker'></i>
            </div>
          </div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>{isEdit ? `Adresse de ${String(addrType).toLowerCase()}` : 'Nouvelle adresse'}</h2>
            <div className='lt-detail-meta'>
              <span className='lt-badge lt-badge-info'>
                <i className='pi pi-tag' style={{fontSize: '0.55rem'}}></i>
                {addrType}
              </span>
              {formik.values?.town && (
                <span className='lt-badge lt-badge-neutral'>
                  <i className='pi pi-map' style={{fontSize: '0.55rem'}}></i>
                  {formik.values.town}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='lt-detail-actions-group'>
          <button
            data-testid='address-save-btn'
            onClick={formik.handleSubmit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.4)'}}
            onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'}}
          >
            <i className='pi pi-check' style={{fontSize: '0.78rem'}}></i>
            <OlangItem olang='Save' />
          </button>
        </div>
      </div>

      {/* ── 2-Column Layout ── */}
      <div style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: 24, alignItems: 'start'}}>
        {/* LEFT: Form */}
        <div className='lt-detail-form'>
          <div className='lt-form-section'>
            <h4 className='lt-form-section-title'><i className='pi pi-map-marker'></i>Adresse</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'><OlangItem olang='Address.Name' /></label>
                <InputText value={selectedAddress?.type || ''} readOnly className='lt-form-input' style={{background: '#F8FAFC'}} />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Address.Route' /></label>
                <InputText name='route' className='lt-form-input' placeholder='Route' value={formik.values?.route || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Address.number' /></label>
                <InputText name='addressNumber' className='lt-form-input' placeholder='N°' value={formik.values?.addressNumber || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Address.Postalcode' /></label>
                <InputText name='zipCode' className='lt-form-input' placeholder='Code postal' value={formik.values?.zipCode || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Address.Town' /></label>
                <InputText name='town' className='lt-form-input' placeholder='Ville' value={formik.values?.town || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'><OlangItem olang='Address.Country' /></label>
                <InputText name='Country' className='lt-form-input' placeholder='Pays' value={formik.values?.Country || ''} onChange={formik.handleChange} />
              </div>
            </div>
          </div>

          <div className='lt-form-section' style={{marginTop: 16}}>
            <h4 className='lt-form-section-title'><i className='pi pi-phone'></i>Contact</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Phone.celltitle' /></label>
                <InputText name='Phone' className='lt-form-input' placeholder='Téléphone' value={formik.values?.Phone || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='Address.Fax' /></label>
                <InputText name='Fax' className='lt-form-input' placeholder='Fax' value={formik.values?.Fax || ''} onChange={formik.handleChange} />
              </div>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'><OlangItem olang='Address.Email' /></label>
                <InputText name='Email' className='lt-form-input' placeholder='Email' value={formik.values?.Email || ''} onChange={formik.handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Map Card */}
        <div className='lt-detail-side' style={{position: 'sticky', top: 16}}>
          <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
            <div style={{padding: '12px 16px', fontFamily: "'Manrope', sans-serif", fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8}}>
              <i className='pi pi-map' style={{color: '#6366F1'}}></i>Localisation
            </div>
            <div style={{padding: 0, height: 480}}>
              <MapSearchComponent
                style={{height: '480px'}}
                onAddress={(e) => setAddressMap(e)}
                selectedAddress={selectedAddress}
                onSetSelectedAddress={(e) => onSetSelectedAddress(e)}
              />
            </div>
            {formik.values?.lat && formik.values?.lng && (
              <div style={{padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B'}}>
                <span><strong style={{color: '#0F172A'}}>Lat :</strong> {formik.values.lat}</span>
                <span><strong style={{color: '#0F172A'}}>Lng :</strong> {formik.values.lng}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(AddressDetail)
