import { useAppDispatch, useAppSelector } from '../../../hooks'
import {
  createOrUpdateFamille,
  fetchFamilles,
  getEditFamille,
  getFamilles,
  getSelectedFamille,
  getShow,
  setEditFamille,
  setExistItem,
  setSelectedFamille,
  setShow,
} from '../slice/statut.slice'
import FamilleDetail from './StatutDetail/StatutDetail'
import FamilleEditor from './StatutEditor/StatutEditor'
import FamilleList from './StatutList/StatutList'

function StatutComponent() {
  let show = useAppSelector(getShow)
  let selectedFamille = useAppSelector(getSelectedFamille)
  let visible = useAppSelector(getEditFamille)
  const familles = useAppSelector(getFamilles)
  const dispatch = useAppDispatch()

  const save = (data) => {
    dispatch(createOrUpdateFamille(data)).then((res) => {
      if (res.payload) {
        dispatch(setShow(true))
        dispatch(setEditFamille(false))
        dispatch(setExistItem(false))
        dispatch(setSelectedFamille(null))
      }
    })
    dispatch(setSelectedFamille(null))

  }
  const onHide = () => {
    // dispatch(setEditFamille(false))
    // dispatch(setSelectedFamille(null))
    // dispatch(setExistItem(false))
    
  }
  return (
    <div>
      {show ? (
        <FamilleList titleShow={true} detailView='Detail' familles={familles} />
      ) : (
        <FamilleDetail />
      )}
      <FamilleEditor
        famille={false}
        selectedFamille={selectedFamille}
        visible={visible}
        onHide={onHide}
        onSubmitHandler={(e) => save(e)}
      />
    </div>
  )
}

export default StatutComponent
