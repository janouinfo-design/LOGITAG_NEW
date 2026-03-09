import {psCoreRequest, request} from '../../../api'

export async function _fetchStatDash(data) {
  return await request('engin/statistic', {
    method: 'POST',
    data,
  })
}

export async function _fetchStatByCode(data) {
  return await request('engin/statisticDetail', {
    method: 'POST',
    data,
  })
}
