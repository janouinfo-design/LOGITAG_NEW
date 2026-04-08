import {request as orequest, psCoreRequest} from '../../../../../api'
import _axios from './axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchConversationList(data) {
  return await request('communication/list', {
    method: 'POST',
    data,
  })
}
export async function _saveConversation(data) {
  return await request('communication/save', {
    method: 'POST',
    data,
  })
}

export async function _fetchMessagesList() {
  return await request('communication/mainList')
}

/**
 * Check if all messages are read
 * @returns {Promise} A promise resolved with data containing isReadAll
 * @example
 * const data = await _getUserRead()
 * console.log(data)
 */
export async function _getUserRead() {
  return await request('communication/isReadAll')
}

export async function _readMsg(data) {
  return await request('communication/isRead', {
    method: 'POST',
    data,
  })
}
