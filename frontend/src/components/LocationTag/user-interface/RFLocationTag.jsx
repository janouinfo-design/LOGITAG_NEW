import {useEffect, useState, memo} from 'react'
import {Button} from 'primereact/button'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {Avatar} from 'primereact/avatar'
import {useAppDispatch, useAppSelector} from '../../../hooks'

import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchStatDash,
  fetchStatDetail,
  getEnginsInside,
  getEnginsOutSide,
  getStatDash,
  setEnginsInside,
  setEnginsOutSide,
  setStatDetail,
} from '../slice/locationTag.slice'
import {fetchEngines, getEngines} from '../../Engin/slice/engin.slice'
import DetailEngin from './detailTag/DetailEngin'

const RFLocationTag = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [active, setActive] = useState()
  const [loadingShow, setLoadingShow] = useState(false)

  const dispatch = useAppDispatch()

  const allEngins = useAppSelector(getEngines)
  const enginsInside = useAppSelector(getEnginsInside)
  const enginsOutSide = useAppSelector(getEnginsOutSide)
  const statDash = useAppSelector(getStatDash)

  const enginsCondition = [
    {label: 'In Warehouse', code: 'enginInWarehouse', quantity: enginsInside?.length},
    {label: 'With Client', code: 'enginWithClient', quantity: enginsOutSide?.length},
  ]

  const enginName = (rowData) => (
    <Chip
      label={<OlangItem olang={`${rowData?.engTitle}`} />}
      icon={`fa fa-solid ${rowData.engIcon}`}
      style={{backgroundColor: rowData?.engBgColor}}
      className='text-white'
    />
  )
  const enginQuantity = (rowData) => {
    return (
      <Avatar
        label={rowData?.countEng ? rowData?.countEng : '0'}
        style={{backgroundColor: rowData?.engBgColor}}
        className='text-white text-2xl font-bold mr-2'
        size='large'
        shape='circle'
      />
    )
  }

  const showDetail = (e) => {
    setLoadingShow(true)
    setActive(e)
    dispatch(fetchStatDetail({src: e.engCode})).then(() => {
      setLoadingShow(false)
      setDialogVisible(true)
    })
  }

  const buttonShow = (rowData) => {
    return (
      <Button
        label={<OlangItem olang='Show' />}
        icon='pi pi-external-link'
        severity='help'
        // style={{backgroundColor: '#D64B70', color: 'white', border: '1px solid white'}}
        onClick={() => showDetail(rowData)}
        rounded
        loading={loadingShow && active?.engCode == rowData?.engCode}
        disabled={loadingShow}
      />
    )
  }

  const columns = [
    {
      header: 'Status',
      olang: 'Status',
      body: enginName,
    },
    {
      header: 'Quantity',
      olang: 'Quantity',
      body: enginQuantity,
    },
    {
      header: 'Show',
      field: null,
      olang: 'Show',
      body: buttonShow,
    },
  ]

  useEffect(() => {
    dispatch(fetchStatDash())
  }, [])

  return (
    <div className='card'>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'Situation.engintag'} />
        </h1>
      </div>
      <DetailEngin
        dialogVisible={dialogVisible}
        tags={allEngins}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        active={active}
      />
      <DatatableComponent
        tableId='tagsLocation-table'
        data={statDash}
        columns={columns}
        //exportFields={exportFields}
      />
    </div>
  )
}

export default memo(RFLocationTag)
