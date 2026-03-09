import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getSelectedGeoClient,
  getSelectedSiteClient,
  setSelectedGeoClient,
} from '../../../../store/slices/customer.slice'
import {getPointGeo, getSelectedGeo} from '../../../Navigxy/slice/navixy.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  addGeoToSite,
  fetchGeoForSite,
  getLinkTo,
  getSelectedSite,
  setLinkTo,
} from '../../slice/site.slice'

const LinkTo = ({labelSite, selectedSite}) => {
  let show = useAppSelector(getLinkTo)
  let selectedGeo = useAppSelector(getSelectedGeoClient)
  let selectedPointGeo = useAppSelector(getPointGeo)

  const dispatch = useAppDispatch()

  const onHide = () => {
    dispatch(setLinkTo(false))
  }

  const save = () => {
    dispatch(addGeoToSite({selectGeo: selectedGeo?.id, selectSite: selectedSite?.id})).then(
      (res) => {
        if (res.payload) {
          dispatch(fetchGeoForSite(selectedSite?.id))
          dispatch(setSelectedGeoClient(null))
          dispatch(setLinkTo(false))
        }
      }
    )
  }

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent label='No' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Yes' className='ml-2' onClick={save} />
    </div>
  )

  const message = (
    <div>
      Do you wanna link this {selectedSite?.name} to this {labelSite}
    </div>
  )

  return (
    <DialogComponent visible={show} footer={footer} onHide={onHide}>
      <div>
        <h5>
          <OlangItem olang={message} />
        </h5>
      </div>
    </DialogComponent>
  )
}

export default LinkTo
