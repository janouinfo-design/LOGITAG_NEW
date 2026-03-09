import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'
import {psCore} from '../../../../api/axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchInvoicesByCodeClient(customerId) {
  return await request(`invoice/filter?data={custumerid:${customerId}}`)
}

export async function _saveInvoice(data) {
  return await request('invoice/save', {
    method: 'POST',
    data,
  })
}

export async function _fetchPdf(orderID) {
  return await request('Order/print', {
    data: {orderID: orderID},
  })
}

export async function _removeInvoice(id) {
  return await request('invoice/remove', {
    method: 'POST',
    data: {id, type: 'invoice'},
  })
}

export async function _saveLang(data) {
  return await psCoreRequest('save', {
    method: 'POST',
    data,
  })
}

export async function _fetchStatus() {
  return await request('status/list', {data: {id: 0, src: 'invoice'}})
}

export async function fetchInvoicesPs() {
  return await request('invoice/filter', {data: {custumerid: 0}})
}

export async function fetchInvoiceDetailData() {
  return request('catalog/list', {data: {custumerid: 0}})
}
export async function _fetchInvoiceDetail() {
  return await request('invoice/get')
}
