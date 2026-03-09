import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchLogList(data) {
  return await request('logs/list', {
    method: 'post',
    data,
  })
}

export async function _fetchGeoById(data) {
  return await request('geofencing/GetGeofenceByWorksite', {
    method: 'post',
    data,
  })
}

export async function _fetchStaffList(data) {
  return await request('staff/list', {
    method: 'post',
    data,
  })
}

export async function _fetchEnginesList(args) {
  if (args === null || args === undefined) {
    args.LocationID = 0
    args.LocationObject = ''
  }
  return await request('engin/list', {
    data: {custumerid: 0, ...args},
  })
}

export async function _fetchEnginByTag(data) {
  return await request('engin/byMac', {
    method: 'post',
    data,
  })
}
