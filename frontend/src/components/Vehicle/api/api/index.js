import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchVehicles() {
  return await request('list')
}

export async function _saveLang(data) {
  return await request('save', {
    method: 'POST',
    data,
  })
}

export async function _fetchHistoricalTag(id) {
  return await request('tag/gethistorique', {data: {id}})
}
