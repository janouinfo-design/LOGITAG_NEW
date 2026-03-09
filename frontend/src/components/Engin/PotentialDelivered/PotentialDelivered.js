import React, {useEffect, useState} from 'react'
import {FeatureGroup, MapContainer, Marker, Popup, useMapEvent} from 'react-leaflet'
import {useRef} from 'react'
import BaseMapLayerComponent from '../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import GeomanComponent from '../../shared/MapComponent/user-interface/GeomanComponent/GeomanComponent'
import {InputText} from 'primereact/inputtext'
import {Divider} from 'primereact/divider'
import {Button} from 'primereact/button'
import {useDispatch} from 'react-redux'
import {fetchPotentialDeliveredHistory} from '../slice/engin.slice'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import IconMap from '../../../assets/icons/marker.png'
import {fetchCustomers, getCustomers} from '../../../store/slices/customer.slice'
import {useSelector} from 'react-redux'
import {Dropdown} from 'primereact/dropdown'
import {createOrUpdateSite, getListGeo, fetchAllGeo} from '../../Site/slice/site.slice'
import moment from 'moment'
import {saveGeofencing} from '../../../store/slices/geofencing.slice'
import {createOrUpdateAddress, fetchAddresses} from '../../Site/slice/addressSite.slice'
import geocodeInstance from '../../shared/MapSearch/services'

import * as turf from '@turf/turf'
import {OverlayPanel} from 'primereact/overlaypanel'
import {Calendar} from 'primereact/calendar'
import {Chip} from 'primereact/chip'
import {TabPanel, TabView} from 'primereact/tabview'
import {Message} from 'primereact/message'
import {setAlertError} from '../../../store/slices/alert.slice'

const customIcon = new L.Icon({
  iconUrl: IconMap,
  iconSize: [60, 60],
})

