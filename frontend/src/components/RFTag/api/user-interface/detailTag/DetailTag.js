import React, {useEffect, useState, memo} from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from 'primereact/dialog'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppSelector} from '../../../../hooks'
import {getTags} from '../../../Tag/slice/tag.slice'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getTagActive, getTagInactive} from '../../slice/rftag.slice'

const DetailTag = ({dialogVisible, setDialogVisible, tags, active}) => {
  const [tag, setTag] = useState()

  let tagActive = useAppSelector(getTagActive)
  let tagInactive = useAppSelector(getTagInactive)

  const portalRoot = document.getElementById('portal')

  const dialogFooterTemplate = (
    <ButtonComponent label='Ok' icon='pi pi-check' onClick={() => setDialogVisible(false)} />
  )
  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )
  const statusTemplate = (rowData) => (
    <Chip
      label={rowData?.status}
      style={{backgroundColor: `${rowData?.statusColor}`, color: 'white'}}
    />
  )

  const namesTagTemplate = (rowData) => <div className='font-semibold text-lg'>{rowData?.code}</div>
  useEffect(() => {
    let obj = active?.code === 'Active' ? tagActive : tagInactive
    setTag(obj)
  }, [active])


  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID Tag',
      body: namesTagTemplate,
    },
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {
      header: 'Satus',
      olang: 'Status',
      field: 'status',
      body: statusTemplate,
    },

    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  const exportFields = [
    {label: 'Nom', column: 'code'},
    {label: 'Label', column: 'label'},
    {label: 'Adresse', column: 'adresse'},
    {label: 'Satus', column: 'status'},
  ]

  return ReactDOM.createPortal(
    <Dialog
      header={`Tags ${active?.code}`}
      visible={dialogVisible}
      style={{width: '80vw'}}
      onHide={() => setDialogVisible(false)}
      footer={dialogFooterTemplate}
      position='right'
    >
      <DatatableComponent
        tableId='site-table'
        data={tag}
        columns={columns}
        exportFields={exportFields}
      />
    </Dialog>,
    portalRoot
  )
}

export default memo(DetailTag)
