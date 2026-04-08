import {useState} from 'react'
import {Dialog} from 'primereact/dialog'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {getStatDetail} from '../../slice/locationTag.slice'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {
  fetchEnginListHistory,
  getSelectedEngine,
  setSelectedEngine,
} from '../../../Engin/slice/engin.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import {Image} from 'primereact/image'
import {Button} from 'primereact/button'
import {Divider} from 'primereact/divider'

const DetailEngin = ({dialogVisible, setDialogVisible, active}) => {
  const [visible, setVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [dialogVisibleMap, setDialogVisibleMap] = useState(false)

  const selectedEngin = useAppSelector(getSelectedEngine)
  const statDetail = useAppSelector(getStatDetail)

  const dispatch = useAppDispatch()

  const dialogFooterTemplate = (
    <ButtonComponent
      label={<OlangItem olang='OK' />}
      icon='pi pi-check'
      onClick={() => setDialogVisible(false)}
    />
  )

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

  const getPosOfAddress = (data) => {
    try {
      let obj = {
        srcId: data?.id,
        srcObject: 'Engin',
        srcMouvement: 'pos',
      }
      dispatch(setSelectedEngine(data))
      dispatch(fetchEnginListHistory(obj)).then(() => {
        setDialogVisibleMap(true)
      })
    } catch (error) {}
  }

  const addresseeTemplate = (rowData) => {
    return (
      <div>
        {rowData?.enginAddress ? (
          <Chip
            onClick={() => getPosOfAddress(rowData)}
            label={rowData?.enginAddress}
            className='w-11rem m-1 flex justify-content-center align-items-center cursor-pointer'
          />
        ) : (
          'No address found.'
        )}
      </div>
    )
  }

  const handleClickType = (rowData) => {
    dispatch(setSelectedEngine(rowData))
    setVisible(true)
  }

  const handleType = (e) => {
    setVisible(true)
    dispatch(setSelectedEngine(e))
  }

  const typeTemplate = (rowData) => {
    let typesArray
    try {
      typesArray = JSON.parse(rowData.types)
    } catch (error) {
      console.error('Error parsing JSON data:', error)

      typesArray = []
    }
    return (
      <>
        {rowData.types === '' ? (
          <ButtonComponent
            label={<OlangItem olang='ADD.Type' />}
            onClick={() => handleClickType(rowData)}
          />
        ) : (
          <div className='flex'>
            {typesArray?.slice(0, 2).map((o, index) => {
              return (
                <div>
                  <Chip key={index} label={`${o?.type}`} className='ml-2' />
                </div>
              )
            })}
            {typesArray?.length >= 3 ? <Chip label='...' className='ml-2' /> : null}
            <i
              className='ml-2 pi pi-window-maximize cursor-pointer hover:text-700'
              onClick={() => handleType(rowData)}
            ></i>
          </div>
        )}
      </>
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

  const iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname == 'exit') {
      icon = 'pi pi-arrow-up'
      color = '#D64B70'
    } else if (rowData?.etatenginname == 'reception') {
      icon = 'pi pi-arrow-down'
      color = 'green'
    } else if (rowData?.etatenginname == 'nonactive') {
      icon = 'pi pi-exclamation-triangle'
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

  const handleShowMap = (rowData, srcMouv = '') => {
    setMouvement(srcMouv)
    dispatch(setSelectedEngine(rowData))
    let obj = {
      srcId: rowData?.uid,
      srcObject: 'Engin',
    }
    dispatch(fetchEnginListHistory(obj)).then(() => {
      setDialogVisibleMap(true)
    })
  }

  const familleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.familleTag}
        title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        icon={rowData.familleIconTag}
        style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
        className='cursor-pointer'
        onClick={() => handleShowMap(rowData, '')}
      />
    )
  }

  const tagTemplate = (rowData) => {
    return (
      <div className='flex flex-column'>
        <div className='flex justify-content-center'>
          {rowData.tagId ? (
            familleTagTemplate(rowData)
          ) : (
            <Chip
              label='Untagged'
              className='cursor-pointer'
              onClick={() => handleShowMap(rowData, '')}
            />
          )}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Chip
            label={
              rowData?.labeltag === null ||
              rowData?.labeltag === '' ||
              rowData?.labeltag == undefined
                ? rowData?.tagname
                : rowData?.labeltag
            }
            className='m-2'
            style={{background: '#D64B70', color: 'white'}}
          />
        </div>
      </div>
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
          <span className={`block mt-2 font-bold text-lg ${textColor}`}>
            {batteries > 100 ? '100%' : batteries}
          </span>
        </div>
      </div>
    )
  }

  const tagIdTemplate = ({tagId}) => {
    return tagId == null || tagId === '' || tagId === undefined || tagId === 0 ? 'No Tag' : tagId
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
      olang: 'Photo',
      body: imageTemplate,
    },
    {
      header: 'Référence',
      field: 'reference',
      olang: 'Reference',
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
      body: tagTemplate,
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
    // {
    //   header: 'IMMATRICULATION',
    //   field: 'immatriculation',
    //   olang: 'IMMATRICULATION',
    // },
    {
      header: 'Matricule',
      field: 'model',
      olang: 'Matricule',
    },
    // {
    //   header: 'Type',
    //   field: 'types',
    //   olang: 'Type',
    //   body: typeTemplate,
    // },
    {
      header: 'Worksite',
      field: 'LocationObjectname',
      olang: 'Worksite',
    },

    {
      header: 'Addressee',
      olang: 'Addressee',
      field: 'enginAddress',
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

  const headerDialog = () => {
    return (
      <div className='flex flex-col'>
        <h3 className='text-start'>Engin {active?.engTitle}</h3>
        {/* <Button
          icon='pi pi-times'
          severity='danger'
          className='p-button-text'
          onClick={() => setDialogVisible(false)}
        /> */}
        <Divider />
      </div>
    )
  }

  return (
    <>
      <Dialog
        header={headerDialog}
        visible={dialogVisible}
        style={{width: '80vw', height: '80vh'}}
        onHide={() => setDialogVisible(false)}
        // footer={dialogFooterTemplate}
        closeIcon='pi pi-times text-red-500 font-bold '
        position='bottom-right'
      >
        {statDetail?.length > 0 ? (
          <div>
            <DatatableComponent
              tableId='tagLocation-table'
              data={statDetail}
              columns={columns}
              exportFields={exportFields}
              rowGroupTemplates={rowGroupTemplates}
              allowedGroupFields={allowedGroupFields}
            />
            <EnginMapLocation
              dialogVisible={dialogVisibleMap}
              setDialogVisible={() => setDialogVisibleMap((prev) => !prev)}
              historySrc={{
                srcId: selectedEngin?.id,
                srcObject: 'engin',
                srcMovement: mouvement,
              }}
            />
          </div>
        ) : (
          <div className='text-lg font-semibold'>
            <OlangItem olang='No.engin.found' />
          </div>
        )}
      </Dialog>
    </>
  )
}

export default DetailEngin