function PotentialDeliveredEngins() {
  let [showEditForm, setShowEditForm] = useState(false)
  let [currentLayer, setCurrentLayer] = useState(null)
  let [center] = useState({lat: 33, lng: -7})
  let [inputs, setInputs] = useState({})
  let [loading, setLoading] = useState(false)
  let [periodLabel, setPeriodLabel] = useState('')
  let [intersectLayer, setIntersectLayer] = useState(null)
  const [geofences, setGeofences] = useState([])

  const [periodes, setPeriodes] = useState([
    moment().startOf('month').toDate(),
    moment().endOf('month').toDate(),
  ])
  const listGeo = useSelector(getListGeo)
  let periodRef = useRef()
  let mapRef = useRef(null)
  let clusterRef = useRef(null)
  const geoLayers = useRef({})

  const customers = useSelector(getCustomers)

  let [histories, setHistories] = useState([])

  const dispatch = useDispatch()

  console.log('histories map:', histories)

  const onChange = (e) => {
    setInputs((prev) => ({...prev, [e.target.name]: e.target.value}))
  }

  const MapEvents = (props) => {
    useMapEvent('pm:create', (e) => {
      try {
        console.log('layersss:', e)
        setShowEditForm(true)
        let layer = e.layer.toGeoJSON()
        setCurrentLayer(e)

        let geo = layer.geometry.coordinates[0].map((coords) => [coords[1], coords[0]])
        console.log('geoInside', geo)
        const pl = turf.polygon([geo])
        const checkInterSec = checkIntersection(listGeo, pl, e.layer)

        console.log('checkInterSec:', checkInterSec)
      } catch (e) {
        console.log('errorrrr:', e)
      }
    })
    useMapEvent('pm:globaleditmodetoggled', (e) => {
      if (!e.enabled) {
        let layer = e.layer.toGeoJSON()
        setShowEditForm(true)
        setCurrentLayer(e)
      }
    })
    useMapEvent('pm:globalremovalmodetoggled', (e) => {
      if (!e.enabled) {
        setShowEditForm(false)
        setCurrentLayer(null)
      }
    })
  }

  const close = () => {
    setShowEditForm(false)
    removeLayer()
  }

  const removeLayer = () => {
    setCurrentLayer(null)
    if (currentLayer) currentLayer.layer.remove()

    if (intersectLayer) intersectLayer.remove()
  }

  const save = async () => {
    // setShowEditForm(false)
    //customer save
    let obj = {...inputs, active: 1, reqType: 'potential_delivered_process'}
    setLoading(true)
    dispatch(createOrUpdateSite(obj)).then(async ({payload}) => {
      let worksite = payload.result?.[0].idworksite
      if (worksite) {
        let response = await saveGeofence(worksite)
        let addrResponse = await updateAddress(worksite)
      }

      resetDatas()
      fetchHistories()
      setLoading(false)
    })
  }

  let resetDatas = () => {
    setShowEditForm(false)
    setInputs({})
    removeLayer()
  }

  const excludeArea = async () => {
    let response = await saveGeofence(-1, {
      tags: 'exclude-potential',
    })
    resetDatas()
    fetchHistories()
  }

  const saveGeofence = async (worksiteId, extra_data) => {
    if (!worksiteId || !currentLayer) return

    let layer = currentLayer.layer.toGeoJSON()

    let type = currentLayer.layerType || currentLayer.shape
    layer.properties = {
      ...inputs,
      label: inputs.name || inputs.label,
      description: inputs.label,
      worksiteId,
      tags: '',
      type,
      ...(extra_data || {}),
    }
    if (type == 'circle') {
      layer.properties.radius = currentLayer?.layer?.options?.radius
    }

    return await dispatch(saveGeofencing(layer))
  }

  const updateAddress = async (worksiteId) => {
    let {payload} = await dispatch(fetchAddresses(worksiteId))
    let address = payload?.result?.[0] || null

    if (!address) return
    let centroid = turf.centroid(currentLayer.layer.toGeoJSON())
    let [lng, lat] = centroid.geometry.coordinates
    let geocode = await geocodeInstance.geocode(lat, lng)
    let geoRes = parseAddress(geocode.result?.results?.[0])

    let obj = {
      ...address,
      client: true,
      type: 'Adresse de site',
      contact: '',
      name: inputs?.name || 'worksite',
      Address: geoRes?.address,
      zipCode: '',
      city: '',
      Country: geoRes?.Country,
      CellPhone: '',
      Phone: '',
      Email: '',
      Fax: '',
      isDefault: 0,
      active: 1,
      town: geoRes?.town,
      lat: lat,
      lng: lng,
      addressNumber: geoRes?.addressNumber,
      route: geoRes?.route,
      fax: '',
      email: '',
      phone: '',
      address: geoRes?.address,
      country: geoRes?.Country,
    }

    let response = await dispatch(createOrUpdateAddress(obj))
  }

  const parseAddress = (info) => {
    let address, zipCode, city, Country, town, route, phone, fax, email, addressNumber
    info.address_components.forEach((component) => {
      if (component.types.includes('country')) {
        Country = component.long_name
      } else if (component.types.includes('fax')) {
        fax = component.long_name
      } else if (component.types.includes('email')) {
        email = component.long_name
      } else if (component.types.includes('route')) {
        route = component.long_name
      } else if (component.types.includes('street_number')) {
        addressNumber = component.long_name
      } else if (component.types.includes('sublocality')) {
        town = component.long_name
      }
    })

    return {
      phone,
      email,
      fax,
      route,
      address: info?.formatted_address,
      town,
      Country,
      addressNumber,
    }
  }

  const checkIntersection = (geofencesArray, geofenceToCheck, layer) => {
    try {
      if (Array.isArray(geofenceToCheck?.geometry?.coordinates)) {
        geofenceToCheck.geometry.coordinates[0] = geofenceToCheck.geometry.coordinates[0].map(
          (o) => [o[1], o[0]]
        )
      }
      for (let geofence of geofencesArray) {
        if (geofence?.geometry?.type && geofence?.geometry?.type === 'Feature') {
          const geofencePolygon = geofence.geometry
          let intersectFeature = turf.intersect(geofencePolygon, geofenceToCheck)
          if (intersectFeature) {
            console.log('intersectFeature:', intersectFeature)
            let geoJson = L.geoJSON(intersectFeature, {
              color: 'red',
            })

            setIntersectLayer(geoJson)
            mapRef.current.addLayer(geoJson)
            mapRef.current.fitBounds(geoJson.getBounds())
            geoJson.bringToFront()
            console.log('intersectFeature geofence:', geofence)
            setTimeout(() => {
              dispatch(
                setAlertError({
                  title: 'Alert',
                  message: `You have intersected with the Position of ${geofence?.label}!`,
                  acceptClassName: 'p-button-success',
                  icon: 'pi pi-exclamation-triangle',
                  visible: true,
                  accept: () => {
                    dispatch(setAlertError({visible: false}))
                    dispatch(setShowEditForm(false))
                  },
                })
              )
              mapRef.current.removeLayer(layer)
              // editorRef.current.clearLayers()
            }, 500)
            // mapRef.current.removeLayer(geoJson)
            return true
          }
        }
      }
      return false
    } catch (e) {
      console.log('Error checkIntersection:', e)
      return -1
    }
  }

  const flyTo = (item) => {
    let latlng = [item.lat, item.lng]
    mapRef.current?.flyTo(latlng, 15)
  }

  let fetchHistories = () => {
    if (!Array.isArray(periodes) || periodes?.length < 2) return
    let obj = {
      startDate: moment(periodes?.[0]).format('YYYY-MM-DD'),
      endDate: moment(periodes?.[1]).format('YYYY-MM-DD'),
    }
    dispatch(fetchPotentialDeliveredHistory(obj)).then(({payload}) => {
      if (Array.isArray(payload?.result)) {
        setHistories(payload.result)
      } else {
        setHistories([])
      }
    })
  }

  const displayGeofences = (list) => {
    console.log('displayGeofences', list)
    if (Array.isArray(list)) {
      list.forEach((geo) => {
        let layer = L.geoJSON(geo.geometry)
        layer.bindPopup(`<p>${geo.geometry.properties.label}</p>`)
        layer.addTo(mapRef.current)
      })
    }
  }

  useEffect(() => {
    fetchHistories()
    dispatch(fetchCustomers())
    dispatch(fetchAllGeo()).then((props) => {
      if (props.meta.requestStatus === 'fulfilled') {
        displayGeofences(props.payload)
      }
    })
  }, [])

  useEffect(() => {
    if (!Array.isArray(customers)) return
    let almCustomer = customers.find((o) => (o.label || '').toUpperCase().includes('ALM'))
    if (almCustomer) {
      setInputs((prev) => ({...prev, customerID: almCustomer.id}))
    }
  }, [customers])

  useEffect(() => {
    if (!Array.isArray(periodes) || periodes.length < 2) return
    setPeriodLabel(
      moment(periodes[0]).format('DD/MM/YYYY') + ' ' + moment(periodes[1]).format('DD/MM/YYYY')
    )
  }, [periodes])

  return (
    <div className='relative'>
      <div className='p-2' style={{position: 'absolute', top: 10, zIndex: 2}}>
        {showEditForm && (
          <div className='bg-white shadow-2 p-2' style={{width: '300px'}}>
            <div className='flex gap-2 justify-content-between align-items-center my-2 '>
              <div className='flex gap-2 align-items-center'>
                <span className='pi pi-map'></span>
                <strong>Site</strong>
              </div>
              <span
                onClick={(e) => setShowEditForm(false)}
                className='text-red-600 pi pi-times'
              ></span>
            </div>
            <Divider />
            <TabView>
              <TabPanel header={'Informations'}>
                <div className='flex flex-column gap-3'>
                  <div>
                    <strong>Nom du site</strong>
                    <InputText
                      value={inputs.name}
                      onChange={onChange}
                      name='name'
                      className='w-full'
                    />
                  </div>
                  <div>
                    <strong>Libilé</strong>
                    <InputText
                      value={inputs.label}
                      onChange={onChange}
                      name='label'
                      className='w-full'
                    />
                  </div>
                  <div>
                    <strong>Client</strong>
                    <Dropdown
                      value={inputs.customerID}
                      onChange={onChange}
                      name='customerID'
                      className='w-full'
                      options={(customers || []).map((o) => ({label: o?.label, value: o?.id}))}
                    />
                  </div>

                  <div className='flex my-3 justify-content-end gap-2'>
                    <Button disabled={loading} label='Fermer' severity='danger' onClick={close} />
                    <Button
                      disabled={!inputs?.label || !inputs?.name || !inputs?.customerID}
                      loading={loading}
                      label='Enregistrer'
                      onClick={save}
                    />
                  </div>
                </div>
              </TabPanel>
              <TabPanel className='hidden' header={'Autres actions'}>
                <Message severity='error' text='Exclure cette zone des futures recherches' />

                <InputText
                  value={inputs.label}
                  onChange={onChange}
                  name='label'
                  className='w-full my-3'
                  placeholder='Libellé'
                />
                <div className='text-center mt-2'>
                  <Button
                    onClick={excludeArea}
                    className='w-full'
                    size='small'
                    label='Exclure'
                    severity='danger'
                  />
                </div>
              </TabPanel>
            </TabView>
          </div>
        )}
        {!showEditForm && (
          <div className='bg-white shadow-2 p-2' style={{width: '300px'}}>
            <div className='w-full flex flex-wrap justify-content-bewteen gap-2 align-items-center my-2 '>
              <div className='flex gap-2 w-full align-items-center'>
                <span className='pi pi-list'></span>
                <strong>Historique des livraisons potentielles</strong>
              </div>
              <div className='flex gap-2 align-items-center cursor-pointer'>
                <Chip
                  style={{fontSize: '10px'}}
                  label={periodLabel}
                  icon='pi pi-calendar'
                  className='font-semibold'
                  onClick={(e) => periodRef.current.toggle(e)}
                />
                <span className='pi pi-search  hover:text-blue-500' onClick={fetchHistories}></span>
                <OverlayPanel ref={periodRef}>
                  <Calendar
                    value={periodes}
                    onChange={(e) => setPeriodes(e.value)}
                    selectionMode='range'
                    inline
                  />
                </OverlayPanel>
              </div>
            </div>
            <Divider />
            <div style={{maxHeight: '400px', overflow: 'auto'}}>
              {histories.map((o) => (
                <div
                  onClick={(e) => flyTo(o)}
                  className='flex flex-row hover:bg-blue-100 cursor-pointer p-2 border-bottom-1 border-gray-100'
                >
                  <div className='flex flex-col gap-1 '>
                    <strong>{o.reference || o.srcid}</strong>
                    <span className='text-gray-500'>
                      {moment(o.date).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  <Button
                    icon='fas fa-solid fa-trash-xmark'
                    severity='danger'
                    className='ml-auto'
                    rounded
                    size='small'
                    outlined
                  />
                </div>
              ))}
              {histories.length == 0 && (
                <div className='text-gray-500 py-2 text-center'>Aucune livraisons trouvée</div>
              )}
            </div>
          </div>
        )}
      </div>
      <MapContainer
        ref={mapRef}
        minZoom={1}
        maxZoom={22}
        zoom={7}
        zoomControl={false}
        center={center}
        style={{width: '100%', height: '80vh'}}
      >
        <MapEvents />
        <BaseMapLayerComponent top={60} right={10} position={'topright'} />
        <GeomanComponent actions={['polygon']} show={true} />
        <FeatureGroup ref={geoLayers} />
        <MarkerClusterGroup
          maxClusterRadius={3}
          ref={clusterRef}
          // iconCreateFunction={createTrackerClusterCustomIcon}
        >
          {histories.map((o) => (
            <Marker position={{lat: o.lat, lng: o.lng}} icon={customIcon}>
              <Popup>
                <div>
                  <div className='flex flex-row items-center'>
                    <div>Ref:</div>
                    <span className='font-bold text-xl ml-2'>{o.reference}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default PotentialDeliveredEngins
