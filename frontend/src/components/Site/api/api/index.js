import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'
import {psCore} from '../../../../api/axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchSites(data) {
  return await request('worksite/list', {
    method: 'POST',
    data,
  })
}

export async function _fetchSitesClient(data) {
  return await request('worksite/list', {data: {IDCustomer: data}})
}

export async function _saveSite(data) {
  return await request('worksite/save', {
    method: 'POST',
    data,
  })
}

export async function _removeSite(id) {
  return await request('worksite/remove', {
    method: 'POST',
    data: {id},
  })
}
export async function _removeGeoFromSite(id) {
  return await request('worksite/remove', {
    method: 'POST',
    data: {id},
  })
}

export async function _fetchGeoForSite(id) {
  return await request('geofencing/GetGeofence', {
    data: {id: id},
  })
}

// export async function _fetchAddressPsCore(src = 'Worksite', srcID = 100) {
//   return await psCoreRequest('address/list', {data: {src, srcID}})
// }

export async function _fetchAddressPsCore(id) {
  return await request('address/list', {data: {src: 'Worksite', srcID: id}})
}

export async function _saveLang(data) {
  return await request('site/save', {
    method: 'POST',
    data,
  })
}
