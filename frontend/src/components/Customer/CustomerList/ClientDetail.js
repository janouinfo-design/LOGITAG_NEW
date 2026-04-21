import React, {useEffect, useState, memo} from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {FileUploadeComponent} from '../../shared/FileUploaderComponent/FileUploadeComponent'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import SiteEditor from '../../Site/user-interface/SiteEditor/SiteEditor'
import {Dropdown} from 'primereact/dropdown'
import TagList from '../../Tag/user-interface/TagList/TagList'
import SiteList from '../../Site/user-interface/SiteList/SiteList'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateCustomer,
  fetchCustomerAddress,
  fetchCustomerTags,
  fetchCustomers,
  fetchSitesClient,
  getAddressDetail,
  getCustomerAddress,
  getCustomerTags,
  getEditCustomer,
  getSelectedCustomer,
  getSelectedSiteClient,
  getSelectedTagClient,
  getTag,
  removeClientTag,
  setAddressDetail,
  setDetailShow,
  setDetailSiteClient,
  setEditTagClient,
  setSelectedCustomer,
  setSelectedSiteClient,
  setSelectedTagClient,
  setTag,
} from '../../../store/slices/customer.slice'
import _ from 'lodash'
import TagEditor from '../../Tag/user-interface/TagEditor/TagEditor'
import {Image} from 'primereact/image'
import {useLocation, useNavigate} from 'react-router-dom'
import {Button} from 'primereact/button'
import SiteDetail from '../../Site/user-interface/SiteDetail/SiteDetail'
import {
  createOrUpdateSite,
  fetchSites,
  getDetailSite,
  getShowMapSite,
  getSites,
  setDetailSite,
  setEditSite,
  setGeoSite,
  setGeoSiteSelectedSite,
  setSelectedSite,
  setShowMapSite,
} from '../../Site/slice/site.slice'
import SiteComponent from '../../Site/user-interface/SiteComponent'
import CompanyComponent from '../../Company/user-interface/Company.component'
import {
  createOrUpdateAddress,
  getCompanyAddresses,
  getEditAddress,
  setSelectedAddress,
} from '../../Company/slice/company.slice'
import AddressDetail from '../../Company/user-interface/AddressDetail/AddressDetail'
import AddressesComponent from '../../shared/AddressesComponent/Addresses.Component'
import SiteClientComponent from './SiteClientComponent'
import EditeTagClient from '../CustomerEditor/EditeTagClient'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {createOrUpdateTag, fetchStatus, fetchTags, setSelectedTag} from '../../Tag/slice/tag.slice'
import {setGeofencesSelectedSite} from '../../shared/MapComponent/slice/geofencing.slice'
import {fetchValidator, getValidator} from '../../Inventory/slice/inventory.slice'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {useSelector} from 'react-redux'
import PrimaryActionButton from '../../shared/PrimaryActionButton/PrimaryActionButton'

