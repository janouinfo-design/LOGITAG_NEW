import {psCoreRequest, request as orequest} from '../../../api'
import _axios from './axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchTeams(data) {
  return await request('staff/list', {
    method: 'post',
    data,
  })
}

export async function _saveTeam(data) {
  return await request('staff/save', {
    method: 'post',
    data,
  })
}

export async function _saveUser(data) {
  return await request('staff/saveUser', {
    method: 'post',
    data,
  })
}

export async function _getTagTeam(data) {
  return await request('staff/tags', {
    method: 'post',
    data,
  })
}

export async function _removeTagTeam(data) {
  return await request('relation/remove', {
    method: 'POST',
    data,
  })
}

export async function _fetchTypeListStaff() {
  return await request('types/list', {
    data: {src: 'staffType', LocationObject: '', LocationID: 0},
  })
}

export async function _removeTeam(id) {
  return await request('staff/remove', {
    method: 'POST',
    data: {id},
  })
}

export async function _addTagTeam(data) {
  return await request('relation/save', {
    method: 'POST',
    data,
  })
}

export async function _saveLang(data) {
  return await request('save', {
    method: 'POST',
    data,
  })
}
