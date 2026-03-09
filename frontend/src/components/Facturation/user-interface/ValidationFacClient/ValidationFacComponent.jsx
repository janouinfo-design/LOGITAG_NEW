import {useAppDispatch, useAppSelector} from '../../../../hooks'
import DetailFacture from '../../../FacturesList/user-interface/DetailFacture/DetailFacture'
import {
  getDetailValidVisible,
  getSelectedClientGl,
  setDetailVisibleValid,
} from '../../slice/facturation.slice'
import FacturationList from './FacturationList'

const ValidationFacComponent = () => {
  const dispatch = useAppDispatch()

  const visibleDetail = useAppSelector(getDetailValidVisible)
  const selectedClientGb = useAppSelector(getSelectedClientGl)

  const onHideDetail = () => {
    dispatch(setDetailVisibleValid(false))
  }

  return (
    <>
      {visibleDetail ? (
        <DetailFacture
          selectedUser={selectedClientGb}
          idTable='table-validation-client'
          onHideDetail={onHideDetail}
        />
      ) : (
        <FacturationList />
      )}
    </>
  )
}

export default ValidationFacComponent
