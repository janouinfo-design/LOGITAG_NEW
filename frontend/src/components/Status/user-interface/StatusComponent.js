import {useAppDispatch, useAppSelector} from '../../../hooks'

import StatusList from './StatusList/StatusList'
import StatusDetail from './StatusDetail/StatusDetail'
import {
  getEditStatus,
  getSelectedStatus,
  getShow,
  getStatus,
  setEditStatus,
} from '../slice/status.slice'
import StatusEditor from './StatusEditor/StatusEditor'

function StatusComponent() {
  let show = useAppSelector(getShow)
  let selectedStatus = useAppSelector(getSelectedStatus)
  let visible = useAppSelector(getEditStatus)
  const statuss = useAppSelector(getStatus)
  const dispatch = useAppDispatch()
  return (
    <div>
      {show ? (
        <StatusList titleShow={true} detailView='Detail' statuss={statuss} />
      ) : (
        <StatusDetail />
      )}
      <StatusEditor
        engin={false}
        selectedStatus={selectedStatus}
        visible={visible}
        onHide={() => dispatch(setEditStatus(false))}
        //onSubmitHandler={(e) => save(e)}
      />
    </div>
  )
}

export default StatusComponent
