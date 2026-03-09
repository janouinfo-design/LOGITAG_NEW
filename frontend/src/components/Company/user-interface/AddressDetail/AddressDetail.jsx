import {InputText} from 'primereact/inputtext'
import React, {useEffect, useState, memo} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateAddress,
  fetchCompanyAddresses,
  getCompanyAddresses,
  getSelectedAddress,
  setEditAddress,
  setSelectedAddress,
} from '../../slice/company.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Card} from 'primereact/card'
import _ from 'lodash'
import {fetchCustomerAddress, setAddressDetail} from '../../../../store/slices/customer.slice'
import {MapSearchComponent} from '../../../shared/MapSearch/user-interface/MapSearchComponent/MapSearchComponent'
import {InputNumber} from 'primereact/inputnumber'
import {Button} from 'primereact/button'
import {useFormik} from 'formik'

const AddressDetail = ({client, handleSaveAddress}) => {
  const [mapInfo, setMapInfo] = useState({})
  const [addressMap, setAddressMap] = useState('')
  const [addresses, setAddresses] = useState({
    town: '',
    country: '',
    fullAddress: '',
    zipCode: '',
  })
  const selectedAddress = useAppSelector(getSelectedAddress)
  const getCompanyAddress = useAppSelector(getCompanyAddresses)
  const dispatch = useAppDispatch()


  const formik = useFormik({
    initialValues: _.cloneDeep(selectedAddress),
    onSubmit: (values) => {
      handleSaveAddress(values)
    },
  })

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedAddress)
    old = {
      ...old,
      ...addresses,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedAddress(old))
  }

  const save = () => {
    dispatch(createOrUpdateAddress(addresses)).then((res) => {
      if (res.payload) {
        dispatch(fetchCompanyAddresses())
        dispatch(setEditAddress(false))
      }
    })
  }
  const onSetSelectedAddress = (addr) => {
    dispatch(setSelectedAddress(addr))
  }

  useEffect(() => {
    let obj = {}
    addressMap?.address_components?.forEach((component) => {
      const {types, long_name} = component
      types.forEach((type) => {
        obj[type] = long_name
      })
    })

    formik.setFieldValue('Address', addressMap?.formatted_address || selectedAddress?.Address)
    formik.setFieldValue('town', obj?.locality || selectedAddress?.town)
    formik.setFieldValue('route', obj?.route || selectedAddress?.route)
    formik.setFieldValue('zipCode', obj?.postal_code || selectedAddress?.zipCode)
    formik.setFieldValue('Country', obj?.country || selectedAddress?.Country)
    formik.setFieldValue(
      'lat',
      addressMap?.geometry?.location?.lat().toString()?.replace('.', ',') || selectedAddress?.lat
    )
    formik.setFieldValue(
      'lng',
      addressMap?.geometry?.location?.lng().toString()?.replace('.', ',') || selectedAddress?.lng
    )
  }, [addressMap])

  const handleBack = () => {
    if (client) {
      dispatch(setAddressDetail(false))
    } else {
      dispatch(setEditAddress(false))
    }
  }
  useEffect(() => {
    if (selectedAddress == null) {
      dispatch(setEditAddress(false))
    }
  }, [selectedAddress])

  return (
    <div className='row'>
      <div className='col-lg-12 col-md-12 col-sm-12'>
        {client ? (
          <ButtonComponent onClick={handleBack}>
            <i class='fa-solid fa-share fa-flip-horizontal text-white mr-2'></i>
            <OlangItem olang='btn.back' />
          </ButtonComponent>
        ) : (
          <ButtonComponent onClick={handleBack}>
            <i class='fa-solid fa-share fa-flip-horizontal text-white mr-2'></i>
            <OlangItem olang='btn.back' />
          </ButtonComponent>
        )}
      </div>
      <div className='col-lg-12 col-md-12 col-sm-12 '>
        <div className='container p-5'>
          <div className='row'>
            <div className='col-lg-12 col-md-12 col-sm-12'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Name' />
                </label>
                <div className='border-round font-semibold xl:text-2xl sm:text-sm'>
                  {selectedAddress?.type}
                </div>
              </div>
            </div>
            <div className='hidden col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Contact' />
                </label>
                <InputText
                  name='contact'
                  placeholder='Contact'
                  className='w-6 font-semibold text-lg'
                  value={formik.values?.contact}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <MapSearchComponent
                style={{height: '700px'}}
                onAddress={(e) => {
                  setAddressMap(e)
                }}
                selectedAddress={selectedAddress}
                onSetSelectedAddress={(e) => onSetSelectedAddress(e)}
              />
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Route' />
                </label>
                <InputText
                  name='route'
                  placeholder='Route'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.route}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Postalcode' />
                </label>
                <InputText
                  name='zipCode'
                  placeholder='Code Postal'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.zipCode}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Town' />
                </label>
                <InputText
                  name='town'
                  placeholder='Town'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.town}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Country' />
                </label>
                <InputText
                  name='Country'
                  placeholder='Country'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.Country}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.number' />
                </label>
                <InputText
                  name='addressNumber'
                  placeholder='Address Number'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.addressNumber}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Phone.celltitle' />
                </label>
                <InputText
                  name='Phone'
                  placeholder='Cell Phone'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.Phone}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Fax' />
                </label>
                <InputText
                  name='Fax'
                  placeholder='Fax'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.Fax}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='flex align-items-center justify-content-between'>
                <label className=''>
                  <OlangItem olang='Address.Email' />
                </label>
                <InputText
                  name='Email'
                  placeholder='Email'
                  className='w-6 text-lg font-semibold'
                  value={formik.values?.Email}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
              <div className='w-full flex justify-content-end'>
                <ButtonComponent
                  className='w-10rem flex justify-content-center text-300 font-bold'
                  onClick={formik.handleSubmit}
                >
                  <OlangItem olang='Save' />
                </ButtonComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(AddressDetail)
