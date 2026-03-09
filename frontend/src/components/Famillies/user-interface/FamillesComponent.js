import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateFamille,
  fetchFamilles,
  getEditFamille,
  getFamilles,
  getSelectedFamille,
  getSelectedObject,
  getShow,
  setEditFamille,
  setExistItem,
  setSelectedFamille,
  setShow,
} from '../slice/famille.slice'
import FamilleDetail from './FamilleDetail/FamilleDetail'
import FamilleEditor from './FamilleEditor/FamilleEditor'
import FamilleList from './FamilleList/FamilleList'

function FamillesComponent() {
  let show = useAppSelector(getShow)
  let selectedFamille = useAppSelector(getSelectedFamille)
  const selectedObject = useAppSelector(getSelectedObject)

  let visible = useAppSelector(getEditFamille)
  const familles = useAppSelector(getFamilles)
  const dispatch = useAppDispatch()

  const save = (data) => {
    const newData = {...data, typesId: selectedObject?.typeId || 0}
    dispatch(createOrUpdateFamille(newData)).then((res) => {
      if (res.payload) {
        dispatch(setShow(true))
        dispatch(setEditFamille(false))
        dispatch(setExistItem(false))
        dispatch(setSelectedFamille(null))
        dispatch(fetchFamilles({src: selectedObject?.name}))
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

export default FamillesComponent
