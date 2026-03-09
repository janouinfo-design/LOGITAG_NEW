import React, {useEffect, useState, memo} from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {FileUploadeComponent} from '../../shared/FileUploaderComponent/FileUploadeComponent'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import SiteEditor from '../../Site/user-interface/SiteEditor/SiteEditor'
import {Dropdown} from 'primereact/dropdown'
import TagList from '../../Tag/user-interface/TagList/TagList'
import SiteList from '../../Site/user-interface/SiteList/SiteList'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateCustomer,
  fetchCustomerAddress,
  fetchCustomerTags,
  fetchCustomers,
  fetchSitesClient,
  getAddressDetail,
  getCustomerAddress,
  getCustomerTags,
  getEditCustomer,
  getSelectedCustomer,
  getSelectedTagClient,
  getTag,
  removeClientTag,
  setAddressDetail,
  setDetailShow,
  setDetailSiteClient,
  setEditTagClient,
  setSelectedCustomer,
  setSelectedSiteClient,
  setSelectedTagClient,
  setTag,
} from '../../../store/slices/customer.slice'
import _ from 'lodash'
import TagEditor from '../../Tag/user-interface/TagEditor/TagEditor'
import {Image} from 'primereact/image'
import {useLocation, useNavigate} from 'react-router-dom'
import {Button} from 'primereact/button'
import SiteDetail from '../../Site/user-interface/SiteDetail/SiteDetail'
import {
  createOrUpdateSite,
  fetchSites,
  getDetailSite,
  getShowMapSite,
  getSites,
  setDetailSite,
  setEditSite,
  setGeoSite,
  setGeoSiteSelectedSite,
  setSelectedSite,
  setShowMapSite,
} from '../../Site/slice/site.slice'
import SiteComponent from '../../Site/user-interface/SiteComponent'
import CompanyComponent from '../../Company/user-interface/Company.component'
import {
  createOrUpdateAddress,
  getCompanyAddresses,
  getEditAddress,
  setSelectedAddress,
} from '../../Company/slice/company.slice'
import AddressDetail from '../../Company/user-interface/AddressDetail/AddressDetail'
import AddressesComponent from '../../shared/AddressesComponent/Addresses.Component'
import SiteClientComponent from './SiteClientComponent'
import EditeTagClient from '../CustomerEditor/EditeTagClient'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {createOrUpdateTag, fetchStatus, fetchTags, setSelectedTag} from '../../Tag/slice/tag.slice'
import {setGeofencesSelectedSite} from '../../shared/MapComponent/slice/geofencing.slice'
import {fetchValidator, getValidator} from '../../Inventory/slice/inventory.slice'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {useSelector} from 'react-redux'

