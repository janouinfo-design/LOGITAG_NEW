import React, {useEffect, useRef, useState, memo} from 'react'
import {TabPanel, TabView} from 'primereact/tabview'
import {Toast} from 'primereact/toast'

import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchStatus,
  fetchTags,
  getAlreadyExist,
  getSelectedStatus,
  getStatus,
  setSelectedStatus,
  setShow,
} from '../../slice/status.slice'
import {InputText} from 'primereact/inputtext'
import {Message} from 'primereact/message'
import {Dropdown} from 'primereact/dropdown'
import {InputSwitch} from 'primereact/inputswitch'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Card} from 'primereact/card'
import {useNavigate} from 'react-router-dom'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'

const StatusDetail = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [statusClick, setStatusClick] = useState()
  const [statusOption, setStatusOption] = useState([])
  const [showToast, setShowToast] = useState(false)
  const toast = useRef(null)
  let selectedTag = useAppSelector(getSelectedStatus)
  // const existItem = useAppSelector(getAlreadyExist)
  const navigate = useNavigate()
  let status = useAppSelector(getStatus)
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      ...selectedTag,
      active: selectedTag ? selectedTag?.active === 1 : true,
    },
    // onSubmit: (values, {resetForm}) => {
    //   dispatch(createOrUpdateTag(values)).then((res) => {
    //     if (res.payload) {
    //       dispatch(fetchTags())
    //       dispatch(setShow(true))
    //     }
    //   })
    //   dispatch(setSelectedStatus(null))
    //   setTimeout(() => {
    //     resetForm()
    //   }, 2000)
    // },
  })

  const handleFormChange = (e) => {
    formik.handleChange(e)
    setIsValid(true)
  }

  useEffect(() => {
    formik.setValues({
      ...selectedTag,
      active: selectedTag ? selectedTag.active === 1 : true,
    })
  }, [selectedTag])

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedTag)
    old = {...old, [e.target.name]: e.target.value}
    dispatch(setSelectedStatus(old))
    setIsValid(true)
  }


  const onHide = () => {
    dispatch(setShow(true))
  }

  useEffect(() => {
    setInputs(selectedTag || {})
  }, [selectedTag])

  // const onSave = async () => {
  //   dispatch(createOrUpdateTag(statusClick)).then((res) => {
  //     if (res.payload) {
  //       dispatch(fetchTags())
  //       show()
  //       dispatch(setShow(true))
  //       setIsValid(false)
  //     }
  //   })
  // }

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

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={formik.handleSubmit} className='ml-2' disabled={!isValid}>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )


  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>Tag {selectedTag?.code}</span>
    </>
  )

  const handleStatusChange = (e) => {
    formik.setFieldValue('status', e.value)
    setIsValid(true)
  }
  const show = () => {
    toast.current.show({severity: 'success', summary: 'success', detail: 'Tag Is Updated'})
  }

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
          <strong className='p-3'>{selectedTag?.code}</strong>
        </div>
      </div>
      <div className='w-full mt-4 flex align-items-center'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Tag.Info' />} leftIcon='pi pi-sliders-h mr-2'>
            <div className='flex justify-content-center'>
              {/* {existItem && (
                <Message severity='error' text='The Tag is Already Exist' className='w-6' />
              )} */}
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
                {/* <div className='flex justify-content-center p-2'>
                  <h3>
                    ID TAG: <span className='ml-2'>{selectedTag?.code}</span>
                  </h3>
                </div> */}
                {selectedTag?.id && (
                  <div className='my-3'>
                    <label>
                      <OlangItem olang='Label' />
                    </label>
                    <InputText
                      name='label'
                      className='w-full'
                      onChange={handleFormChange}
                      value={formik.values?.label}
                    />
                  </div>
                )}
                <div className='my-3'>
                  <label>
                    <OlangItem olang='Status' />
                  </label>
                  <Dropdown
                    name='status'
                    value={formik.values?.status}
                    options={statusOption}
                    optionLabel='name'
                    onChange={handleStatusChange}
                    placeholder={`${selectedTag?.status || 'Select status'}`}
                    className='w-full'
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
                    onChange={handleFormChange}
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

export default memo(StatusDetail)
