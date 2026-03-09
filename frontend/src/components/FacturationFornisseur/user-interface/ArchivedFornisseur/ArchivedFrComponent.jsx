import {useAppDispatch, useAppSelector} from '../../../../hooks'
import DetailFacture from '../../../FacturesList/user-interface/DetailFacture/DetailFacture'
import {
  getSelectedFrGlobal,
  getVisibleArchivedFr,
  setVisibleArchivedFr,
} from '../../slice/factureFornisseur.slice'
import ArchivedFornisseur from './ArchivedFornisseur'

const ArchivedFrComponent = () => {
  const visibleDetail = useAppSelector(getVisibleArchivedFr)
  const selectedFr = useAppSelector(getSelectedFrGlobal)
  const dispatch = useAppDispatch()

  const onHideDetail = () => {
    dispatch(setVisibleArchivedFr(false))
  }

  return (
    <div>
      {visibleDetail ? (
        <DetailFacture
          selectedUser={selectedFr}
          onHideDetail={onHideDetail}
          idTable='table-archive-fornisseur'
        />
      ) : (
        <ArchivedFornisseur />
      )}
    </div>
  )
}

export default ArchivedFrComponent
