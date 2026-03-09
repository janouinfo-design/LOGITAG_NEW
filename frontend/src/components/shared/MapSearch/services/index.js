import { request } from '../api/request'

class Geocoder  {
    async  geocode(lat , lng){
        return await request({query: `latlng=${lat},${lng}`, service:'geocode'})
    }
    async  autocomplete(address){
        return await request({ query: `input=${address}`, service: 'place/autocomplete' })
    }
}

const geocodeInstance = new Geocoder()

export default geocodeInstance
