import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'
import {psCore} from '../../../api/axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchDashboard(data) {
  return await request('tag/dashboard', {
    method: 'POST',
    data,
  })
}

export async function _fetchDashboardDetail(code) {
  return await request('tag/dashboarddetail', {
    method: 'POST',
    data: {src: code},
  })
}

export async function _fetchStatisticDash(filter) {
  return await request('statistics/GetResults', {
    method: 'POST',
    data: filter
  })
}

export async function _fetchEnginCountByLocation(filter){
   return await request('engin/enginCountByLocation', {
    method: 'POST',
    data: filter
   })
}
