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
      <div className='flex justify-content-between align-items-center'>
        <div>
          <ButtonComponent onClick={() => dispatch(setShow(true))}>
            <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
            <div className='ml-2'>
              <OlangItem olang='btn.back' />
            </div>
          </ButtonComponent>
        </div>

        <div className='w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>{selectedTag?.name}</strong>
        </div>
      </div>
      <div className='w-full mt-4 flex align-items-center'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Tag.Info' />} leftIcon='pi pi-sliders-h mr-2'>
            <div className='flex justify-content-center'>
              {existItem && (
                <Message severity='error' text='The Tag is Already Exist' className='w-6' />
              )}
            </div>
            <Card
              title={title}
              footer={footer}
              className='flex flex-column mt-6 p-2 w-full md:w-9 lg:w-9 xl:w-6'
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
            >
              <div className=' flex flex-column'>
                {selectedTag?.id && (
                  <div className='my-3'>
                    <label>
                      <OlangItem olang='Label' />
                      {_labelValidator?.isRequired == 1 && (
                        <span className='h3 text-danger'>*</span>
                      )}
                    </label>
                    <InputText
                      name='label'
                      className={`w-full ${
                        formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : null
                      }`}
                      onChange={formik.handleChange}
                      value={formik.values?.label}
                      disabled={selectedTag?.id != 0 ? true : false}
                    />
                  </div>
                )}
                <div className='my-3'>
                  <label>
                    <OlangItem olang='Emplacément' />
                  </label>
                  <Dropdown
                    id='LocationID'
                    name='LocationID'
                    filter
                    value={formik.values?.LocationID}
                    options={(worksites || []).map(o => ({label: o.name, value: o.type+':'+o.id}))}
                    // optionLabel='name'
                    // optionValue='id'
                    onChange={e => {
                      console.log('location changed', e);
                      formik.handleChange(e)
                    }}
                    placeholder={'Select '}
                    className={`w-full ${
                      formik.errors?.status && formik.submitCount > 0 ? 'p-invalid' : null
                    }`}
                  />
                </div>
                <div className='my-3'>
                  <label>
                    <OlangItem olang='Status' />
                    {_statusValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <Dropdown
                    id='statusid'
                    name='statusid'
                    value={formik.values?.statusid}
                    options={statusOption}
                    optionLabel='name'
                    optionValue='value'
                    onChange={formik.handleChange}
                    placeholder={'Select status'}
                    className={`w-full ${
                      formik.errors?.status && formik.submitCount > 0 ? 'p-invalid' : null
                    }`}
                  />
                </div>
                <div className='my-3'>
                  <label>
                    <OlangItem olang='Famille' />
                    {_familleValidator?.isRequired == 1 && (
                      <span className='h3 text-danger'>*</span>
                    )}
                  </label>
                  <Dropdown
                    id='familleId'
                    name='familleId'
                    options={familles}
                    optionLabel='label'
                    optionValue='id'
                    onChange={formik.handleChange}
                    value={`${formik.values?.familleId}`}
                    placeholder={'select famille'}
                    className={`w-full ${
                      formik.errors?.famille && formik.submitCount > 0 ? 'p-invalid' : null
                    }`}
                  />
                </div>

                <div className='my-3 mt-6 flex align-items-center gap-2'>
                  <label>
                    <OlangItem olang='Active' />
                  </label>
                  <InputSwitch
                    id='active'
                    name='active'
                    checked={formik.values.active}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default memo(TagDetail)
