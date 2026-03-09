import {useEffect, useState, memo} from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from 'primereact/dialog'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchEnginsByStatus,
  fetchTagsByStatus,
  getEnginsByStatus,
  getTags,
  getTagsByStatus,
} from '../../../Tag/slice/tag.slice'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getEngineTagged, getEngineUntagged} from '../../slice/rfEngine.slice'
import {Image} from 'primereact/image'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import GeocodingComponent from '../../../shared/GeocodingComponent/GeocodingComponent'
import {API_BASE_URL_IMAGE} from '../../../../api/config'

const DetailTag = ({dialogVisible, setDialogVisible, active}) => {
  const [engine, setEngine] = useState()
  const dispatch = useAppDispatch()
  const enginsByStatus = useAppSelector(getEnginsByStatus)
  let engineTagged = useAppSelector(getEngineTagged)
  let engineUntagged = useAppSelector(getEngineUntagged)


  const dialogFooterTemplate = (
    <ButtonComponent label='Ok' icon='pi pi-check' onClick={() => setDialogVisible(false)} />
  )

  useEffect(() => {
    let obj = active?.code === 'Tagged' ? engineTagged : engineUntagged
    setEngine(obj)
  }, [active])

  const imageTemplate = (rowData) => (
    <Image
      src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
      alt='EngineImage'
      width='60'
      height='60'
      preview
      imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
    />
  )
  const fakeData = [
    {
      dernierFoisVuAdresse: 'Rue du Rhône 14',
      dateEtHeure: '2023-06-22 10:30:00',
    },
  ]
  const _addresseeTemplate = (rowData) => {
    if (
      rowData.enginAddress == '' ||
      rowData.enginAddress == null ||
      rowData.enginAddress == undefined
    ) {
      return ''
    }
    return (
      <>
        <Chip
          icon='pi pi-map-marker'
          label={rowData.enginAddress}
          className='w-11rem m-1 flex justify-content-center align-items-center'
        />

        {/* {fakeData.map((item, index) => (
          <div key={index}>
            <div className='flex flex-column justify-content-center'>
              <Chip
                icon='pi pi-map-marker'
                label={item.dernierFoisVuAdresse}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
              <Chip
                label={item.dateEtHeure}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
            </div>
          </div>
        ))} */}
      </>
    )
  }

  const __addresseeTemplate = ({addressName}) => {
    return (
      <div>
        {addressName ? (
          <Chip
            label={addressName}
            className='w-11rem m-1 flex justify-content-center align-items-center'
          />
        ) : (
          'No address found.'
        )}
      </div>
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

  const typeTemplate = (rowData) => {
    let typesArray
    if (rowData.types !== '') {
      typesArray = JSON.parse(rowData.types)
    } else {
      typesArray = []
    }
    return (
      <>
        {typesArray.slice(0, 2).map((o, index) => (
          <Chip key={index} label={`${o.type}`} className='ml-2' />
        ))}
      </>
    )
  }

  const tagIdTemplate = ({tagId}) => {
    return tagId == null || tagId === '' || tagId === undefined || tagId === 0 ? 'No Tag' : tagId
  }

  const handleShowMap = (rowData, srcMouv = '') => {
    // setMouvement(srcMouv)
    // dispatch(setSelectedEngine(rowData))
    // setDialogVisible(true)
  }

  const iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname === 'exit') {
      icon = 'fa-solid fa-up-from-bracket'
      color = '#D64B70'
    } else if (rowData?.etatenginname === 'reception') {
      icon = 'fa-solid fa-down-to-bracket'
      color = 'green'
    } else if (rowData?.etatenginname === 'nonactive') {
      icon = 'fa-solid fa-octagon-exclamation'
      color = 'red'
    }
    return (
      <div>
        <i
          style={{color}}
          className={`${icon} text-2xl rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin} ${rowData?.locationDate ?? '2023-06-22 10:30:00 Test '}`}
          alt={`${rowData?.etatengin} ${rowData?.locationDate ?? '2023-06-22 10:30:00  Test'}`}
          onClick={() => handleShowMap(rowData, 'entry_exit')}
        ></i>
      </div>
    )
  }

  const statusTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.statuslabel}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.statuslabel}
        style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}}
        title={`${rowData?.statusDate}`}
      />
    )
  }

  const BatteryStatus = ({batteries, locationDate}) => {
    let batteryIcon
    let textColor
    let alt
    if (batteries === '' || batteries === null || batteries === undefined) {
      batteryIcon = 'fas fa-battery-empty'
      textColor = 'text-700'
      alt = 'No data'
    } else {
      const batteryValue = parseInt(batteries, 10)
      alt = locationDate ?? 'No date'
      if (batteryValue >= 80) {
        batteryIcon = 'fas fa-battery-full'
        textColor = 'text-success'
      } else if (batteryValue >= 50) {
        batteryIcon = 'fas fa-battery-three-quarters'
        textColor = 'text-success'
      } else if (batteryValue >= 20) {
        batteryIcon = 'fas fa-battery-half'
        textColor = 'text-warning'
      } else if (batteryValue > 0) {
        batteryIcon = 'fas fa-battery-quarter'
        textColor = 'text-danger'
      } else {
        batteryIcon = 'fas fa-battery-empty'
        textColor = 'text-danger'
      }
    }

    return (
      <div className='flex items-center justify-center'>
        <div className='p-4 rounded-lg text-center'>
          <i title={alt} alt={alt} className={`text-4xl ${batteryIcon} ${textColor}`}></i>
          <span className={`block mt-2 font-bold text-lg ${textColor}`}>{batteries}</span>
        </div>
      </div>
    )
  }

  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <Chip
        label={famille}
        icon={familleIcon}
        style={{background: familleBgcolor, color: 'white'}}
      />
    )
  }

  const columns = [
    {
      header: 'Photo',
      field: 'image',
      body: imageTemplate,
    },
    {
      header: 'Référence',
      field: 'reference',
      olang: 'reference',
    },
    {
      header: 'TagId',
      field: 'tagId',
      olang: 'tagId',
      body: tagIdTemplate,
    },
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
    },
    {
      header: 'Vin',
      field: 'vin',
      olang: 'vin',
    },
    {
      header: 'Etat',
      field: 'etatenginname',
      olang: 'Etat',
      body: iconTemplate,
    },
    {
      header: 'Tag',
      field: 'tagname',
      olang: 'Tag',
      //body: tagTemplate,
    },
    {
      header: 'Status',
      olang: 'status',
      field: 'statuslabel',
      body: statusTemplate,
    },
    {
      header: 'Battery status',
      olang: 'BatteryStatus',
      field: 'batteries',
      body: BatteryStatus,
    },
    {
      header: 'Famille',
      field: 'famille',
      olang: 'Famille',
      visible: true,
      body: familleTemplate,
    },
    {
      header: 'Marque',
      field: 'brand',
      olang: 'marque',
    },
    {
      header: 'IMMATRICULATION',
      field: 'immatriculation',
      olang: 'IMMATRICULATION',
    },
    {
      header: 'Matricule',
      field: 'model',
      olang: 'Matricule',
    },
    {
      header: 'VIN',
      field: 'vin',
      olang: 'VIN',
    },
    // {
    //   header: 'Type',
    //   field: null,
    //   olang: 'Type',
    //   body: typeTemplate,
    // },
    {
      header: 'Addressee',
      olang: 'Addressee',
      field: null,
      body: addresseeTemplate,
    },
  ]

  const exportFields = [
    {
      label: 'Référence',
      column: 'reference',
    },
    {
      label: 'Marque',
      column: 'brand',
    },
    {
      label: 'TagId',
      column: 'tagId',
    },
    {
      label: 'Label',
      column: 'label',
    },
    {
      label: 'Vin',
      column: 'vin',
    },
    {
      label: 'Etat',
      column: 'etatenginname',
    },
    {
      label: 'Tag',
      column: 'tagname',
    },
    {
      label: 'Status',
      column: 'statuslabel',
    },
    {
      label: 'Battery status',
      column: 'batteries',
    },
    {
      label: 'Famille',
      column: 'famille',
    },
    {
      label: 'IMMATRICULATION',
      column: 'immatriculation',
    },
    {
      label: 'Matricule',
      column: 'model',
    },
    {
      label: 'Worksite',
      column: 'LocationObjectname',
    },
  ]

  const rowGroupTemplates = {
    reference: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.reference} />
    ),
    tagId: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.tagId} />
    ),
    field: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.field} />
    ),
    label: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.label} />
    ),
    vin: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.vin} />
    ),
    etatenginname: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.etatenginname} />
    ),
    tagname: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.tagname} />
    ),
    statuslabel: (rowData) => (
      <Chip
        style={{backgroundColor: rowData.statusbgColor, color: 'white'}}
        label={rowData?.statuslabel}
      />
    ),
    batteries: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.batteries} />
    ),
    famille: (rowData) => familleTemplate(rowData),
    brand: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.brand} />
    ),
    immatriculation: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.immatriculation} />
    ),
    model: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.model} />
    ),
    LocationObjectname: (rowData) => (
      <Chip
        style={{backgroundColor: '#D64B70', color: 'white'}}
        label={rowData?.LocationObjectname}
      />
    ),
    Addresse: (rowData) => (
      <Chip
        style={{backgroundColor: '#D64B70', color: 'white'}}
        label={addresseeTemplate(rowData)}
      />
    ),
  }

  const allowedGroupFields = [
    'famille',
    'statuslabel',
    'LocationObjectname',
    'etatenginname',
    'tagname',
    'batteries',
  ]

  useEffect(() => {
    dispatch(fetchEnginsByStatus(active))
  }, [active])

  return (
    <>
      <Dialog
        header={`Engine ${active?.code ?? ''} `}
        visible={dialogVisible}
        style={{height: '80vh', width: '80vw'}}
        onHide={() => setDialogVisible(false)}
        position='bottom-right'
      >
        {enginsByStatus?.length > 0 ? (
          <DatatableComponent
            tableId='engines-table'
            // height={'60vh'}
            rows={5}
            data={enginsByStatus}
            columns={columns}
            exportFields={exportFields}
            rowGroupTemplates={rowGroupTemplates}
            allowedGroupFields={allowedGroupFields}
          />
        ) : (
          <div className='text-lg font-semibold'>
            <OlangItem olang='No.engine.found' />
          </div>
        )}
      </Dialog>
    </>
  )
}

export default DetailTag
