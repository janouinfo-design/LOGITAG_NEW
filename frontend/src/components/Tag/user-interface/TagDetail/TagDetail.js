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
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

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

      <div data-testid="tag-detail-page" style={{padding: '10px 14px', fontFamily: "'Inter', -apple-system, sans-serif"}}>
        {/* ── Header ── */}
        <div data-testid="tag-detail-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FFF', borderRadius: 12, border: '1px solid #E8ECF0', marginBottom: 14, gap: 12, flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <button onClick={() => dispatch(setShow(true))} data-testid="tag-back-btn" style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem'}}>
              <i className='pi pi-arrow-left'></i>
            </button>
            <div style={{width: 52, height: 52, borderRadius: 12, background: '#F3E8FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'}}><i className='pi pi-tag'></i></div>
            <div>
              <h2 style={{fontFamily: "'Manrope', sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0}}>{selectedTag?.name || selectedTag?.label || '-'}</h2>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 4}}>
                {selectedTag?.familleTag && <span style={{display: 'inline-flex', padding: '2px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: selectedTag.familleTagIconBgcolor || '#2563EB', color: '#FFF'}}>{selectedTag.familleTag}</span>}
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: selectedTag?.active ? '#F0FDF4' : '#F1F5F9', color: selectedTag?.active ? '#16A34A' : '#64748B'}}>
                  <span style={{width: 6, height: 6, borderRadius: '50%', background: selectedTag?.active ? '#16A34A' : '#94A3B8'}}></span>
                  {selectedTag?.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <PrimaryActionButton type="edit" onClick={formik.handleSubmit} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden'}}>
          <TabView>
            <TabPanel header={<span style={{display: 'flex', alignItems: 'center', gap: 6}}><i className='pi pi-cog' style={{fontSize: '0.82rem'}}></i>Général</span>}>
              <div style={{display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, padding: 16}}>
                <div>
                  <div style={{marginBottom: 20}}>
                    <h4 style={{fontFamily: "'Manrope', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10, borderBottom: '1px solid #F1F5F9'}}><i className='pi pi-tag' style={{color: '#64748B'}}></i>Informations Tag</h4>
                    {existItem && <Message severity='error' text='The Tag is Already Exist' className='w-full' style={{marginBottom: 8, marginTop: 8}} />}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12}}>
                      {selectedTag?.id && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                          <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Label{_labelValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                          <InputText name='label' onChange={formik.handleChange} value={formik.values?.label} disabled={selectedTag?.id != 0} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                        </div>
                      )}
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Emplacement</label>
                        <Dropdown id='LocationID' name='LocationID' filter value={formik.values?.LocationID} options={(worksites || []).map(o => ({label: o.name, value: o.type+':'+o.id}))} onChange={formik.handleChange} placeholder='Emplacement' style={{borderRadius: 8}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Statut{_statusValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <Dropdown id='statusid' name='statusid' value={formik.values?.statusid} options={statusOption} optionLabel='name' optionValue='value' onChange={formik.handleChange} placeholder='Statut' style={{borderRadius: 8}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Famille{_familleValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <Dropdown id='familleId' name='familleId' options={familles} optionLabel='label' optionValue='id' onChange={formik.handleChange} value={`${formik.values?.familleId}`} placeholder='Famille' style={{borderRadius: 8}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Actif</label>
                        <div style={{paddingTop: 6}}><InputSwitch id='active' name='active' checked={formik.values.active} onChange={formik.handleChange} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Résumé */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                  <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden'}}>
                    <div style={{padding: '12px 16px', fontFamily: "'Manrope', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9'}}>Résumé</div>
                    <div style={{padding: '12px 16px'}}>
                      {[
                        {l: 'Statut', v: selectedTag?.active ? 'Actif' : 'Inactif', c: selectedTag?.active ? '#16A34A' : '#64748B'},
                        {l: 'Code', v: selectedTag?.code || '-', c: '#3B82F6'},
                        {l: 'Famille', v: selectedTag?.familleTag || '-'},
                        {l: 'Label', v: selectedTag?.statuslabel || '-'},
                      ].map((r, i) => (
                        <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #F8FAFC' : 'none'}}>
                          <span style={{color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500}}>{r.l}</span>
                          <span style={{color: r.c || '#0F172A', fontSize: '0.82rem', fontWeight: 700}}>{r.v}</span>
                        </div>
                      ))}
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
