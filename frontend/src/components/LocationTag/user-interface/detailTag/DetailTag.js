import {useEffect, useState, memo} from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from 'primereact/dialog'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppSelector} from '../../../../hooks'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Image} from 'primereact/image'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {getTagInside, getTagOutSide} from '../../slice/locationTag.slice'

const DetailTag = ({dialogVisible, setDialogVisible, active}) => {
  const [tag, setTag] = useState()

  let tagInside = useAppSelector(getTagInside)
  let tagOutSide = useAppSelector(getTagOutSide)


  const dialogFooterTemplate = (
    <ButtonComponent
      label={<OlangItem olang='OK' />}
      icon='pi pi-check'
      onClick={() => setDialogVisible(false)}
    />
  )

  useEffect(() => {
    let obj = active?.name === 'inside' ? tagInside : tagOutSide
    setTag(obj)
  }, [active])


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
      style={{backgroundColor: `${rowData?.statusbgColor}`, color: 'white'}}
    />
  )

  const namesTagTemplate = (rowData) => <div className='font-semibold text-lg'>{rowData?.name}</div>
  useEffect(() => {
    let obj = active?.code === 'tagInWarehouse' ? tagInside : tagOutSide
    setTag(obj)
  }, [active])

  const columns = [
    {
      header: 'ID.Tag',
      field: 'name',
      olang: 'ID Tag',
      body: namesTagTemplate,
    },
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
    },
    {
      header: active?.code === 'tagInWarehouse' ? 'Worksite' : 'Client',
      field: active?.code === 'tagInWarehouse' ? 'LocationObjectname' : 'Clients',
      olang: active?.code === 'tagInWarehouse' ? 'Worksite' : 'Client',
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
    {
      label: active?.code === 'tagInWarehouse' ? 'Worksite' : 'Clients',
      column: active?.code === 'tagInWarehouse' ? 'LocationObjectname' : 'Clients',
    },
    {label: 'Adresse', column: 'adresse'},
    {label: 'Satus', column: 'status'},
  ]

  return (
    <>
      <Dialog
        header={`TAG ${active?.code}`}
        visible={dialogVisible}
        style={{width: '80vw'}}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooterTemplate}
        position='right'
      >
        {tag?.length > 0 ? (
          <DatatableComponent
            tableId='tagLocation-table'
            data={tag}
            columns={columns}
            exportFields={exportFields}
          />
        ) : (
          <div className='text-lg font-semibold'>
            <OlangItem olang='No.tag.found' />
          </div>
        )}
      </Dialog>
    </>
  )
}

export default memo(DetailTag)
