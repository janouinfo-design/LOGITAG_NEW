import React, {useEffect, useState, memo} from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from 'primereact/dialog'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {fetchTagsByStatus, getTags, getTagsByStatus} from '../../../Tag/slice/tag.slice'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getTagActive, getTagInactive} from '../../slice/rftag.slice'
import {Dropdown} from 'primereact/dropdown'
import {tagsByStatus} from './../../../Tag/slice/tag.slice'
import GeocodingComponent from '../../../shared/GeocodingComponent/GeocodingComponent'

const DetailTag = ({dialogVisible, setDialogVisible, tags, active, statusLabel}) => {
  //tags = tags.filter((t) => t?.statusname === active?.statusName) //add filter for status
  const [tag, setTag] = useState()
  const [levelPower, setLevelPower] = useState()
  const dispatch = useAppDispatch()
  const tagsByStatus = useAppSelector(getTagsByStatus)

  let tagActive = useAppSelector(getTagActive)
  let tagInactive = useAppSelector(getTagInactive)

  const portalRoot = document.getElementById('portal')

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )
  const statusTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.status}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.status}
        style={{backgroundColor: `${rowData?.statusbgColor}`, color: `#ffffff`}}
      />
    )
  }

  const tagTemplate = (rowData) => {
    return (
      <div className='flex justify-content-center'>
        <img
          src={require('../../../Engin/assets/LOGITAGCMYK.png')}
          alt={rowData.tagname}
          style={{width: '40px', height: '20%', objectFit: 'cover'}}
        />
      </div>
    )
  }

  const namesTagTemplate = (rowData) => <div className='font-semibold text-lg'>{rowData?.name}</div>
  useEffect(() => {
    let obj = active?.code === 'Active' ? tagActive : tagInactive
    setTag(obj)
  }, [active])


  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <Chip
        label={famille}
        icon={familleIcon}
        style={{background: familleBgcolor, color: 'white'}}
      />
    )
  }

  const addresseeTemplate = ({enginAddress}) => {
    return (
      <>
        {
          <div>
            {enginAddress ? (
              <Chip
                label={enginAddress}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }

  const columns = [
    // {
    //   header: 'Tag',
    //   field: null,
    //   olang: 'Tag',
    //   body: tagTemplate,
    // },
    {
      header: 'ID.Tag',
      field: 'name',
      olang: 'ID Tag',
      // body: namesTagTemplate,
    },
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
    },
    {
      header: 'Famille',
      field: 'famille',
      olang: 'Famille',
      visible: true,
      body: familleTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
      body: addresseeTemplate,
    },
    {
      header: 'Satus',
      olang: 'Status',
      field: 'status',
      body: statusTemplate,
    },
    // {
    //   header: 'Battery status',
    //   olang: 'BatteryStatus',
    //   field: 'status',
    //   body: BatteryStatusTemplate,
    // },

    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  const exportFields = [
    {label: 'Nom', column: 'name'},
    {label: 'Label', column: 'label'},
    {label: 'Famille', column: 'famille'},
    // {label: 'Adresse', column: 'adresse'},
    {label: 'Satus', column: 'status'},
  ]

  const allowedGroupFields = ['famille', 'status']

  const rowGroupTemplates = {
    famille: (rowData) => familleTemplate(rowData),
    status: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.status} />
    ),
  }

  useEffect(() => {
    dispatch(fetchTagsByStatus(active))
  }, [active])

  return ReactDOM.createPortal(
    <Dialog
      header={`Tags ${statusLabel}`}
      visible={dialogVisible}
      style={{width: '80vw', height: '80vh'}}
      onHide={() => setDialogVisible(false)}
      position='bottom-right'
    >
      <DatatableComponent
        tableId='statutactuelrftagdetail-table'
        data={tagsByStatus}
        columns={columns}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        allowedGroupFields={allowedGroupFields}
      />
    </Dialog>,
    portalRoot
  )
}

export default DetailTag
