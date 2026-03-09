import {Chip} from 'primereact/chip'
import React, {useState, useEffect} from 'react'

const GeocodingComponent = ({apiKey, latitude, longitude, chip, styleDv}) => {
  const [address, setAddress] = useState(null)
  const key = process.env.REACT_APP_KEY_API_GOOGLE_ADDRESS
  useEffect(() => {
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
      apiKey == undefined || apiKey == null || apiKey == '' ? key : apiKey
    }`

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'OK' && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address
          setAddress(formattedAddress)
        } else {
          console.error('Unable to retrieve address.')
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }, [apiKey, latitude, longitude])

  return (
    <>
      {chip ? (
        <div className={styleDv}>{address}</div>
      ) : (
        <div>
          {address ? (
            <Chip
              label={address}
              className='w-11rem m-1 flex justify-content-center align-items-center'
            />
          ) : (
            'No address found.'
          )}
        </div>
      )}
    </>
  )
}

export default GeocodingComponent
