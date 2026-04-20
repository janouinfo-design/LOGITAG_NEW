import React, {useEffect, useState, memo} from 'react'
import {InputText} from 'primereact/inputtext'
import {InputSwitch} from 'primereact/inputswitch'
import {useFormik} from 'formik'
import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateSite,
  getSelectedSite,
  setEditSite,
  setSelectedSite,
} from '../../slice/site.slice'
import {createOrUpdateAddress} from '../../slice/addressSite.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {MapSearchComponent} from '../../../shared/MapSearch/user-interface/MapSearchComponent/MapSearchComponent'
import {fetchSitesClient, getSelectedCustomer} from '../../../../store/slices/customer.slice'

/**
 * SiteFullEditor — unified single-page "Ajouter un site"
 * Combines: Site info (Label, Nom, Code, Référence, Description, Actif)
 *         + Address (Route, N°, Code postal, Ville, Pays)
 *         + Contact (Téléphone, Fax, Email)
 *         + Map sticky right
 */
const SiteFullEditor = ({onBack}) => {
  const dispatch = useAppDispatch()
  const selectedSite = useAppSelector(getSelectedSite)
  const selectedCustomer = useAppSelector(getSelectedCustomer)
  const [addressMap, setAddressMap] = useState('')
  const [savingStatus, setSavingStatus] = useState(null) // null | 'saving' | 'success' | 'error'

  const customerID = selectedSite?.customerID || selectedCustomer?.id

  const formik = useFormik({
    initialValues: {
      // Site fields
      id: selectedSite?.id || 0,
      customerID: customerID,
      label: selectedSite?.label || '',
      name: selectedSite?.name || '',
      code: selectedSite?.code || '',
      reference: selectedSite?.reference || '',
      description: selectedSite?.description || '',
      active: selectedSite?.active == null ? 1 : selectedSite?.active,
      // Address fields
      Address: '',
      route: '',
      addressNumber: '',
      zipCode: '',
      town: '',
      Country: '',
      Phone: '',
      Fax: '',
      Email: '',
      lat: '',
      lng: '',
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors = {}
      if (!values.label || !values.label.trim()) errors.label = 'Requis'
      if (!values.name || !values.name.trim()) errors.name = 'Requis'
      return errors
    },
    onSubmit: async (values) => {
      setSavingStatus('saving')
      try {
        const sitePayload = {
          id: values.id,
          customerID: values.customerID,
          label: values.label,
          name: values.name,
          code: values.code,
          reference: values.reference,
          description: values.description,
          active: values.active ? 1 : 0,
        }
        const siteRes = await dispatch(createOrUpdateSite(sitePayload))
        const newSite = siteRes?.payload
        const siteId = newSite?.id || values.id

        // If address was filled, save it
        const hasAddress = values.Address || values.route || values.town || values.Email || values.Phone
        if (hasAddress && siteId) {
          const addressPayload = {
            id: 0,
            worksiteID: siteId,
            type: 'Adresse de site',
            Address: values.Address,
            route: values.route,
            addressNumber: values.addressNumber,
            zipCode: values.zipCode,
            town: values.town,
            Country: values.Country,
            Phone: values.Phone,
            Fax: values.Fax,
            Email: values.Email,
            lat: values.lat,
            lng: values.lng,
            active: 1,
            isDefault: 1,
          }
          await dispatch(createOrUpdateAddress(addressPayload))
        }

        setSavingStatus('success')
        if (customerID) dispatch(fetchSitesClient(customerID))
        setTimeout(() => {
          dispatch(setSelectedSite(null))
          dispatch(setEditSite(false))
          if (onBack) onBack()
        }, 600)
      } catch (e) {
        setSavingStatus('error')
      }
    },
  })

  useEffect(() => {
    let obj = {}
    addressMap?.address_components?.forEach((component) => {
      const {types, long_name} = component
      types.forEach((type) => { obj[type] = long_name })
    })
    if (addressMap?.formatted_address) formik.setFieldValue('Address', addressMap.formatted_address)
    if (obj?.locality) formik.setFieldValue('town', obj.locality)
    if (obj?.route) formik.setFieldValue('route', obj.route)
    if (obj?.postal_code) formik.setFieldValue('zipCode', obj.postal_code)
    if (obj?.country) formik.setFieldValue('Country', obj.country)
    const lat = addressMap?.geometry?.location?.lat?.()?.toString()?.replace('.', ',')
    const lng = addressMap?.geometry?.location?.lng?.()?.toString()?.replace('.', ',')
    if (lat) formik.setFieldValue('lat', lat)
    if (lng) formik.setFieldValue('lng', lng)
  }, [addressMap])

  const handleBack = () => {
    dispatch(setSelectedSite(null))
    dispatch(setEditSite(false))
    if (onBack) onBack()
  }

  const labelError = formik.errors.label && formik.touched.label
  const nameError = formik.errors.name && formik.touched.name

  return (
    <div className='lt-page' data-testid='site-full-editor'>
      {/* ── Premium Header ── */}
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <button className='lt-back-btn' onClick={handleBack} data-testid='site-editor-back'>
            <i className='pi pi-arrow-left'></i>
            <span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span>
          </button>
          <div className='lt-detail-avatar'>
            <div className='lt-detail-avatar-ph' style={{background: '#DCFCE7', color: '#16A34A'}}>
              <i className='pi pi-building'></i>
            </div>
          </div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>{selectedSite?.id ? 'Modifier le site' : 'Nouveau site'}</h2>
            <div className='lt-detail-meta'>
              {selectedCustomer?.label && (
                <span className='lt-badge lt-badge-info'>
                  <i className='pi pi-briefcase' style={{fontSize: '0.55rem'}}></i>
                  Client : {selectedCustomer?.code || selectedCustomer?.label}
                </span>
              )}
              {formik.values.town && (
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
            type='button'
            data-testid='site-editor-save'
            onClick={formik.handleSubmit}
            disabled={savingStatus === 'saving'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: savingStatus === 'success' ? '#16A34A' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFF', cursor: savingStatus === 'saving' ? 'wait' : 'pointer',
              fontWeight: 700, fontSize: '0.82rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', transition: 'all 0.18s',
              opacity: savingStatus === 'saving' ? 0.7 : 1,
            }}
          >
            <i className={savingStatus === 'success' ? 'pi pi-check' : (savingStatus === 'saving' ? 'pi pi-spin pi-spinner' : 'pi pi-check')} style={{fontSize: '0.78rem'}}></i>
            {savingStatus === 'saving' ? 'Enregistrement…' : (savingStatus === 'success' ? 'Enregistré !' : 'Enregistrer')}
          </button>
        </div>
      </div>

      {/* ── 2-Column Layout ── */}
      <div style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: 24, alignItems: 'start'}}>
        {/* LEFT: Form */}
        <div className='lt-detail-form'>
          {/* Section 1: Informations */}
          <div className='lt-form-section'>
            <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Informations</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Label <span className='lt-required'>*</span></label>
                <InputText
                  name='label'
                  data-testid='site-full-label'
                  placeholder='Nom du site'
                  value={formik.values.label}
                  onChange={formik.handleChange}
                  className={`lt-form-input ${labelError ? 'p-invalid' : ''}`}
                />
                {labelError && <small className='p-error'>{formik.errors.label}</small>}
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Nom <span className='lt-required'>*</span></label>
                <InputText
                  name='name'
                  data-testid='site-full-name'
                  placeholder='Identifiant'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  className={`lt-form-input ${nameError ? 'p-invalid' : ''}`}
                />
                {nameError && <small className='p-error'>{formik.errors.name}</small>}
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Code</label>
                <InputText name='code' data-testid='site-full-code' placeholder='Code du site' value={formik.values.code} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Référence</label>
                <InputText name='reference' data-testid='site-full-reference' placeholder='Référence interne' value={formik.values.reference} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'>Description</label>
                <InputText name='description' data-testid='site-full-description' placeholder='Description optionnelle' value={formik.values.description} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field lt-form-field--full' style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0'}}>
                <label className='lt-form-label' style={{margin: 0, flex: 1}}>Site actif</label>
                <InputSwitch
                  name='active'
                  data-testid='site-full-active'
                  checked={!!formik.values.active}
                  onChange={(e) => formik.setFieldValue('active', e.value ? 1 : 0)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Adresse */}
          <div className='lt-form-section' style={{marginTop: 16}}>
            <h4 className='lt-form-section-title'><i className='pi pi-map-marker'></i>Adresse</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'>Adresse</label>
                <InputText name='Address' data-testid='site-full-address' placeholder='Adresse du site' value={formik.values.Address} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Route</label>
                <InputText name='route' data-testid='site-full-route' placeholder='Route' value={formik.values.route} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>N°</label>
                <InputText name='addressNumber' data-testid='site-full-number' placeholder='N°' value={formik.values.addressNumber} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Code postal</label>
                <InputText name='zipCode' data-testid='site-full-zip' placeholder='Code postal' value={formik.values.zipCode} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Ville</label>
                <InputText name='town' data-testid='site-full-town' placeholder='Ville' value={formik.values.town} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'>Pays</label>
                <InputText name='Country' data-testid='site-full-country' placeholder='Pays' value={formik.values.Country} onChange={formik.handleChange} className='lt-form-input' />
              </div>
            </div>
          </div>

          {/* Section 3: Contact */}
          <div className='lt-form-section' style={{marginTop: 16}}>
            <h4 className='lt-form-section-title'><i className='pi pi-phone'></i>Contact</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Téléphone</label>
                <InputText name='Phone' data-testid='site-full-phone' placeholder='Téléphone' value={formik.values.Phone} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'>Fax</label>
                <InputText name='Fax' data-testid='site-full-fax' placeholder='Fax' value={formik.values.Fax} onChange={formik.handleChange} className='lt-form-input' />
              </div>
              <div className='lt-form-field lt-form-field--full'>
                <label className='lt-form-label'>Email</label>
                <InputText name='Email' data-testid='site-full-email' placeholder='Email' value={formik.values.Email} onChange={formik.handleChange} className='lt-form-input' />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky Map */}
        <div className='lt-detail-side' style={{position: 'sticky', top: 16}}>
          <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
            <div style={{padding: '12px 16px', fontFamily: "'Manrope', sans-serif", fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8}}>
              <i className='pi pi-map' style={{color: '#3B82F6'}}></i>Localisation
            </div>
            <div style={{padding: 0, height: 480}}>
              <MapSearchComponent
                style={{height: '480px'}}
                onAddress={(e) => setAddressMap(e)}
                selectedAddress={{lat: 46.5197, lng: 6.6323}}
                onSetSelectedAddress={() => {}}
              />
            </div>
            {(formik.values.lat || formik.values.lng) && (
              <div style={{padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B'}}>
                <span><strong style={{color: '#0F172A'}}>Lat :</strong> {formik.values.lat || '—'}</span>
                <span><strong style={{color: '#0F172A'}}>Lng :</strong> {formik.values.lng || '—'}</span>
              </div>
            )}
          </div>
          <div style={{marginTop: 12, padding: '12px 14px', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 10, fontSize: '0.75rem', color: '#1E40AF', display: 'flex', alignItems: 'flex-start', gap: 10}}>
            <i className='pi pi-info-circle' style={{color: '#3B82F6', marginTop: 2}}></i>
            <span>Recherchez une adresse sur la carte pour remplir automatiquement Route, Ville, Code postal et coordonnées GPS.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(SiteFullEditor)
