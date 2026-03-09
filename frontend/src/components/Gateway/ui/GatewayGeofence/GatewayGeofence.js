import React, {useEffect, useMemo, useRef, useState} from 'react'
import MapComponent from '../../../shared/MapComponent/user-interface/MapComponent'
import {FeatureGroup, MapContainer, Marker, Popup, useMapEvent} from 'react-leaflet'
import GeomanComponent from '../../../shared/MapComponent/user-interface/GeomanComponent/GeomanComponent'
import BaseMapLayerComponent from '../../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Button} from 'primereact/button'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getAllSite, getSelectedGateway} from '../../slice/gateway.slice'
import markerIcon from '../../../../assets/icons/marker.png'
import L, {Icon} from 'leaflet'
import * as turf from '@turf/turf'
import {getAddressesSelectedSite} from '../../../Site/slice/addressSite.slice'
import {getCompanyAddresses} from '../../../Company/slice/company.slice'
import './style.css'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {setToastParams} from '../../../../store/slices/ui.slice'

const customIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [50, 50],
})

const enterIcon = L.divIcon({
  html: '<i class="fa-solid fa-arrow-down-to-bracket fa-2x"></i>', // Icon HTML
  className: 'custom-fa-icon', // Use custom class for styling
  iconSize: [26, 26], // Size of the icon
  iconAnchor: [16, 32], // Anchor point at the bottom-center
  popupAnchor: [0, -16], // Adjust popup position
})

const exitIcon = L.divIcon({
  html: '<i class="fa-solid fa-arrow-up-from-bracket fa-2x"></i>', // Icon HTML
  className: 'custom-fa-icon-exit', // Use custom class for styling
  iconSize: [26, 26], // Size of the icon
  iconAnchor: [16, 32], // Anchor point at the bottom-center
  popupAnchor: [0, -16], // Adjust popup position
})

