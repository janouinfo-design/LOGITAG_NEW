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
      {/* <Toast ref={messagesRef} /> */}
      {/* <div className='bg-primary w-12 my-2'>
        <h3 className=' text-white p-3'>Information</h3>
      </div> */}
      <Toast ref={toast} />
      <TabView>
        <TabPanel header={<OlangItem olang='Reception' />}>
          <Card
            className='lg:w-6 w-full md:w-6 '
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
              borderRadius: '15px',
            }}
          >
            <div className='p-2  flex flex-column'>
              <div className='flex flex-column'>
                {imageChange ? (
                  <div className='w-11'>
                    <div className='flex justify-content-end'>
                      <i
                        className='pi pi-times cursor-pointer'
                        onClick={() => setImageChange(!imageChange)}
                      ></i>
                    </div>

                    <FileUploadeComponent
                      accept={'image/*'}
                      // onUploadFinished={onFinishedUpload}
                      uploadExtraInfo={{
                        src: 'company',
                        srcID: company?.id || 0,
                        id: company?.imageid || 0,
                        desc: 'profile',
                      }}
                    />
                  </div>
                ) : (
                  <div className='w-5 flex flex-column '>
                    <div className='ml-5'>
                      <Button
                        icon='pi pi-pencil'
                        className='ml-8 h-2rem w-2rem '
                        rounded
                        severity='secondary'
                        aria-label='User'
                        onClick={() => setImageChange(!imageChange)}
                      />
                    </div>
                    <div>
                      <Image
                        src={`${API_BASE_URL_IMAGE}${company?.image}`}
                        alt='Image'
                        width='100'
                        preview
                        imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className='flex flex-column my-3'>
                <label className=''>
                  <OlangItem olang='Code' />
                </label>
                <InputText
                  name='code'
                  className='w-11 font-semibold text-lg'
                  value={company?.code}
                  onChange={onInputChange}
                />
              </div>
              <div className='flex flex-column my-3'>
                <label className=''>
                  <OlangItem olang='Label' />
                </label>
                <InputText
                  type='text'
                  name='label'
                  className='w-11 font-semibold text-lg'
                  value={company?.label}
                  onChange={onInputChange}
                />
              </div>
              <div className='flex flex-column my-3'>
                <label className=''>
                  <OlangItem olang='IDE' />
                </label>
                <InputText
                  type='text'
                  name='NPA'
                  className='w-11 font-semibold text-lg'
                  value={company?.NPA}
                  onChange={onInputChange}
                />
              </div>
              <div className='flex flex-column my-3'>
                <label className=''>
                  <OlangItem olang='Date.From' />
                </label>
                <Calendar
                  name='begDate'
                  className='w-11 font-semibold text-lg'
                  value={company?.begDate}
                  onChange={onInputChange}
                  timeOnly
                  showIcon
                  icon={() => <i className='pi pi-clock' />}
                />
              </div>
              <div className='flex flex-column my-3'>
                <label className=''>
                  <OlangItem olang='Date.To' />
                </label>
                <Calendar
                  name='endDate'
                  className='w-11 font-semibold text-lg'
                  value={company?.endDate}
                  onChange={onInputChange}
                  timeOnly
                  showIcon
                  icon={() => <i className='pi pi-clock' />}
                />
              </div>
              <div className='flex gap-2 flex-column my-3'>
                <label className=''>
                  <OlangItem olang='gpsConfig' />
                </label>
                <InputSwitch
                  name='gpsConfig'
                  className='font-semibold text-lg'
                  checked={company?.gpsConfig == 1 ? true : false}
                  onChange={onInputChange}
                />
              </div>
              <div className='flex justify-content-end w-11 mt-6 my-5'>
                <ButtonComponent onClick={save} className='w-10rem flex justify-content-center'>
                  <OlangItem olang='Save' />
                </ButtonComponent>
              </div>
            </div>
          </Card>
        </TabPanel>
        <TabPanel header={<OlangItem olang='Addresses' />} leftIcon='pi pi-map mr-2'>
          <div>
            {editAddress == true ? (
              <AddressDetail handleSaveAddress={(e) => saveAddressCompany(e)} />
            ) : (
              <div className='flex flex-wrap lg:ml-8 w-full'>
                {companyAddresses?.map((address) => (
                  <AddressesComponent
                    key={address.id}
                    className='w-full lg:w-6 mt-4'
                    id={address.id}
                    type={address.type}
                    {...address}
                  />
                ))}
              </div>
            )}
          </div>
        </TabPanel>
        <TabPanel header={<OlangItem olang='Setting' />} leftIcon='pi pi-cog mr-2'>
          <Card
            className='lg:w-6 w-full md:w-6'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
              borderRadius: '15px',
            }}
          >
            <section className='w-full px-2'>
              <div className='text-2xl font-bold'>
                <img
                  src={require('../../../../assets/images/LOGITRAK.webp')}
                  style={{width: '200px', height: '20%', objectFit: 'cover'}}
                />
                {/* <span className='text-primary'>
                  <OlangItem olang='LOGITRAK' />
                </span> */}
              </div>
              <div>
                <div className='w-full  my-3 flex flex-column'>
                  <label className='my-2 ml-1'>
                    <OlangItem olang='Email' />
                  </label>
                  <InputText
                    name='email'
                    className={`w-[90%] font-semibold text-lg ${
                      formik.errors.email && formik.touched.email ? 'p-invalid' : ''
                    }`}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    disabled={isDisabled}
                  />
                </div>
                <div className='my-3 flex flex-column'>
                  <label className='my-2 ml-1'>
                    <OlangItem olang='Password' />
                  </label>
                  <Password
                    name='password'
                    value={formik.values.password}
                    toggleMask
                    feedback={false}
                    onChange={formik.handleChange}
                    className={`font-semibold w-[90%] text-lg`}
                    inputClassName='w-full'
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className='flex xl:justify-content-end w-[90%] justify-content-end align-items-center mt-6 my-5 '>
                <ButtonComponent className='p-button-danger font-semibold mr-2' onClick={logOut}>
                  <OlangItem olang='Log.Out' />
                </ButtonComponent>
                <ButtonComponent
                  onClick={formik.handleSubmit}
                  className='w-full flex justify-content-center font-semibold '
                  disabled={isDisabled}
                >
                  <OlangItem olang='Log.In' />
                </ButtonComponent>
              </div>
            </section>
          </Card>
        </TabPanel>
      </TabView>
    </>
  )
}

export default CompanyList
