import {FormattedDisplayName} from 'react-intl'
import {
  setChatMessages,
  setUserRead,
} from '../_metronic/partials/layout/drawer-messenger/slice/Chat.slice'
import {
  setLastEnginUpdates,
  setSocketEnterOrExit,
  setSocketStatusChange,
  setUpdatedEngin,
  updateEnginLastSeen,
} from '../components/Engin/slice/engin.slice'
import {setMessage} from '../components/Planning/slice/planing.slice'
import {setLogs, setNewLogs} from '../components/LogsTracking/slice/logs.slice'
import {updateTrackersState} from '../components/Navigxy/slice/navixy.slice'
import {setChangeStaffStatus} from '../components/Repports/slice/rapports.slice'
export const socketEvents = {
  plan_message: (data, dispatch) => {
    console.log('plan_message data' , data)
    dispatch(setMessage(data))
  },
  tag_status_changed: (data, dispatch) => {},
  engin_status_changed: (data, dispatch) => {
    const check = data.data[0].typeMsg
    if (check == 'success') {
      dispatch(setSocketEnterOrExit(data))
    }
  },
  engin_state_changed: (data, dispatch) => {
    dispatch(setSocketStatusChange(data))
  },
  data_message: (data, dispatch, socketId) => {
    console.log('data_message', data , data?.socket == socketId)
    // if (data?.socket == socketId) return
    dispatch(setUserRead(1))
    dispatch(setChatMessages(data))
  },
  new_location: (data) => {},
  new_engin: (data) => {},
  new_location_push: (data, dispatch) => {
    dispatch(setLogs(data))
  },
  updated_engins: (data, dispatch) => {
    if (Array.isArray(data?.list) && data?.list?.length > 0) {
      // dispatch(setUpdatedEngin(data?.list))
    }
  },
  new_tags_logs: (data, dispatch) => {
    dispatch(setNewLogs({data: data.data, flespi: true}))
  },
  engin_last_seen_at: (data, dispatch) => {
    dispatch(updateEnginLastSeen(data.engins))
  },
  new_updated_engins(data, dispatch) {
    dispatch(setLastEnginUpdates(data?.engins))
  },
  worksite_statistiques(data, dispatch) {},
  navixy_trackers_state(data, dispatch) {
    dispatch(updateTrackersState(data.data))
  },
  emitUpdateStaffStats(data, dispatch) {
    console.log('emitUpdateStaffStats', data)
    dispatch(setChangeStaffStatus(data?.staffTimeWorking?.[0]))
  },
}
