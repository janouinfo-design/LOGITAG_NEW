import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchTagsForClient(id) {
  return await request('tag/getbycustomer', {data: {id: id}})
}

export async function _removeClientTag(objId) {
  return await request('tag/removebycustomer', {
    method: 'POST',
    data: {idCustomer: objId.idCustomer, idTag: objId.idTag},
  })
}
