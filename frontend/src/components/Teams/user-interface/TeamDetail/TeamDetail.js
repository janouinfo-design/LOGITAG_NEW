import React, {useEffect, useState} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {FileUploadeComponent} from '../../../shared/FileUploaderComponent/FileUploadeComponent'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import SiteEditor from '../../../Site/user-interface/SiteEditor/SiteEditor'
import {Dropdown} from 'primereact/dropdown'

import SiteList from '../../../Site/user-interface/SiteList/SiteList'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {
  createOrUpdateTeam,
  fetchTeams,
  getEditTeam,
  getSelectedTeam,
  setShow,
  getShow,
  setSelectedTeam,
  fetchTypesStaff,
  getTypesStaff,
  setSelectedTeamV,
  setTagVisible,
  getTagStaff,
} from '../../slice/team.slice'
import _ from 'lodash'
import * as Yup from 'yup'

import {Image} from 'primereact/image'
import {useNavigate} from 'react-router-dom'
import {Button} from 'primereact/button'
import TeamList from '../TeamList/TeamList'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import TeamEditor from '../TeamEditor/TeamEditor'
import {Calendar} from 'primereact/calendar'
import {InputSwitch} from 'primereact/inputswitch'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {useFormik} from 'formik'
import moment from 'moment'
import TeamTag from './TeamTag'
import TagListDrop from './TagListDrop'
import {fetchTags, fetchTagsFree} from '../../../Tag/slice/tag.slice'
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

