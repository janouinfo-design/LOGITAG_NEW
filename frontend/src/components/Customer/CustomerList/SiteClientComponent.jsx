import React from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  fetchSitesClient,
  getDetailSiteClient,
  getSelectedSiteClient,
  setDetailSiteClient,
  setSelectedSiteClient,
} from '../../../store/slices/customer.slice'
import SiteList from '../../Site/user-interface/SiteList/SiteList'
// import SiteDetail from '../../Site/user-interface/SiteDetail/SiteDetail'
// import SiteAndGeo from '../../Site/user-interface/SiteDetail/SiteAndGeo'
import SiteDetailWithLinks from '../../Site/user-interface/SiteEditor/SiteDetailWithLinks'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  getSelectedSite,
  setDetailSite,
  setGeoSite,
  setGeoSiteSelectedSite,
  setSelectedSite,
} from '../../Site/slice/site.slice'
import {Divider} from 'primereact/divider'

const SiteClientComponent = () => {
  const dispatch = useAppDispatch()
  let showDetail = useAppSelector(getDetailSiteClient)
  const selectedSiteClient = useAppSelector(getSelectedSite)

  // const onHide = () => {
  //   dispatch(setDetailSiteClient(false))
  //   dispatch(setSelectedSiteClient(null))
  // }

  const onHide = () => {
    dispatch(setGeoSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setDetailSiteClient(false))
    dispatch(setSelectedSite(null))
    //dispatch(fetchSitesClient())
  }

  return (
    <>
      {showDetail ? (
        <>
          <div className='flex flex-row justify-content-between align-items-center'>
            <ButtonComponent className='bg-red-600' onClick={onHide}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2 text-base font-semibold'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
            <div className='text-xl px-3 bg-blue-50 h-[40px] flex flex-row items-center justify-center text-800 font-semibold border-2 border-blue-800 rounded-xl'>
              <i className='fa-solid fa-location-dot text-blue-500 text-2xl mr-1'></i>
              <span className='ml-1 text-3xl text-blue-500  font-bold'>
                {selectedSiteClient?.label}
              </span>
            </div>
          </div>
          <Divider />
          <SiteDetailWithLinks />
        </>
      ) : (
        <SiteList filter={true} detailView='Detail' client={true} />
      )}
    </>
  )
}

export default SiteClientComponent

{
  /* <SiteDetail selectedSite={selectedSiteClient} client={true} onShow={onHide} /> */
}
