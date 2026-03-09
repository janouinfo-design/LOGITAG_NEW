import _axios from '../../FacturationFornisseur/api/axios'
import {request as orequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchMatriceList() {
  return await request('/matrix/list', {data: {id: ''}})
}

export async function _fetchMatriceItemsList(id) {
  return await request('/matrix/getMatriceItems', {data: {ID_Matrice: id}})
}

export async function _fetchTarifList() {
  return await request('/tarif/list', {data: {id: ''}})
}
export async function _fetchTarifGet(id) {
  return await request('/tarif/get', {data: {id}})
}
export async function _fetchParamsList() {
  return await request('/tarif/getParamsNiveau')
}

export async function _fetchParametersList() {
  return await request('/tarif/getParametres')
}

export async function _fetchNiveauSrcDataList(id) {
  return await request(`/tarif/GetParamsNiveauSrcData?IdParam=${id}`)
}

export async function _fetchPrestationList() {
  return await request('/tarif/ClientGetPrestationList')
}

export async function _fetchEtatList() {
  return await request('/tarif/TarifGetEtat')
}

export async function _saveMatrix(data) {
  return await request('matrix/save', {
    method: 'post',
    data,
  })
}
export async function _getInfoClient(data) {
  return await request('customer/getinfo', {
    method: 'post',
    data,
  })
}
export async function _getInfoDepot(data) {
  return await request('customer/getinfo', {
    method: 'post',
    data,
  })
}
export async function _savePrixMatrix(data) {
  return await request('matrix/UpdatePrixMatrice', {
    method: 'post',
    data,
  })
}

export async function _fetchClientFac(data) {
  return await request('customer/list', {
    method: 'post',
    data,
  })
}

export async function _removeMatrice(id) {
  return await request('matrix/delete', {
    method: 'POST',
    data: {id},
  })
}

export async function _saveTarif(data) {
  return await request('tarif/save', {
    method: 'post',
    data,
  })
}
export async function _removeTarif(data) {
  return await request('tarif/remove', {
    method: 'post',
    data,
  })
}

export async function _fetchFactureValidation(data) {
  return await request('invoice/validationClient', {
    method: 'post',
    data,
  })
}

export async function _saveMatrixDetails(data) {
  return await request('matrix/AddDimension', {
    method: 'post',
    data,
  })
}

export async function _fetchInvoicePendingBilling(data) {
  return await request('invoicePendingBilling/client', {
    method: 'post',
    data,
  })
}

export async function _saveInvoicePendingBilling(data) {
  return await request('invoicePendingBilling/save', {
    method: 'post',
    data,
  })
}

export async function _facturedDropDownAuto(data) {
  return await request('invoice/facturedClientDropDown', {
    method: 'post',
    data,
  })
}

export async function _calculInvoice(data) {
  return await request('invoice/calculateFormule', {
    method: 'post',
    data,
  })
}

export async function _invoiceSaveNd(data) {
  return await request('invoice/save', {
    method: 'post',
    data,
  })
}

export async function _generatePdf(data) {
  return await request('fileGenerator/generate', {
    method: 'post',
    data,
  })
}
export async function _generatePdfGetStatus(data) {
  return await request('fileGenerator/getStatus', {
    method: 'post',
    data,
  })
}

export async function _fetchStatusFacture(data) {
  return await request('status/list', {
    method: 'post',
    data,
  })
}

export async function _updateService(data) {
  return await request('invoicePendingBilling/updatePrice', {
    method: 'post',
    data,
  })
}

export async function _getPercentage(data) {
  return await request('invoice/checkLineImported', {
    method: 'post',
    data,
  })
}

export async function _updateMultiPrice(data) {
  return await request('invoicePendingBilling/updatePriceServices', {
    method: 'post',
    data,
  })
}

export async function _updateStatusService(data) {
  return await request('service/updateStatut', {
    method: 'post',
    data,
  })
}

export async function _fetchArchivedClient(data) {
  return await request('invoice/archivedClient', {
    method: 'post',
    data,
  })
}

export async function _fetchDetailClient(data) {
  return await request('invoice/getClientInfo', {
    method: 'post',
    data,
  })
}

export async function _updatePriceCou(data) {
  return await request('invoicePendingBilling/updateCoutPrestation', {
    method: 'post',
    data,
  })
}
