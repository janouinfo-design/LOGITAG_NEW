import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchCompany() {
  return await request('company/get', {data: {id: 1}})
}
export async function _fetchCompanyAddresses() {
  return await request('address/list', {data: {src: 'company', srcID: 1}})
}

export async function _fetchCustomerAddresses(id) {
  return await request('address/list', {data: {src: 'customer', srcID: id}})
}

export async function _saveCompany(data) {
  return await request('company/save', {
    method: 'post',
    data,
  })
}
export async function _saveAddress(data) {
  return await request('address/save', {
    method: 'post',
    data,
  })
}

export async function _saveLang(data) {
  return await request('tag/save', {
    method: 'POST',
    data,
  })
}

export async function _getVersion(data) {
  return await request('config/get', {
    method: 'POST',
    data,
  })
}