const ClientDetail = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [imageChange, setImageChange] = useState(false)
  const [imageId, setImageId] = useState()
  const [siteOptions, setSiteOptions] = useState([])
  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const validators = useSelector(getValidator)
  const dispatch = useAppDispatch()
  const selectedCustomer = useAppSelector(getSelectedCustomer)
  const sites = useAppSelector(getSites)
  const tags = useAppSelector(getCustomerTags)
  const editCustomer = useAppSelector(getEditCustomer)
  const showDetail = useAppSelector(getDetailSite)
  const sitesClient = useAppSelector(getSelectedSiteClient)
  const [activeTabIdx, setActiveTabIdx] = useState(0)

  const location = useLocation()

  let editAddress = useAppSelector(getAddressDetail)
  let customerAddress = useAppSelector(getCustomerAddress)
  let tagEdit = useAppSelector(getTag)
  let selectedTagClient = useAppSelector(getSelectedTagClient)
  let showMap = useAppSelector(getShowMapSite)

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedCustomer)
    old = {...old, imageid: imageId, [e.target.name]: e.target.value}
    dispatch(setSelectedCustomer(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  const onFinishedUpload = async (e) => {
    setIsValid(true)
    const imageid = await e.data[0].id
    setImageId(imageid)
    setIsValid(true)
  }

  const onSave = async (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedCustomer?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)

    //   return
    // }
    dispatch(createOrUpdateCustomer(imageId)).then((res) => {
      if (res.payload) {
        dispatch(fetchCustomers())
        dispatch(setDetailShow(true))
      }
    })
  }
  const saveTag = (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedCustomer?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
    dispatch(createOrUpdateTag(e)).then((res) => {
      if (res.payload) {
        dispatch(fetchCustomerTags(selectedCustomer.id))
        dispatch(setTag(false))
        dispatch(setSelectedTag(null))
      }
    })
  }

  useEffect(() => {
    if (selectedCustomer == null) {
      dispatch(setDetailShow(true))
    }
  }, [selectedCustomer])

  const onHide = () => {
    dispatch(setDetailShow(true))
  }

  useEffect(() => {
    setSiteOptions([
      {label: 'All', value: 0},
      ...sites?.map((st) => ({
        label: st.name,
        value: st.id,
      })),
    ])
  }, [sites])

  useEffect(() => {
    dispatch(fetchCustomerAddress())
  }, [selectedCustomer])

  useEffect(() => {
    dispatch(fetchSites())
    dispatch(fetchTags())
    dispatch(fetchStatus())
    dispatch(fetchCustomerTags(selectedCustomer?.id))
    dispatch(fetchSitesClient())
  }, [])

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={onSave} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>{selectedCustomer?.label}</span>
    </>
  )
  const addSiteClient = () => {
    dispatch(fetchValidator('worksite'))
    dispatch(setEditSite(true))
    dispatch(setSelectedSite(null))
  }
  const onSaveSite = () => {
    dispatch(createOrUpdateSite(selectedCustomer.id)).then((res) => {
      if (res.payload) {
        dispatch(setEditSite(false))
        dispatch(setDetailSiteClient(true))
      }
    })
  }

  const saveAddress = (e) => {
    dispatch(setSelectedAddress(e))
    dispatch(createOrUpdateAddress(e)).then((res) => {
      if (res.payload) {
        dispatch(setAddressDetail(false))
        dispatch(fetchCustomerAddress())
        dispatch(setSelectedAddress(null))
      }
    })
  }

  const addresseeTemplate = (rowData) => {
    return (
      <>
        <Chip
          label={rowData.dateCreation}
          className='w-11rem m-1 flex justify-content-center align-items-center'
        />
      </>
    )
  }
  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )

  const onHideTag = () => {
    dispatch(setSelectedTag(null))
    dispatch(setTag(false))
  }

  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID Tag',
    },
    {
      header: 'Creation Date',
      field: null,
      olang: 'Creation.Date',
      body: addresseeTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  const onHideDetail = () => {
    dispatch(setDetailShow(true))
    dispatch(setDetailSiteClient(false))
    dispatch(setSelectedSiteClient(null))
    dispatch(setGeoSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setSelectedSite(null))
    dispatch(setGeofencesSelectedSite(null))
  }
  const _codeValidator = validators.find((validator) => validator.id === 'code')
  const _labelValidator = validators.find((validator) => validator.id === 'label')
  return (
    <>
      <TagEditor visible={tagEdit} selectedTag={selectedTagClient} onHide={onHideTag} client={true} onSubmitHandler={(e) => saveTag(e)} />
      <EditeTagClient />

      <div className='lt-page' data-testid="client-detail-page">
        {/* ── Premium Header ── */}
        <div className='lt-detail-header' data-testid="client-detail-header">
          <div className='lt-detail-header-left'>
            <button className='lt-back-btn' onClick={onHideDetail}>
              <i className='pi pi-arrow-left'></i>
              <span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span>
            </button>
            <div className='lt-detail-avatar'>
              {selectedCustomer?.image ? (
                <Image src={`${API_BASE_URL_IMAGE}${selectedCustomer.image}`} alt='' width="52" height="52" preview imageStyle={{objectFit: 'cover', width: 52, height: 52, borderRadius: 12}} />
              ) : (
                <div className='lt-detail-avatar-ph' style={{background: '#EFF6FF', color: '#3B82F6'}}><i className='pi pi-building'></i></div>
              )}
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{selectedCustomer?.label || '-'}</h2>
              <div className='lt-detail-meta'>
                <span className={`lt-badge ${selectedCustomer?.active != 0 ? 'lt-badge-success' : 'lt-badge-neutral'}`}>
                  <span className={`lt-badge-dot ${selectedCustomer?.active != 0 ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                  {selectedCustomer?.active != 0 ? 'Actif' : 'Inactif'}
                </span>
                {selectedCustomer?.code && <span className='lt-badge lt-badge-info' style={{background:'#DBEAFE', color:'#1D4ED8'}}><i className='pi pi-hashtag' style={{fontSize: '0.5rem'}}></i>{selectedCustomer.code}</span>}
                {Array.isArray(customerAddress) && <span className='lt-badge lt-badge-neutral'><i className='pi pi-map-marker' style={{fontSize: '0.55rem'}}></i>{customerAddress.length} adresse{customerAddress.length > 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>
          <div className='lt-detail-header-right'>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Engins</div>
              <div className='lt-detail-stat-val'>{selectedCustomer?.enginNumber || 0}</div>
            </div>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Tags</div>
              <div className='lt-detail-stat-val'>{tags?.length || 0}</div>
            </div>
            <div className='lt-detail-actions-group'>
              <PrimaryActionButton type="more" onClick={addSiteClient} />
              <PrimaryActionButton type="edit" onClick={onSave} />
            </div>
          </div>
        </div>

        {/* ── 3-Step Stepper ── */}
        {(() => {
          const hasInfo = !!(selectedCustomer?.label || selectedCustomer?.code)
          const hasAddress = Array.isArray(customerAddress) && customerAddress.length > 0
          const hasSites = Array.isArray(sitesClient) && sitesClient.length > 0
          const steps = [
            {k: 'info', label: '1. Informations', desc: 'Nom, code et identité du client', done: hasInfo, icon: 'pi-user'},
            {k: 'address', label: '2. Adresses', desc: "Ajoutez au moins une adresse", done: hasAddress, icon: 'pi-map-marker'},
            {k: 'sites', label: '3. Sites', desc: 'Rattachez les sites clients', done: hasSites, icon: 'pi-sitemap'},
          ]
          const nextStepIdx = steps.findIndex((s) => !s.done)
          return (
            <div className='lt-depot-stepper' data-testid='client-stepper'>
              <div className='lt-depot-stepper-head'>
                <div className='lt-depot-stepper-title'>Configuration du client en 3 étapes</div>
                <div className='lt-depot-stepper-sub'>
                  {nextStepIdx === -1
                    ? '✓ Configuration complète. Votre client est prêt.'
                    : `Étape ${nextStepIdx + 1}/3 : ${steps[nextStepIdx].desc}.`}
                </div>
              </div>
              <div className='lt-depot-stepper-track'>
                {steps.map((s, i) => {
                  const isActive = activeTabIdx === i
                  const isNext = nextStepIdx === i
                  return (
                    <React.Fragment key={s.k}>
                      <button
                        className={`lt-depot-step ${s.done ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isNext ? 'is-next' : ''}`}
                        onClick={() => setActiveTabIdx(i)}
                        data-testid={`client-step-${s.k}`}
                      >
                        <span className='lt-depot-step-num'>
                          {s.done ? <i className='pi pi-check' /> : (i + 1)}
                        </span>
                        <span className='lt-depot-step-txt'>
                          <span className='lt-depot-step-lbl'>{s.label}</span>
                          <span className='lt-depot-step-desc'>{s.desc}</span>
                        </span>
                        <i className={`pi ${s.icon} lt-depot-step-ico`} />
                      </button>
                      {i < steps.length - 1 && (
                        <span className={`lt-depot-step-sep ${steps[i].done ? 'is-done' : ''}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView
            className='lt-tabview'
            activeIndex={activeTabIdx}
            onTabChange={(e) => setActiveTabIdx(e.index)}
          >
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-user'></i>1. Informations</span>}>
              <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
                <div className='lt-detail-form'>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-building'></i>Informations Client</h4>
                  <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className='lt-form-field lt-form-field--full'>
                      {imageChange ? (
                        <div>
                          <div style={{display: 'flex', justifyContent: 'flex-end'}}><button className='lt-close-sm' onClick={() => setImageChange(!imageChange)}><i className='pi pi-times'></i></button></div>
                          <FileUploadeComponent accept={'image/*'} onUploadFinished={onFinishedUpload} uploadExtraInfo={{src: 'customer', srcID: selectedCustomer?.id || 0, id: selectedCustomer?.imageid || 0, desc: 'profile'}} />
                        </div>
                      ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                          <Image src={`${API_BASE_URL_IMAGE}${selectedCustomer?.image}`} alt='Image' width='56' preview imageStyle={{objectFit: 'cover', borderRadius: '10px'}} />
                          <button className='lt-form-upload-btn' onClick={() => setImageChange(!imageChange)}><i className='pi pi-pencil'></i>Changer</button>
                        </div>
                      )}
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Nom' />{_codeValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                      <InputText id='code' name='code' value={selectedCustomer?.code} onChange={onInputChange} placeholder='Client' className={`lt-form-input ${inputValidity['code'] == false ? 'p-invalid' : ''}`} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Label' />{_labelValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                      <InputText id='label' name='label' value={selectedCustomer?.label} onChange={onInputChange} placeholder='label' className={`lt-form-input ${inputValidity['label'] == false ? 'p-invalid' : ''}`} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='IDE' /></label>
                      <InputText name='NPA' value={selectedCustomer?.NPA} onChange={onInputChange} placeholder='IDE' className='lt-form-input' />
                    </div>
                  </div>
                </div>
              </div>

                {/* RIGHT: Sidebar */}
                <div className='lt-detail-side'>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Résumé</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Code</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedCustomer?.code || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Label</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedCustomer?.label || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>IDE</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedCustomer?.NPA || '-'}</span></div>
                    </div>
                  </div>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Relations</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-link' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.82rem'}}><span className='lt-sidebar-link-label' style={{color: '#475569', fontWeight: 500}}>Engins</span><span className='lt-sidebar-link-count' style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 8px', borderRadius: 6, background: '#EFF6FF', color: '#3B82F6', fontSize: '0.72rem', fontWeight: 800}}>{selectedCustomer?.enginNumber || 0}</span></div>
                      <div className='lt-sidebar-link' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.82rem'}}><span className='lt-sidebar-link-label' style={{color: '#475569', fontWeight: 500}}>Tags</span><span className='lt-sidebar-link-count' style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 8px', borderRadius: 6, background: '#EFF6FF', color: '#3B82F6', fontSize: '0.72rem', fontWeight: 800}}>{tags?.length || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map-marker'></i>2. Adresses</span>}>
              <div>
                {editAddress == true ? (
                  <AddressDetail client={true} handleSaveAddress={(e) => saveAddress(e)} />
                ) : (
                  <>
                    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20}}>
                      <div>
                        <h3 style={{margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif"}}>Gestion des adresses</h3>
                        <p style={{margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748B'}}>Consultez et gérez toutes les adresses associées à ce client.</p>
                      </div>
                      <button
                        data-testid='client-address-add-btn'
                        onClick={() => { dispatch(setSelectedAddress({customerID: selectedCustomer?.id, id: 0, type: '', active: 1})); dispatch(setAddressDetail(true)) }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '10px 18px', borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                          color: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', transition: 'all 0.18s',
                        }}
                        onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.4)'}}
                        onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'}}
                      >
                        <i className='pi pi-plus' style={{fontSize: '0.8rem'}}></i>
                        Ajouter une adresse
                      </button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                      {customerAddress && customerAddress?.map((address) => (
                        <AddressesComponent client={true} key={address.id} id={address.id} type={address.type} {...address} />
                      ))}
                      {(!customerAddress || customerAddress.length === 0) && (
                        <div style={{padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', border: '1px dashed #E2E8F0', borderRadius: 12}}>
                          <i className='pi pi-map-marker' style={{fontSize: '1.6rem', color: '#CBD5E1', display: 'block', marginBottom: 8}}></i>
                          Aucune adresse enregistrée pour ce client.
                        </div>
                      )}
                    </div>
                    {customerAddress && customerAddress.length > 0 && (
                      <div style={{
                        marginTop: 20, padding: '14px 18px', background: '#EFF6FF',
                        border: '1px solid #DBEAFE', borderRadius: 12,
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                      }}>
                        <div style={{width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                          <i className='pi pi-info-circle' style={{color: '#FFF', fontSize: '0.85rem'}}></i>
                        </div>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#1E3A8A', marginBottom: 2}}>Bon à savoir</div>
                          <div style={{fontSize: '0.78rem', color: '#1E40AF'}}>L'adresse principale est utilisée pour la facturation et les documents officiels.</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-sitemap'></i>3. Sites</span>}>
              <SiteClientComponent />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  )
}

export default memo(ClientDetail)
