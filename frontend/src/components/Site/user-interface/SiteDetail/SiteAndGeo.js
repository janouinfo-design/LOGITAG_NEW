import React from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getSelectedSite, getShowMapSite, setShowMapSite} from '../../slice/site.slice'
import GeofecingSite from './GeofencingSite'
import SiteDetail from './SiteDetail'
import {
  fetchSitesClient,
  getDetailSiteClient,
  getSelectedSiteClient,
  setDetailSiteClient,
  setSelectedSiteClient,
} from '../../../../store/slices/customer.slice'
import {getSelectedAddress} from '../../slice/addressSite.slice'
import {setGeofencesSelectedSite} from '../../../shared/MapComponent/slice/geofencing.slice'

const SiteAndGeo = () => {
  const dispatch = useAppDispatch()
  let showDetail = useAppSelector(getDetailSiteClient)
  const selectedSiteClient = useAppSelector(getSelectedSite)

  const onHide = () => {
    dispatch(setDetailSiteClient(false))
    dispatch(setGeofencesSelectedSite(null))
    // dispatch(setSelectedSiteClient(null))
    dispatch(fetchSitesClient(selectedSiteClient?.Customerid))
  }
  let ShowMap = useAppSelector(getShowMapSite)
  // let adressesSiteFound = useAppSelector(getSelectedAddress)
  // if (adressesSiteFound.length == 0) {
  //   ShowMap = false
  // } else if (
  //   adressesSiteFound.length > 0 &&
  //   adressesSiteFound[0]?.lat == '' &&
  //   adressesSiteFound[0]?.lng == '' &&
  //   adressesSiteFound[0]?.address == ''
  // ) {
  //   ShowMap = false
  // } else {
  //   ShowMap = true
  // }

  return (
    <>
      {ShowMap ? (
        <GeofecingSite onShowMap={() => dispatch(setShowMapSite(false))} />
      ) : (
        <SiteDetail
          selectedSite={selectedSiteClient}
          client={true}
          onShow={onHide}
          onShowMap={() => dispatch(setShowMapSite(true))}
        />
      )}
    </>
  )
}

export default SiteAndGeo
{
  /* <SiteDetail selectedSite={selectedSiteClient} client={true} onShow={onHide} /> */
}
