import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchFamilles(src) {
  return await request('Types/list', {
    data: {src, LocationObject: '', LocationID: 0},
  })
}

export async function _fetchIcons() {
  return await request('Types/iconslist')
}

export async function _saveFamille(data) {
  return await request('Types/saveFamille', {
    method: 'post',
    data,
  })
}

export async function _fetchObject() {
  return await request('types/typeItemsList', {data: {src: 'StatusTypes'}})
}

export async function _fetchObjectFamilles() {
  return await request('types/typeItemsList', {data: {src: 'StatusTypes'}})
}

export async function _removeFamille(id) {
  return await request('Types/remove', {
    method: 'POST',
    data: {id},
  })
}
