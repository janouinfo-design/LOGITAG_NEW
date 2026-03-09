import {useEffect, useState, memo} from 'react'
import {Button} from 'primereact/button'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {Avatar} from 'primereact/avatar'
import DetailTag from './detailTag/DetailTag'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchTags, getTags} from '../../Tag/slice/tag.slice'
import {
  fetchObjectCount,
  getObjectCount,
  getTagActive,
  getTagInactive,
  setTagActive,
  setTagInactive,
} from '../slice/rftag.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const RFTagComponent = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [currentTag, setCurrentTag] = useState()

  const dispatch = useAppDispatch()

  const tagsType = useAppSelector(getTags)
  const activeTag = useAppSelector(getTagActive)
  const inactiveTga = useAppSelector(getTagInactive)
  const objectCount = useAppSelector(getObjectCount)

  const showDetail = (e) => {
    setDialogVisible(true)
    setCurrentTag(e)
  }

  const buttonShow = (rowData) => {
    return (
      <Button
        label={<OlangItem olang='Show' />}
        icon='pi pi-external-link'
        style={{backgroundColor: '#D64B70', color: 'white', border: '1px solid white'}}
        onClick={() => showDetail(rowData)}
        rounded
      />
    )
  }

  const statusTemplate = (rowData) => {
    if (rowData?.statusIcon) {
      return (
        <i
          title={rowData?.statusLabel}
          className={`${rowData?.statusIcon} text-5xl rounded p-2`}
          style={{color: `${rowData.statusBgColor}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.statusLabel}
        style={{background: `${rowData.statusBgColor}`, color: rowData.color ?? 'white'}}
        title={`${rowData?.statusDate}`}
      />
    )
  }

  const tagQuantityTemplate = (rowData) => {
    return (
      <Avatar
        label={rowData?.countTag}
        style={{backgroundColor: rowData?.statusBgColor}}
        className='text-white text-2xl font-bold mr-2'
        size='large'
        shape='circle'
      />
    )
  }

  const columns = [
    {
      header: 'Status',
      field: 'statusLabel',
      olang: 'Status',
      body: statusTemplate,
    },
    {
      header: 'Quantity',
      field: 'countTag',
      olang: 'Quantity',
      body: tagQuantityTemplate,
    },
    {
      header: 'Show',
      field: null,
      olang: 'Show',
      body: buttonShow,
    },
  ]
  const exportFields = [
    {label: 'Tags', column: 'Tags'},
    {label: 'Quantity', column: 'countTag'},
  ]

  useEffect(() => {
    dispatch(fetchTags())
  }, [])

  useEffect(() => {
    dispatch(
      setTagActive(tagsType?.filter((it) => it.relationId === null && it.statusname !== 'NotReady'))
    )
    dispatch(setTagInactive(tagsType?.filter((it) => it.statusname === 'NotReady')))
  }, [tagsType])

  useEffect(() => {
    dispatch(fetchObjectCount({srcObject: 'tag', srcStatut: ''}))
  }, [])

  return (
    <div className='card'>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'Situation.tags'} />
        </h1>
      </div>
      <DetailTag
        dialogVisible={dialogVisible}
        tags={tagsType ? tagsType : []}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        active={currentTag?.statusName}
        statusLabel={currentTag?.statusLabel}
      />
      <DatatableComponent
        tableId='statutactuelrftag-table'
        data={objectCount ? objectCount : []}
        columns={columns}
        exportFields={exportFields}
      />
    </div>
  )
}

export default memo(RFTagComponent)
