import {
  FeatureGroup,
  MapContainer,
  ZoomControl,
  TileLayer,
  useMapEvent,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet'
import L, {Icon} from 'leaflet'
import {useEffect, useRef, useState} from 'react'
import VehicleList from './VehicleList/VehicleList'
import VehicleInfoSlider from './VehicleInfoSlider/VehicleInfoSlider'
import mapConfig from '../../../configs/map/config'
import markerIcon from '../assets/icons/marker.png'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import useMap from '../../../hooks/map/useMap'
import {
  fetchHistoricalTag,
  getHistoryTag,
  getNewTags,
  getSelectedVehicle,
  getVehicles,
  setIsLoading,
} from '../slice/vehicle.slice'
import {Image} from 'primereact/image'
import {
  fetchCurrentPosOfTracker,
  getCurrentPointTracker,
  getHashs,
  getSelectedTracker,
} from '../../Navigxy/slice/navixy.slice'

const customIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [50, 50],
})
export default function VehicleMapView(props) {
  const [center, setCenter] = useState([46.8182, 8.2275])
  const [zoom, setZoom] = useState(8)
  const [getLatAndLng, setGetLatAndLng] = useState([])
  const [historyTag, setHistoryTag] = useState([])
  const [position, setPosition] = useState()
  const [displayPol, setDisplayPol] = useState(false)
  const { map , MapComponent} = useMap();

  const selectedVehicule = useAppSelector(getSelectedVehicle)
  const dispatch = useAppDispatch()
  const vhs = useAppSelector(getNewTags)
  const hash = useAppSelector(getHashs)
  const currentPointTracker = useAppSelector(getCurrentPointTracker)

  const selectedTracker = useAppSelector(getSelectedTracker)
  let ref = useRef(null)
  let layerRef = useRef(null)
  let historyTags = useAppSelector(getHistoryTag)


  function MapEvents() {
    useMapEvent('click', async (e) => {
      setCenter(e.latlng)
      // ref.current.flyTo(e.latlng)
    })
  }

  useEffect(() => {
    setDisplayPol(false)
    dispatch(fetchHistoricalTag(selectedVehicule?.id)).then((res) => {
      if (res?.meta?.requestStatus === 'fulfilled') {
        dispatch(setIsLoading(false))
        const jsonParse = JSON.parse(res?.payload?.[0]?.historique)
        setHistoryTag(jsonParse)
        if (ref.current) {
          const firstLocation = jsonParse?.[0]
          ref.current.flyTo([parseFloat(firstLocation?.lat), parseFloat(firstLocation?.long)], 15, {
            duration: 3,
          })
        }
      }
      setDisplayPol(true)
    })
  }, [selectedVehicule])

  // useEffect(() => {
  //   if (selectedVehicule?.lat && selectedVehicule?.lng && typeof ref.current?.flyTo == 'function')
  //     ref.current.flyTo([selectedVehicule?.lat, selectedVehicule?.lng])
  // }, [selectedVehicule])

  return (
    <div {...props} className='position-relative'>
      <div
        className='position-absolute bg-white  shadow'
        style={{top: '10px', left: '10px', zIndex: '3', width: '300px'}}
      >
        <VehicleList />
      </div>
      <div
        className='position-absolute   bg-transparent'
        style={{bottom: '0', zIndex: '3', width: '100%'}}
      >
        <VehicleInfoSlider />
      </div>
      {!1 && <MapContainer
        zoomControl={false}
        zoom={zoom}
        ref={ref}
        center={center}
        className=''
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
        {displayPol ? (
          <>
            <Polyline
              positions={historyTag?.map((data) => [parseFloat(data?.lat), parseFloat(data?.long)])}
            />
            {historyTag?.map((data, index) => (
              <Marker
                icon={customIcon}
                key={index}
                position={[parseFloat(data?.lat), parseFloat(data?.long)]}
              >
                <Popup>
                  <div className='flex'>
                    <div>
                      Date: <div className='text-lg font-semibold'>{data?.dateHistorique}</div>
                      Location: <div className='text-lg font-semibold'>{data?.Location}</div>
                      Time: <div className='text-lg font-semibold'>{data?.timeHistorique}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        ) : null}
        {/* <SearchComponent></SearchComponent> */}
      </MapContainer>}
      <MapComponent />
    </div>
  )
}

// {selectedTracker != null ? (
//   <Marker
//     icon={customIcon}
//     position={[currentPointTracker?.lat, currentPointTracker?.lng]}
//     // eventHandlers={{
//     //   click: () => handleTrackerClick(selectedTracker?.lat, selectedTracker?.lng),
//     // }}
//   >
//     <Popup>
//       <div>
//         <div className='my-2'>
//           Tracker:<span className='font-bold ml-2'>{selectedTracker?.label}</span>
//         </div>
//         {/* <div className='flex'>
//               <div>Status: </div>
//               <span className='text-red-500 font-bold ml-2'>en panne</span>
//             </div> */}
//       </div>
//     </Popup>
//   </Marker>
// ) : null}
