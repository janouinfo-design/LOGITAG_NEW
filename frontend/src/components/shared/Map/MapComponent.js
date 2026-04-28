import {FeatureGroup, MapContainer, Marker, Popup, TileLayer, useMapEvent} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './Style.css'
import {useEffect, useRef, useState} from 'react'
import L, {Icon} from 'leaflet'

// import Search from 'react-leaflet-search'

import markerIcon from './icon/marker.png'

// import casablancaLayer from '../../assets/data/casablanca.json'

export const MapComponent = (props) => {
  let ref = useRef(null)
  let layerRef = useRef(null)
  let [addresses, setAddresses] = useState([])
  let [input, setInput] = useState('')
  let [isLocate, setIsLocate] = useState(true)

  const [center, setCenter] = useState({lat: 33, lng: -7})
  const [zoom, setZoom] = useState(13)

  const customIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [50, 50],
  })

  function MapEvents() {
    useMapEvent('click', async (e) => {
      setCenter(e.latlng)
      if (typeof props?.events?.click == 'function') props.events.click(e)
      let addr = await ARCGIS.reverseGeocode(e.latlng.lat, e.latlng.lng)

      if (typeof props.onAddress == 'function' && addr.success) {
        props.onAddress(addr.result)
        setIsLocate(false)
        setInput(addr.result.address.LongLabel)
      }
    })
  }

  const onInput = (val) => {
    setInput(val)
  }

  useEffect(() => {
    if (isLocate) locate()
    setIsLocate(true)
  }, [input])

  const locate = async () => {
    if (!input) setAddresses([])

    if (typeof input == 'string' && input?.length > 6) {
      let loc = await ARCGIS.geocode(input)
      if (loc.success) {
        setAddresses(loc.result.candidates.map((addr) => ({...addr, id: new Date().getTime()})))
      }
    }
  }

  const onSelectAddresse = async (addr) => {
    setAddresses([])
    if (addr && addr?.location) {
      setIsLocate(false)
      setInput(addr.address)
      let loc = await ARCGIS.reverseGeocode(addr?.location?.y, addr?.location?.x)
      setCenter({lat: addr?.location?.y, lng: addr?.location?.x})
      if (typeof props.onAddress == 'function' && loc.success) {
        props.onAddress(loc.result)
      }
    }
  }

  const ARCGIS = {
    async reverseGeocode(lat, lng) {
      return await this.request('reverseGeocode', `f=pjson&location=${lng},${lat}`)
    },
    async geocode(address) {
      return await this.request('findAddressCandidates', `address=${address}&f=json`)
    },
    async request(service, params) {
      try {
        return {success: true, result: await (await fetch(this.buildUrl(service, params))).json()}
      } catch (e) {
        return {success: false, result: e.message}
      }
    },
    buildUrl(service, params) {
      return `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/${service}?langCode=FR&token=${this.key}&${params}`
    },
    key: 'AAPK2ab90943b3d24c96b56938e2f7c042f9yk_GGn5GHzz-hjFwbbA2w1wi2Rmhf-AvouRDpYqaqm14yS8PsDWzMHi9XTxnfOrU',
  }

  useEffect(() => {
    if (ref.current) ref.current.flyTo(center, zoom, {})
  }, [center])

  return (
    <div {...props}>
      <div className='relative'>
        <div className='p-input-icon-left p-input-icon-right w-full'>
          <i className='pi pi-search' />
          <input
            value={input}
            className=' w-full'
            placeholder='Search'
            onChange={(e) => onInput(e.target.value)}
          />
          <i className='pi pi-times-circle' onClick={() => onInput('')} />
        </div>
        {addresses.length ? (
          <div
            className='shadow-2'
            style={{
              position: 'absolute',
              width: '100%',
              background: '#fff',
              maxHeight: '200px',
              overflow: 'auto',
              zIndex: '10000',
              ...(props?.listStyle || {}),
            }}
          >
            {addresses.map((addr, index) => (
              <div
                onClick={() => onSelectAddresse(addr)}
                key={index}
                className='flex gap-2 p-2 align-items-center border-bottom-1 border-gray-200'
              >
                <i className='pi pi-map-marker'></i>
                <div>{addr.address}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <MapContainer
        maxZoom={20}
        zoom={zoom}
        ref={ref}
        center={center}
        className=''
        style={{width: '100%', height: '400px', ...(props?.mapStyle || {})}}
      >
        <MapEvents />
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          attribution='&copy openstreetmap'
        />
        <FeatureGroup ref={layerRef}>
          <Marker icon={customIcon} position={center}>
            <Popup>
              <div>
                <strong>Lat: </strong>
                {center.lat}
              </div>
              <div>
                <strong>Lat:</strong> {center.lng}
              </div>
            </Popup>
          </Marker>
        </FeatureGroup>
        {/* <SearchComponent></SearchComponent> */}
      </MapContainer>
    </div>
  )
}