const ClientDetail = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [imageChange, setImageChange] = useState(false)
  const [imageId, setImageId] = useState()
  const [siteOptions, setSiteOptions] = useState([])
  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const validators = useSelector(getValidator)
  const dispatch = useAppDispatch()
  const selectedCustomer = useAppSelector(getSelectedCustomer)
  const sites = useAppSelector(getSites)
  const tags = useAppSelector(getCustomerTags)
  const editCustomer = useAppSelector(getEditCustomer)
  const showDetail = useAppSelector(getDetailSite)

  const location = useLocation()

  let editAddress = useAppSelector(getAddressDetail)
  let customerAddress = useAppSelector(getCustomerAddress)
  let tagEdit = useAppSelector(getTag)
  let selectedTagClient = useAppSelector(getSelectedTagClient)
  let showMap = useAppSelector(getShowMapSite)

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedCustomer)
    old = {...old, imageid: imageId, [e.target.name]: e.target.value}
    dispatch(setSelectedCustomer(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  const onFinishedUpload = async (e) => {
    setIsValid(true)
    const imageid = await e.data[0].id
    setImageId(imageid)
    setIsValid(true)
  }

  const onSave = async (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedCustomer?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)

    //   return
    // }
    dispatch(createOrUpdateCustomer(imageId)).then((res) => {
      if (res.payload) {
        dispatch(fetchCustomers())
        dispatch(setDetailShow(true))
      }
    })
  }
  const saveTag = (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedCustomer?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
    dispatch(createOrUpdateTag(e)).then((res) => {
      if (res.payload) {
        dispatch(fetchCustomerTags(selectedCustomer.id))
        dispatch(setTag(false))
        dispatch(setSelectedTag(null))
      }
    })
  }

  useEffect(() => {
    if (selectedCustomer == null) {
      dispatch(setDetailShow(true))
    }
  }, [selectedCustomer])

  const onHide = () => {
    dispatch(setDetailShow(true))
  }

  useEffect(() => {
    setSiteOptions([
      {label: 'All', value: 0},
      ...sites?.map((st) => ({
        label: st.name,
        value: st.id,
      })),
    ])
  }, [sites])

  useEffect(() => {
    dispatch(fetchCustomerAddress())
  }, [selectedCustomer])

  useEffect(() => {
    dispatch(fetchSites())
    dispatch(fetchTags())
    dispatch(fetchStatus())
    dispatch(fetchCustomerTags(selectedCustomer?.id))
    dispatch(fetchSitesClient())
  }, [])

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={onSave} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>{selectedCustomer?.label}</span>
    </>
  )
  const addSiteClient = () => {
    dispatch(fetchValidator('worksite'))
    dispatch(setEditSite(true))
    dispatch(setSelectedSite(null))
  }
  const onSaveSite = () => {
    dispatch(createOrUpdateSite(selectedCustomer.id)).then((res) => {
      if (res.payload) {
        dispatch(setEditSite(false))
        dispatch(setDetailSiteClient(true))
      }
    })
  }

  const saveAddress = (e) => {
    dispatch(setSelectedAddress(e))
    dispatch(createOrUpdateAddress(e)).then((res) => {
      if (res.payload) {
        dispatch(setAddressDetail(false))
        dispatch(fetchCustomerAddress())
        dispatch(setSelectedAddress(null))
      }
    })
  }

  const addresseeTemplate = (rowData) => {
    return (
      <>
        <Chip
          label={rowData.dateCreation}
          className='w-11rem m-1 flex justify-content-center align-items-center'
        />
      </>
    )
  }
  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )

  const onHideTag = () => {
    dispatch(setSelectedTag(null))
    dispatch(setTag(false))
  }

  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID Tag',
    },
    {
      header: 'Creation Date',
      field: null,
      olang: 'Creation.Date',
      body: addresseeTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  const onHideDetail = () => {
    dispatch(setDetailShow(true))
    dispatch(setDetailSiteClient(false))
    dispatch(setSelectedSiteClient(null))
    dispatch(setGeoSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setSelectedSite(null))
    dispatch(setGeofencesSelectedSite(null))
  }
  const _codeValidator = validators.find((validator) => validator.id === 'code')
  const _labelValidator = validators.find((validator) => validator.id === 'label')
  return (
    <>
      <TagEditor
        visible={tagEdit}
        selectedTag={selectedTagClient}
        onHide={onHideTag}
        client={true}
        onSubmitHandler={(e) => saveTag(e)}
      />
      <EditeTagClient />
      <SiteEditor selectedCLient={selectedCustomer} save={onSaveSite} />
      <div className='mt-3 flex align-items-center justify-content-between'>
        <div>
          <ButtonComponent onClick={onHideDetail}>
            <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
            <div className='ml-2 text-base font-semibold'>
              <OlangItem olang='btn.back' />
            </div>
          </ButtonComponent>
          <ButtonComponent onClick={addSiteClient} className='ml-2 border-1'>
            <i class='pi pi-plus text-white'></i>
            <div className='ml-2 text-white font-bold text-base'>
              <OlangItem olang='btn.addSite' />
            </div>
          </ButtonComponent>
        </div>
        <div className='w-3 flex align-items-center justify-content-center text-xl'>
          <strong className=' p-3'>{selectedCustomer?.label}</strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Customer.Info' />} leftIcon='pi pi-user mr-2'>
            <Card
              className='w-full md:w-9 lg:w-10 xl:w-6 mt-6 p-2'
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
              title={title}
              footer={footer}
            >
              <div className='flex flex-column justify-content-center'>
                {imageChange ? (
                  <div>
                    <i
                      className='pi pi-times cursor-pointer'
                      style={{marginLeft: '98%'}}
                      onClick={() => setImageChange(!imageChange)}
                    ></i>
                    <FileUploadeComponent
                      accept={'image/*'}
                      onUploadFinished={onFinishedUpload}
                      uploadExtraInfo={{
                        src: 'customer',
                        srcID: selectedCustomer?.id || 0,
                        id: selectedCustomer?.imageid || 0,
                        desc: 'profile',
                      }}
                    />
                  </div>
                ) : (
                  <div className='w-5'>
                    <div>
                      <Button
                        icon='pi pi-pencil'
                        className='ml-8 h-2rem w-2rem '
                        rounded
                        severity='secondary'
                        aria-label='User'
                        onClick={() => setImageChange(!imageChange)}
                      />
                    </div>
                    <Image
                      src={`${API_BASE_URL_IMAGE}${selectedCustomer?.image}`}
                      alt='Image'
                      width='80'
                      preview
                      imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                    />
                  </div>
                )}
                <div className='flex flex-column my-2 w-12 mt-5'>
                  <label htmlFor='code'>
                    <OlangItem olang='Nom' />
                    {_codeValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    id='code'
                    name='code'
                    value={selectedCustomer?.code}
                    onChange={onInputChange}
                    placeholder='Client'
                    className={`font-semibold text-lg  ${
                      inputValidity['code'] == false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='flex flex-column my-2 w-12'>
                  <label htmlFor='label'>
                    <OlangItem olang='Label' />
                    {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    id='label'
                    name='label'
                    value={selectedCustomer?.label}
                    onChange={onInputChange}
                    placeholder='label'
                    className={`font-semibold text-lg ${
                      inputValidity['label'] == false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='flex flex-column my-2 w-12'>
                  <label className='p-2'>
                    <OlangItem olang='IDE' />
                  </label>
                  <InputText
                    name='NPA'
                    value={selectedCustomer?.NPA}
                    onChange={onInputChange}
                    placeholder='IDE'
                    className='font-semibold text-lg'
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
          <TabPanel
            header={<OlangItem olang='Customer.address' />}
            leftIcon='pi pi-map-marker mr-2'
          >
            <div>
              {editAddress == true ? (
                <AddressDetail client={true} handleSaveAddress={(e) => saveAddress(e)} />
              ) : (
                <div className='flex flex-wrap lg:ml-5 w-full'>
                  {customerAddress &&
                    customerAddress?.map((address) => (
                      <AddressesComponent
                        client={true}
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
          <TabPanel header={<OlangItem olang='Customer.sites' />}>
            <SiteClientComponent />
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default memo(ClientDetail)
