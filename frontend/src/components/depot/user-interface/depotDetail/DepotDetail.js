import {Toast} from 'primereact/toast'
import {memo, useRef, useState} from 'react'
import {createOrUpdateDepot, getSelectedDepot, setSelectedDepot} from '../../slice/depot.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import {useFormik} from 'formik'
import {useAppSelector} from '../../../../hooks'
import {InputSwitch} from 'primereact/inputswitch'
import {useDispatch} from 'react-redux'
import _ from 'lodash'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

function DepotDetail() {
  const toast = useRef(null)
  const selectedDepot = useAppSelector(getSelectedDepot)
  const validators = useAppSelector(getValidator)
  const [isValid, setIsValid] = useState(true)
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues: {
      ..._.cloneDeep(selectedDepot),
      active: selectedDepot ? selectedDepot?.active === 1 : true,
    },
    validate: (data) => {
      let errors = {}
      validators.forEach((validator) => {
        const _regExp = new RegExp(validator.regExp.slice(1, -1))
        if (validator.isRequired) {
          if (!data[validator.id]) errors[validator.id] = '*'
          if (!_regExp.test(data[validator.id])) errors[validator.id] = validator.messageError
        }
      })
      setIsValid(Object.keys(errors).length === 0)
      return errors
    },
    onSubmit: (values) => {
      dispatch(setSelectedDepot(values))
      const errors = formik.validateForm(values)
      if (Object.keys(errors).length === 0) {
        dispatch(createOrUpdateDepot()).then((res) => {
          if (res.payload) {
            toast.current.show({severity: 'success', summary: 'Successful', detail: 'Depot Updated', life: 2000})
          }
        })
      }
    },
  })

  const handleFormChange = (e) => formik.handleChange(e)
  const _codeValidator = validators?.find((f) => f.id === 'code')
  const _labelValidator = validators?.find((f) => f.id === 'label')

  return (
    <>
      <Toast ref={toast} position='bottom-right' />
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 12}}>
        <PrimaryActionButton type='edit' onClick={formik.handleSubmit} />
      </div>
      <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
        <div className='lt-detail-form'>
          <div className='lt-form-section'>
            <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Informations</h4>
            <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='label' />{_labelValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                <InputText
                  name='label'
                  className={`lt-form-input ${formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : ''}`}
                  onChange={handleFormChange}
                  value={formik.values?.label || ''}
                />
              </div>
              <div className='lt-form-field'>
                <label className='lt-form-label'><OlangItem olang='code' />{_codeValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                <InputText
                  name='code'
                  className={`lt-form-input ${formik.errors?.code && formik.submitCount > 0 ? 'p-invalid' : ''}`}
                  onChange={handleFormChange}
                  value={formik.values?.code || ''}
                />
              </div>
              <div className='lt-form-field lt-form-field--full' style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <label className='lt-form-label' style={{margin: 0}}><OlangItem olang='Active' /></label>
                <InputSwitch id='active' name='active' checked={formik.values.active} onChange={handleFormChange} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className='lt-detail-side' style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
            <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Résumé</div>
            <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
              <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Code</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{formik.values?.code || '—'}</span></div>
              <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Label</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{formik.values?.label || '—'}</span></div>
              <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', gap: 12}}>
                <span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Statut</span>
                <span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>
                  <span className={`lt-badge ${formik.values.active ? 'lt-badge-success' : 'lt-badge-neutral'}`} style={{fontSize: '0.7rem'}}>
                    <span className={`lt-badge-dot ${formik.values.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                    {formik.values.active ? 'Actif' : 'Inactif'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(DepotDetail)
