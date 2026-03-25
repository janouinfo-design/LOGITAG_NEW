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

const DashboardDetail = ({viewMode = 'cards'}) => {
  const [visible, setVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const {title, code, src, titledetail} = useAppSelector(getSelectedDashboard) || {}
  let selectedEngin = useAppSelector(getSelectedEngine)
  const selectedCard = useAppSelector(getCardSelected)

  const dispatch = useAppDispatch()
  const dashboardDataDetail = useAppSelector(getDashboardDetail)

  // useEffect(() => {
  //   dispatch(fetchDashboardDetail(code))
  // }, [])
  const statusEnginTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.statuslabel}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    } else {
      return (
        <Chip
          label={rowData?.statuslabel}
          style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}}
          title={`${rowData?.statusDate}`}
        />
      )
    }
  }

  const statusTagTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.status}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    } else {
      return (
        <Chip
          label={rowData?.status}
          style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}}
          title={`${rowData?.statusDate}`}
        />
      )
    }
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
          onClick={() => handleShowMap(rowData)}
        ></i>
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
          <span className={`block mt-2 font-bold text-lg ${textColor}`}>{batteries}</span>
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

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )

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

  const getFilteredData = () => {
    if (!dashboardDataDetail || !searchTerm.trim()) return dashboardDataDetail || []
    const term = searchTerm.toLowerCase()
    return dashboardDataDetail.filter((item) => {
      const fields = [
        item.reference, item.label, item.tagname, item.labeltag,
        item.vin, item.famille, item.brand, item.model,
        item.immatriculation, item.LocationObjectname,
        item.name, item.status, item.statuslabel,
        item.enginAddress, item.tagAddress,
      ]
      return fields.some((f) => f && String(f).toLowerCase().includes(term))
    })
  }

  const getBatteryInfo = (batteries) => {
    if (!batteries && batteries !== 0) return {icon: 'fas fa-battery-empty', color: '#94A3B8', label: 'N/A'}
    const val = parseInt(batteries, 10)
    if (val >= 80) return {icon: 'fas fa-battery-full', color: '#10B981', label: `${batteries}%`}
    if (val >= 50) return {icon: 'fas fa-battery-three-quarters', color: '#10B981', label: `${batteries}%`}
    if (val >= 20) return {icon: 'fas fa-battery-half', color: '#F59E0B', label: `${batteries}%`}
    if (val > 0) return {icon: 'fas fa-battery-quarter', color: '#EF4444', label: `${batteries}%`}
    return {icon: 'fas fa-battery-empty', color: '#EF4444', label: '0%'}
  }

  const getEtatInfo = (rowData) => {
    if (rowData?.etatenginname === 'exit') return {icon: 'fa-solid fa-up-from-bracket', color: '#D64B70', label: 'Sortie'}
    if (rowData?.etatenginname === 'reception') return {icon: 'fa-solid fa-down-to-bracket', color: '#10B981', label: 'Réception'}
    if (rowData?.etatenginname === 'nonactive') return {icon: 'fa-solid fa-octagon-exclamation', color: '#EF4444', label: 'Non actif'}
    return {icon: '', color: '#94A3B8', label: rowData?.etatengin || ''}
  }

  const renderEnginCard = (item, index) => {
    const battery = getBatteryInfo(item.batteries)
    const etat = getEtatInfo(item)
    return (
      <div className="lt-card" key={item.id || index} data-testid={`engin-card-${index}`} onClick={() => handleShowMap(item)}>
        <div className="lt-card-img-wrap">
          {item.image ? (
            <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt={item.reference} className="lt-card-img" />
          ) : (
            <div className="lt-card-img-placeholder">
              <i className="fas fa-truck" />
            </div>
          )}
          {item.statuslabel && (
            <span className="lt-card-status-badge" style={{background: item.statusbgColor || '#94A3B8', color: item.color || '#FFF'}}>
              {item.statuslabel}
            </span>
          )}
        </div>
        <div className="lt-card-body">
          <div className="lt-card-ref">{item.reference || 'N/A'}</div>
          <div className="lt-card-label">{item.label || ''}</div>
          <div className="lt-card-chips">
            {item.famille && (
              <span className="lt-chip" style={{background: item.familleBgcolor || '#EFF6FF', color: item.familleColor || '#2563EB'}}>
                <i className={item.familleIcon || ''} /> {item.famille}
              </span>
            )}
            {item.familleTag && (
              <span className="lt-chip" style={{background: item.familleTagIconBgcolor || '#F5F3FF', color: item.familleTagIconColor || '#7C3AED'}}>
                <i className={item.familleIconTag || ''} /> {item.familleTag}
              </span>
            )}
            {etat.icon && (
              <span className="lt-chip" style={{background: `${etat.color}18`, color: etat.color}}>
                <i className={etat.icon} /> {etat.label}
              </span>
            )}
          </div>
          <div className="lt-card-footer">
            <div className="lt-card-battery" title={`Batterie: ${battery.label}`}>
              <i className={battery.icon} style={{color: battery.color}} />
              <span style={{color: battery.color}}>{battery.label}</span>
            </div>
            {(item.LocationObjectname || item.enginAddress) && (
              <div className="lt-card-location" title={item.enginAddress || item.LocationObjectname}>
                <i className="fas fa-map-marker-alt" />
                <span>{item.LocationObjectname || item.enginAddress || ''}</span>
              </div>
            )}
          </div>
          {item.tagname && (
            <div className="lt-card-tag">
              <span className="lt-tag-pill">
                {item.labeltag || item.tagname}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderTagCard = (item, index) => {
    return (
      <div className="lt-card" key={item.id || index} data-testid={`tag-card-${index}`}>
        <div className="lt-card-icon-wrap">
          <i className={item.familleIcon || 'fas fa-tag'} style={{color: item.familleColor || '#2563EB'}} />
        </div>
        <div className="lt-card-body">
          <div className="lt-card-ref">{item.name || 'N/A'}</div>
          <div className="lt-card-label">{item.label || ''}</div>
          <div className="lt-card-chips">
            {item.famille && (
              <span className="lt-chip" style={{background: item.familleBgcolor || '#EFF6FF', color: 'white'}}>
                <i className={item.familleIcon || ''} /> {item.famille}
              </span>
            )}
            {item.status && (
              <span className="lt-chip" style={{background: item.statusbgColor || '#94A3B8', color: item.color || '#FFF'}}>
                {item.status}
              </span>
            )}
            <span className={`lt-chip ${item.active == 1 ? 'lt-chip-active' : 'lt-chip-inactive'}`}>
              <i className={item.active == 1 ? 'pi pi-check' : 'pi pi-times'} />
              {item.active == 1 ? 'Actif' : 'Inactif'}
            </span>
          </div>
          {(item.tagAddress || item.adresse) && (
            <div className="lt-card-footer">
              <div className="lt-card-location">
                <i className="fas fa-map-marker-alt" />
                <span>{item.tagAddress || item.adresse || ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const filteredData = getFilteredData()
  const isEngin = selectedCard?.src === 'engin' || src === 'engin'

  const renderCardGrid = () => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="lt-empty-state" data-testid="empty-state">
          <i className={isEngin ? 'fas fa-truck' : 'fas fa-tags'} />
          <p>Aucun élément trouvé</p>
        </div>
      )
    }
    return (
      <div className="lt-card-grid" data-testid="card-grid">
        {filteredData.map((item, i) => isEngin ? renderEnginCard(item, i) : renderTagCard(item, i))}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .lt-detail-wrapper {
          width: 100%;
        }
        .lt-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 0 4px;
        }
        .lt-search-input {
          flex: 1;
          max-width: 360px;
          padding: 10px 16px 10px 40px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFF;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          color: #0F172A;
          transition: all 0.2s ease;
          outline: none;
        }
        .lt-search-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .lt-search-input::placeholder {
          color: #94A3B8;
        }
        .lt-search-wrap {
          position: relative;
          flex: 1;
          max-width: 360px;
        }
        .lt-search-wrap i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 0.85rem;
          pointer-events: none;
        }
        .lt-result-count {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #94A3B8;
          white-space: nowrap;
        }

        /* === CARD GRID === */
        .lt-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
        }
        .lt-card {
          background: #FFFFFF;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          transition: all 0.25s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          animation: ltCardIn 0.35s ease-out backwards;
        }
        .lt-card:nth-child(1) { animation-delay: 0s; }
        .lt-card:nth-child(2) { animation-delay: 0.04s; }
        .lt-card:nth-child(3) { animation-delay: 0.08s; }
        .lt-card:nth-child(4) { animation-delay: 0.12s; }
        .lt-card:nth-child(5) { animation-delay: 0.16s; }
        .lt-card:nth-child(6) { animation-delay: 0.2s; }
        .lt-card:nth-child(7) { animation-delay: 0.24s; }
        .lt-card:nth-child(8) { animation-delay: 0.28s; }
        @keyframes ltCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lt-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }

        /* Card Image */
        .lt-card-img-wrap {
          position: relative;
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: #F1F5F9;
        }
        .lt-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .lt-card:hover .lt-card-img {
          transform: scale(1.05);
        }
        .lt-card-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
        }
        .lt-card-img-placeholder i {
          font-size: 2.5rem;
          color: #CBD5E1;
        }
        .lt-card-status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 10px;
          border-radius: 6px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Card Icon (for Tags) */
        .lt-card-icon-wrap {
          width: 100%;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%);
        }
        .lt-card-icon-wrap i {
          font-size: 2.5rem;
        }

        /* Card Body */
        .lt-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .lt-card-ref {
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
        }
        .lt-card-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #64748B;
          line-height: 1.3;
        }
        .lt-card-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .lt-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 6px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .lt-chip i {
          font-size: 0.65rem;
        }
        .lt-chip-active {
          background: #ECFDF5;
          color: #059669;
        }
        .lt-chip-inactive {
          background: #FEF2F2;
          color: #DC2626;
        }
        .lt-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #F1F5F9;
        }
        .lt-card-battery {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .lt-card-battery i {
          font-size: 1rem;
        }
        .lt-card-location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          color: #94A3B8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
        }
        .lt-card-location i {
          color: #CBD5E1;
          font-size: 0.7rem;
          flex-shrink: 0;
        }
        .lt-card-tag {
          margin-top: 4px;
        }
        .lt-tag-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          background: #FDF2F8;
          color: #D64B70;
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Empty State */
        .lt-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px dashed #CBD5E1;
          width: 100%;
        }
        .lt-empty-state i {
          font-size: 2.5rem;
          color: #CBD5E1;
          margin-bottom: 12px;
        }
        .lt-empty-state p {
          font-family: 'Inter', sans-serif;
          font-size: 0.925rem;
          color: #94A3B8;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lt-card-grid {
            grid-template-columns: 1fr;
          }
          .lt-search-wrap {
            max-width: 100%;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lt-card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

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

      <div className="lt-detail-wrapper" data-testid="dashboard-detail">
        {/* Search Bar - shown in both modes */}
        <div className="lt-search-bar">
          <div className="lt-search-wrap">
            <i className="pi pi-search" />
            <input
              className="lt-search-input"
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="detail-search-input"
            />
          </div>
          <span className="lt-result-count" data-testid="result-count">
            {filteredData?.length || 0} résultat{(filteredData?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>

        {/* Toggle between views */}
        {viewMode === 'cards' ? (
          renderCardGrid()
        ) : (
          <DatatableComponent
            tableId='dashboard-detail-table'
            data={filteredData}
            columns={columns}
            exportFields={exportFields}
            rowGroupTemplates={rowGroupTemplates}
            allowedGroupFields={allowedGroupFields}
          />
        )}
      </div>
    </>
  )
}

export default DashboardDetail
