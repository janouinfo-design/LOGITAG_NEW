import {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {getVisibleDetailFac, setFactureList, setVisibleDetailFac} from '../slice/factureListSlice'
import DetailFacture from './DetailFacture/DetailFacture'
import FacturesList from './FacturesList'
import {useLocation} from 'react-router-dom'
import {getSelectedClientGl} from '../../Facturation/slice/facturation.slice'

const FactureComponent = () => {
  const detailVisible = useAppSelector(getVisibleDetailFac)
  const selectedClientGb = useAppSelector(getSelectedClientGl)
  const location = useLocation()
  const dispatch = useAppDispatch()

  const onHideDetail = () => {
    dispatch(setVisibleDetailFac(false))
  }

  useEffect(() => {
    if (location.pathname !== '/facture/clientFacturer') {
      dispatch(setFactureList([]))
      dispatch(setVisibleDetailFac(false))
    }
  }, [location.pathname])

  return (
    <>
      {detailVisible ? (
        <DetailFacture
          selectedUser={selectedClientGb}
          idTable='table-detail-client'
          onHideDetail={onHideDetail}
        />
      ) : (
        <FacturesList />
      )}
    </>
  )
}

export default FactureComponent
