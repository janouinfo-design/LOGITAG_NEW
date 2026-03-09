import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchDepots(data) {
  return await request('deposit/list', {
    method: 'POST',
    data,
  })
}

export async function _saveDepot(data) {
  return await request('deposit/save', {
    method: 'POST',
    data,
  })
}

export async function _removeDepot(id) {
  return await request('deposit/remove', {
    method: 'POST',
    data: {id},
  })
}

export async function _fetchAddressPsCore(id) {
  return await request('address/list', {data: {src: 'deposit', srcID: id}})
}

export async function _relationAdd(data) {
  return await request('relation/add', {
    method: 'post',
    data,
  })
}

export async function _fetchGeoForDepot(id, src) {
  return await request('geofencing/GetGeofence', {
    data: {id: id, src: src},
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

export async function _saveLang(data) {
  return await request('site/save', {
    method: 'POST',
    data,
  })
}
