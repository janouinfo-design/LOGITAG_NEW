import {memo, useRef} from 'react'
import {MapContainer} from 'react-leaflet'

const useMapHook = () => {
  const mapRef = useRef(null)
  const MapComponent = (props) => (
    <MapContainer
      maxZoom={props.maxZoom || 20}
      zoom={props.zoom || 13}
      {...props}
      style={{width: '100%', height: '400px', ...(props?.style || {})}}
      ref={mapRef}
    >
      {props.children}
    </MapContainer>
  )

  return {
    MapComponent: memo(MapComponent),
    mapRef,
  }
}

export default useMapHook
