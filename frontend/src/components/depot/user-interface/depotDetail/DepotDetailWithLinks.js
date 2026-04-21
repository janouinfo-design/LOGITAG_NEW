import React, {useState} from 'react'
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

  const hasInfo = !!(selectedDepot?.label || selectedDepot?.code)
  const hasAddress = Array.isArray(addresses) && addresses.length > 0
  const hasGeofence = showMapSite
  const [activeTabIdx, setActiveTabIdx] = useState(0)

  const steps = [
    {k: 'info', label: '1. Informations', desc: 'Nom et code du dépôt', done: hasInfo, icon: 'pi-box'},
    {k: 'address', label: '2. Adresse', desc: "Ajoutez l'adresse principale", done: hasAddress, icon: 'pi-map-marker'},
    {k: 'geofence', label: '3. Géofencing', desc: 'Définissez la zone géographique', done: hasGeofence, icon: 'pi-map'},
  ]
  const currentStep = steps.findIndex((s) => !s.done)
  const nextStepIdx = currentStep === -1 ? -1 : currentStep

  return (
    <div className='lt-page' data-testid="depot-detail-page">
      {/* ── Premium Header ── */}
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <button className='lt-back-btn' onClick={onHide}><i className='pi pi-arrow-left'></i><span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span></button>
          <div className='lt-detail-avatar'>
            <div className='lt-detail-avatar-ph' style={{background: '#DBEAFE', color: '#1D4ED8'}}><i className='pi pi-box'></i></div>
          </div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>{selectedDepot?.label || 'Dépôt'}</h2>
            <div className='lt-detail-meta'>
              <span className={`lt-badge ${selectedDepot?.active ? 'lt-badge-success' : 'lt-badge-neutral'}`}>
                <span className={`lt-badge-dot ${selectedDepot?.active ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
                {selectedDepot?.active ? 'Actif' : 'Inactif'}
              </span>
              {selectedDepot?.code && <span className='lt-badge lt-badge-info' style={{background:'#DBEAFE', color:'#1D4ED8'}}><i className='pi pi-hashtag' style={{fontSize: '0.5rem'}}></i>{selectedDepot.code}</span>}
              {Array.isArray(addresses) && <span className='lt-badge lt-badge-neutral'><i className='pi pi-map-marker' style={{fontSize: '0.55rem'}}></i>{addresses.length} adresse{addresses.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-Step Stepper ── */}
      <div className='lt-depot-stepper' data-testid='depot-stepper'>
        <div className='lt-depot-stepper-head'>
          <div className='lt-depot-stepper-title'>Configuration du dépôt en 3 étapes</div>
          <div className='lt-depot-stepper-sub'>
            {nextStepIdx === -1
              ? '✓ Configuration complète. Votre dépôt est prêt.'
              : `Étape ${nextStepIdx + 1}/3 : ${steps[nextStepIdx].desc}.`}
          </div>
        </div>
        <div className='lt-depot-stepper-track'>
          {steps.map((s, i) => {
            const isActive = activeTabIdx === i
            const isNext = nextStepIdx === i
            return (
              <React.Fragment key={s.k}>
                <button
                  className={`lt-depot-step ${s.done ? 'is-done' : ''} ${isActive ? 'is-active' : ''} ${isNext ? 'is-next' : ''}`}
                  onClick={() => setActiveTabIdx(i)}
                  data-testid={`depot-step-${s.k}`}
                >
                  <span className='lt-depot-step-num'>
                    {s.done ? <i className='pi pi-check' /> : (i + 1)}
                  </span>
                  <span className='lt-depot-step-txt'>
                    <span className='lt-depot-step-lbl'>{s.label}</span>
                    <span className='lt-depot-step-desc'>{s.desc}</span>
                  </span>
                  <i className={`pi ${s.icon} lt-depot-step-ico`} />
                </button>
                {i < steps.length - 1 && (
                  <span className={`lt-depot-step-sep ${steps[i].done ? 'is-done' : ''}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='lt-detail-tabs'>
        <TabView
          className='lt-tabview'
          activeIndex={activeTabIdx}
          onTabChange={(e) => setActiveTabIdx(e.index)}
        >
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-box'></i>1. Informations</span>}>
            <DepotAndGeo />
          </TabPanel>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map-marker'></i>2. Adresse</span>}>
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
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map'></i>3. Géofencing</span>}>
              <MapComponentSelectedDepot addresses={addresses} />
            </TabPanel>
          )}
        </TabView>
      </div>
    </div>
  )
}

export default DepotDetailWithLinks
