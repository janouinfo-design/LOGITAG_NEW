import {useMemo} from 'react'
import {GoogleMap, useLoadScript, Marker} from '@react-google-maps/api'

const GoogleMapDetail = () => {
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: 'AIzaSyDNcOVNaruADFlD-IucNxNRP88h4MBNpAs',
  })
  if (!isLoaded) return <div>loading...</div>
  return (
    <GoogleMap
      center={{lat: 46.8182, lng: 8.2275}}
      zoom={10}
      mapContainerClassName='w-full h-19rem ml-8'
    ></GoogleMap>
  )
}
export default GoogleMapDetail
