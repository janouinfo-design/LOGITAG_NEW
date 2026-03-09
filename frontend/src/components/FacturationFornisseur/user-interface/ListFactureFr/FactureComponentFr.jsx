import {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getSelectedFrGlobal,
  getShowDetailFacFr,
  setFactureListFr,
  setShowDetailFacFr,
} from '../../slice/factureFornisseur.slice'
import FacturesListFr from './FacturesListFr'
import {useLocation} from 'react-router-dom'
import DetailFacture from '../../../FacturesList/user-interface/DetailFacture/DetailFacture'

const FactureComponentFr = () => {
  const detailVisible = useAppSelector(getShowDetailFacFr)
  const selectedFr = useAppSelector(getSelectedFrGlobal)

  const dispatch = useAppDispatch()
  const location = useLocation()

  const onHideDetail = () => {
    dispatch(setShowDetailFacFr(false))
  }

  useEffect(() => {
    if (location.pathname !== '/facture/fournisseurFacturer') {
      dispatch(setFactureListFr([]))
    }
  }, [location.pathname])

  return (
    <>
      {detailVisible ? (
        <DetailFacture
          selectedUser={selectedFr}
          idTable='table-detail-fournisseur'
          onHideDetail={onHideDetail}
        />
      ) : (
        <FacturesListFr />
      )}
    </>
  )
}

export default FactureComponentFr
