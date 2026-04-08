import {memo, useCallback, useEffect, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import {SplitButton} from 'primereact/splitbutton'
import {
  fetchTags,
  getSelectedTag,
  getTags,
  setEditTag,
  setSelectedTag,
  removeTag,
  fetchStatus,
  getStatus,
  setShow,
  setTagLocationShow,
  setTagLocation,
  fetchTagHistory,
  setTagHistoryShow,
} from '../../slice/tag.slice'
import {Chip} from 'primereact/chip'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useNavigate} from 'react-router-dom'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import GeocodingComponent from '../../../shared/GeocodingComponent/GeocodingComponent'
import {fetchValidator} from '../../../Inventory/slice/inventory.slice'
import {ProgressSpinner} from 'primereact/progressspinner'
import {setToastParams} from '../../../../store/slices/ui.slice'
import Loader from '../../../shared/Loader/Loader'
import {fetchFamilles} from '../../../Famillies/slice/famille.slice'
import _ from 'lodash'
import {DialogComponent} from '../../../shared/DialogComponent'
import moment from 'moment'
import {checkGeneratedFile, generateEngFile} from '../../../Engin/slice/engin.slice'
import {Button} from 'primereact/button'
import {_fetchStatusRapport} from '../../../Repports/api'

const TagList = ({titleShow, detailView, tags}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [rows, setRows] = useState(10)
  const [page, setPage] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfVisible, setPdfVisible] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [generatedCheck, setGeneratedCheck] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const status = useAppSelector(getStatus)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  let icon = detailView === 'Detail' ? 'pi-eye' : 'pi-sliders-v'
  let actions = [
    {
      label: `${detailView}`,
      icon: `pi ${icon} text-blue-500`,
      command: (e) => {
        if (detailView === 'Detail' || !detailView) {
          setIsLoading(true)
          dispatch(fetchValidator('tagupdate'))
            .then(() => {
              dispatch(setSelectedTag(e.item.data))
              dispatch(setShow(false))
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else if (detailView === 'Edit') {
          dispatch(setSelectedTag(e.item.data))
          dispatch(setEditTag(true))
        }
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      confirm: 'test',
      command: (e) => {
        dispatch(setSelectedTag(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimerce tag?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeTag(e.item.data))
            },
          })
        )
      },
    },
  ]

  const showLocationAddress = (rowData) => {
    if (!rowData?.lat || !rowData?.lng) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'Warning',
          detail: 'No Location Found',
          position: 'top-right',
        })
      )
      return
    }
    // dispatch(setTagHistoryShow(true))
    dispatch(fetchTagHistory(rowData?.id))
    let obj = {
      enginName: rowData?.enginName || '',
      image: rowData?.image || 'import/uploads/nopicture.png',
      tagName: rowData?.name,
      latitude: rowData?.lat,
      longitude: rowData?.lng,
      icon: rowData?.familleIcon,
      iconBgColor: rowData?.familleBgcolor,
      famille: rowData?.famille,
    }
    dispatch(setTagLocation(obj))
    dispatch(setTagLocationShow(true))
  }

  const fetchAndSetTags = (searchTerm) => {
    const params = {search: searchTerm || undefined, page: 1, All: 1}
    dispatch(fetchTags(params))
      .then(({payload}) => {
        if (payload) {
          setTotalRecords(payload[0]?.TotalTags || 0)
          setPage(0)
        }
      })
      .catch((error) => {
        console.error('Error fetching Tags:', error)
      })
  }

  const debouncedSearch = useCallback(
    _.debounce((searchTerm) => {
      fetchAndSetTags(searchTerm.trim())
    }, 300),
    []
  )

  const handleSearch = (event) => {
    setSearchInput(event.target.value)
    debouncedSearch(event.target.value)
  }

  const activeTemplate = (rowData) => {
    const isActive = rowData?.active == 1
    return (
      <span
        className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-danger'}`}
        data-testid="tag-active-badge"
      >
        <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-danger'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }
  const statusTemplate = (rowData) => {
    const bgColor = rowData?.statusbgColor || '#94A3B8'
    const label = rowData?.status || '-'
    return (
      <span
        className="lt-badge"
        style={{background: `${bgColor}18`, color: bgColor}}
        title={rowData?.statusDate || ''}
        data-testid="tag-status-badge"
      >
        <span className="lt-badge-dot" style={{background: bgColor}}></span>
        {label}
      </span>
    )
  }

  const handlePageChange = (newPage, rows) => {
    setPage(newPage)
    dispatch(fetchTags({page: newPage, PageSize: rows, All: 1}))
  }

  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <span
        className="lt-famille-chip"
        style={{background: familleBgcolor || '#64748B'}}
        data-testid="tag-famille-chip"
      >
        {familleIcon && <i className={familleIcon} style={{fontSize: '0.75rem'}}></i>}
        {famille || '-'}
      </span>
    )
  }

  const checkPdf = async () => {
    let obj = {
      Filetype: 'pdf',
      src: 'tag',
    }
    const {payload} = await dispatch(checkGeneratedFile(obj))
    setGeneratedCheck(payload?.[0] || null)
    setPdfVisible(true)
  }

  const handlePdfClick = async (type) => {
    if (type === 'pdf') {
      setPdfVisible(false)
      setPdfLoading(true)
    }
    const obj = {
      templatename: 'tagList',
      Filetype: type === 'pdf' ? 'pdf' : 'xls',
      src: 'tag',
    }

    try {
      const {payload} = await dispatch(generateEngFile(obj))

      if (!payload || payload.length === 0) {
        console.error('No payload data received.')
        setPdfLoading(false)
        return
      }
      // setPdfIdGenerator(payload[0].ID)

      const intervalWait = setInterval(async () => {
        try {
          const resStatus = await _fetchStatusRapport({id: payload[0].ID})
          if (resStatus?.data?.[0]?.status == 1) {
            if (type === 'pdf') {
              setPdfLoading(false)
            }
            // setPdfIdGenerator(0)
            clearInterval(intervalWait)
            if (type === 'xls') {
              setLoadingExcel(false)
            }

            const filePath = payload[0].path
            if (filePath) {
              window.open(filePath, '_blank')
            } else {
              console.error('File path is missing.')
            }
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

  const addresseeTemplate = (rowData) => {
    const {tagAddress} = rowData
    return (
      <div>
        {tagAddress ? (
          <span
            className="lt-geo-btn"
            onClick={() => showLocationAddress(rowData)}
            data-testid="tag-address-btn"
          >
            <i className="pi pi-map-marker" style={{fontSize: '0.78rem'}}></i>
            {tagAddress.length > 25 ? tagAddress.substring(0, 25) + '...' : tagAddress}
          </span>
        ) : (
          <span className="lt-badge lt-badge-neutral" data-testid="no-address">
            <i className="pi pi-map" style={{fontSize: '0.7rem'}}></i>
            Aucune adresse
          </span>
        )}
      </div>
    )
  }

  const columns = [
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
      body: addresseeTemplate,
    },
    {
      header: 'Satus',
      olang: 'Status',
      field: 'status',
      body: statusTemplate,
    },

    {header: 'ACTIF', field: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  const exportFields = [
    {label: 'Nom', column: 'name'},
    {label: 'Label', column: 'label'},
    {label: 'Famille', column: 'famille'},
    //{label: 'Adresse', column: 'adresse'},
    {label: 'Satus', column: 'status'},
  ]

  const allowedGroupFields = ['famille', 'status']

  const rowGroupTemplates = {
    famille: (rowData) => familleTemplate(rowData),
    status: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.status} />
    ),
  }

  let create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('tagadd'))
      .then(() => {
        dispatch(setEditTag(true))
        dispatch(setSelectedTag(null))
      })
      .finally(() => {
        setIsLoadingButton(false)
      })
  }

  useEffect(() => {
    dispatch(fetchFamilles({src: 'tagType'}))
    setIsLoading(true)
    dispatch(fetchStatus())
    dispatch(fetchTags({page: 1, All: 1})).then(({payload}) => {
      setPage(0)
      setTotalRecords(payload?.[0]?.TotalTags)
      setRows(10)
      setIsLoading(false)
    })
  }, [])

  return (
    <>
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
      <div className="lt-page" data-testid="tag-list-page">
        {/* Modern SaaS Header */}
        <div className="lt-page-header" data-testid="tag-page-header">
          <div className="lt-page-header-left">
            <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'}}>
              <i className="pi pi-tag"></i>
            </div>
            <div>
              <h1 className="lt-page-title"><OlangItem olang={'tag.list'} /></h1>
              <p className="lt-page-subtitle">Inventaire et suivi de vos tags</p>
            </div>
          </div>
          <div className="lt-page-header-right">
            {totalRecords > 0 && (
              <div className="lt-count-badge" data-testid="tag-total-count">
                <i className="pi pi-tag" style={{fontSize: '0.75rem'}}></i>
                <strong>{totalRecords}</strong> tags
              </div>
            )}
            <div className="lt-view-toggle" data-testid="tag-view-toggle">
              <button
                className={`lt-view-btn ${viewMode === 'grid' ? 'lt-view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vue vignettes"
                data-testid="tag-view-grid"
              >
                <i className="pi pi-th-large"></i>
              </button>
              <button
                className={`lt-view-btn ${viewMode === 'table' ? 'lt-view-btn--active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Vue tableau"
                data-testid="tag-view-table"
              >
                <i className="pi pi-list"></i>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="lt-table-wrap" data-testid="tag-skeleton">
            <div className="lt-skeleton-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="lt-skeleton-row" style={{animationDelay: `${i * 0.08}s`}}>
                  <div className="lt-skeleton-cell" style={{width: 100, height: 14}} />
                  <div className="lt-skeleton-cell" style={{width: 80, height: 14}} />
                  <div className="lt-skeleton-cell" style={{width: 70, height: 28, borderRadius: 8}} />
                  <div className="lt-skeleton-cell" style={{width: 120, height: 14}} />
                  <div className="lt-skeleton-cell" style={{width: 60, height: 28, borderRadius: 8}} />
                  <div className="lt-skeleton-cell" style={{flex: 1, height: 28, borderRadius: 8}} />
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="lt-table-wrap" data-testid="tag-grid-wrap">
            {/* Search bar */}
            <div style={{padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10}}>
              <i className="pi pi-search" style={{color: '#94A3B8', fontSize: '0.85rem'}}></i>
              <input
                style={{flex: 1, border: 'none', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#0F172A', outline: 'none'}}
                placeholder="Rechercher un tag..."
                value={searchInput}
                onChange={handleSearch}
                data-testid="tag-grid-search"
              />
              <span style={{fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#F1F5F9'}}>
                Page {page + 1} / {Math.ceil(totalRecords / rows) || 1}
              </span>
            </div>
            {/* Grid */}
            <div className="lt-vignette-grid" data-testid="tag-grid-view">
              {tags.map((item, i) => {
                const isActive = item.active == 1
                const statusColor = item.statusbgColor || '#94A3B8'
                return (
                  <div key={item.id || i} className="lt-vcard" data-testid={`tag-vcard-${i}`}>
                    <div className="lt-vcard-img-ph" style={{background: item.familleBgcolor || '#6D28D9', color: '#FFF'}}>
                      <i className={item.familleIcon || 'pi pi-tag'}></i>
                    </div>
                    <div className="lt-vcard-name">{item.name || item.label || '-'}</div>
                    {item.label && item.label !== item.name && <div className="lt-vcard-sub">{item.label}</div>}
                    <div className="lt-vcard-badges">
                      {item.famille && (
                        <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.7rem', padding: '2px 8px'}}>
                          {item.familleIcon && <i className={item.familleIcon} style={{fontSize: '0.65rem'}}></i>}
                          {item.famille}
                        </span>
                      )}
                      <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor}}>
                        <span className="lt-badge-dot" style={{background: statusColor}}></span>
                        {item.status || '-'}
                      </span>
                      <span className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-danger'}`}>
                        <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-danger'}`}></span>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {item.tagAddress && (
                      <button className="lt-vcard-geo" onClick={() => showLocationAddress(item)} data-testid="tag-vcard-geo">
                        <i className="pi pi-map-marker"></i>Localiser
                      </button>
                    )}
                    {item.tagAddress && (
                      <div className="lt-vcard-footer" style={{justifyContent: 'center'}}>
                        <div className="lt-vcard-loc" style={{maxWidth: '100%'}}>
                          <i className="pi pi-map-marker"></i>
                          {item.tagAddress.length > 30 ? item.tagAddress.substring(0, 30) + '...' : item.tagAddress}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Grid Pagination */}
            <div className="lt-grid-pagination" data-testid="tag-grid-pagination">
              <button className="lt-grid-page-btn" disabled={page <= 0} onClick={() => handlePageChange({page: page - 1, rows})}>
                <i className="pi pi-chevron-left"></i>
              </button>
              <span className="lt-grid-page-info">
                Page <strong>{page + 1}</strong> / <strong>{Math.ceil(totalRecords / rows) || 1}</strong>
                &nbsp;&mdash;&nbsp;{totalRecords} tags
              </span>
              <button className="lt-grid-page-btn" disabled={page + 1 >= Math.ceil(totalRecords / rows)} onClick={() => handlePageChange({page: page + 1, rows})}>
                <i className="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="lt-table-wrap" data-testid="tag-table">
            <DatatableComponent
              tableId='tag-table'
              data={tags}
              columns={columns}
              exportFields={exportFields}
              onNew={create}
              isLoading={isLoadingButton}
              rowGroupTemplates={rowGroupTemplates}
              contextMenuModel={actions}
              allowedGroupFields={allowedGroupFields}
              rowActions={actions}
              sortField={'id'}
              sortOrder={-1}
              rows={rows}
              page={page}
              onPageChange={handlePageChange}
              totalRecords={totalRecords}
              onSearchServer={handleSearch}
              searchServ={searchInput}
              serverSearched={true}
              onPdfClick={checkPdf}
              loadingPdf={pdfLoading}
              loadingExcel={loadingExcel}
              lazy={true}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default memo(TagList)
