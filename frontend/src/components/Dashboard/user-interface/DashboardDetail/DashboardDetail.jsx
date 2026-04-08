import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchDashboardDetail,
  getCardSelected,
  getDashboardDetail,
  getSelectedDashboard,
  setEditDashboard,
  setSelectedDashboardDetail,
} from '../../slice/dashboard.slice'
import {Image} from 'primereact/image'
import {Chip} from 'primereact/chip'
import {getSelectedEngine, setSelectedEngine} from '../../../Engin/slice/engin.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import GeocodingComponent from '../../../shared/GeocodingComponent/GeocodingComponent'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {Avatar} from 'primereact/avatar'
import {FamilleTagTemplate} from '../../../Tag/user-interface/TagList/FamilleTagTemplate'

const DashboardDetail = () => {
  const [visible, setVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')

  const {title, code, src, titledetail} = useAppSelector(getSelectedDashboard) || {}
  let selectedEngin = useAppSelector(getSelectedEngine)
  const selectedCard = useAppSelector(getCardSelected)

  const dispatch = useAppDispatch()
  const dashboardDataDetail = useAppSelector(getDashboardDetail)

  // useEffect(() => {
  //   dispatch(fetchDashboardDetail(code))
  // }, [])
  const statusEnginTemplate = (rowData) => {
    const bgColor = rowData?.statusbgColor || '#94A3B8'
    const label = rowData?.statuslabel || '-'
    return (
      <span className="lt-badge" style={{background: `${bgColor}18`, color: bgColor}} title={rowData?.statusDate || ''}>
        <span className="lt-badge-dot" style={{background: bgColor}}></span>
        {label}
      </span>
    )
  }

  const statusTagTemplate = (rowData) => {
    const bgColor = rowData?.statusbgColor || '#94A3B8'
    const label = rowData?.status || '-'
    return (
      <span className="lt-badge" style={{background: `${bgColor}18`, color: bgColor}} title={rowData?.statusDate || ''}>
        <span className="lt-badge-dot" style={{background: bgColor}}></span>
        {label}
      </span>
    )
  }
  const fakeData = [
    {
      dernierFoisVuAdresse: 'Rue du Rhône 14',
      dateEtHeure: '2023-06-22 10:30:00',
    },
  ]
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

  const handleShowMap = (rowData, srcMouv = '') => {
    setMouvement(srcMouv)
    dispatch(setSelectedEngine(rowData))
    setDialogVisible(true)
  }

  const familleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.familleTag}
        title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        icon={rowData.familleIconTag}
        style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
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
              title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
              alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
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

  const iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname === 'exit') {
      icon = 'pi pi-arrow-up'
      color = '#D64B70'
    } else if (rowData?.etatenginname === 'reception') {
      icon = 'pi pi-arrow-down'
      color = 'green'
    } else if (rowData?.etatenginname === 'nonactive') {
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
          onClick={() => handleShowMap(rowData)}
        ></i>
      </div>
    )
  }

  const BatteryStatus = ({batteries, locationDate}) => {
    if (batteries === '' || batteries === null || batteries === undefined) {
      return (
        <div className="lt-battery">
          <div className="lt-battery-bar-wrap">
            <div className="lt-battery-bar-fill" style={{width: '0%', background: '#CBD5E1'}} />
          </div>
          <span className="lt-battery-text lt-battery-text-muted">N/A</span>
        </div>
      )
    }
    const val = Math.min(parseInt(batteries, 10) || 0, 100)
    let color, textClass
    if (val >= 50) { color = '#22C55E'; textClass = 'lt-battery-text-success' }
    else if (val >= 20) { color = '#F59E0B'; textClass = 'lt-battery-text-warning' }
    else { color = '#EF4444'; textClass = 'lt-battery-text-danger' }
    return (
      <div className="lt-battery" title={locationDate ?? ''}>
        <div className="lt-battery-bar-wrap">
          <div className="lt-battery-bar-fill" style={{width: `${val}%`, background: color}} />
        </div>
        <span className={`lt-battery-text ${textClass}`}>{val}%</span>
      </div>
    )
  }

  const tagIdTemplate = ({tagId}) => {
    return tagId == null || tagId === '' || tagId === undefined || tagId === 0 ? 'No Tag' : tagId
  }

  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <span className="lt-famille-chip" style={{background: familleBgcolor || '#64748B'}}>
        {familleIcon && <i className={familleIcon} style={{fontSize: '0.75rem'}}></i>}
        {famille || '-'}
      </span>
    )
  }

  const activeTemplate = (rowData) => {
    const isActive = rowData?.active == 1
    return (
      <span className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-danger'}`}>
        <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-danger'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const addresseeTemplate = (type, {enginAddress, tagAddress}) => {
    return (
      <>
        {
          <div>
            {enginAddress ? (
              <Chip
                label={type == 'engin' ? enginAddress : tagAddress}
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

  const buildColumns = () => {
    if (selectedCard?.src === 'engin' || src === 'engin') {
      return [
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
          body: statusEnginTemplate,
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
          header: 'Modèle',
          field: 'model',
          olang: 'Modele',
        },

        // {
        //   header: 'Type',
        //   field: null,
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
          field: 'addressee',
          body: (r) => addresseeTemplate('engin', r),
        },
      ]
    } else if (selectedCard?.src === 'tag' || src === 'tag') {
      return [
        {
          header: 'ID Tag',
          field: 'name',
          olang: 'ID Tag',
          filter: true,
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
          body: (r) => addresseeTemplate('tag', r),
        },
        {
          header: 'Satus',
          olang: 'Status',
          field: 'status',
          body: statusTagTemplate,
        },

        {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
      ]
    }
  }

  const buildExportColumns = () => {
    if (src === 'engin') {
      return [
        {
          label: 'Référence',
          column: 'reference',
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
          column: 'etatengin',
        },

        {
          label: 'Status',
          column: 'status',
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
          label: 'Marque',
          column: 'brand',
        },
        {
          label: 'IMMATRICULATION',
          column: 'immatriculation',
        },
        {
          label: 'Modèle',
          column: 'model',
        },

        {
          label: 'Worksite',
          column: 'LocationObjectname',
        },
      ]
    } else if (src === 'tag') {
      return [
        {
          label: 'ID Tag',
          column: 'name',
        },
        {
          label: 'Label',
          column: 'label',
        },
        {
          label: 'Famille',
          column: 'famille',
        },
        {
          label: 'Status',
          column: 'status',
        },
      ]
    }
  }

  const columns = buildColumns()

  const exportFields = buildExportColumns()

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
    status: (rowData) => (
      <Chip
        style={{backgroundColor: rowData.statusbgColor, color: 'white'}}
        label={rowData?.status}
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
    // Addresse: (rowData) => (
    //   <Chip
    //     style={{backgroundColor: '#D64B70', color: 'white'}}
    //     label={addresseeTemplate(rowData)}
    //   />
    // ),
  }

  const allowedGroupFields = [
    'famille',
    'status',
    'LocationObjectname',
    'etatenginname',
    'tagname',
    'batteries',
  ]

  const handleClickType = (rowData) => {
    dispatch(setSelectedDashboardDetail(rowData))
    //dispatch(setTypeEdit(true))
  }

  const handleType = (e) => {
    setVisible(true)
    dispatch(setSelectedDashboardDetail(e))
  }

  return (
    <>
      {selectedCard == null ? (
        <div className='flex justify-content-between p-2'>
          <div className=''>
            <ButtonComponent
              label={<OlangItem olang={'btn.back'} />}
              onClick={() => {
                dispatch(setEditDashboard(false))
              }}
            />
          </div>
          <div className=''>
            <p className='text-2xl font-bold text-gray-800'>{titledetail}</p>
          </div>
        </div>
      ) : null}
      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        historySrc={{
          srcId: selectedEngin?.id,
          srcObject: 'engin',
          srcMovement: mouvement,
        }}
      />
      <DatatableComponent
        tableId='dashboard-detail-table'
        data={dashboardDataDetail}
        columns={columns}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        allowedGroupFields={allowedGroupFields}
      />
    </>
  )
}

export default DashboardDetail
