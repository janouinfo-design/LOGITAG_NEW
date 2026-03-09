import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'
import {psCore} from '../../../../api/axios'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _fetchEngineEvents(args) {
  if (args === null || args === undefined) {
    args.LocationID = 0
    args.LocationObject = ''
  }
  return await request('engin/event', {data: args})
}
