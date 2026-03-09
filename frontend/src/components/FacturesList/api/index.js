import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchFactureList(data) {
  return await request('invoice/facturedClient', {
    method: 'POST',
    data,
  })
}

export async function _closeFacture(data) {
  return await request('invoice/cloture', {
    method: 'POST',
    data,
  })
}

export async function _getDetailFacture(data) {
  return await request('invoice/get', {
    method: 'POST',
    data,
  })
}

export async function _updateLine(data) {
  return await request('invoice/updateLineInvoice', {
    method: 'POST',
    data,
  })
}

export async function _getDetailService(data) {
  return await request('invoice/getDetailLineInvoice', {
    method: 'POST',
    data,
  })
}

export async function _recalculateFormule(data) {
  return await request('invoice/calculateFormuleForOneService', {
    method: 'POST',
    data,
  })
}
export async function _removeService(data) {
  return await request('invoice/removeLine', {
    method: 'POST',
    data,
  })
}

export async function _getHistoryFormule(data) {
  return await request('invoice/GetHistoryOrderLine', {
    method: 'POST',
    data,
  })
}
