import _axios from './axios'
import {psCoreRequest, request as orequest} from '../../../api'
import moment from 'moment'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchInventories(obj) {
  return await request('Inventory/list', {
    method: 'POST',
    data: {dateFrom: obj.dateFrom, dateTo: obj.dateTo},
  })
}

//Inventory/details?data={id:30322,type:'nonscan'}
export async function _fecthInventoryDetail(obj) {
  return await request('Inventory/details', {data: obj})
}

export async function _saveInventory(data) {
  return await request('inventory/save', {
    method: 'POST',
    data,
  })
}

export async function _removeInventory(id) {
  return await request('inventory/remove', {
    method: 'POST',
    data: {id},
  })
}

//http://localhost:31000/Inventory/close?data={id:30323}
export async function _closedInventory(id) {
  return await request('Inventory/close', {
    method: 'POST',
    data: {id},
  })
}
