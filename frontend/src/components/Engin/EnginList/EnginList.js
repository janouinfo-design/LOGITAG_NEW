import {DatatableComponent} from '../../../components/shared/DatatableComponent/DataTableComponent'
import {
  checkGeneratedFile,
  fetchEnginListHistory,
  fetchEngines,
  fetchStatusHistoric,
  fetchStatusList,
  fetchTypesList,
  generateEngFile,
  getEngines,
  getLastEnginsUpdates,
  getStatusList,
  getStatusListHistory,
  removeEngine,
  saveTagAddress,
  setEditEngine,
  setParamCadHis,
  setSelectedEngine,
  setSelectedHistory,
  setShow,
  setShowHistory,
  setStatusVisible,
  setTypeFields,
} from '../slice/engin.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {Chip} from 'primereact/chip'
import {Image} from 'primereact/image'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {setAlertParams} from '../../../store/slices/alert.slice'
import EnginMapLocation from './EnginMapLocation'
import DynamicInputs from '../EnginEditor/DynamicInputs'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {Button} from 'primereact/button'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {InputText} from 'primereact/inputtext'
import {useFormik} from 'formik'
import {fetchValidator} from '../../Inventory/slice/inventory.slice'
import moment from 'moment'
import Loader from '../../shared/Loader/Loader'
import {fetchStatus, fetchTagsWithEngin} from '../../Tag/slice/tag.slice'
import _ from 'lodash'
import {_fetchStatusRapport} from '../../Repports/api'
import {useLocalStorage, useSessionStorage} from 'primereact/hooks'
import {MultiSelect} from 'primereact/multiselect'
import {Dropdown} from 'primereact/dropdown'
import {Tag} from 'primereact/tag'
import {Calendar} from 'primereact/calendar'
import {fetchFamilles} from '../../Famillies/slice/famille.slice'
import {fetchSites, getSites} from '../../Site/slice/site.slice'
import {useLocation} from 'react-router-dom'
import {ProgressSpinner} from 'primereact/progressspinner'
import {
  fetchConversationList,
  setDetailChat,
} from '../../../_metronic/partials/layout/drawer-messenger/slice/Chat.slice'
import {DrawerComponent} from '../../../_metronic/assets/ts/components'
import {Badge} from 'primereact/badge'
import LastSeenComponent from '../EnginDetail/LastSeenComponent'

const ETAT_DATA = [
  {
    label: 'Entrée',
    code: 'reception',
    icon: 'pi pi-arrow-down',
    backgroundColor: '#29bf12',
  },
  {
    label: 'Sortie',
    code: 'exit',
    icon: 'pi pi-arrow-up',
    backgroundColor: '#D64B70',
  },
]

const etatItemTemplateStatic = (option) => (
  <Tag
    className='cursor-pointer gap-2'
    value={option?.label || option?.name}
    style={{background: option?.backgroundColor}}
    icon={option?.icon}
  />
)

const selectedTemplateStatic = (option, props) => {
  if (option) {
    return (
      <Tag
        className='cursor-pointer gap-2'
        value={option?.label || option?.name}
        style={{background: option?.backgroundColor}}
        icon={option?.icon}
      />
    )
  }
  return <span>{props.placeholder}</span>
}

const tagFamItemTemplateStatic = (option, props) => {
  if (option) {
    return (
      <Chip
        className='cursor-pointer text-white'
        label={option?.label || option?.name}
        style={{background: option?.backgroundColor}}
        icon={option?.icon}
      />
    )
  }
  return <span>{props.placeholder}</span>
}

const FilterEtat = memo(({value, onChange}) => (
  <Dropdown
    showClear
    value={value}
    options={ETAT_DATA}
    optionLabel='name'
    placeholder={'Etat'}
    optionValue='code'
    className='p-column-filter border-1 border-blue-300 border-round-lg h-4rem flex align-items-center'
    onChange={(e) => onChange('etat', e.value)}
    maxSelectedLabels={1}
    itemTemplate={etatItemTemplateStatic}
    valueTemplate={selectedTemplateStatic}
    style={{minWidth: '8rem', maxWidth: '10rem'}}
  />
))

const FilterFamTag = memo(({value, onChange, options}) => (
  <Dropdown
    showClear
    value={value}
    options={options}
    optionLabel='label'
    placeholder='Filter'
    optionValue='value'
    className='p-column-filter border-1 border-blue-300 border-round-lg h-4rem flex align-items-center'
    onChange={(e) => onChange('tagFam', e.value)}
    maxSelectedLabels={1}
    itemTemplate={tagFamItemTemplateStatic}
    valueTemplate={tagFamItemTemplateStatic}
    style={{minWidth: '8rem', maxWidth: '10rem'}}
  />
))

const FilterFamEng = memo(({value, onChange, options}) => (
  <Dropdown
    showClear
    value={value}
    options={options}
    optionLabel='label'
    placeholder='Filter'
    optionValue='label'
    className='p-column-filter border-1 border-blue-300 border-round-lg h-4rem flex align-items-center'
    onChange={(e) => onChange('engFam', e.value)}
    maxSelectedLabels={1}
    itemTemplate={tagFamItemTemplateStatic}
    valueTemplate={tagFamItemTemplateStatic}
    style={{minWidth: '8rem', maxWidth: '10rem'}}
  />
))

