import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchEnginesRapport(data) {
  return await request('engin/list', {
    method: 'GET',
    data,
  })
}

export async function _buildRapport(data) {
  return await request('engin/rapport', {
    method: 'post',
    data,
  })
}

export async function _fetchStatusRapport(data) {
  return await request('fileGenerator/getStatus', {
    method: 'post',
    data,
  })
}

export async function _getListRpt(data) {
  return await request('engin/rapportGet', {
    method: 'post',
    data,
  })
}

export async function _deleteRapport(data) {
  return await request('engin/rapportDelete', {
    method: 'post',
    data,
  })
}

export async function _fetchListRpt(data) {
  return await request('engin/rapportList', {
    method: 'post',
    data,
  })
}

export async function _fetchWeekTime(data) {
  return await request('staff/WeeklyTimeCalculation', {
    method: 'post',
    data,
  })
}

export async function _fetchDetailsWeek(data) {
  return await request('staff/WeeklyTimeCalculationDetails', {
    method: 'post',
    data,
  })
}

export async function _fetchCalendarWork(data) {
  return await request('staff/getCalendarByDate', {
    method: 'post',
    data,
  })
}

export async function _fetchDetailPresence(data) {
  return await request('staff/DisplayCalendarHistory', {
    method: 'post',
    data,
  })
}

export async function _generateReport(data) {
  return await request('staff/rapport', {
    method: 'post',
    data,
  })
}

export async function _generateReportCsv(data) {
  return await request('staff/generateXLS', {
    method: 'post',
    data,
  })
}

export async function _fetchTimeStatus(data) {
  return await request('status/list', {
    method: 'post',
    data,
  })
}

export async function _updateTimeStatus(data) {
  return await request('staff/updateHistory', {
    method: 'post',
    data,
  })
}

export async function _fetchUserHistoric(data) {
  return await request('positions/getHistorique', {
    method: 'post',
    data,
  })
}
