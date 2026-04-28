import {FeatureGroup, MapContainer, Marker, Popup, TileLayer, useMapEvent} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './Style.css'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import L, {Icon} from 'leaflet'
import markerIcon from '../../assets/icons/marker.png'

import {usePlacesWidget} from 'react-google-autocomplete'
import GooglePlacesAutocomplete, {geocodeByPlaceId} from 'react-google-places-autocomplete'

import geocodeInstance from '../../services'

import {InputText} from 'primereact/inputtext'
import {useAppDispatch} from '../../../../../hooks'
import BaseMapLayerComponent from '../../../BaseMapLayerComponent/BaseMapLayerComponent'
const apiKey = 'AIzaSyDNcOVNaruADFlD-IucNxNRP88h4MBNpAs'
export const MapSearchComponent = ({
  onAddress,
  events,
  className,
  style,
  listStyle,
  mapStyle,
  selectedAddress,
  onSetSelectedAddress = () => {},
}) => {
  const [draggable, setDraggable] = useState(true)
  const markerRef = useRef(null)

  const [inputAddress, setInputAddress] = useState(selectedAddress)
  const [center, setCenter] = useState({lat: selectedAddress?.lat, lng: selectedAddress?.lng})
  const placesWidget = usePlacesWidget({
    apiKey,
    options: {
      types: ['address'],
      language: 'fr',
    },
    onPlaceSelected: (place) => {
      onPlaceSelected(place)
    },
  })
  let ref = useRef(null)
  let layerRef = useRef(null)
  let [addresses, setAddresses] = useState([])
  let [input, setInput] = useState('')
  let [isLocate, setIsLocate] = useState(true)

  const [zoom, setZoom] = useState(14)

  const customIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [50, 50],
  })

  // function MapEvents() {
  //   useMapEvent('click', async (e) => {
  //     setCenter(e.latlng)
  //     if (typeof events?.click == 'function') events.click(e)
  //     let _addr = await geocodeInstance.geocode(e.latlng.lat, e.latlng.lng)

  //     if (typeof onAddress == 'function' && _addr.success) {
  //       let addr = extractAddressInfo(_addr, selectedAddress, e.getLatLng().lat, e.getLatLng().lng)
  //       onAddress(addr)
  //       onSetSelectedAddress(addr)
  //       setInputAddress(addr)
  //       setIsLocate(false)
  //       setInput(addr?.Address)
  //     }
  //   })
  // }

  function onPlaceSelected(place) {
    if (ref.current) {
      ref.current.flyTo({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()})
      setCenter({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()})
    }
    if (typeof onAddress == 'function')
      onAddress({
        ...place,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      })
  }

  function onAutocompletPlaceSelected(place) {
    if (place?.value?.place_id) {
      geocodeByPlaceId(place?.value?.place_id).then((response) => {
        if (Array.isArray(response) && response?.length > 0) onPlaceSelected(response?.[0])
      })
    }
  }
  function MapEvents() {
    useMapEvent('click', async (e) => {
      setCenter(e.latlng)
      if (typeof events?.click == 'function') events.click(e)
      const marker = markerRef.current
      if (marker !== null) {
        let loc = await geocodeInstance.geocode(marker.getLatLng().lat, marker.getLatLng().lng)
        let addr = extractAddressInfo(
          loc,
          selectedAddress,
          marker.getLatLng().lat,
          marker.getLatLng().lng
        )
        //setCenter({lat: marker.getLatLng().lat, lng: marker.getLatLng().lng})

        if (typeof onAddress == 'function' && loc.success) {
          //let addr = extractAddressInfo(_addr, selectedAddress)
          onAddress(addr)
          onSetSelectedAddress(addr)
          setInputAddress(addr)
          setIsLocate(false)
          setInput(addr?.Address)
        }
      }
    })
  }

  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current
        if (marker != null) {
          let loc = await geocodeInstance.geocode(marker.getLatLng().lat, marker.getLatLng().lng)

          let addr = extractAddressInfo(
            loc,
            selectedAddress,
            marker.getLatLng().lat,
            marker.getLatLng().lng
          )

          setCenter({lat: marker.getLatLng().lat, lng: marker.getLatLng().lng})
          if (typeof onAddress == 'function' && loc.success) {
            onAddress(addr)
            onSetSelectedAddress(addr)
            setInputAddress(addr)
            setIsLocate(false)
            setInput(addr?.Address)
          }
        }
      },
    }),
    []
  )

  function extractAddressInfo(data, oldAddress, lat, lng) {
    const status = data.result.status
    let formattedAddress,
      latitude,
      longitude,
      zipCode,
      town,
      country,
      cellPhone,
      phone,
      email,
      fax,
      addressNumber,
      route,
      city
    const oldId = oldAddress?.id || ''
    if (status === 'OK') {
      const firstResult = data.result.results[0]
      let fullAdress = ''
      firstResult.address_components.forEach((component) => {
        if (component.types.includes('street_number')) {
          fullAdress += component.long_name + ', '
        }
        if (component.types.includes('route')) {
          fullAdress += component.long_name + ', '
        }
        if (component.types.includes('locality')) {
          fullAdress += component.long_name + ', '
        }
        if (component.types.includes('administrative_area_level_2')) {
          fullAdress += component.long_name + ', '
        }
        if (component.types.includes('country')) {
          fullAdress += component.long_name
        }
      })
      formattedAddress = fullAdress
      const geometry = firstResult.geometry
      const location = geometry.location
      // latitude = lat
      // longitude = lng
      const addressComponents = firstResult.address_components
      zipCode =
        addressComponents.find((component) => component.types.includes('postal_code'))?.long_name ||
        ''
      town =
        addressComponents.find((component) => component.types.includes('locality'))?.long_name || ''
      country =
        addressComponents.find((component) => component.types.includes('country'))?.long_name || ''
      city =
        addressComponents.find((component) =>
          component.types.includes('administrative_area_level_1')
        )?.long_name || ''

      addressComponents.forEach((component) => {
        if (component.types.includes('phone')) {
          phone = component.long_name || oldAddress?.Phone || ''
        } else if (component.types.includes('fax')) {
          fax = component.long_name || oldAddress?.Fax || ''
        } else if (component.types.includes('email')) {
          email = component.long_name || oldAddress?.Email || ''
        } else if (component.types.includes('route')) {
          route = component.long_name
        } else if (component.types.includes('street_number')) {
          addressNumber = component.long_name
        } else if (component.types.includes('sublocality')) {
          town = component.long_name
        }
      })
      const additionalInfo = firstResult.plus_code || {}
      const compoundCode = additionalInfo.compound_code || ''
      const globalCode = additionalInfo.global_code || ''
      cellPhone = firstResult?.formatted_phone_number || oldAddress?.CellPhone || ''
    } else {
      formattedAddress = 'Status is not OK'
      latitude = ''
      longitude = ''
      zipCode = ''
      town = ''
      country = ''
      city = ''
      cellPhone = ''
      phone = oldAddress?.Phone || ''
      email = oldAddress?.Email || ''
      fax = oldAddress?.Fax || ''
      addressNumber = ''
      route = ''
    }
    return {
      client: true,
      className: 'w-full lg:w-6 mt-4',
      id: oldId,
      type: oldAddress?.type || '',
      contact: '',
      name: 'Facture',
      Address: formattedAddress,
      zipCode: zipCode || oldAddress?.zipCode || '',
      city: city,
      Country: country,
      CellPhone: cellPhone || oldAddress?.CellPhone || '',
      Phone: phone || oldAddress?.Phone || '',
      Email: email || oldAddress?.Email || '',
      Fax: fax || oldAddress?.Fax || '',
      lat: lat,
      lng: lng,
      isDefault: 0,
      active: 1,
      town: town || oldAddress?.town || '',
      lat1: '',
      lng1: '',
      addressNumber: addressNumber || '',
      route: route || '',
    }
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
      let loc = await geocodeInstance.autocomplete(input)
      if (loc.success) {
      }
    }
  }

  const onSelectAddresse = async (addr) => {
    setAddresses([])
    if (addr && addr?.location) {
      setIsLocate(false)
      setInput(addr.address)
      let loc = await geocodeInstance.geocode(addr?.location?.y, addr?.location?.x)
      setCenter({lat: addr?.location?.y, lng: addr?.location?.x})
      if (typeof onAddress == 'function' && loc.success) {
        onAddress(loc.result)
      }
    }
  }

  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  useEffect(() => {
    if (selectedAddress) {
      const lat = selectedAddress?.lat || 46.933295342561046
      const lng = selectedAddress?.lng || 7.454324562997108
      return
      setCenter({lat, lng})
      if (ref.current) ref.current.setView([lat, lng], 20, {})
    }
  }, [selectedAddress])

  return (
    <div className={className || ''} style={style || {}}>
      <div className='relative '>
        <div style={{position: 'relative', height: '40px'}}>
          <div style={{position: 'absolute', top: 0, width: '100%', zIndex: 20}}>
            <GooglePlacesAutocomplete
              apiKey={apiKey}
              selectProps={{
                onChange: onAutocompletPlaceSelected,
                placeholder: 'Tapez votre adresse…',
                noOptionsMessage: () => 'Commencez à taper…',
                loadingMessage: () => 'Recherche…',
              }}
            />
          </div>
        </div>
        {/* <div className='p-input-icon-left p-input-icon-right w-full'>
          <i className='pi pi-search' />
          <InputText
            className=' w-full'
            placeholder='Search'
            value={inputAddress?.Address}
            onChange={setInputAddress}
            ref={placesWidget.ref}
          />
          <i className='pi pi-times-circle' onClick={() => onInput('')} />
        </div> */}
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
              ...(listStyle || {}),
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
        zoom={zoom}
        ref={ref}
        center={center}
        className=''
        style={{width: '100%', height: 'calc(100% - 50px)', ...(mapStyle || {})}}
      >
        <MapEvents />
        {/* <TileLayer
          url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          attribution='&copy openstreetmap'
        /> */}
        <BaseMapLayerComponent top={60} right={15} />

        <FeatureGroup ref={layerRef}>
          <Marker
            ref={markerRef}
            draggable={draggable}
            eventHandlers={eventHandlers}
            icon={customIcon}
            position={center}
          >
            <Popup>
              <div>
                <strong>Lat: </strong>
                {center.lat}
              </div>
              <div>
                <strong>Lng:</strong> {center.lng}
              </div>
            </Popup>
          </Marker>
        </FeatureGroup>
      </MapContainer>
    </div>
  )
}
