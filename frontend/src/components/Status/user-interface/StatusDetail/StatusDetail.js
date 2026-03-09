import React, {useEffect, useRef, useState, memo} from 'react'
import {TabPanel, TabView} from 'primereact/tabview'
import {Toast} from 'primereact/toast'

import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchStatus,
  fetchTags,
  getAlreadyExist,
  getSelectedObject,
  getSelectedStatus,
  getStatus,
  saveStatus,
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
import IconDropdown from '../../../shared/IconDropdown/IconDropdown'
import {fetchIcons, getIcons} from '../../../Famillies/slice/famille.slice'
import {ColorPicker} from 'primereact/colorpicker'
import StatusTransition from '../Transition/Transition'

const StatusDetail = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [statusClick, setStatusClick] = useState()
  const [showToast, setShowToast] = useState(false)
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
    onSubmit: (values, {resetForm}) => {
      let obj = {
        id: selectedStatus?.id,
        name: selectedStatus?.name,
        label: values.label,
        backgroundColor: `${values.backgroundColor.startsWith('#') ? '' : '#'}${
          values.backgroundColor
        }`,
        iconId: values.iconId,
      }
      dispatch(saveStatus(obj)).then((res) => {
        if (res.payload) {
          dispatch(fetchStatus())
          dispatch(setShow(true))
        }
      })

      // dispatch(createOrUpdateTag(values)).then((res) => {
      //   if (res.payload) {
      //     dispatch(fetchTags())
      //     dispatch(setShow(true))
      //   }
      // })
      // dispatch(setSelectedStatus(null))
      // setTimeout(() => {
      //   resetForm()
      // }, 2000)
    },
  })

  const optionTemplate = (option) => {
    return (
      <div className='flex'>
        <i className={`${option?.icon} text-2xl`} />
        <span className='ml-2'>{option?.icon}</span>
      </div>
    )
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

  const onHide = () => {
    dispatch(setShow(true))
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
        <OlangItem olang='source' /> {selectedObj?.name || ''}
      </span>
    </>
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

  // useEffect(() => {
  //   setInputs(selectedStatus || {})
  // }, [selectedStatus])

  useEffect(() => {
    dispatch(fetchIcons()).then(() => {})
    dispatch(fetchStatus())
  }, [])

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
          <strong className='p-3'>{selectedStatus?.code}</strong>
        </div>
      </div>

      <TabView>
        <TabPanel leftIcon="pi pi-cog mr-2" header={<OlangItem olang='Details' />}>
          <div className='w-full mt-4 flex align-items-center'>
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
                        ID TAG: <span className='ml-2'>{selectedStatus?.code}</span>
                      </h3>
                    </div> */}
                {selectedStatus?.id && (
                  <div className='my-3'>
                    <label>
                      <OlangItem olang='Label.st' />
                    </label>
                    <InputText
                      name='label'
                      className='w-full font-semibold text-lg'
                      onChange={handleFormChange}
                      value={formik.values?.label}
                    />
                  </div>
                )}
                <div className='my-3'>
                  <label>
                    <OlangItem olang='icon' />
                  </label>
                  {/* <IconDropdown
                    className={`w-full font-semibold text-lg`}
                    name={'iconId'}
                    filter={true}
                    optionValue='iconId'
                    filterBy={'name'}
                    data={icons}
                    onChange={formik.handleChange}
                    value={formik.values.iconId}
                  /> */}
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
                    className='w-full font-semibold text-lg'
                  />
                </div>
                {/* <div className='my-3 mt-6 flex align-items-center gap-2'>
                      <label>
                        <OlangItem olang='Active' />
                      </label>
                      <InputSwitch
                        id='active'
                        name='active'
                        checked={formik.values.active}
                        onChange={handleFormChange}
                      />
                    </div> */}
                <div className='my-4 mt-5'>
                  <label htmlFor='color'>
                    <OlangItem olang='color' />{' '}
                  </label>
                  <div>
                    <ColorPicker
                      name='backgroundColor'
                      value={formik.values.backgroundColor}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>
        <TabPanel leftIcon="pi pi-link mr-2"  header={<OlangItem olang='transitions' />}>
          <StatusTransition filter={{ statusId: selectedStatus?.id }} />
        </TabPanel>
      </TabView>
      
    </>
  )
}
export default StatusDetail
