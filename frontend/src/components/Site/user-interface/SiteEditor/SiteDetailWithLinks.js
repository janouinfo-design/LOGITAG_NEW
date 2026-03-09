import React, {memo, useEffect} from 'react'
import {TabView, TabPanel} from 'primereact/tabview'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import SiteAndGeo from '../SiteDetail/SiteAndGeo'
import CalendarViewSite from '../SiteDetail/CalendarViewSite'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  createOrUpdateAddress,
  fetchAddresses,
  getAddressDetail,
  getAddressesSelectedSite,
  setAddressDetail,
  setSelectedAddress,
} from '../../slice/addressSite.slice'
import AddressDetail from '../SiteDetail/Address/AddressDetail/AddressDetail'
import AddressesSiteComponent from '../SiteDetail/Address/AddressesSite.Component'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getSelectedSite} from '../../slice/site.slice'
import MapComponent from '../../../shared/MapComponent/user-interface/MapComponent'
import MapComponentSelectedSite from '../SiteDetail/Map/MapComponentSelectedSite'

const SiteDetailWithLinks = () => {
  const editAddress = useAppSelector(getAddressDetail)
  const selectedSite = useAppSelector(getSelectedSite)
  const addresses = useAppSelector(getAddressesSelectedSite)
  const dispatch = useAppDispatch()

  let showMapSite = false

  if (addresses.length == 0 || addresses == null || addresses == undefined) {
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

  const saveAddress = (e) => {
    dispatch(setSelectedAddress(e))
    dispatch(createOrUpdateAddress(e)).then((res) => {
      if (res.payload) {
        dispatch(setAddressDetail(false))
        dispatch(fetchAddresses(selectedSite?.id))
        dispatch(setSelectedAddress(null))
      }
    })
  }

  return (
    <div className='w-full mt-4 flex align-items-center'>
      <TabView className='w-full'>
        <TabPanel header='Site.info' leftIcon='pi pi-user mr-2'>
          <SiteAndGeo />
        </TabPanel>
        <TabPanel header={<OlangItem olang='Site.address' />} leftIcon='pi pi-map-marker mr-2'>
          {editAddress ? (
            <AddressDetail client={true} handleSaveAddress={saveAddress} />
          ) : (
            <div className='flex flex-wrap lg:ml-5 w-full'>
              {addresses &&
                addresses.map((address) => (
                  <AddressesSiteComponent
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
          <TabPanel header={<OlangItem olang='Site.geofencing' />} leftIcon='pi pi-map-marker mr-2'>
            <MapComponentSelectedSite />
            {/* <MapComponent /> */}
          </TabPanel>
        )}
        <TabPanel header='Site.timeline'>
          <CalendarViewSite />
        </TabPanel>
      </TabView>
    </div>
  )
}

export default memo(SiteDetailWithLinks)