const TeamDetail = () => {
  const [isValid, setIsValid] = useState(false)
  const [imageChange, setImageChange] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [imageId, setImageId] = useState()
  const [statusOption, setStatusOption] = useState([])

  const selectedTeam = useAppSelector(getSelectedTeam)
  const editTeam = useAppSelector(getEditTeam)
  const status = useAppSelector(getTypesStaff)
  const validators = useAppSelector(getValidator)
  const tagStaff = useAppSelector(getTagStaff)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const generateYupSchema = (validationArray) => {
    if (!Array.isArray(validationArray)) return
    let schema = {}
    validationArray.forEach((rule) => {
      const {id, label, isRequired, messageError, max, min, regExp} = rule
      if (isRequired === 1 && rule.active) {
        let yupChain = Yup.string().required(messageError || `${label} is required`)
        if (max > 0) {
          yupChain = yupChain.max(max, `Maximum length exceeded (max: ${max})`)
        }
        if (min > 0) {
          yupChain = yupChain.min(min, `Minimum length not met (min: ${min})`)
        }
        if (regExp) {
          yupChain = yupChain.matches(new RegExp(regExp), 'Invalid format')
        }
        schema[id] = yupChain
      }
    })

    return Yup.object().shape(schema)
  }

  const validationSchema = generateYupSchema(validators)

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      typeName: '',
      birthday: '',
      hireday: '',
      exitday: '',
    },
    validationSchema: validationSchema,
    onSubmit: (data) => {
      const obj = {
        ...selectedTeam,
        exitday: data.exitday,
        birthday: data.birthday,
        hireday: data.hireday,
        firstname: data.firstname,
        lastname: data.lastname,
        typeId: data.typeName,
      }
      dispatch(setSelectedTeamV(obj))
      onSave()
    },
  })

  const onFinishedUpload = async (e) => {
    if (e.success) {
      const imageid = await e.data[0].id
      setImageId(imageid)
    }
  }

  const onSave = () => {
    dispatch(createOrUpdateTeam({imageId: imageId})).then((res) => {
      if (res.payload) {
        dispatch(fetchTeams())
        dispatch(setShow(true))
      }
    })
  }

  useEffect(() => {
    if (selectedTeam == null) {
      dispatch(setShow(true))
    }
    const oldSelected = {
      ...selectedTeam,
      hireday: selectedTeam?.hireday ? moment(selectedTeam?.hireday, 'DD/MM/YYYY').toDate() : null,
      exitday: selectedTeam?.exitday ? moment(selectedTeam?.exitday, 'DD/MM/YYYY').toDate() : null,
      birthday: selectedTeam?.birthday
        ? moment(selectedTeam?.birthday, 'DD/MM/YYYY').toDate()
        : null,
      typeName: selectedTeam?.typeId,
    }
    formik.setValues(oldSelected)
  }, [])

  const removeDateDp = () => {
    setDisabled(!disabled)
    formik.setFieldValue('exitday', null)
  }

  const onHide = () => {
    dispatch(setShow(true))
  }

  const createTag = () => {
    dispatch(setTagVisible(true))
  }

  const renderAsterisk = (validators, fieldId) => {
    const validator = validators.find((validator) => validator.id === fieldId)
    return validator && validator.isRequired === 1 ? (
      <span className='h3 text-danger'>*</span>
    ) : null
  }

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={formik.handleSubmit} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Detail' /> {selectedTeam?.label}
      </span>
    </>
  )
  const header = <OlangItem olang='Info' />
  const headerTag = <OlangItem olang='tag' />

  useEffect(() => {
    setStatusOption([
      ...status?.map((st) => ({
        name: st.label,
        value: st.id,
      })),
    ])
  }, [status])

  useEffect(() => {
    if (selectedTeam?.exitday == null) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    dispatch(fetchTypesStaff())
    dispatch(fetchTagsFree())
  }, [])

  return (
    <>
      <TagListDrop />
      <div className='lt-page' data-testid="team-detail-page">
        {/* ── Premium Header ── */}
        <div className='lt-detail-header'>
          <div className='lt-detail-header-left'>
            <button className='lt-back-btn' onClick={() => dispatch(setShow(true))}><i className='pi pi-arrow-left'></i><span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span></button>
            <div className='lt-detail-avatar'>
              {selectedTeam?.image ? (
                <Image src={`${API_BASE_URL_IMAGE}${selectedTeam.image}`} alt='' width="52" height="52" preview imageStyle={{objectFit: 'cover', width: 52, height: 52, borderRadius: 12}} />
              ) : (
                <div className='lt-detail-avatar-ph' style={{background: '#F3E8FF', color: '#2563EB'}}><i className='pi pi-user'></i></div>
              )}
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{selectedTeam?.firstname} {selectedTeam?.lastname}</h2>
              <div className='lt-detail-meta'>
                <span className={`lt-badge ${selectedTeam?.active ? 'lt-badge-success' : 'lt-badge-neutral'}`}>
                  <span className={`lt-badge-dot ${selectedTeam?.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                  {selectedTeam?.active ? 'Actif' : 'Inactif'}
                </span>
                {selectedTeam?.typeName && <span className='lt-badge lt-badge-info'><i className='pi pi-briefcase' style={{fontSize: '0.55rem'}}></i>{selectedTeam.typeName}</span>}
                {selectedTeam?.hireday && <span style={{color: '#94A3B8', fontSize: '0.78rem'}}>Embauché le {selectedTeam.hireday}</span>}
              </div>
            </div>
          </div>
          <div className='lt-detail-actions-group'>
            <PrimaryActionButton type="edit" onClick={formik.handleSubmit} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView className='lt-tabview'>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-user'></i>Général</span>}>
              <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
                {/* LEFT: Form */}
                <div className='lt-detail-form'>
                  <div className='lt-form-section'>
                    <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Identité</h4>
                    <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div className='lt-form-field lt-form-field--full'>
                        {imageChange ? (
                          <div><div style={{display: 'flex', justifyContent: 'flex-end'}}><button className='lt-close-sm' onClick={() => { setImageChange(!imageChange); setIsValid(false) }}><i className='pi pi-times'></i></button></div>
                            <FileUploadeComponent accept={'image/*'} onUploadFinished={onFinishedUpload} uploadExtraInfo={{src: 'staff', srcID: selectedTeam?.id || 0, id: selectedTeam?.imageid || 0, desc: 'profile'}} /></div>
                        ) : (
                          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                            <Image src={`${API_BASE_URL_IMAGE}${selectedTeam?.image}`} alt='Image' width='56' preview imageStyle={{objectFit: 'cover', borderRadius: '10px'}} />
                            <button className='lt-form-upload-btn' onClick={() => setImageChange(!imageChange)}><i className='pi pi-pencil'></i>Changer</button>
                          </div>
                        )}
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Nom{renderAsterisk(validators, 'firstname')}</label>
                        <InputText name='firstname' className={`lt-form-input ${formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''}`} onChange={formik.handleChange} value={formik.values.firstname} />
                        {formik.errors.firstname && formik.touched.firstname && <small className='p-error'>{formik.errors.firstname}</small>}
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Prénom{renderAsterisk(validators, 'lastname')}</label>
                        <InputText name='lastname' className={`lt-form-input ${formik.errors.lastname && formik.touched.lastname ? 'p-invalid' : ''}`} onChange={formik.handleChange} value={formik.values.lastname} />
                        {formik.errors.lastname && formik.touched.lastname && <small className='p-error'>{formik.errors.lastname}</small>}
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Fonction{renderAsterisk(validators, 'typeName')}</label>
                        <Dropdown name='typeName' options={statusOption} optionLabel='name' optionValue='value' onChange={formik.handleChange} placeholder='Fonction' className={`lt-form-input ${formik.errors.typeName && formik.touched.typeName ? 'p-invalid' : ''}`} value={formik.values.typeName} />
                      </div>
                    </div>
                  </div>
                  <div className='lt-form-section'>
                    <h4 className='lt-form-section-title'><i className='pi pi-calendar'></i>Dates</h4>
                    <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Date de naissance</label>
                        <Calendar name='birthday' showIcon className='lt-form-input' dateFormat='dd/mm/yy' onChange={formik.handleChange} placeholder='dd/mm/yy' value={formik.values.birthday} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Date de création</label>
                        <Calendar name='hireday' showIcon className='lt-form-input' dateFormat='dd/mm/yy' onChange={formik.handleChange} placeholder='dd/mm/yy' value={formik.values.hireday} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Date départ</label>
                        <div style={{display: 'flex', gap: 6, alignItems: 'stretch'}}>
                          <Calendar showIcon disabled={disabled} name='exitday' dateFormat='dd/mm/yy' className='lt-form-input' style={{flex: 1}} onChange={formik.handleChange} placeholder='dd/mm/yy' value={formik.values.exitday} />
                          <button type='button' onClick={removeDateDp} title={disabled ? 'Activer la date de départ' : 'Retirer la date de départ'} style={{flexShrink: 0, width: 36, border: '1px solid #E2E8F0', background: '#FFF', borderRadius: 8, color: disabled ? '#10B981' : '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>
                            <i className={disabled ? 'pi pi-plus' : 'pi pi-times'}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Sidebar */}
                <div className='lt-detail-side'>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Résumé</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Statut</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}><span className={`lt-badge ${selectedTeam?.active ? 'lt-badge-success' : 'lt-badge-neutral'}`} style={{fontSize: '0.7rem'}}><span className={`lt-badge-dot ${selectedTeam?.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>{selectedTeam?.active ? 'Actif' : 'Inactif'}</span></span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Fonction</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedTeam?.typeName || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Date de naissance</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedTeam?.birthday || '-'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Membre depuis</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedTeam?.hireday || '-'}</span></div>
                    </div>
                  </div>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Relations</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div className='lt-sidebar-link' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.82rem'}}><span className='lt-sidebar-link-label' style={{color: '#475569', fontWeight: 500}}>Tags assignés</span><span className='lt-sidebar-link-count' style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 8px', borderRadius: 6, background: '#EFF6FF', color: '#3B82F6', fontSize: '0.72rem', fontWeight: 800}}>{tagStaff?.length || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-tag'></i>Tags</span>}>
              <TeamTag tagStaff={tagStaff} selectedTeam={selectedTeam} />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  )
}

export default TeamDetail