function GatewayGeofence({selectedSite, setIsValid, setExitMarkerPosition, exitMarkerPosition}) {
  const [currentLayer, setCurrentLayer] = useState(null)
  const [markerPosition, setMarkerPosition] = useState([0, 0])

  const [center, setCenter] = useState([0, 0])

  const selectedGateWay = useAppSelector(getSelectedGateway)
  const selectedLocation = useAppSelector(getAddressesSelectedSite)
  const addressCompany = useAppSelector(getCompanyAddresses)
  const worksites = useAppSelector(getAllSite)

  const mapRef = useRef()
  const markerRef = useRef(null)
  const exitMarkerRef = useRef(null)
  const editorRef = useRef(null)

  const dispatch = useAppDispatch()

  const MapEvents = () => {
    useMapEvent('click', async (e) => {
      setIsValid(true)
      setExitMarkerPosition(e.latlng)
      // if (typeof events?.click == 'function') events.click(e)
      const marker = exitMarkerRef.current
      if (marker) {
        marker.setLatLng(e.latlng)
        mapRef.current.setView(e.latlng, 16)
      } else {
        setMarkerPosition(e.latlng)
      }
    })
  }

  const displayGeoGateWay = () => {
    if (!Array.isArray(worksites)) return
    const {locationId} = selectedGateWay || {}
    const findSite = worksites?.find((site) => site.id == locationId)
    if (!findSite) return
    const geofence = findSite.geofence?.[0]
    const geometry = geofence?.geometry
    if (geometry?.type !== 'Feature') return
    // if (!editorRef.current || !mapRef.current) return
    const coordinates = geometry?.geometry?.coordinates
    if (!coordinates) return
    const layer = L.geoJSON(geometry, {
      color: 'green',
      weight: 2,
    })
    const centerGeo = turf.centerOfMass(geometry)
    editorRef.current.addLayer(layer)
    mapRef.current.setView(centerGeo.geometry.coordinates.reverse(), 19)
  }

  const displayEnterExitMarker = () => {
    const {lat, lng, exitLat, exitLng} = selectedGateWay || {}

    // if (!markerRef.current && !exitMarkerRef.current) return

    if (lat && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      setMarkerPosition([lat, lng])
    }

    if (exitLat && exitLng && exitMarkerRef.current) {
      exitMarkerRef.current.setLatLng([exitLat, exitLng])
      setExitMarkerPosition([exitLat, exitLng])
    }
  }

  const displayEnter = () => {
    const {lat, lng} = selectedGateWay || {}
    if (!lat && !lng) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'Erreur',
          detail: "Veuillez renseigner les coordonnees d'arrivee",
          position: 'top-right',
        })
      )
      return
    }

    if (markerRef.current && mapRef.current) {
      mapRef.current.flyTo(markerRef.current.getLatLng(), 20)
      markerRef.current.openPopup()
    }
  }

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current
    if (marker) {
      setMarkerPosition(marker.getLatLng())
    }
  }

  const handleExitMarkerDragEnd = () => {
    const marker = exitMarkerRef.current
    if (marker) {
      setIsValid(true)
      setExitMarkerPosition(marker.getLatLng())
    }
  }

  const displayExit = () => {
    const {exitLat, exitLng} = selectedGateWay || {}
    if (!exitLat && !exitLng) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez renseigner les coordonnees de sortie',
          position: 'top-right',
        })
      )
      return
    }
    if (exitMarkerRef.current && mapRef.current) {
      mapRef.current.flyTo(exitMarkerRef.current.getLatLng(), 20)
      exitMarkerRef.current.openPopup()
    }
  }

  const latAddress = addressCompany?.[0]?.lat
  const lngAddress = addressCompany?.[0]?.lng

  useEffect(() => {
    if (mapRef.current) {
      let geometry = selectedSite?.geofence?.[0]?.geometry
      if (geometry?.type !== 'Feature' || !editorRef.current) return
      editorRef.current.clearLayers()
      const layer = L.geoJSON(geometry, {
        color: 'green',
        weight: 2,
      })
      const getCenterOfGeo = turf.centerOfMass(geometry)
      mapRef.current.setView(getCenterOfGeo.geometry.coordinates.reverse(), 18)
      editorRef.current.addLayer(layer)
    }
  }, [selectedSite])

  useEffect(() => {
    // setTimeout(() => {
    if (mapRef.current) {
      const {locationId} = selectedGateWay
      if (locationId == null || locationId == 0) {
        mapRef?.current?.setView([latAddress, lngAddress], 20)
      }
      // if (editorRef?.current) {
      // alert('selectedGateWay')
      displayGeoGateWay()
      displayEnterExitMarker()
      // }
      // }, 1000)
    }
  }, [mapRef.current])

  return (
    <div className='flex flex-1 flex-column relative  w-full' style={{gap: 50}}>
      <div
        style={{top: '10px', right: '10px'}}
        className='flex flex-column absolute  z-2 align-items-end w-full'
      >
        <ButtonComponent
          onClick={displayEnter}
          // label={<OlangItem olang='enter' />}
          className='p-button-success mt-2'
          icon='fas fa-solid fa-arrow-down-to-bracket'
          style={{height: '40px', width: '40px'}}
        />
        <ButtonComponent
          onClick={displayExit}
          // label={<OlangItem olang='exit' />}
          className='p-button-danger mt-2 '
          icon='fas fa-solid fa-arrow-up-from-bracket'
          style={{height: '40px', width: '40px'}}
        />
      </div>
      <div className='w-full'>
        <MapContainer
          ref={mapRef}
          minZoom={1}
          maxZoom={22}
          zoom={16}
          zoomControl={false}
          center={[latAddress, lngAddress]}
          style={{width: '100%', height: '600px'}}
        >
          <BaseMapLayerComponent />
          <FeatureGroup ref={editorRef}></FeatureGroup>
          {/* <GeomanComponent show={true} actions={['polygon']} /> */}
          <MapEvents />
          <Marker
            ref={markerRef}
            // draggable={true}
            // eventHandlers={{
            //   dragend: handleMarkerDragEnd, // Get position on drag end
            // }}
            icon={enterIcon}
            position={markerPosition}
          >
            <Popup>
              <p>
                <OlangItem olang='info.enter' />
              </p>
            </Popup>
          </Marker>
          <Marker
            ref={exitMarkerRef}
            draggable={true}
            eventHandlers={{
              dragend: handleExitMarkerDragEnd,
            }}
            icon={exitIcon}
            position={exitMarkerPosition}
          >
            <Popup>
              <p>
                <OlangItem olang='info.exit' />
              </p>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}

export default GatewayGeofence