const FilterSite = memo(({value, onChange, options}) => (
  <MultiSelect
    value={value}
    options={options}
    placeholder='Site'
    optionLabel='label'
    optionValue='id'
    filter
    className='p-column-filter border-1 border-blue-300 border-round-lg h-4rem flex align-items-center'
    onChange={(e) => onChange('sites', e.value)}
    style={{minWidth: '8rem', maxWidth: '10rem'}}
  />
))

const FilterStatus = memo(({value, onChange, options}) => (
  <Dropdown
    showClear
    value={value}
    options={options}
    optionLabel='label'
    placeholder='Any'
    optionValue='name'
    className='p-column-filter border-1 border-blue-300 border-round-lg h-4rem flex align-items-center'
    onChange={(e) => onChange('status', e.value)}
    maxSelectedLabels={1}
    valueTemplate={selectedTemplateStatic}
    itemTemplate={etatItemTemplateStatic}
    style={{minWidth: '8rem', maxWidth: '10rem'}}
  />
))

const FilterLastSeen = memo(({value, onChange, calRef}) => (
  <Calendar
    ref={calRef}
    value={value}
    onChange={(e) => onChange('lastSeen', e.value)}
    hourFormat='24'
    placeholder='DD/MM/YYYY'
    className='p-column-filter border-1 border-blue-300 border-round-lg'
    style={{minWidth: '8rem', maxWidth: '12rem'}}
    showButtonBar={true}
  />
))

