import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchTags(data) {
  return await request('tag/list', {
    method: 'post',
    data,
  })
}

export async function _fetchTagsFree(id) {
  return await request('tag/list', {data: {IDCustomer: 0, displayAll: 1, all: 0}})
}

export async function _fetchTagsByStatus(src) {
  return await request('tag/bystatut', {data: {src}})
}

export async function _fetchEnginsByStatus(src) {
  return await request('engin/bystatut', {data: {src}})
}

export async function _fetchStatus() {
  return await request('status/list', {data: {src: 'tag'}})
}

export async function _saveTag(data) {
  return await request('tag/save', {
    method: 'post',
    data,
  })
}

export async function _fetchTagHistory(id) {
  return await request('tag/listHistory', {
    method: 'GET',
    data: {tagId: id},
  })
}

export async function _relationAdd(data) {
  return await request('relation/add', {
    method: 'post',
    data,
  })
}
export async function _fetchTagsToEngin(id) {
  return await request('engin/tags', {data: {id}})
}
export async function _removeEnginTag(objId) {
  return await request('relation/remove', {
    method: 'POST',
    data: {objId},
  })
}

export async function _removeTag(id) {
  return await request('tag/remove', {
    method: 'POST',
    data: {id},
  })
}

export async function _saveLang(data) {
  return await request('tag/save', {
    method: 'POST',
    data,
  })
}
