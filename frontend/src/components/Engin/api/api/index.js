import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'
import {psCore} from '../../../../api/axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchEngines(args) {
  if (args === null || args === undefined) {
    args.LocationID = 0
    args.LocationObject = ''
  }
  return await request('engin/list', {
    data: {custumerid: 0, page: 0, PageSize: 5000, ...args},
  })
}

export async function _fetchEnginListHistory(data) {
  return await request('engin/listhistory', {
    method: 'post',
    data,
  })
}

export async function _fetchEnginListHistoryFromFlespi(data) {
  return await request('xflespi/list', {
    params: data,
  })
}
export async function _fetchTypeList() {
  return await request('types/list', {
    data: {src: 'engin', LocationObject: '', LocationID: 0},
  })
}

export async function _tagPosition(data) {
  return await request('tag/savePosition', {
    method: 'post',
    data,
  })
}
export async function _modifyStatus(data) {
  return await request('engin/modifyStatus', {
    method: 'post',
    data,
  })
}

export async function _getEngById(data) {
  return await request('engin/getForMap', {
    method: 'post',
    data,
  })
}

export async function _fetchStatusList(lng) {
  return await request('types/trcStatusList', {
    method: 'POST',
    data: {src: 'engin'},
  })
}

export async function _saveEngine(data) {
  return await request('engin/save', {
    method: 'POST',
    data,
  })
}

export async function _generateFile(data) {
  return await request('fileGenerator/save', {
    method: 'POST',
    data,
  })
}

export async function _checkFileGenerate(data) {
  return await request('fileGenerator/checkFile', {
    method: 'POST',
    data,
  })
}

export async function _fetchObjectsNoActive(data) {
  return await request('object/noActiveList', {
    method: 'POST',
    data,
  })
}

export async function _fetchStatusListHistory(data) {
  return await request('engin/statusListHistory', {
    method: 'POST',
    data,
  })
}

export async function _activateObject(data) {
  return await request('object/activate', {
    method: 'POST',
    data,
  })
}

export async function _fetchInactiveEngin(data) {
  return await request('engin/listnoactive', {
    method: 'POST',
    data,
  })
}

export async function _saveEngineTypes(data) {
  return await request('engin/saveTypes', {
    method: 'POST',
    data,
  })
}

export async function _removeEngine(id) {
  return await request('engin/remove', {
    method: 'POST',
    data: {id},
  })
}
export async function _deleteEngine(id) {
  return await request('engin/delete', {
    method: 'post',
    data: {id},
  })
}

export async function _deleteObject(data) {
  return await request('object/delete', {
    method: 'post',
    data,
  })
}

export async function _activateEngine(id) {
  return await request('engin/activate', {
    method: 'post',
    data: {id},
  })
}

export async function _saveLang(data) {
  return await request('engin/save', {
    method: 'POST',
    data,
  })
}

export async function _getGeoByIdGeo(data) {
  return await request('geofencing/GetGeofenceByID', {
    method: 'POST',
    data,
  })
}

export async function _saveFile(option) {
  return await request('file/save', {data: option})
}

export async function _fetchPotentialDeliveredHistory(filter) {
  return await request('engin/potentialDeliveredHistory', {data: filter})
}

export async function _fetchEnginsModels(filter) {
  return await request('engin/getModel', {data: filter})
}
