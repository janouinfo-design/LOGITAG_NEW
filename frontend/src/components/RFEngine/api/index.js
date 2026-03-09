import {psCoreRequest, request} from '../../../api'

export async function _fetchEngineTagNotTagged() {
  return await request('Engin/CountTagged')
}
