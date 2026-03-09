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
import {fetchEngines, getEngines} from '../../Engin/slice/engin.slice'
import {
  getEngineTagged,
  getEngineUnengineged,
  getEngineUntagged,
  setEngineTagged,
  setEngineUntagged,
} from '../slice/rfEngine.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {fetchObjectCount, getObjectCount} from '../../RFTag/slice/rftag.slice'

const RFEngineComponent = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [currentEngin, setCurrentEngin] = useState()
  const [active, setActive] = useState()

  const dispatch = useAppDispatch()

  let engineType = useAppSelector(getEngines)
  const engineTagged = useAppSelector(getEngineTagged)
  const engineUntagged = useAppSelector(getEngineUntagged)
  const objectCount = useAppSelector(getObjectCount)

  const engineCondition = [
    {code: 'Tagged', quantity: engineTagged?.length},
    {code: 'Untagged', quantity: engineUntagged?.length},
  ]

  const engineName = (rowData) => (
    <Chip
      label={<OlangItem olang={`${rowData?.code}`} />}
      icon={'pi pi-power-off'}
      style={{backgroundColor: rowData?.code === 'Tagged' ? '#523F8D' : '#D64B70'}}
      className='text-white'
    />
  )
  const engineQuantity = (rowData) => {
    return (
      <Avatar
        label={rowData?.quantity !== 0 ? rowData?.quantity : '0'}
        style={{backgroundColor: rowData?.code === 'Tagged' ? '#523F8D' : '#D64B70'}}
        className='text-white mr-2'
        size='large'
        shape='circle'
      />
    )
  }

  const showDetail = (e) => {
    setDialogVisible(true)
    setActive(e)
    setCurrentEngin(e)
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

  const enginQuantityTemplate = (rowData) => {
    return (
      <Avatar
        label={rowData?.Count}
        style={{backgroundColor: rowData?.statusBgColor}}
        className='text-white text-2xl font-bold mr-2'
        size='large'
        shape='circle'
      />
    )
  }

  const tagTemplate = (rowData) => {
    let image =
      rowData?.statusName === 'tagged'
        ? require('../../Engin/assets/LOGITAGCMYK.png')
        : require('../../Engin/assets/LOGITAGBLACK.png')

    return (
      <img
        src={image}
        title={rowData.statusName == 'tagged' ? `Tagged` : 'No Tag'}
        alt={rowData.statusName == 'tagged' ? `Tagged` : 'No Tag'}
        style={{width: '35px', height: '20%', objectFit: 'cover'}}
      />
    )
  }

  const columns = [
    {
      header: 'Engine',
      field: 'Count',
      olang: 'Engine',
      body: tagTemplate,
    },
    {
      header: 'Quantity',
      field: 'quantity',
      olang: 'Quantity',
      body: enginQuantityTemplate,
    },
    {
      header: 'Show',
      field: null,
      olang: 'Show',
      body: buttonShow,
    },
  ]
  const exportFields = [
    {label: 'Tags', column: 'Tagged'},
    {
      label: 'Quantity',
      column: 'quantity',
    },
  ]

  useEffect(() => {
    dispatch(fetchEngines({}))
  }, [])

  useEffect(() => {
    dispatch(setEngineTagged(engineType?.filter((it) => it.tagname !== '')))
    dispatch(setEngineUntagged(engineType?.filter((it) => it.tagname === null)))
  }, [engineType])

  useEffect(() => {
    dispatch(fetchObjectCount({srcObject: 'engin', srcStatut: ''}))
  }, [])

  return (
    <div className='card'>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'Sommaire.rftag'} />
        </h1>
      </div>
      <DetailTag
        dialogVisible={dialogVisible}
        engine={engineType}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        active={currentEngin?.statusName}
        statusLabel={currentEngin?.statusLabel}
      />
      <DatatableComponent
        tableId='rfEngine-table'
        data={objectCount ? objectCount : []}
        columns={columns}
      />
    </div>
  )
}

export default memo(RFEngineComponent)
