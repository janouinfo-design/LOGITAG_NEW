
import { psCoreRequest, request } from "../../../api";

export async function _fetchMenus(){
    return request('menu/get')
    //await psCoreRequest('menu/get');
}