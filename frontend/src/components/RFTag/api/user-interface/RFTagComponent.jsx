import React, {useEffect, useState, memo} from 'react'
import {classNames} from 'primereact/utils'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Tooltip} from 'primereact/tooltip'
import {Button} from 'primereact/button'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {Avatar} from 'primereact/avatar'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import DetailTag from './detailTag/DetailTag'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchTags, getTags} from '../../Tag/slice/tag.slice'
import {getTagActive, getTagInactive, setTagActive, setTagInactive} from '../slice/rftag.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const RFTagComponent = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [active, setActive] = useState()

  const dispatch = useAppDispatch()

  const tagsType = useAppSelector(getTags)
  const activeTag = useAppSelector(getTagActive)
  const inactiveTga = useAppSelector(getTagInactive)


  const tagsCondition = [
    {code: 'Active', quantity: activeTag?.length},
    {code: 'Inactive', quantity: inactiveTga?.length},
  ]

  const tagName = (rowData) => (
    <Chip
      label={rowData?.code}
      icon={'pi pi-power-off'}
      className={`${rowData?.code === 'Active' ? 'bg-green-600' : 'bg-red-600'} text-white`}
    />
  )
  const tagQuantity = (rowData) => (
    <Avatar
      label={rowData?.quantity}
      className={`${
        rowData?.code === 'Active' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
      } mr-2`}
      size='large'
      shape='circle'
    />
  )

  const showDetail = (e) => {
    setDialogVisible(true)
    setActive(e)
  }

  const buttonShow = (rowData) => {
    return (
      <Button
        label={<OlangItem olang='Show' />}
        icon='pi pi-external-link'
        onClick={() => showDetail(rowData)}
        rounded
      />
    )
  }

  const columns = [
    {
      header: 'Status',
      field: 'code',
      olang: 'Status',
      body: tagName,
    },
    {
      header: 'Quantity',
      field: 'quantity',
      olang: 'Quantity',
      body: tagQuantity,
    },
    {
      header: 'Show',
      field: null,
      olang: 'Show',
      body: buttonShow,
    },
  ]
  const exportFields = [{label: 'Tags', column: 'Tags'}]

  useEffect(() => {
    dispatch(fetchTags())
  }, [])

  useEffect(() => {
    dispatch(setTagActive(tagsType?.filter((it) => it.active === 1)))
    dispatch(setTagInactive(tagsType?.filter((it) => it.active === 0)))
  }, [tagsType])

  return (
    <div className='card'>
      <DetailTag
        dialogVisible={dialogVisible}
        tags={tagsType}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        active={active}
      />
      <DatatableComponent
        tableId='site-table'
        data={tagsCondition}
        columns={columns}
        exportFields={exportFields}
      />
    </div>
  )
}

export default memo(RFTagComponent)
