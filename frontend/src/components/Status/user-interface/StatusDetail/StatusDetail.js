import React, {useEffect, useRef, useState} from 'react'
import {TabPanel, TabView} from 'primereact/tabview'
import {Toast} from 'primereact/toast'
import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchStatus,
  getSelectedObject,
  getSelectedStatus,
  getStatus,
  saveStatus,
  setShow,
} from '../../slice/status.slice'
import {InputText} from 'primereact/inputtext'
import {Dropdown} from 'primereact/dropdown'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'
import {fetchIcons, getIcons} from '../../../Famillies/slice/famille.slice'
import {ColorPicker} from 'primereact/colorpicker'
import StatusTransition from '../Transition/Transition'
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

const StatusDetail = () => {
  const [isValid, setIsValid] = useState(false)
  const toast = useRef(null)

  const status = useAppSelector(getStatus)
  const icons = useAppSelector(getIcons)
  const selectedStatus = useAppSelector(getSelectedStatus)
  const selectedObj = useAppSelector(getSelectedObject)

  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      label: '',
      backgroundColor: '',
      iconId: '',
      active: selectedStatus ? selectedStatus?.active === 1 : true,
    },
    onSubmit: (values) => {
      let obj = {
        id: selectedStatus?.id,
        name: selectedStatus?.name,
        label: values.label,
        backgroundColor: `${values.backgroundColor.startsWith('#') ? '' : '#'}${values.backgroundColor}`,
        iconId: values.iconId,
      }
      dispatch(saveStatus(obj)).then((res) => {
        if (res.payload) {
          dispatch(fetchStatus())
          dispatch(setShow(true))
        }
      })
    },
  })

  const optionTemplate = (option) => (
    <div className='flex align-items-center'>
      <i className={`${option?.icon} text-2xl`} />
      <span className='ml-2'>{option?.icon}</span>
    </div>
  )

  const selectedOptionTm = (option, props) => {
    if (option) {
      return (
        <div className='flex align-items-center'>
          <i className={`${option?.icon} text-2xl`} />
          <span className='ml-2 text-base'>{option?.icon}</span>
        </div>
      )
    }
    return <span>{props.placeholder}</span>
  }

  const handleFormChange = (e) => {
    formik.handleChange(e)
    setIsValid(true)
  }

  useEffect(() => {
    if (Array.isArray(icons) && icons.length > 0) {
      const findIcon = icons.find((icon) => icon.icon === selectedStatus?.icon)
      formik.setValues({
        ...selectedStatus,
        iconId: findIcon?.iconId,
        active: selectedStatus ? selectedStatus.active === 1 : true,
      })
    }
  }, [selectedStatus, icons])

  useEffect(() => {
    dispatch(fetchIcons())
    dispatch(fetchStatus())
  }, [])

  const onHide = () => dispatch(setShow(true))

  const rawBg = formik.values.backgroundColor || ''
  const bg = rawBg ? (rawBg.startsWith('#') ? rawBg : `#${rawBg}`) : '#E0E7FF'
  const currentIconObj = Array.isArray(icons) ? icons.find((i) => i.iconId === formik.values.iconId) : null
  const iconClass = currentIconObj?.icon || selectedStatus?.icon

  return (
    <>
      <Toast ref={toast} position='top-center' />
      <div className='lt-page' data-testid="status-detail-page">
        {/* ── Premium Header ── */}
        <div className='lt-detail-header'>
          <div className='lt-detail-header-left'>
            <button className='lt-back-btn' onClick={onHide}><i className='pi pi-arrow-left'></i><span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span></button>
            <div className='lt-detail-avatar'>
              <div className='lt-detail-avatar-ph' style={{background: bg, color: '#fff'}}>
                <i className={iconClass || 'pi pi-circle'}></i>
              </div>
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{selectedStatus?.label || selectedStatus?.code || 'Statut'}</h2>
              <div className='lt-detail-meta'>
                <span className='lt-badge lt-badge-info'><i className='pi pi-tag' style={{fontSize: '0.5rem'}}></i>{selectedObj?.name || 'Statut'}</span>
                {selectedStatus?.code && <span className='lt-badge lt-badge-neutral'><i className='pi pi-hashtag' style={{fontSize: '0.5rem'}}></i>{selectedStatus.code}</span>}
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
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-cog'></i><OlangItem olang='Details' /></span>}>
              <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
                <div className='lt-detail-form'>
                  <div className='lt-form-section'>
                    <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Identité</h4>
                    <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      {selectedStatus?.id && (
                        <div className='lt-form-field lt-form-field--full'>
                          <label className='lt-form-label'><OlangItem olang='Label.st' /></label>
                          <InputText
                            name='label'
                            className='lt-form-input'
                            onChange={handleFormChange}
                            value={formik.values?.label || ''}
                          />
                        </div>
                      )}
                      <div className='lt-form-field lt-form-field--full'>
                        <label className='lt-form-label'><OlangItem olang='icon' /></label>
                        <Dropdown
                          name='iconId'
                          value={formik.values.iconId}
                          onChange={formik.handleChange}
                          options={icons}
                          itemTemplate={optionTemplate}
                          valueTemplate={selectedOptionTm}
                          optionLabel='icon'
                          optionValue='iconId'
                          placeholder={'Icon'}
                          className='lt-form-input'
                        />
                      </div>
                      <div className='lt-form-field lt-form-field--full'>
                        <label className='lt-form-label' htmlFor='color'><OlangItem olang='color' /></label>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                          <ColorPicker
                            name='backgroundColor'
                            value={formik.values.backgroundColor}
                            onChange={formik.handleChange}
                          />
                          <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#64748B'}}>{bg.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Sidebar */}
                <div className='lt-detail-side'>
                  <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                    <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Aperçu</div>
                    <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0'}}>
                        <div style={{width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem'}}>
                          <i className={iconClass || 'pi pi-circle'}></i>
                        </div>
                        <div>
                          <div style={{fontWeight: 700, color: '#0F172A'}}>{formik.values.label || selectedStatus?.code || '—'}</div>
                          <div style={{fontSize: '0.75rem', color: '#64748B'}}>Statut</div>
                        </div>
                      </div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Code</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{selectedStatus?.code || '—'}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Couleur</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{bg.toUpperCase()}</span></div>
                      <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Icône</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{iconClass || '—'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-link'></i><OlangItem olang='transitions' /></span>}>
              <StatusTransition filter={{statusId: selectedStatus?.id}} />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  )
}

export default StatusDetail
