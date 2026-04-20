import React, {useEffect, useRef, useState, memo} from 'react'
import {TabPanel, TabView} from 'primereact/tabview'
import {Toast} from 'primereact/toast'
import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateTag,
  fetchStatus,
  fetchTags,
  getAlreadyExist,
  getEditTag,
  getSelectedTag,
  getStatus,
  setSelectedTag,
  setShow,
} from '../../slice/tag.slice'
import {InputText} from 'primereact/inputtext'
import {Message} from 'primereact/message'
import {Dropdown} from 'primereact/dropdown'
import {InputSwitch} from 'primereact/inputswitch'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Card} from 'primereact/card'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'
import {getFamilles} from '../../../Famillies/slice/famille.slice'
import {useSelector} from 'react-redux'
import {fetchValidator, getValidator} from '../../../Inventory/slice/inventory.slice'
import { getEnginesWorksite } from '../../../Engin/slice/engin.slice'
import { fetchSitesClient, getSelectedSiteClient } from '../../../../store/slices/customer.slice'

const TagDetail = () => {
  const [isValid, setIsValid] = useState(true)
  const [statusClick, setStatusClick] = useState()
  const [statusOption, setStatusOption] = useState([])
  const [selectFamille, setSelectFamille] = useState('')
  const worksites = useAppSelector(getSelectedSiteClient)
  // const [familleOptions, setfamilleOptions] = useState([])

  const selectedTag = useAppSelector(getSelectedTag)
  const existItem = useAppSelector(getAlreadyExist)
  const status = useAppSelector(getStatus)
  const familles = useAppSelector(getFamilles)
  const validators = useSelector(getValidator)

  const toast = useRef(null)

  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      ...selectedTag,
      active: selectedTag ? selectedTag?.active === 1 : true,
    },

    // validate: (data) => {
    //   let errors = {}
    //   validators.forEach((validator) => {
    //     if (validator.isRequired) {
    //       if (!data[validator.id]) {
    //         errors[validator.id] = '*'
    //       }
    //     }
    //   })
    //   setIsValid(Object.keys(errors).length === 0)
    //   return errors
    // },
    onSubmit: (values, {resetForm}) => {
      console.log('values to submit', values);
      if((values.LocationID || '').toString().includes(':')){
         let [type, id] = values.LocationID.toString().split(':').map(item => item.trim());
         values.LocationID = id
         values.LocationObject = type.toLowerCase()
      }

      console.log('values after process', values);
      // return
      dispatch(createOrUpdateTag(values)).then((res) => {
        if (res.payload) {
          dispatch(fetchTags())
          dispatch(setShow(true))
        }
      })
    },
  })

  // const handleFormChange = (e) => {
  //   formik.handleChange(e)
  //   //setIsValid(formik.isValid)
  // }


  // useEffect(() => {
  //   setfamilleOptions([
  //     ...familles?.map((typ) => ({
  //       name: typ.label,
  //       code: typ.id,
  //     })),
  //   ])
  // }, [familles])

  useEffect(() => {
    formik.setValues({
      ...selectedTag,
      active: selectedTag ? selectedTag.active === 1 : true,
    })
  }, [selectedTag])

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedTag)
    old = {...old, [e.target.name]: e.target.value}
    dispatch(setSelectedTag(old))
    setIsValid(true)
  }

  const onHide = () => {
    dispatch(setShow(true))
    dispatch(setSelectedTag(null))
    // setFamilles([])
    formik.resetForm()
  }

  const onSave = async () => {
    dispatch(createOrUpdateTag(statusClick)).then((res) => {
      if (res.payload) {
        dispatch(fetchTags())
        show()
        dispatch(setShow(true))
        setIsValid(false)
      }
    })
  }

  useEffect(() => {
    setStatusOption([
      {name: 'selectionner', code: 0},
      ...status?.map((st) => ({
        name: st.label,
        value: st.status,
      })),
    ])
  }, [status])

  useEffect(() => {
    dispatch(fetchStatus())
  }, [])

  // useEffect(() => {
  //   setfamilleOptions([
  //     ...familles?.map((typ) => ({
  //       name: typ.label,
  //       code: typ.id,
  //     })),
  //   ])
  // }, [familles])

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
      <i className='pi pi-tag mr-1'></i>
      <span className='ml-1'>Tag: {selectedTag?.label}</span>
    </>
  )

  const show = () => {
    toast.current.show({severity: 'success', summary: 'success', detail: 'Tag Is Updated'})
  }

  useEffect(() => {
    dispatch(fetchValidator('tagupdate'))
    dispatch(fetchSitesClient(0))
  }, [])

  const _codeValidator = validators?.find((field) => field.id === 'code')
  const _labelValidator = validators?.find((field) => field.id === 'label')
  const _statusValidator = validators?.find((field) => field.id === 'status')
  const _familleValidator = validators?.find((field) => field.id === 'famille')

  return (
    <>
      <Toast ref={toast} position='top-center'>
        <div>Success message!</div>
      </Toast>

      <div className='lt-page' data-testid="tag-detail-page">
        {/* ── Premium Header ── */}
        <div className='lt-detail-header' data-testid="tag-detail-header">
          <div className='lt-detail-header-left'>
            <button className='lt-back-btn' onClick={() => dispatch(setShow(true))} data-testid="tag-back-btn">
              <i className='pi pi-arrow-left'></i>
            </button>
            <div className='lt-detail-avatar-ph' style={{background: '#F3E8FF', color: '#7C3AED'}}>
              <i className='pi pi-tag'></i>
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{selectedTag?.name || selectedTag?.label || '-'}</h2>
              <div className='lt-detail-meta'>
                {selectedTag?.familleTag && (
                  <span className='lt-badge' style={{background: selectedTag.familleTagIconBgcolor || '#7C3AED', color: '#FFF', fontSize: '0.68rem'}}>{selectedTag.familleTag}</span>
                )}
                <span className={`lt-badge ${selectedTag?.active ? 'lt-badge-success' : 'lt-badge-neutral'}`}>
                  <span className={`lt-badge-dot ${selectedTag?.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                  {selectedTag?.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
          <div className='lt-detail-header-right'>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Code</div>
              <div className='lt-detail-stat-val' style={{fontSize: '0.8rem', color: '#3B82F6'}}>{selectedTag?.code || '-'}</div>
            </div>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Statut</div>
              <div className='lt-detail-stat-val' style={{fontSize: '0.8rem'}}>{selectedTag?.statuslabel || '-'}</div>
            </div>
            <div className='lt-detail-actions'>
              <button className='lt-detail-action-btn lt-detail-action-btn--save' onClick={formik.handleSubmit} title="Enregistrer"><i className='pi pi-check'></i></button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView className='lt-tabview'>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-cog'></i>Général</span>}>
              <div className='lt-detail-form' style={{maxWidth: 700}}>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-tag'></i>Informations Tag</h4>
                  {existItem && <Message severity='error' text='The Tag is Already Exist' className='w-full' style={{marginBottom: 8}} />}
                  <div className='lt-form-grid'>
                    {selectedTag?.id && (
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Label' />{_labelValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='label' className={`lt-form-input ${formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : ''}`} onChange={formik.handleChange} value={formik.values?.label} disabled={selectedTag?.id != 0} />
                      </div>
                    )}
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Emplacément' /></label>
                      <Dropdown id='LocationID' name='LocationID' filter value={formik.values?.LocationID} options={(worksites || []).map(o => ({label: o.name, value: o.type+':'+o.id}))} onChange={formik.handleChange} placeholder='Emplacement' className='lt-form-input' />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Status' />{_statusValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                      <Dropdown id='statusid' name='statusid' value={formik.values?.statusid} options={statusOption} optionLabel='name' optionValue='value' onChange={formik.handleChange} placeholder='Statut' className='lt-form-input' />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Famille' />{_familleValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                      <Dropdown id='familleId' name='familleId' options={familles} optionLabel='label' optionValue='id' onChange={formik.handleChange} value={`${formik.values?.familleId}`} placeholder='Famille' className='lt-form-input' />
                    </div>
                    <div className='lt-form-field'>
                      <label className='lt-form-label'><OlangItem olang='Active' /></label>
                      <div style={{paddingTop: 6}}><InputSwitch id='active' name='active' checked={formik.values.active} onChange={formik.handleChange} /></div>
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

export default memo(TagDetail)
