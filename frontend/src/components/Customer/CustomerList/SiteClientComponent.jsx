import React from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getDetailSiteClient,
  setDetailSiteClient,
} from '../../../store/slices/customer.slice'
import SiteList from '../../Site/user-interface/SiteList/SiteList'
import SiteDetailWithLinks from '../../Site/user-interface/SiteEditor/SiteDetailWithLinks'
import SiteFullEditor from '../../Site/user-interface/SiteEditor/SiteFullEditor'
import {
  getEditSite,
  getSelectedSite,
  setEditSite,
  setGeoSite,
  setGeoSiteSelectedSite,
  setSelectedSite,
} from '../../Site/slice/site.slice'

const SiteClientComponent = () => {
  const dispatch = useAppDispatch()
  const showDetail = useAppSelector(getDetailSiteClient)
  const editSite = useAppSelector(getEditSite)
  const selectedSiteClient = useAppSelector(getSelectedSite)

  const onHideDetail = () => {
    dispatch(setGeoSite([]))
    dispatch(setGeoSiteSelectedSite([]))
    dispatch(setDetailSiteClient(false))
    dispatch(setSelectedSite(null))
  }

  const onHideEditor = () => {
    dispatch(setEditSite(false))
    dispatch(setSelectedSite(null))
  }

  if (editSite) {
    return <SiteFullEditor onBack={onHideEditor} />
  }

  if (showDetail) {
    return (
      <div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12}}>
          <button onClick={onHideDetail} data-testid='site-detail-back' style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFF', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'}}>
            <i className='pi pi-arrow-left' style={{fontSize: '0.75rem'}}></i>Retour
          </button>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: '#EFF6FF', color: '#3B82F6', fontWeight: 700, fontSize: '0.9rem'}}>
            <i className='pi pi-map-marker'></i>
            {selectedSiteClient?.label}
          </div>
        </div>
        <SiteDetailWithLinks />
      </div>
    )
  }

  return <SiteList filter={true} detailView='Detail' client={true} />
}

export default SiteClientComponent
