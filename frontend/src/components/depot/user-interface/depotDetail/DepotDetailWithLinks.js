import {TabPanel, TabView} from 'primereact/tabview'
import DepotAndGeo from './DepotAndGeo'
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

  let showMapSite = false
  if ((Array.isArray(addresses) && addresses?.length == 0) || addresses == null || addresses == undefined) {
    showMapSite = false
  } else if ((addresses.length > 0 && addresses[0]?.lat == '') || addresses[0]?.lng == '' || addresses[0]?.Address == '') {
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
    <div className='lt-page' data-testid="depot-detail-page">
      {/* ── Premium Header ── */}
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <button className='lt-back-btn' onClick={onHide}><i className='pi pi-arrow-left'></i><span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span></button>
          <div className='lt-detail-avatar'>
            <div className='lt-detail-avatar-ph' style={{background: '#FEF3C7', color: '#D97706'}}><i className='pi pi-box'></i></div>
          </div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>{selectedDepot?.label || 'Dépôt'}</h2>
            <div className='lt-detail-meta'>
              <span className={`lt-badge ${selectedDepot?.active ? 'lt-badge-success' : 'lt-badge-neutral'}`}>
                <span className={`lt-badge-dot ${selectedDepot?.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                {selectedDepot?.active ? 'Actif' : 'Inactif'}
              </span>
              {selectedDepot?.code && <span className='lt-badge lt-badge-info'><i className='pi pi-hashtag' style={{fontSize: '0.5rem'}}></i>{selectedDepot.code}</span>}
              {Array.isArray(addresses) && <span className='lt-badge lt-badge-neutral'><i className='pi pi-map-marker' style={{fontSize: '0.55rem'}}></i>{addresses.length} adresse{addresses.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='lt-detail-tabs'>
        <TabView className='lt-tabview'>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-box'></i><OlangItem olang='Depot.info' /></span>}>
            <DepotAndGeo />
          </TabPanel>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map-marker'></i><OlangItem olang='Depot.address' /></span>}>
            {editAddress ? (
              <AddressDetail client={true} handleSaveAddress={saveAddress} />
            ) : (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
                {addresses && addresses.map((address) => (
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
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map'></i><OlangItem olang='Depot.geofencing' /></span>}>
              <MapComponentSelectedDepot addresses={addresses} />
            </TabPanel>
          )}
        </TabView>
      </div>
    </div>
  )
}

export default DepotDetailWithLinks
