import {TabPanel, TabView} from 'primereact/tabview'
import DepotAndGeo from './DepotAndGeo'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  getSelectedDepot,
  setDetailDepot,
  setGeoDepotSelectedDepot,
  setSelectedDepot,
} from '../../slice/depot.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import AddressesDepotComponent from './address/AddressesDepotComponent'
import {
  createOrUpdateAddress,
  fetchAddresses,
  getAddressDetail,
  getAddresses,
  setAddressDetail,
  setSelectedAddress,
} from '../../slice/addressDepot.slice'
import AddressDetail from './address/AddressDetail/AddressDetail'
import {useEffect} from 'react'
import MapComponentSelectedDepot from './Map/MapComponentSelectedDepot'

const DepotDetailWithLinks = () => {
  const dispatch = useAppDispatch()
  const editAddress = useAppSelector(getAddressDetail)
  const addresses = useAppSelector(getAddresses)
  const selectedDepot = useAppSelector(getSelectedDepot)
  const _addresses = [
    {
      id: 31017,
      type: 'Adresse de depot',
      contact: '',
      name: 'depot',
      Address: 'Casablanca, Morocco',
      zipCode: '',
      city: '',
      Country: 'Morocco',
      CellPhone: '',
      Phone: '',
      Email: '',
      Fax: '',
      lat: '33.5777804',
      lng: '-7.630010799999999',
      isDefault: 0,
      active: 1,
      town: 'Casablanca',
      lat1: '33.5777804',
      lng1: '-7.630010799999999',
      addressNumber: '',
      route: '',
    },
  ]

  let showMapSite = false

  if (
    (Array.isArray(addresses) && addresses?.length == 0) ||
    addresses == null ||
    addresses == undefined
  ) {
    showMapSite = false
  } else if (
    (addresses.length > 0 && addresses[0]?.lat == '') ||
    addresses[0]?.lng == '' ||
    addresses[0]?.Address == ''
  ) {
    showMapSite = false
  } else {
    showMapSite = true
  }

  const onHide = () => {
    dispatch(setSelectedDepot(null))
    dispatch(setGeoDepotSelectedDepot([]))
    dispatch(setDetailDepot(false))
  }
  const saveAddress = (e) => {
    dispatch(setSelectedAddress)
    dispatch(createOrUpdateAddress(e)).then((res) => {
      if (res.payload) {
        dispatch(setAddressDetail(false))
        dispatch(fetchAddresses(selectedDepot?.id))
        dispatch(setSelectedAddress(null))
      }
    })
  }
  useEffect(() => {
    dispatch(fetchAddresses(selectedDepot?.id))
  }, [selectedDepot?.id])
  return (
    <>
      <ButtonComponent onClick={onHide}>
        <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
        <div className='ml-2 text-base font-semibold'>
          <OlangItem olang='btn.back' />
        </div>
      </ButtonComponent>
      <div className='w-full mt-4 flex align-items-center'>
        <TabView className='w-full'>
          <TabPanel header='Depot.info' leftIcon='pi pi-user mr-2'>
            <DepotAndGeo />
          </TabPanel>
          <TabPanel header={<OlangItem olang='Depot.address' />} leftIcon='pi pi-map-marker mr-2'>
            {editAddress ? (
              <AddressDetail client={true} handleSaveAddress={saveAddress} />
            ) : (
              <div className='flex flex-wrap lg:ml-5 w-full'>
                {addresses &&
                  addresses.map((address) => (
                    <AddressesDepotComponent
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
          </TabPanel>
          {showMapSite && (
            <TabPanel
              header={<OlangItem olang='Depot.geofencing' />}
              leftIcon='pi pi-map-marker mr-2'
            >
              <MapComponentSelectedDepot addresses={addresses} />
            </TabPanel>
          )}
        </TabView>
      </div>
    </>
  )
}

export default DepotDetailWithLinks
