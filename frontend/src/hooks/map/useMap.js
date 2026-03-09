import React, { memo, useCallback, useRef, useState } from 'react'
import { MapContainer , ZoomControl , TileLayer} from 'react-leaflet'
import mapConfig from '../../configs/map/config';

const useMap = () => {
  const [zoom, setZoom] = useState(8)
  const [center, setCenter] = useState([46.8182, 8.2275])
  const [map , setMap] =useState(null)
  const ref = useRef(null)
  const MapEvents = ()=> {
        
  }

  function MapComponent(props){
    return (
      <MapContainer
          zoomControl={false}
          zoom={zoom}
          ref={ref}
          center={center}
          className=''
          // whenReady={setMap}
          style={{zIndex: '2', width: '100%', height: '85vh', ...(props?.mapStyle || {})}}
        >
          <ZoomControl position='topright' />
          <MapEvents />
          <TileLayer
            url={mapConfig.tilelayer.uri}
            {...mapConfig.tilelayer.options}
            //url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            //attribution='&copy openstreetmap'
          />
      </MapContainer>
    )
  }
  

  return {
    MapComponent,
    map
  }
}

export default useMap