const EnginList = () => {
  const [visible, setVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [savePosVisible, setSavePosVisible] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [showTag, setShowTag] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterLoadingPopup, setFilterLoadingPopup] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfVisible, setPdfVisible] = useState(false)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [pdfIdGenerator, setPdfIdGenerator] = useLocalStorage('pdfIdGen', 0)
  const [generatedCheck, setGeneratedCheck] = useState([])
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [orderBy, setOrderBy] = useState({field: 'lastSeenAt', order: 'DESC'})
  const [familleTag, setFamilleTag] = useState([])
  const [familleEngin, setFamilleEngin] = useState([])
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    etat: null,
    status: null,
    lastSeen: null,
    sites: [],
    marque: null,
    tagFam: null,
    engFam: null,
  })
  const refFilter = useRef(null)
  const filtersRef = useRef(filters)
  const orderByRef = useRef(orderBy)

  const intervalPdf = useRef(null)

  const location = useLocation()

  const engines = useAppSelector(getEngines)
  let enginsLastUpdates = useAppSelector(getLastEnginsUpdates)
  const enginStatus = useAppSelector(getStatusList)
  const sites = useAppSelector(getSites)
  const statusList = useAppSelector(getStatusListHistory)
  const searchEng = useRef('')
  const calenderRef = useRef(null)
  const firstLoading = useRef(true)

  const dispatch = useAppDispatch()

  const displayChatDetail = (selectedEngin) => {
    let obj = {
      srcId: selectedEngin.id,
      srcObject: 'Engin',
    }
    dispatch(fetchConversationList(obj)).then((res) => {
      dispatch(setSelectedEngine(selectedEngin))
      console.log('res fetchConversationList', res)
      dispatch(setDetailChat(true))
    })
    const drawer = DrawerComponent.getInstance('kt_drawer_chat')
    if (drawer) {
      drawer.show()
      return
    }

    // Fallback: trigger the DOM toggle (the one used in Navbar)
    const toggle = document.getElementById('kt_drawer_chat_toggle')
    if (toggle) {
      toggle.click()
    }
  }

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        try {
          dispatch(fetchValidator('engin'))
          dispatch(setSelectedEngine(e.item.data))
          dispatch(setShow(false))
          dispatch(fetchTagsWithEngin(e.item.data.id))
        } catch (error) {}
      },
    },
    {
      label: 'Chat',
      icon: 'pi pi-comment text-green-500',
      command: (e) => {
        displayChatDetail(e.item.data)
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        try {
          dispatch(setSelectedEngine(e.item.data))
          dispatch(
            setAlertParams({
              title: 'Supprimer',
              message: 'Voulez-vous vraiment supprimerce engin?',
              acceptClassName: 'p-button-danger',
              visible: true,
              accept: () => {
                dispatch(removeEngine({data: e.item.data, page: page, pageSize: rows}))
              },
            })
          )
        } catch (error) {}
      },
    },
  ]

  const handlePageChange = (newPage, newRows) => {
    if (firstLoading.current) return

    const params = {
      search: searchEng.current || undefined,
      searchLastSeen: filters?.lastSeen
        ? moment(filters.lastSeen).isValid()
          ? moment(filters.lastSeen).format('YYYY-MM-DD')
          : ''
        : '',
      searchSituation: filters?.etat || '',
      searchTag: filters?.tagFam || '',
      searchStatus: filters?.status || '',
      searchFamille: filters?.engFam || '',
      searchSite: filters?.sites?.map((item) => item).join(', ') || '',
      SortDirection: orderBy?.order || 'DESC',
      SortColumn: orderBy?.field || '',
      page: newPage,
      PageSize: newRows,
    }

    setPage(newPage)
    setRows(newRows)
    dispatch(fetchEngines(params))
  }

  const splitAction = (item) => {
    try {
      dispatch(fetchValidator('engin'))
      dispatch(setSelectedEngine(item))
      dispatch(setShow(false))
    } catch (error) {}
  }
  const getPosOfAddress = useCallback(
    (data) => {
      try {
        const obj = {
          srcId: data?.id,
          srcObject: 'Engin',
          srcMouvement: 'pos',
        }
        dispatch(setParamCadHis({title: 'Positions', showList: true}))
        dispatch(fetchEnginListHistory(obj)).then(() => {
          dispatch(setShowHistory(true))
          dispatch(setSelectedEngine(data))
          setDialogVisible(true)
        })
      } catch (error) {}
    },
    [dispatch]
  )

  const imageTemplate = useCallback(
    (rowData) => (
      <div className="lt-img-cell" data-testid="img-cell">
        <Image
          src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
          alt='EngineImage'
          width='48'
          height='48'
          preview
          imageStyle={{objectFit: 'cover', width: '48px', height: '48px'}}
        />
      </div>
    ),
    []
  )

  const addresseeTemplate = useCallback(
    (rowData) => (
      <div
        className="lt-geo-btn"
        onClick={() => getPosOfAddress(rowData)}
        data-testid="geo-btn"
      >
        <i className="pi pi-map-marker" style={{fontSize: '0.85rem'}}></i>
        Localiser
      </div>
    ),
    [getPosOfAddress]
  )

  const handleClickType = useCallback(
    (rowData) => {
      try {
        dispatch(setSelectedEngine(rowData))
        setVisible(true)
      } catch (error) {}
    },
    [dispatch]
  )

  const handleType = useCallback(
    (e) => {
      try {
        setVisible(true)
        dispatch(setSelectedEngine(e))
      } catch (error) {}
    },
    [dispatch]
  )

  const onClickStatus = useCallback(
    (rowData) => {
      const objInfo = {
        srcId: rowData?.uid,
        srcObject: 'engin',
      }
      dispatch(setSelectedEngine(rowData))
      dispatch(fetchStatusHistoric(objInfo)).then(() => {
        dispatch(setStatusVisible(true))
      })
    },
    [dispatch]
  )

  const typeTemplate = (rowData) => {
    let typesArray
    try {
      // if(rowData.type)
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

  const handleShowMap = useCallback(
    (rowData) => {
      try {
        const obj = {
          srcId: rowData?.uid,
          srcObject: 'Engin',
        }
        dispatch(setParamCadHis({title: 'Enter_Exit', showList: true}))
        dispatch(fetchEnginListHistory(obj)).then(() => {
          dispatch(setShowHistory(true))
          dispatch(setSelectedEngine(rowData))
          setDialogVisible(true)
        })
      } catch (error) {}
    },
    [dispatch]
  )

  const statusTemplate = useCallback(
    (rowData) => {
      const bgColor = rowData?.statusbgColor || '#94A3B8'
      const label = rowData?.statuslabel || '-'
      return (
        <div
          className="lt-badge"
          style={{
            background: `${bgColor}18`,
            color: bgColor,
            cursor: 'pointer',
          }}
          onClick={() => onClickStatus(rowData)}
          title={rowData?.statusDate || ''}
          data-testid="status-badge"
        >
          <span className="lt-badge-dot" style={{background: bgColor}}></span>
          {label}
        </div>
      )
    },
    [onClickStatus]
  )

  //etatengin
  const iconTemplate = useCallback(
    (rowData) => {
      let label = ''
      let badgeClass = 'lt-badge lt-badge-neutral'
      let dotClass = 'lt-badge-dot lt-badge-dot-neutral'
      let iconClass = ''
      if (rowData?.etatenginname == 'exit') {
        label = 'Sortie'
        badgeClass = 'lt-badge lt-badge-danger'
        dotClass = 'lt-badge-dot lt-badge-dot-danger'
        iconClass = 'pi pi-arrow-up'
      } else if (rowData?.etatenginname == 'reception') {
        label = 'Entrée'
        badgeClass = 'lt-badge lt-badge-success'
        dotClass = 'lt-badge-dot lt-badge-dot-success'
        iconClass = 'pi pi-arrow-down'
      } else if (rowData?.etatenginname == 'nonactive') {
        label = 'Inactif'
        badgeClass = 'lt-badge lt-badge-danger'
        dotClass = 'lt-badge-dot lt-badge-dot-danger'
        iconClass = 'pi pi-exclamation-triangle'
      }
      return (
        <div
          className={badgeClass}
          style={{cursor: 'pointer'}}
          onClick={() => handleShowMap(rowData, null)}
          data-testid="etat-badge"
        >
          <span className={dotClass}></span>
          {iconClass && <i className={iconClass} style={{fontSize: '0.75rem'}}></i>}
          {label || rowData?.etatenginname || '-'}
        </div>
      )
    },
    [handleShowMap]
  )

  const onClear = () => {
    setSearchInput('')
    searchEng.current = ''
    setFilters({
      etat: null,
      status: null,
      lastSeen: null,
      sites: [],
      marque: null,
      tagFam: null,
      engFam: null,
    })
    dispatch(
      fetchEngines({
        SortDirection: 'DESC',
        SortColumn: 'lastSeenAt',
        page: 1,
        rows: rows,
      })
    ).then(({payload}) => {
      if (payload) {
        setTotalRecords(payload[0]?.TotalEngins || 0)
        setPage(1)
      }
    })
  }

  const extraActionTemplate = () => {
    return (
      <Button
        className='font-semibold p-border-circle text-gray-800 bg-transparent hover:text-red-700 hover:bg-gray-100'
        label={<OlangItem olang='clear' />}
        icon='pi pi-filter-slash'
        onClick={onClear}
        text
        rounded
      />
    )
  }

  const handleOrderClick = (field) => {
    try {
      setLoadingOrder(true)
      const newOrder = orderBy?.order === 'ASC' ? 'DESC' : 'ASC'

      const params = {
        page: page,
        PageSize: rows,
        SortColumn: field,
        SortDirection: newOrder,
        search: searchEng.current || undefined,
        searchLastSeen: filters?.lastSeen
          ? moment(filters.lastSeen).isValid()
            ? moment(filters.lastSeen).format('YYYY-MM-DD')
            : ''
          : '',
        searchSituation: filters?.etat || '',
        searchTag: filters?.tagFam || '',
        searchStatus: filters?.status || '',
        searchFamille: filters?.engFam || '',
        searchSite: filters?.sites?.map((item) => item).join(', ') || '',
      }

      setOrderBy({
        field: field,
        order: newOrder,
      })

      dispatch(fetchEngines(params)).then(({payload}) => {
        if (payload) {
          setTotalRecords(payload[0]?.TotalEngins || 0)
          setLoadingOrder(false)
        }
      })
    } catch (error) {
      console.error('Error handling order click:', error)
      setLoadingOrder(false)
    }
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
        onClick={() => showTagById(rowData)}
      />
    )
  }

  const showTagById = useCallback((rowData) => {
    setShowTag((prev) => {
      if (prev?.includes(rowData?.uid)) return prev.filter((x) => x !== rowData?.uid)
      return [...prev, rowData?.uid]
    })
  }, [])

  const tagTemplate = useCallback(
    (rowData) => {
      return (
        <div className='flex flex-column'>
          <div className='flex justify-content-center'>
            {rowData.tagId ? (
              familleTagTemplate(rowData)
            ) : (
              <Chip label='Untagged' className='cursor-pointer' />
            )}
          </div>
          {showTag.includes(rowData?.uid) ? (
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
                style={{background: rowData?.familleTagIconBgcolor || '#D64B70', color: 'white'}}
              />
            </div>
          ) : null}
        </div>
      )
    },
    [showTag]
  )

  const BatteryStatus = useCallback(({batteries, locationDate}) => {
    if (batteries === '' || batteries === null || batteries === undefined) {
      return (
        <div className="lt-battery" data-testid="battery-status">
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
      <div className="lt-battery" title={locationDate ?? ''} data-testid="battery-status">
        <div className="lt-battery-bar-wrap">
          <div className="lt-battery-bar-fill" style={{width: `${val}%`, background: color}} />
        </div>
        <span className={`lt-battery-text ${textClass}`}>{val}%</span>
      </div>
    )
  }, [])

  const tagIdTemplate = ({tagId}) => {
    return tagId == null || tagId === '' || tagId === undefined || tagId === 0 ? 'No Tag' : tagId
  }

  const familleTemplate = useCallback(
    ({famille, familleIcon, familleBgcolor}) => (
      <span
        className="lt-famille-chip"
        style={{background: familleBgcolor || '#64748B'}}
        data-testid="famille-chip"
      >
        {familleIcon && <i className={familleIcon} style={{fontSize: '0.75rem'}}></i>}
        {famille || '-'}
      </span>
    ),
    []
  )

  const representativesItemTemplate = (option) => {
    return (
      <div className='flex align-items-center gap-2'>
        <img
          alt={option?.name || ''}
          src={`https://primefaces.org/cdn/primereact/images/avatar/${option?.image}`}
          width='32'
        />
        <span>{option?.name || ''}</span>
      </div>
    )
  }

  const setFilterField = useCallback((key, value) => {
    setFilters((prev) => ({...prev, [key]: value}))
  }, [])

  const customBottomBar = useCallback(
    () => (
      <div className='flex flex-row align-items-center justify-content-between px-2'>
        <Button
          label='Clear'
          severity='danger'
          onClick={() => {
            calenderRef.current.hide()
          }}
        />
      </div>
    ),
    []
  )

  const filterTemplateSearch = (field) => {
    return (
      <InputText
        type='search'
        placeholder={`${field}`}
        className='p-column-filter border-1 border-blue-300 border-round-lg'
        style={{minWidth: '8rem', maxWidth: '10rem'}}
        name={field}
        value={filters[field]}
        onChange={(e) => setFilters({...filters, [field]: e.target.value})}
      />
    )
  }

  const lastSeenTemplate = (data) => {
    return <LastSeenComponent data={data} />
    if (!data.lastSeenAt || typeof data.lastSeenAt != 'string') return '_'
    let formated = data.lastSeenAt.includes('+')
      ? moment(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
      : moment.utc(data.lastSeenAt).format('DD/MM/YYYY HH:mm')
    return (
      <div className='flex flex-column'>
        <strong>{formated}</strong>
        <span className='text-sm text-gray-600'>{data.lastSeenLocationName}</span>
        <div className='text-sm text-gray-600 flex gap-1 align-items-center'>
          <span>{data.lastSeenDevice}</span>
          {data.lastSeenRssi && (
            <Badge title='force du signal' value={data.lastSeenRssi} severity='warning'></Badge>
          )}
        </div>
      </div>
    )
  }

  const columns = useMemo(
    () => [
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
        header: 'Vin',
        field: 'vin',
        olang: 'vin',
        filter: true,
        filterElement: filterTemplateSearch('vin'),
        showFilterMenu: false,
        width: '15rem',
      },
      {
        header: 'Label',
        field: 'label',
        olang: 'label',
        filter: true,
        filterElement: filterTemplateSearch('label'),
        showFilterMenu: false,
        width: '15rem',
      },
      {
        header: 'Etat',
        field: 'etatenginname',
        olang: 'Etat',
        body: iconTemplate,
        filterElement: <FilterEtat value={filters.etat} onChange={setFilterField} />,
        showFilterMenu: false,
        filter: true,
      },
      {
        header: 'Tag',
        field: 'tagname',
        olang: 'Tag',
        body: tagTemplate,
        filterElement: (
          <FilterFamTag value={filters.tagFam} onChange={setFilterField} options={familleTag} />
        ),
        showFilterMenu: false,
        filter: true,
      },
      {
        header: 'Status',
        olang: 'status',
        field: 'statuslabel',
        body: statusTemplate,
        filterElement: (
          <FilterStatus value={filters.status} onChange={setFilterField} options={enginStatus} />
        ),
        showFilterMenu: false,
        filter: true,
      },
      {
        header: 'Dernière vue',
        olang: 'lastSeen',
        field: 'lastSeenAt',
        body: lastSeenTemplate,
        filterElement: (
          <FilterLastSeen value={filters.lastSeen} onChange={setFilterField} calRef={calenderRef} />
        ),
        showFilterMenu: false,
        filter: true,
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
        filterElement: (
          <FilterFamEng value={filters.engFam} onChange={setFilterField} options={familleEngin} />
        ),
        showFilterMenu: false,
        filter: true,
      },
      {
        header: 'Marque',
        field: 'brand',
        olang: 'marque',
        filter: true,
        filterElement: filterTemplateSearch('brand'),
        showFilterMenu: false,
        width: '15rem',
      },
      {
        header: 'Matricule',
        field: 'model',
        olang: 'Matricule',
        filter: true,
        filterElement: filterTemplateSearch('model'),
        showFilterMenu: false,
        width: '15rem',
      },
      {
        header: 'Worksite',
        field: 'LocationObjectname',
        olang: 'Worksite',
        filterElement: (
          <FilterSite value={filters.sites} onChange={setFilterField} options={sites} />
        ),
        showFilterMenu: false,
        filter: true,
      },
      {
        header: 'Addressee',
        olang: 'Addressee',
        field: 'latlng',
        body: addresseeTemplate,
      },
    ],
    [
      imageTemplate,
      BatteryStatus,
      addresseeTemplate,
      iconTemplate,
      tagTemplate,
      statusTemplate,
      familleTemplate,
      filters.etat,
      filters.tagFam,
      filters.status,
      filters.lastSeen,
      filters.engFam,
      filters.sites,
      setFilterField,
      familleTag,
      familleEngin,
      enginStatus,
      sites,
    ]
  )

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

  const fetchAndSetEngines = useCallback(
    (searchTerm, pageSize, targetPage = 1) => {
      const f = filtersRef.current
      const ob = orderByRef.current
      let params = {
        search: searchTerm || undefined,
        searchLastSeen: f?.lastSeen
          ? moment(f.lastSeen).isValid()
            ? moment(f.lastSeen).format('YYYY-MM-DD')
            : ''
          : '',
        searchSituation: f?.etat || '',
        searchTag: f?.tagFam || '',
        searchStatus: f?.status || '',
        searchFamille: f?.engFam || '',
        searchSite: f?.sites?.map((item) => item).join(', ') || '',
        SortDirection: ob?.order || 'DESC',
        SortColumn: ob?.field || '',
        searchLabel: f?.label || '',
        page: targetPage,
        PageSize: pageSize,
      }
      dispatch(fetchEngines(params))
        .then(({payload}) => {
          if (payload) {
            setTotalRecords(payload[0]?.TotalEngins || 0)
            setPage(targetPage)
            setRows(pageSize)
          }
        })
        .catch((error) => {
          console.error('Error fetching engines:', error)
        })
    },
    [dispatch]
  )

  const debouncedSearch = useRef(
    _.debounce((searchTerm, pageSize, fetchFn) => {
      fetchFn(searchTerm.trim(), pageSize, 1)
    }, 300)
  ).current

  const handleSearch = (event) => {
    searchEng.current = event.target.value
    setSearchInput(event.target.value)
    setPage(1)
    debouncedSearch(event.target.value, rows, fetchAndSetEngines)
  }

  const formik = useFormik({
    initialValues: {
      locationId: '',
      latitude: '',
      longitude: '',
      macAddress: '',
    },
    onSubmit: (data) => {
      dispatch(saveTagAddress(data))
    },
  })

  const getStatusOfPdf = async () => {
    try {
      let idPdf = JSON.parse(localStorage.getItem('idPdf') || '{}')
      const res = await _fetchStatusRapport({id: +idPdf?.id})
      if (res?.data?.[0]?.status == 1) {
        setPdfLoading(false)
        window.open(idPdf.path, '_blank')
        if (intervalPdf.current) clearInterval(intervalPdf.current)
        localStorage.setItem('idPdf', JSON.stringify({path: '', id: 0}))
        setPdfIdGenerator(0)
        return
      }
      if (!intervalPdf.current) {
        handlePdfClick('pdf', true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handlePdfClick = async (type, onlyInterval) => {
    if (type === 'pdf') {
      setPdfVisible(false)
      setPdfLoading(true)
    }

    const obj = {
      templatename: 'enginList',
      Filetype: type === 'pdf' ? 'pdf' : 'xls',
      src: 'engin',
    }

    const clearPdfLoading = () => {
      setPdfLoading(false)
      setPdfIdGenerator(0)
      localStorage.setItem('idPdf', JSON.stringify({path: '', id: 0}))
      clearInterval(intervalPdf.current)
      intervalPdf.current = null
    }

    const openFile = (filePath) => {
      if (filePath) {
        window.open(filePath, '_blank')
      } else {
        console.error('File path is missing.')
      }
    }

    try {
      let payloadVar = null
      if (!onlyInterval) {
        const {payload} = await dispatch(generateEngFile(obj))
        if (!payload || payload.length === 0) {
          console.error('No payload data received.')
          clearPdfLoading()
          return
        }

        setPdfIdGenerator(payload[0].ID)
        localStorage.setItem('idPdf', JSON.stringify({path: payload[0].path, id: payload[0].ID}))
        payloadVar = payload
      }
      intervalPdf.current = setInterval(async () => {
        if (!payloadVar) return
        try {
          const resStatus = await _fetchStatusRapport({id: payloadVar[0]?.ID})
          if (resStatus?.data?.[0]?.status === 1) {
            setPdfLoading(false)
            clearPdfLoading()
            openFile(payloadVar[0].path)
          }
        } catch (error) {
          console.error('Error fetching report status:', error)
        }
      }, 5000)
    } catch (error) {
      console.error('Error generating file:', error)
      setPdfLoading(false)
    }
  }

  const checkPdf = async () => {
    let obj = {
      Filetype: 'pdf',
      src: 'engin',
    }
    const {payload} = await dispatch(checkGeneratedFile(obj))
    setGeneratedCheck(payload?.[0] || null)
    setPdfVisible(true)
  }

  const onClickExcel = () => {
    setLoadingExcel(true)
    handlePdfClick('xls')
  }

  const savePosFooter = (
    <div>
      <Button
        label='Save'
        icon='pi pi-check'
        onClick={() => {
          formik.handleSubmit()
        }}
      />
    </div>
  )

  const checkPdfFunc = async () => {
    try {
      const storedIdPdf = localStorage.getItem('idPdf')
      let idPdf = storedIdPdf ? JSON.parse(storedIdPdf) : null

      // Check if idPdf is valid and contains an 'id' property
      if (!idPdf || typeof idPdf.id === 'undefined') {
        if (pdfLoading) setPdfLoading(false)
        return // Exit early if idPdf is not valid
      }

      // idPdf is valid, proceed with additional checks
      if (idPdf.id !== 0) {
        getStatusOfPdf()
      } else if (idPdf.id === 0 && pdfLoading) {
        setPdfLoading(false)
      }
    } catch (error) {}
  }

  const hideShowDialog = () => {
    dispatch(setSelectedHistory(null))
    setMouvement(null)
    setDialogVisible((prev) => !prev)
  }

  const mapFamillePayload = (payload, isEnginType = false) =>
    payload.map((item) => ({
      label: item.label,
      value: isEnginType ? item.id : item.label,
      backgroundColor: item.bgColor,
      icon: item.icon,
    }))

  const fetchData = async () => {
    setLoading(true)
    try {
      // let pageGp = 1
      refFilter.current = filters
      setLoadingOrder(true)
      const localFirst = localStorage.getItem('engin-table-configs')
      const parcedDt = JSON.parse(localFirst)
      // if (parcedDt) {
      //   const page = parcedDt?.first / 10 + 1
      //   pageGp = 4
      // }
      const enginesResponse = await dispatch(
        fetchEngines({
          SortDirection: 'DESC',
          SortColumn: 'lastSeenAt',
          page: parcedDt?.first / 10 + 1 || 1,
        })
      ).unwrap()

      setPage(1)
      setTotalRecords(enginesResponse?.[0]?.TotalEngins || 0)
      setRows(rows)

      await Promise.all([
        dispatch(fetchSites()),
        dispatch(fetchTypesList()),
        dispatch(fetchStatusList()),
        dispatch(fetchStatus()),
      ])

      const [tagResponse, enginResponse] = await Promise.all([
        dispatch(fetchFamilles({src: 'tagType'})).unwrap(),
        dispatch(fetchFamilles({src: 'enginType'})).unwrap(),
      ])

      if (tagResponse?.length > 0) {
        setFamilleTag(mapFamillePayload(tagResponse))
      }

      if (enginResponse?.length > 0) {
        setFamilleEngin(mapFamillePayload(enginResponse, true))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      firstLoading.current = false
      setLoading(false)
    }
  }

  const areFiltersEmpty = (filters) => {
    return Object.values(filters).every((value) => {
      if (Array.isArray(value)) return value.length === 0
      return value === null
    })
  }

  let create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('engin'))
      .then(() => {
        dispatch(setEditEngine(true))
        dispatch(setSelectedEngine(null))
        dispatch(setTypeFields([]))
      })
      .finally(() => setIsLoadingButton(false))
  }

  useEffect(() => {
    if (loading) return
    checkPdfFunc()
    fetchData()
  }, [])

  useEffect(() => {
    const localFirst = localStorage.getItem('engin-table-configs')
    const parcedDt = JSON.parse(localFirst)
    if (parcedDt) {
      let page = parcedDt?.first / 10 + 1
    }
  }, [page])

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    orderByRef.current = orderBy
  }, [orderBy])

  useEffect(() => {
    if (firstLoading.current) return
    setFilterLoadingPopup(true)
    setIsLoadingButton(true)
    const f = filtersRef.current
    const ob = orderByRef.current
    const params = {
      search: searchEng.current || undefined,
      searchLastSeen: f?.lastSeen
        ? moment(f.lastSeen).isValid()
          ? moment(f.lastSeen).format('YYYY-MM-DD')
          : ''
        : '',
      searchSituation: f?.etat || '',
      searchTag: f?.tagFam || '',
      searchStatus: f?.status || '',
      searchFamille: f?.engFam || '',
      searchSite: f?.sites?.map((item) => item).join(', ') || '',
      SortDirection: ob?.order || 'DESC',
      SortColumn: ob?.field || '',
      searchLabel: f?.label || '',
      page: 1,
      PageSize: rows,
    }
    dispatch(fetchEngines(params))
      .then(({payload}) => {
        setPage(1)
        setTotalRecords(payload?.[0]?.TotalEngins || 0)
        setLoadingOrder(false)
      })
      .finally(() => {
        setIsLoadingButton(false)
        setFilterLoadingPopup(false)
      })
  }, [filters])

  // useEffect(() => {
  //   // Effect with cleanup to reset state when component unmounts
  //   return () => {
  //   }
  // }, [location])

  const onHide = () => {
    setVisible(false)
    setSelectedEngine(null)
  }

  return (
    <div className="lt-page" data-testid="engin-list-page">
      <DialogComponent
        visible={savePosVisible}
        header={'Save Pos'}
        onHide={() => setSavePosVisible(false)}
        className='w-11 md:w-6'
        footer={savePosFooter}
      >
        <InputText
          placeholder='Enter LocationId'
          id='locationId'
          name='locationId'
          value={formik.values.locationId}
          onChange={(e) => {
            formik.setFieldValue('locationId', e.target.value)
          }}
        />
        <InputText
          placeholder='Enter latitude'
          id='latitude'
          name='latitude'
          value={formik.values.latitude}
          onChange={(e) => {
            formik.setFieldValue('latitude', e.target.value)
          }}
        />
        <InputText
          placeholder='Enter longitude'
          id='longitude'
          name='longitude'
          value={formik.values.longitude}
          onChange={(e) => {
            formik.setFieldValue('longitude', e.target.value)
          }}
        />
        <InputText
          placeholder='Enter MacAddress'
          id='macAddress'
          name='macAddress'
          value={formik.values.macAddress}
          onChange={(e) => {
            formik.setFieldValue('macAddress', e.target.value)
          }}
        />
      </DialogComponent>
      <DialogComponent
        visible={filterLoadingPopup}
        onHide={() => {}}
        closable={false}
        className='w-11 md:w-3'
      >
        <div className='flex flex-column align-items-center justify-content-center py-4 gap-3'>
          <ProgressSpinner
            style={{width: '40px', height: '40px'}}
            strokeWidth='6'
            fill='var(--surface-ground)'
            animationDuration='.8s'
          />
          <span className='font-medium text-700'>Chargement des filtres...</span>
        </div>
      </DialogComponent>
      <DialogComponent visible={pdfVisible} onHide={() => setPdfVisible(false)}>
        <div className='w-full flex flex-row align-items-center justify-content-between mt-2'>
          <h1>
            <OlangItem olang={'gnrt.pdf'} />: {moment(generatedCheck.dateFile).format('DD-MM-YYYY')}
          </h1>
          <div className='flex flex-row align-items-center gap-2'>
            <Button
              label='pdf'
              icon='pi pi-file-pdf'
              className='p-button-sm'
              onClick={() => window.open(generatedCheck.filePath, '_blank')}
              severity='danger'
              outlined
            />
            <Button
              label='Generate'
              icon='pi pi-sync'
              className='p-button-sm'
              severity='success'
              onClick={() => handlePdfClick('pdf')}
              loading={pdfLoading}
            />
          </div>
        </div>
      </DialogComponent>
      <DynamicInputs visible={visible} setVisible={setVisible} onHide={onHide} />

      {/* Modern SaaS Header */}
      <div className="lt-page-header" data-testid="page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}}>
            <i className="pi pi-box"></i>
          </div>
          <div>
            <h1 className="lt-page-title"><OlangItem olang={'engin.list'} /></h1>
            <p className="lt-page-subtitle">Gestion et suivi de vos assets</p>
          </div>
        </div>
        <div className="lt-page-header-right">
          {totalRecords > 0 && (
            <div className="lt-count-badge" data-testid="total-count">
              <i className="pi pi-database" style={{fontSize: '0.75rem'}}></i>
              <strong>{totalRecords}</strong> assets
            </div>
          )}
          <div className="lt-view-toggle" data-testid="engin-view-toggle">
            <button
              className={`lt-view-btn ${viewMode === 'grid' ? 'lt-view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vue vignettes"
              data-testid="engin-view-grid"
            >
              <i className="pi pi-th-large"></i>
            </button>
            <button
              className={`lt-view-btn ${viewMode === 'table' ? 'lt-view-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vue tableau"
              data-testid="engin-view-table"
            >
              <i className="pi pi-list"></i>
            </button>
          </div>
        </div>
      </div>

      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={hideShowDialog}
      />

      {/* Table with SaaS wrapper */}
      {loading ? (
        <div className="lt-table-wrap" data-testid="skeleton-loading">
          <div className="lt-skeleton-wrap">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="lt-skeleton-row" style={{animationDelay: `${i * 0.08}s`}}>
                <div className="lt-skeleton-cell" style={{width: 48, height: 48, borderRadius: 10}} />
                <div className="lt-skeleton-cell" style={{width: 120, height: 14}} />
                <div className="lt-skeleton-cell" style={{width: 80, height: 14}} />
                <div className="lt-skeleton-cell" style={{width: 70, height: 28, borderRadius: 8}} />
                <div className="lt-skeleton-cell" style={{width: 60, height: 28, borderRadius: 8}} />
                <div className="lt-skeleton-cell" style={{width: 90, height: 14}} />
                <div className="lt-skeleton-cell" style={{flex: 1, height: 14}} />
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="lt-table-wrap" data-testid="engin-grid-wrap">
          {/* Search bar for grid mode */}
          <div style={{padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10}}>
            <i className="pi pi-search" style={{color: '#94A3B8', fontSize: '0.85rem'}}></i>
            <input
              style={{flex: 1, border: 'none', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0F172A', outline: 'none'}}
              placeholder="Rechercher un asset..."
              value={searchInput}
              onChange={handleSearch}
              data-testid="engin-grid-search"
            />
            <span style={{fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#F1F5F9'}}>
              Page {page} / {Math.ceil(totalRecords / rows) || 1}
            </span>
          </div>
          {/* Grid of vignettes */}
          <div className="lt-vignette-grid" data-testid="engin-grid-view">
            {engines.map((item, i) => {
              const isExit = item.etatenginname === 'exit'
              const isEntry = item.etatenginname === 'reception'
              const etatLabel = isExit ? 'Sortie' : isEntry ? 'Entrée' : (item.etatenginname || 'Inactif')
              const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
              const bat = parseInt(item.batteries, 10) || 0
              const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
              const statusColor = item.statusbgColor || '#94A3B8'
              return (
                <div key={item.id || i} className="lt-vcard" data-testid={`engin-vcard-${i}`}>
                  {item.image ? (
                    <div className="lt-vcard-img">
                      <Image
                        src={`${API_BASE_URL_IMAGE}${item.image}`}
                        alt={item.reference || ''} width="72" height="72" preview
                        imageStyle={{objectFit: 'cover', width: 72, height: 72}}
                      />
                    </div>
                  ) : (
                    <div className="lt-vcard-img-ph" style={{background: '#F1F5F9', color: '#94A3B8'}}>
                      <i className="pi pi-box"></i>
                    </div>
                  )}
                  <div className="lt-vcard-name">{item.reference || item.label || '-'}</div>
                  {item.vin && <div className="lt-vcard-sub">{item.vin}</div>}
                  <div className="lt-vcard-badges">
                    <span className="lt-badge" style={{background: `${etatColor}15`, color: etatColor}}>
                      <span className="lt-badge-dot" style={{background: etatColor}}></span>{etatLabel}
                    </span>
                    <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor}}>
                      <span className="lt-badge-dot" style={{background: statusColor}}></span>{item.statuslabel || '-'}
                    </span>
                    {item.famille && (
                      <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.7rem', padding: '2px 8px'}}>
                        {item.famille}
                      </span>
                    )}
                    {item.tagname && (
                      <span className="lt-badge lt-badge-info" style={{fontSize: '0.68rem', padding: '2px 7px'}}>
                        <i className="pi pi-tag" style={{fontSize: '0.6rem'}}></i>{item.tagname}
                      </span>
                    )}
                  </div>
                  <button className="lt-vcard-geo" onClick={() => handleShowMap(item, null)} data-testid="engin-vcard-geo">
                    <i className="pi pi-map-marker"></i>Localiser
                  </button>
                  <div className="lt-vcard-footer">
                    <div className="lt-vcard-loc">
                      <i className="pi pi-map-marker"></i>
                      {item.LocationObjectname || item.enginAddress || '-'}
                    </div>
                    <div className="lt-battery" style={{gap: 5}}>
                      <div className="lt-battery-bar-wrap" style={{width: 32, height: 16}}>
                        <div className="lt-battery-bar-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} />
                      </div>
                      <span style={{fontSize: '0.72rem', fontWeight: 800, color: batColor}}>
                        {item.batteries != null && item.batteries !== '' ? `${bat}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Grid Pagination */}
          <div className="lt-grid-pagination" data-testid="engin-grid-pagination">
            <button
              className="lt-grid-page-btn"
              disabled={page <= 1 || isLoadingButton}
              onClick={() => handlePageChange({page: page - 1, rows})}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
            <span className="lt-grid-page-info">
              Page <strong>{page}</strong> / <strong>{Math.ceil(totalRecords / rows) || 1}</strong>
              &nbsp;&mdash;&nbsp;{totalRecords} assets
            </span>
            <button
              className="lt-grid-page-btn"
              disabled={page >= Math.ceil(totalRecords / rows) || isLoadingButton}
              onClick={() => handlePageChange({page: page + 1, rows})}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="lt-table-wrap" data-testid="engin-table">
          <DatatableComponent
            tableId='engin-table'
            data={engines}
            splitAction={splitAction}
            columns={columns}
            onNew={create}
            serverSearched={true}
            onSearchServer={handleSearch}
            searchServ={searchInput}
            exportFields={exportFields}
            rowGroupTemplates={rowGroupTemplates}
            allowedGroupFields={allowedGroupFields}
            rowActions={actions}
            sortField={'id'}
            sortOrder={-1}
            isLoading={isLoadingButton}
            totalRecords={totalRecords}
            rows={rows}
            page={page}
            onPageChange={handlePageChange}
            onPdfClick={checkPdf}
            loadingPdf={pdfLoading}
            onExcelClick={onClickExcel}
            loadingExcel={loadingExcel}
            lazy={true}
            onOrderClick={handleOrderClick}
            orderBy={orderBy}
            extraActionTemplate={extraActionTemplate}
            notSortedColumns={['image', 'latlng']}
            isDataSelectable={false}
          />
        </div>
      )}
    </div>
  )
}

export default memo(EnginList)
