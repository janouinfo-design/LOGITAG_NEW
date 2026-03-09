import {Dialog} from 'primereact/dialog'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getTagLocation, getTagLocationShow, setTagLocationShow} from '../../slice/tag.slice'
import MapHistoryComponent from '../../../shared/MapHistoryComponent/MapHistoryComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

const TagMapLocation = () => {
  const dispatch = useAppDispatch()
  const visible = useAppSelector(getTagLocationShow)
  const selectedTag = useAppSelector(getTagLocation)

  const header = () => {
    return (
      <div className='flex flex-row justify-content-between align-items-center px-5'>
        <div className='text-2xl font-semibold'>
          <OlangItem olang='TagLocation' />
        </div>
        <strong className='text-2xl'>{selectedTag?.tagName}</strong>
      </div>
    )
  }

  const onHide = () => {
    dispatch(setTagLocationShow(false))
  }

  return (
    <Dialog
      header={header}
      visible={visible}
      style={{
        width: '80vw',
        '@media screen and (max-width: 960px)': {width: '75vw'},
        '@media screen and (max-width: 641px)': {width: '100vw', padding: '50px'},
        '@media screen and (max-width: 320px)': {width: '100vw', padding: '50px'},
      }}
      onHide={onHide}
      position='bottom-right'
    >
      <MapHistoryComponent />
    </Dialog>
  )
}

export default TagMapLocation
