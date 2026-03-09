import {request } from '../../../api'


export async function _fetchAlerts(data) {
  return await request('alert/list', {
    method: 'post',
    data,
  })
}

export async function _saveAlert(data) {
  return await request('alert/save', {
    method: 'post',
    data,
  })
}
