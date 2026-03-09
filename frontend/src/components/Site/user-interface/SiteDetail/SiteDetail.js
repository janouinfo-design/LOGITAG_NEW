import {memo, useEffect, useRef, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import {InputSwitch} from 'primereact/inputswitch'
import {Dropdown} from 'primereact/dropdown'
import {Message} from 'primereact/message'
import {Panel} from 'primereact/panel'
import {Card} from 'primereact/card'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateSite,
  fetchGeoForSite,
  fetchSites,
  getAlreadyExist,
  getEditSite,
  getGeoSite,
  getSelectedSite,
  setDetailSite,
  setEditSite,
  setExistItem,
  setLinkTo,
  setSelectedSite,
  setShowMap,
  setShowMapSite,
} from '../../slice/site.slice'
import {
  fetchCustomers,
  getCustomers,
  setDetailShow,
  setDetailSiteClient,
} from '../../../../store/slices/customer.slice'

import _ from 'lodash'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  getGeoData,
  getGeofencing,
  getHashs,
  getUserAuth,
  setSelectedGeo,
} from '../../../Navigxy/slice/navixy.slice'
import GeofecingSite from './GeofencingSite'
import GeofencingComponent from '../../../Geofencing/GeofencingComponent'
import {Accordion, AccordionTab} from 'primereact/accordion'
import {Button} from 'primereact/button'
import {useFormik} from 'formik'
import {
  fetchGeofencings,
  fetchPointGeoLocal,
  getGeofences,
} from '../../../../store/slices/geofencing.slice'
import {useLocation} from 'react-router-dom'
import {useApi} from '../../../../hooks/useApi'
import {
  fetchAddresses,
  getAddressesSelectedSite,
  getSelectedAddress,
} from '../../slice/addressSite.slice'
import MapComponent from '../../../shared/MapComponent/user-interface/MapComponent'
import {fetchValidator, getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {Toast} from 'primereact/toast'

function SiteDetail({selectedSite, client, onShow, onShowMap}) {
  const toast = useRef(null)

  const existItem = useAppSelector(getAlreadyExist)

  let hash = useAppSelector(getHashs)
  const {apiCall} = useApi()

  const [isValid, setIsValid] = useState(true)
  const validators = useSelector(getValidator)

  const dispatch = useAppDispatch()

  const onHide = () => {
    dispatch(setDetailSite(true))
  }

  const formik = useFormik({
    initialValues: {
      ..._.cloneDeep(selectedSite),
      active: selectedSite ? selectedSite?.active === 1 : true,
    },
    validate: (data) => {
      let errors = {}
      validators.forEach((validator) => {
        const _regExp = new RegExp(validator.regExp.slice(1, -1))
        if (validator.isRequired) {
          if (!data[validator.id]) {
            errors[validator.id] = '*'
          }
          if (!_regExp.test(data[validator.id])) {
            errors[validator.id] = validator.messageError
          }
        }
      })
      setIsValid(Object.keys(errors).length === 0)
      return errors
    },
    onSubmit: (values, {resetForm}) => {
      dispatch(setSelectedSite(values))
      const errors = formik.validateForm(values)
      if (Object.keys(errors).length === 0) {
        dispatch(createOrUpdateSite()).then((res) => {
          if (res.payload) {
            toast.current.show({
              severity: 'success',
              summary: 'Successful',
              detail: 'Site Updated',
              life: 2000,
            })
          }
        })
      }
    },
  })

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  useEffect(() => {
    if (selectedSite === null) {
      dispatch(setDetailSite(true))
    } else {
      dispatch(fetchGeoForSite(selectedSite?.id))
    }
  }, [dispatch, selectedSite])

  useEffect(() => {
    apiCall(fetchGeofencings)
    apiCall(() => getGeofencing(hash))
  }, [])

  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>Info.{selectedSite?.name}</span>
    </>
  )

  useEffect(() => {
    dispatch(fetchAddresses(selectedSite?.id))
  }, [])

  let showMapSite = false
  let adressesSiteFound = useAppSelector(getAddressesSelectedSite)
  if (
    adressesSiteFound.length == 0 ||
    adressesSiteFound == null ||
    adressesSiteFound == undefined
  ) {
    showMapSite = false
  } else if (
    (adressesSiteFound.length > 0 && adressesSiteFound[0]?.lat == '') ||
    adressesSiteFound[0]?.lng == '' ||
    adressesSiteFound[0]?.Address == ''
  ) {
    showMapSite = false
  } else {
    showMapSite = true
  }
  const handleFormChange = (e) => {
    formik.handleChange(e)
  }

  const _nameValidator = validators?.find((field) => field.id === 'name')
  const _labelValidator = validators?.find((field) => field.id === 'label')

  return (
    <>
      <div className='flex align-items-center justify-content-between'></div>
      <Toast ref={toast} position='bottom-right' />
      <div className='flex'>
        <Card
          className='w-full md:w-10 lg:w-full xl:w-6 mt-3 p-2 ml-4'
          title={title}
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            borderRadius: '15px',
          }}
        >
          <div className='my-3'>
            <label className='my-2 ml-1'>
              <OlangItem olang='label' />
              {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='label'
              className={`w-full font-semibold text-lg ${
                formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.label}
            />
            {_labelValidator?.isRequired == 1 && (
              <small className='p-error'>{_labelValidator?.messageError}</small>
            )}
          </div>
          <div className='my-3'>
            <label htmlFor='name' className='my-2 ml-1'>
              <OlangItem olang='Name' />
              {_nameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='name'
              className={`w-full font-semibold text-lg ${
                formik.errors?.name && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.name}
            />
            {_nameValidator?.isRequired == 1 && (
              <small className='p-error'>{_nameValidator?.messageError}</small>
            )}
          </div>
          <div className='my-3 flex align-items-center gap-2 mt-3'>
            <label className='my-2 ml-1'>
              <OlangItem olang='Active' />
            </label>
            <InputSwitch
              id='active'
              name='active'
              checked={formik.values.active}
              onChange={handleFormChange}
            />
          </div>
          <div>
            <div className='flex justify-content-end'>
              <ButtonComponent className='p-button-danger' onClick={onHide}>
                <OlangItem olang='Annuler' />
              </ButtonComponent>
              <ButtonComponent onClick={formik.handleSubmit} className='ml-2'>
                <OlangItem olang='Enregistrer' />
              </ButtonComponent>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

export default memo(SiteDetail)
