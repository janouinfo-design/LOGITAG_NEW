import {useAppDispatch, useAppSelector} from '../../../../../hooks'
import DetailFacture from '../../../../FacturesList/user-interface/DetailFacture/DetailFacture'
import {
  getSelectedClientGl,
  getVisibleArchivedCl,
  setVisibelArchivedCl,
} from '../../../slice/facturation.slice'
import ArchivedClient from './ArchivedClient'

const ArchivedComponentCl = () => {
  const visibleDetails = useAppSelector(getVisibleArchivedCl)
  const selectedClientGb = useAppSelector(getSelectedClientGl)
  const dispatch = useAppDispatch()
  const onHideDetail = () => {
    dispatch(setVisibelArchivedCl(false))
  }

  return (
    <div>
      {visibleDetails ? (
        <DetailFacture
          selectedUser={selectedClientGb}
          idTable='table-archive-client'
          onHideDetail={onHideDetail}
        />
      ) : (
        <ArchivedClient />
      )}
    </div>
  )
}

export default ArchivedComponentCl
