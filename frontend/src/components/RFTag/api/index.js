import {psCoreRequest, request} from '../../../api'

export async function _fetchObjectCount(srcObject, srcStatut) {
  return await request('Object/Count', {data: {srcObject, srcStatut}})
}
