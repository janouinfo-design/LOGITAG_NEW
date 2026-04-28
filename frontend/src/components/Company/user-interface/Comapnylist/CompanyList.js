import React, {useEffect, useRef, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import {FileUploadeComponent} from '../../../shared/FileUploaderComponent/FileUploadeComponent'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {
  createOrUpdateAddress,
  createOrUpdateCompany,
  fetchCompany,
  fetchCompanyAddresses,
  getCompany,
  getCompanyAddresses,
  getEditAddress,
  getMsgType,
  getSelectedCompany,
  setEditAddress,
  setSelectedAddress,
  setSelectedCompany,
} from '../../slice/company.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Button} from 'primereact/button'
import {Image} from 'primereact/image'
import {classNames} from 'primereact/utils'
import {Password} from 'primereact/password'
import _ from 'lodash'
import {Message} from 'primereact/message'
import {Toast} from 'primereact/toast'
import {TabPanel, TabView} from 'primereact/tabview'
import AddressesComponent from '../../../shared/AddressesComponent/Addresses.Component'
import AddressDetail from '../AddressDetail/AddressDetail'
import {useLocation} from 'react-router-dom'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'
import {
  getHashs,
  getInfoForUser,
  getUserAuth,
  removeUserAuth,
  saveUserAuth,
} from '../../../Navigxy/slice/navixy.slice'
import navixyLogo from '../../assests/navixy.jpg'
import {navixyValidation} from '../../Schema'
import {getUser} from '../../../Navigxy/api'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {Card} from 'primereact/card'
import {Calendar} from 'primereact/calendar'
import {InputSwitch} from 'primereact/inputswitch'
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

const CompanyList = () => {
  let company = useAppSelector(getSelectedCompany)
  let companyAddresses = useAppSelector(getCompanyAddresses)
  let msgType = useAppSelector(getMsgType)
  let editAddress = useAppSelector(getEditAddress)
  const infoUser = useAppSelector(getInfoForUser)
  const hash = useAppSelector(getHashs)

  const dispatch = useAppDispatch()

  const [imageChange, setImageChange] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [msg, setMsg] = useState(false)
  const messagesRef = useRef(null)
  const toast = useRef(null)

  const formik = useFormik({
    initialValues: {
      password: '',
      email: '',
    },
    onSubmit: (data) => {
      dispatch(saveUserAuth(data)).then((res) => {
        if (res.payload) {
          showSuccess()
          dispatch(getUserAuth())
        }
      })
    },
  })

  const onInputChange = (e) => {
    let old = _.cloneDeep(company)
    old = {
      ...old,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedCompany(old))
  }

  const save = () => {
    dispatch(createOrUpdateCompany(company)).then((res) => {
      if (res.payload) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Informations sauvegardées avec succès',
          })
        )
        setImageChange(false)
        dispatch(fetchCompany())
      }
    })
  }

  const logOut = () => {
    dispatch(removeUserAuth(infoUser?.login))
  }

  const showSuccess = () => {
    toast.current.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Success Login',
      life: 3000,
    })
  }

  const saveAddressCompany = (e) => {
    dispatch(setSelectedAddress(e))
    dispatch(createOrUpdateAddress(e)).then((res) => {
      if (res.payload) {
        dispatch(fetchCompanyAddresses())
        dispatch(setEditAddress(false))
        dispatch(setSelectedAddress(null))
      }
    })
  }

  useEffect(() => {
    if (msg) {
      messagesRef.current.show({
        severity: 'success',
        summary: 'Success Message',
        detail: `${msgType}`,
        life: 3000,
        closable: true,
      })
    }
  }, [msg])

  useEffect(() => {
    dispatch(fetchCompany())
    dispatch(fetchCompanyAddresses())
  }, [])

  useEffect(() => {
    if (hash !== null) {
      setIsDisabled(true)
      formik.setFieldValue('email', infoUser?.login)
    } else {
      setIsDisabled(false)
    }
  }, [hash])

  return (
    <>
      <Toast ref={toast} />
      <div className='lt-page' data-testid="company-detail-page">
        {/* ── Premium Header ── */}
        <div className='lt-detail-header'>
          <div className='lt-detail-header-left'>
            <div className='lt-detail-avatar'>
              {company?.image ? (
                <Image src={`${API_BASE_URL_IMAGE}${company.image}`} alt='' width="52" height="52" preview imageStyle={{objectFit: 'cover', width: 52, height: 52, borderRadius: 12}} />
              ) : (
                <div className='lt-detail-avatar-ph' style={{background: '#FEF3C7', color: '#D97706'}}><i className='pi pi-building'></i></div>
              )}
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{company?.label || 'Entreprise'}</h2>
              <div className='lt-detail-meta'>
                <span className='lt-badge lt-badge-info'><i className='pi pi-hashtag' style={{fontSize: '0.5rem'}}></i>{company?.code || '-'}</span>
                {company?.NPA && <span className='lt-badge lt-badge-info'>IDE: {company.NPA}</span>}
              </div>
            </div>
          </div>
          <div className='lt-detail-header-right'>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Adresses</div>
              <div className='lt-detail-stat-val'>{companyAddresses?.length || 0}</div>
            </div>
            <div className='lt-detail-actions-group'>
              <PrimaryActionButton type="edit" onClick={save} />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView className='lt-tabview'>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-building'></i>Général</span>}>
              <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
                <div className='lt-detail-form'>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Informations</h4>
                  <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className='lt-form-field lt-form-field--full'>
                      {imageChange ? (
                        <div><div style={{display: 'flex', justifyContent: 'flex-end'}}><button className='lt-close-sm' onClick={() => setImageChange(!imageChange)}><i className='pi pi-times'></i></button></div>
                          <FileUploadeComponent accept={'image/*'} uploadExtraInfo={{src: 'company', srcID: company?.id || 0, id: company?.imageid || 0, desc: 'profile'}} /></div>
                      ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                          <Image src={`${API_BASE_URL_IMAGE}${company?.image}`} alt='Image' width='56' preview imageStyle={{objectFit: 'cover', borderRadius: '10px'}} />
                          <button className='lt-form-upload-btn' onClick={() => setImageChange(!imageChange)}><i className='pi pi-pencil'></i>Changer</button>
                        </div>
                      )}
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Code' /></label>
                      <InputText name='code' className='lt-form-input' value={company?.code} onChange={onInputChange} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Label' /></label>
                      <InputText name='label' className='lt-form-input' value={company?.label} onChange={onInputChange} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='IDE' /></label>
                      <InputText name='NPA' className='lt-form-input' value={company?.NPA} onChange={onInputChange} />
                    </div>
                  </div>
                </div>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-clock'></i>Horaires</h4>
                  <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Date.From' /></label>
                      <Calendar name='begDate' className='lt-form-input' value={company?.begDate} onChange={onInputChange} timeOnly showIcon icon={() => <i className='pi pi-clock' />} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Date.To' /></label>
                      <Calendar name='endDate' className='lt-form-input' value={company?.endDate} onChange={onInputChange} timeOnly showIcon icon={() => <i className='pi pi-clock' />} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='gpsConfig' /></label>
                      <div style={{paddingTop: 6}}><InputSwitch name='gpsConfig' checked={company?.gpsConfig == 1} onChange={onInputChange} /></div>
                    </div>
                  </div>
                </div>
              </div>

                {/* RIGHT: Sidebar */}
                <div className='lt-detail-side'>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Résumé</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Code</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{company?.code || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Label</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{company?.label || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>IDE</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{company?.NPA || '-'}</span></div>
                    </div>
                  </div>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Relations</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-link' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.82rem'}}><span className='lt-sidebar-link-label' style={{color: '#475569', fontWeight: 500}}>Adresses</span><span className='lt-sidebar-link-count' style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 8px', borderRadius: 6, background: '#EFF6FF', color: '#3B82F6', fontSize: '0.72rem', fontWeight: 800}}>{companyAddresses?.length || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map-marker'></i>Adresses</span>}>
              {editAddress == true ? (
                <AddressDetail handleSaveAddress={(e) => saveAddressCompany(e)} />
              ) : (
                <div className='flex flex-wrap w-full' style={{gap: 12}}>
                  {companyAddresses?.map((address) => (
                    <AddressesComponent key={address.id} className='w-full lg:w-6 mt-2' id={address.id} type={address.type} {...address} />
                  ))}
                </div>
              )}
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-link'></i>Intégrations</span>}>
              <div className='lt-integrations-wrap'>
                <div className='lt-integrations-head'>
                  <div>
                    <h3 className='lt-integrations-title'>Intégrations & connexions externes</h3>
                    <p className='lt-integrations-sub'>Connectez vos services tiers pour enrichir le suivi de votre flotte.</p>
                  </div>
                </div>

                {/* Logitrak / Navixy integration card */}
                <div className={`lt-int-card ${hash ? 'lt-int-card--connected' : ''}`} data-testid='integration-logitrak'>
                  <div className='lt-int-card-head'>
                    <div className='lt-int-card-logo'>
                      <img src={require('../../../../assets/images/LOGITRAK.webp')} alt='Logitrak' />
                    </div>
                    <div className='lt-int-card-meta'>
                      <div className='lt-int-card-name'>
                        Logitrak
                        <span className='lt-int-card-tag'>GPS · Navixy</span>
                      </div>
                      <p className='lt-int-card-desc'>Synchronisation temps-réel des positions GPS et de l'historique de mouvements.</p>
                    </div>
                    <div className='lt-int-card-status'>
                      <span className={`lt-int-pill ${hash ? 'lt-int-pill--ok' : 'lt-int-pill--off'}`} data-testid='integration-status'>
                        <span className='lt-int-pill-dot' />
                        {hash ? 'Connecté' : 'Non connecté'}
                      </span>
                    </div>
                  </div>

                  <div className='lt-int-card-body'>
                    {hash ? (
                      <div className='lt-int-account' data-testid='integration-account'>
                        <div className='lt-int-account-row'>
                          <span className='lt-int-account-label'><i className='pi pi-user' /> Compte connecté</span>
                          <span className='lt-int-account-val'>{infoUser?.login || formik.values.email || '—'}</span>
                        </div>
                        <div className='lt-int-account-row'>
                          <span className='lt-int-account-label'><i className='pi pi-shield' /> Authentification</span>
                          <span className='lt-int-account-val'>Token sécurisé actif</span>
                        </div>
                        <div className='lt-int-account-actions'>
                          <button type='button' className='lt-int-btn lt-int-btn--danger' onClick={logOut} data-testid='integration-disconnect'>
                            <i className='pi pi-sign-out' /> Déconnecter
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        className='lt-int-form'
                        onSubmit={(e) => { e.preventDefault(); formik.handleSubmit() }}
                        data-testid='integration-form'
                      >
                        <div className='lt-int-form-grid'>
                          <div className='lt-int-field'>
                            <label className='lt-int-label' htmlFor='int-email'><OlangItem olang='Email' /></label>
                            <InputText
                              id='int-email'
                              name='email'
                              type='email'
                              autoComplete='username'
                              placeholder='vous@entreprise.com'
                              className={`lt-int-input ${formik.errors.email && formik.touched.email ? 'p-invalid' : ''}`}
                              value={formik.values.email}
                              onChange={formik.handleChange}
                              data-testid='integration-email'
                            />
                          </div>
                          <div className='lt-int-field'>
                            <label className='lt-int-label' htmlFor='int-password'><OlangItem olang='Password' /></label>
                            <Password
                              inputId='int-password'
                              name='password'
                              autoComplete='current-password'
                              placeholder='••••••••'
                              value={formik.values.password}
                              toggleMask
                              feedback={false}
                              onChange={formik.handleChange}
                              className='lt-int-input lt-int-input--password'
                              inputClassName='lt-int-password-input'
                              data-testid='integration-password'
                            />
                          </div>
                        </div>
                        <div className='lt-int-form-actions'>
                          <button
                            type='submit'
                            className='lt-int-btn lt-int-btn--primary'
                            disabled={!formik.values.email || !formik.values.password}
                            data-testid='integration-connect'
                          >
                            <i className='pi pi-sign-in' /> Connecter le compte
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Placeholder pour futures intégrations */}
                <div className='lt-int-empty-card' data-testid='integration-soon'>
                  <i className='pi pi-plus-circle' />
                  <div>
                    <strong>D'autres intégrations bientôt disponibles</strong>
                    <p>Stripe, Google Calendar, SMS… Suggérez-nous les services dont vous avez besoin.</p>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  )
}

export default CompanyList
