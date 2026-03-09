import {psCoreRequest, request as orequest} from '../../../api'
import _axios from './axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchVehicules(data) {
  return await request('Vehicule/list', {
    method: 'POST',
    data,
  })
}

export async function _saveVehicule(data) {
  return await request('vehicule/save', {
    method: 'POST',
    data,
  })
}

export async function _removeVehicule(id) {
  return await request('vehicule/remove', {
    method: 'POST',
    data: {id},
  })
}
