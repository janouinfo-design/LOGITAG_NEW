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
            <div className='lt-detail-actions'>
              <button className='lt-detail-action-btn lt-detail-action-btn--save' onClick={save} title="Enregistrer"><i className='pi pi-check'></i></button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView className='lt-tabview'>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-building'></i>Général</span>}>
              <div className='lt-detail-form' style={{maxWidth: 700}}>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Informations</h4>
                  <div className='lt-form-grid'>
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
                  <div className='lt-form-grid'>
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
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-cog'></i>Paramètres</span>}>
              <div className='lt-detail-form' style={{maxWidth: 500}}>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'>
                    <img src={require('../../../../assets/images/LOGITRAK.webp')} style={{width: 120, objectFit: 'cover'}} alt="Logitrak" />
                  </h4>
                  <div className='lt-form-grid'>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Email' /></label>
                      <InputText name='email' className={`lt-form-input ${formik.errors.email && formik.touched.email ? 'p-invalid' : ''}`} value={formik.values.email} onChange={formik.handleChange} disabled={isDisabled} />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Password' /></label>
                      <Password name='password' value={formik.values.password} toggleMask feedback={false} onChange={formik.handleChange} className='lt-form-input' inputClassName='w-full' disabled={isDisabled} />
                    </div>
                    <div className='lt-form-field lt-form-field--full' style={{display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end'}}>
                      <button className='lt-modal-btn-cancel' onClick={logOut}>Déconnexion</button>
                      <button className='lt-detail-action-btn lt-detail-action-btn--save' onClick={formik.handleSubmit} disabled={isDisabled} style={{width: 'auto', padding: '8px 16px', borderRadius: 8}}><i className='pi pi-sign-in' style={{marginRight: 4}}></i> Connexion</button>
                    </div>
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
