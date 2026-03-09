import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchFactureList(data) {
  return await request('invoice/notFactured', {
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

export async function _fetchPendingFr(data) {
  return await request('invoicePendingBilling/provider', {
    method: 'POST',
    data,
  })
}

export async function _fetchFactureFr(data) {
  return await request('invoice/facturedProvider', {
    method: 'POST',
    data,
  })
}

export async function _fetchFactureValidationFr(data) {
  return await request('invoice/validationProvider', {
    method: 'post',
    data,
  })
}

export async function _fetchDropDownFr(data) {
  return await request('invoice/facturedProviderDropDown', {
    method: 'post',
    data,
  })
}

export async function _fetchFactureListFr(data) {
  return await request('invoice/facturedProvider', {
    method: 'post',
    data,
  })
}
export async function _fetchListFr(data) {
  return await request('provider/list', {
    method: 'post',
    data,
  })
}

export async function _saveStatusFac(data) {
  return await request('invoice/saveStatus', {
    method: 'post',
    data,
  })
}

export async function _mergeInvoices(data) {
  return await request('invoice/FacturerLines', {
    method: 'post',
    data,
  })
}
export async function _fetchArchivedFr(data) {
  return await request('invoice/archivedProvider', {
    method: 'post',
    data,
  })
}
