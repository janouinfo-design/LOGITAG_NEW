import DetailFacture from '../../../FacturesList/user-interface/DetailFacture/DetailFacture'
import FornisseurValidationFac from './FornisseurValidationFac'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getDetailVisibleValid,
  getSelectedFrGlobal,
  setDetailVisibleValidFr,
} from '../../slice/factureFornisseur.slice'
import FacValidFrNew from './FacValidFrNew'

const FacValidComponent = () => {
  const dispatch = useAppDispatch()

  const visible = useAppSelector(getDetailVisibleValid)
  const selectedFr = useAppSelector(getSelectedFrGlobal)
  const onHideDetail = () => {
    dispatch(setDetailVisibleValidFr(false))
  }

  return (
    <>
      {visible ? (
        <DetailFacture
          selectedUser={selectedFr}
          idTable={'table-validation-fournisseur'}
          onHideDetail={onHideDetail}
        />
      ) : (
        <FacValidFrNew />
      )}
    </>
  )
}

export default FacValidComponent
