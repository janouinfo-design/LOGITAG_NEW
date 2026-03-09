import React, {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getDetailSite,
  getSelectedSite,
  getShowMap,
  setDetailSite,
  setGeoSite,
  setGeoSiteSelectedSite,
  setLinkTo,
  setSelectedSite,
  setShowMap,
} from '../../slice/site.slice'
import GeofecingSite from '../SiteDetail/GeofencingSite'
import SiteDetail from '../SiteDetail/SiteDetail'
import {useLocation} from 'react-router-dom'
import {setDetailSiteClient} from '../../../../store/slices/customer.slice'

const SiteAndGeoSite = () => {
  const dispatch = useAppDispatch()
  const showDetail = useAppSelector(getDetailSite)
  const selectedSite = useAppSelector(getSelectedSite)
  const location = useLocation()

  const onHide = () => {
    dispatch(setGeoSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setDetailSiteClient(false))
    dispatch(setSelectedSite(null))
  }
  let showMap = useAppSelector(getShowMap)

  useEffect(() => {
    if (location.pathname !== '/worksite/index') {
      dispatch(setDetailSite(false))
      dispatch(setLinkTo(false))
      dispatch(setDetailSite(false))
      dispatch(setSelectedSite(null))
      dispatch(setShowMap(false))
    }
  }, [dispatch, location.pathname])

  return (
    <>
      {showMap ? (
        <GeofecingSite onShowMap={() => dispatch(setShowMap(false))} />
      ) : (
        <SiteDetail
          selectedSite={selectedSite}
          client={false}
          onShow={onHide}
          onShowMap={() => dispatch(setShowMap(true))}
        />
      )}
    </>
  )
}

export default SiteAndGeoSite
{
  /* <SiteDetail selectedSite={selectedSiteClient} client={true} onShow={onHide} /> */
}
