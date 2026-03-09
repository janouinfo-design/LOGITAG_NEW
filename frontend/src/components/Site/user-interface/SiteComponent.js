import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getDetailSite,
  getEditSite,
  getSelectedSite,
  getShowMap,
  setDetailSite,
  setGeoSite,
  setLinkTo,
  setSelectedSite,
  setShowMap,
  setShowMapSite,
} from '../slice/site.slice'

import SiteList from './SiteList/SiteList'
import {useEffect} from 'react'
import SiteAndGeoSite from './SiteList/SiteAndGeoSite'
import SiteDetailWithLinks from './SiteEditor/SiteDetailWithLinks'

function SiteComponent() {
  const showDetail = useAppSelector(getDetailSite)
  const selectedSite = useAppSelector(getSelectedSite)
  let showMap = useAppSelector(getShowMap)

  const location = useLocation()
  const dispatch = useAppDispatch()


  useEffect(() => {
    dispatch(setGeoSite(null))
    dispatch(setDetailSite(false))
    dispatch(setLinkTo(false))
    dispatch(setDetailSite(true))
    dispatch(setSelectedSite(null))
    dispatch(setShowMap(false))
  }, [dispatch, location.pathname])

  return (
    <div>
      <SiteDetailWithLinks />
      {showDetail ? (
        <SiteList client={false} titleShow={true} filter={false} detailView='Detail' />
      ) : (
        <SiteAndGeoSite />
      )}
    </div>
  )
}

export default SiteComponent
