import {useMemo, useState} from 'react'
import {DataTable} from 'primereact/datatable'
import {OverlayPanel} from 'primereact/overlaypanel'
import {InputSwitch} from 'primereact/inputswitch'
import {Divider} from 'primereact/divider'
import {Column} from 'primereact/column'
import {Dropdown, Ripple, InputText, Skeleton, MultiSelect} from 'primereact'
import {classNames} from 'primereact/utils'
import {ContextMenu} from 'primereact/contextmenu'
import Button from '../ButtonComponent/ButtonComponent.js'
import {FilterMatchMode} from 'primereact/api'
import _ from 'lodash'
import {useEffect} from 'react'
import moment from 'moment'
import {useRef} from 'react'
import {SplitButton} from 'primereact/splitbutton'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem.js'
import {getCurrentLang, getLangs} from '../Olang/slice/olang.slice.js'
import {useAppSelector} from '../../../hooks'
import {TriStateCheckbox} from 'primereact/tristatecheckbox'

import './style/style.css'
export const DatatableComponent = ({
  tableId,
  onlyExcel,
  data,
  splitAction,
  columns,
  exportFields,
  rowExpansionTemplate,
  expanded,
  expenderData,
  rowActions,
  rowActionIcon,
  extraHeader,
  rowGroupTemplates,
  allowedGroupFields = [],
  allowExpenssion,
  onSelections,
  onNew,
  contextMenuModel,
  extraActionTemplate,
  selectionMode,
  isDataSelectable,
  sortOrder = -1,
  sortField = 'id',
  isLoading = false,
  styleDt,
  totalRecords,
  rows,
  page,
  onPageChange,
  onRowsChange,
  serverSearched,
  searchServ,
  onSearchServer,
  onPdfClick,
  onExcelClick,
  loadingExcel,
  loadingPdf,
  lazy = false,
  onOrderClick,
  orderBy,
  notSortedColumns,
  ...props
}) => {
  const [tColumns, setTColumns] = useState([])
  const table = useRef(null)
  const settingsRef = useRef(null)
  const [currentData, setcurrentData] = useState([])
  const [filters, setFilters] = useState({})
  const [filtersFields, setFiltersFields] = useState([])
  const [expandedRows, setExpandedRows] = useState([])
  const [enableRowSelection, setEnableRowSelection] = useState(false)
  const [selectedData, setSelectedData] = useState([])
  const [selectedItem, setSelectedItem] = useState({})
  const [enableContextMenu, setEnableContextMenu] = useState(false)
  const [actions, setActions] = useState([])
  const [first, setFirst] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    if (page !== undefined) {
      setFirst((page - 1) * rowsPerPage)
    }
  }, [page])

  const currentLang = useAppSelector(getCurrentLang)
  const langs = useAppSelector(getLangs)

  const [hasActions, setHasActions] = useState(false)
  const [hasContext, setHasContext] = useState(false)

  const cmRef = useRef(null)
  const session = tableId + '-configs'
  const customSession = tableId + '-custom-configs'
  let conf = localStorage.getItem(customSession) || null
  conf = JSON.parse(conf)

  const [configs, setConfigs] = useState(conf)
  const [visibility, setVisibility] = useState(conf?.visibility)
  const [exportableColumns, setExportableColumns] = useState(conf?.exportableColumns || {})
  const [rowGroupOptions, setRowGroupOptions] = useState(conf?.rowGroup)

  let isExportable = Array.isArray(exportFields) && exportFields?.length
  const [exportableFields, setExportableFields] = useState(conf?.exportFields) //1
  const [tblColumns, setTblColumns] = useState([])

  const [list, setList] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState(conf?.filterText || '')

  const firstLoading = useRef(true)

  const cols = useMemo(
    () => columns.map((col) => ({title: col.header, dataKey: col.field})),
    [columns]
  )

  const toggleExportFields = (col, vs) => {
    let data = {
      ...(conf || {}),
      exportFields: {...(conf?.exportFields || {}), [col]: !conf?.exportable?.[col]},
    }
    setExportableFields((prev) => {
      prev[col] = vs
      return prev
    })
  } //2

  let exportColumns = useMemo(
    () => cols.map((col) => ({title: col.header, dataKey: col.field})),
    [cols]
  )

  const paginationChange = (e) => {
    setFirst(e.first)
    setRowsPerPage(e.rows)
    if (typeof onPageChange === 'function') {
      if (firstLoading.current) {
        firstLoading.current = false
        return
      }
      onPageChange(e.page + 1, e.rows)
    }
  }

  const template = {
    layout: 'RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport',
    PrevPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <span>
            {' '}
            <i className='pi pi-angle-left'></i>{' '}
          </span>
          <Ripple />
        </Button>
      )
    },
    PageLinks(options) {
      if (
        (options.view.startPage === options.page && options.view.startPage !== 0) ||
        (options.view.endPage === options.page && options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, {'p-disabled': true})

        return (
          <span className={className} style={{userSelect: 'none'}}>
            ...
          </span>
        )
      }

      return (
        <span type='button' className={options.className} onClick={options.onClick}>
          {options.page + 1}
          <Ripple />
        </span>
      )
    },
    NextPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <i className='pi pi-angle-right'></i>
          <Ripple />
        </Button>
      )
    },
    RowsPerPageDropdown(options) {
      const dropOptions = [
        {label: 10, value: 10},
        {label: 20, value: 20},
        {label: 50, value: 50},
        // {label: 'All', value: options.totalRecords},
      ]

      return (
        <div className='mr-5'>
          <span className='mx-2' style={{userSelect: 'none'}}>
            éléments par table:
          </span>
          <Dropdown value={options.value} onChange={options.onChange} options={dropOptions} />
        </div>
      )
    },
    CurrentPageReport(options) {
      return (
        <span className='mx-2'>
          {options.first} à {options.last} de {options.totalRecords} élément
        </span>
      )
    },
  }

  useEffect(() => {
    if (!Array.isArray(data)) return
    let filter = data?.filter((_i) => isMatchItem(_i, globalFilterValue))
    setList(filter)
    setcurrentData(filter)
  }, [globalFilterValue, data])

  const onGlobalFilterChange1 = (e) => {
    if (typeof onSearchServer === 'function') onSearchServer(e.target.value)
    setGlobalFilterValue(e.target.value)
    localStorage.setItem(customSession, JSON.stringify(data))
    let data = {...(conf || {}), filterText: e.target.value}
  }
  const isMatchItem = (item, val) => {
    if ((val || '').includes(':')) {
      val = val.split(':')

      return (
        (typeof item[val[0]] == 'string' ? item[val[0]] : '').toUpperCase() ==
          val[1].toUpperCase() || item[val[0]]?.label == val[1]
      )
    }
    for (const key in item) {
      if (!item[key]) continue
      if (new RegExp(val, 'gi').test(JSON.stringify(item[key]))) {
        return true
      }
    }
    return false
  }
  const clearFilter = () => {
    setGlobalFilterValue('')
  }

  const toggleColumnVisibility = (col, vs) => {
    let data = {...(conf || {}), visibility: {...(conf?.visibility || {}), [col]: vs}}
    localStorage.setItem(customSession, JSON.stringify(data))
    setVisibility(data?.visibility || {})
  }

  const toggleExportColumn = (col, vs) => {
    let data = setFeatureInfosToStorage('exportableColumns', {[col]: vs})
    setExportableColumns(data || {})
  }

  const setFeatureInfosToStorage = (property, val, replace = false) => {
    let data = {
      ...(conf || {}),
      exportableColumns: replace ? val : {...(conf?.[property] || {}), ...val},
    }
    localStorage.setItem(customSession, JSON.stringify(data))
    return data?.[property]
  }
  const getDataFromStorage = (key) => {
    let sData = localStorage.getItem(customSession)
    if (typeof sData == 'string') sData = JSON.parse(sData)
    else sData = {}

    return sData?.[key]
  }

  const toggleRowGroup = (col, group) => {
    let data = {
      ...(conf || {}),
      rowGroup: {groupBy: group ? col : '', groupMode: group ? 'subheader' : ''},
    }
    localStorage.setItem(customSession, JSON.stringify(data))
    setRowGroupOptions(data?.rowGroup)
  }

  const toggleExcelBtn = () => {
    if (typeof onExcelClick == 'function') {
      onExcelClick()
      return
    }
    exporter.export('xlsx')
  }

  const toggleRowSelection = (val) => {
    setEnableRowSelection(val)
    localStorage.setItem('row-selection', val ? 1 : 0)
  }
  const renderHeader = () => {
    return (
      <div
        className={`flex gap-3  flex-wrap ${
          isExportable && currentData?.length ? 'justify-content-between' : 'justify-content-end'
        }`}
      >
        {typeof onNew == 'function' || extraActionTemplate ? (
          <div className='flex align-items-center gap-2'>
            {typeof onNew == 'function' ? (
              <Button
                type='button'
                icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-plus'}
                className='flex flex-row align-items-center gap-2 font-semibold p-border-circle text-gray-800 bg-transparent p-button-text hover:text-green-700 hover:bg-gray-100'
                onClick={onNew}
                text
              >
                <OlangItem olang='new' />
              </Button>
            ) : null}
            {extraActionTemplate && extraActionTemplate()}
          </div>
        ) : null}
        {isExportable && currentData?.length ? (
          <div className='flex gap-5'>
            <Button
              type='button'
              icon='pi pi-file-excel'
              label='Excel'
              className='p-button-outlined text-green-700 border-green-700'
              onClick={toggleExcelBtn}
              loading={loadingExcel}
              disabled={loadingExcel}
              outlined
            />
            {!onlyExcel && (
              <Button
                type='button'
                icon='pi pi-file-pdf'
                label='PDF'
                className='border-red-700 text-red-700'
                loading={loadingPdf}
                disabled={loadingPdf}
                onClick={() => {
                  if (typeof onPdfClick == 'function') {
                    onPdfClick()
                    return
                  }
                  exporter.export('pdf')
                }}
                outlined
              />
            )}
          </div>
        ) : (
          ''
        )}

        {extraHeader ? extraHeader : null}
        <div className='flex align-items-center'>
          <span className='p-input-icon-left'>
            <i className='pi pi-search' />
            <InputText
              value={serverSearched ? searchServ : globalFilterValue}
              onChange={serverSearched ? onSearchServer : onGlobalFilterChange1}
              placeholder='Recherche...'
            />

            {/* <i className="pi pi-times" /> */}
          </span>
          <Button
            icon='pi pi-cog'
            onClick={(e) => settingsRef.current.toggle(e)}
            className='p-button-text  p-button-sm '
            style={{height: 'auto'}}
          />
          <OverlayPanel ref={settingsRef} className='p-0'>
            <div style={{width: '350px'}} className='p-3'>
              <div>
                <h4>Visibilité colones</h4>
                {!tableId && typeof tableId != 'string' ? (
                  <strong className='text-red-400 mt-2 text-sm'>Pas d'identifiant de table</strong>
                ) : (
                  <div className='flex flex-wrap mt-4'>
                    {tblColumns.map((c) => (
                      <div className='px-1 py-2 flex align-items-center '>
                        <InputSwitch
                          checked={!visibility || visibility?.[c.field]}
                          onChange={(e) => toggleColumnVisibility(c?.field, e.value)}
                        />
                        <strong className='ml-2'>{c.header}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Divider />
              <div>
                <h4>Colonnes à exporter</h4>
                {!tableId && typeof tableId != 'string' ? (
                  <strong className='text-red-400 mt-2 text-sm'>Pas d'identifiant de table</strong>
                ) : (
                  <div className='flex flex-wrap mt-4'>
                    {tblColumns.map(
                      (c) =>
                        c.exportable !== false && (
                          <div className='px-1 py-2 flex align-items-center '>
                            <InputSwitch
                              checked={exportableColumns?.[c.field] === true}
                              onChange={(e) => toggleExportColumn(c?.field, e.value)}
                            />
                            <strong className='ml-2'>{c.header}</strong>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
              <Divider />
              <div>
                <h4>Groupage ( Grouper par )</h4>
                <div className='flex flex-wrap mt-4'>
                  {tblColumns.map((c) => {
                    if (!Array.isArray(allowedGroupFields) || !allowedGroupFields.includes(c.field))
                      return null
                    return c.isGroupable === false ? null : (
                      <div className='px-1 py-2 flex align-items-center '>
                        <InputSwitch
                          checked={rowGroupOptions?.groupBy == c.field}
                          onChange={(e) => toggleRowGroup(c.field, e.value)}
                        />
                        <strong className='ml-2'>{c.header}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Divider />
              <div>
                <h4>Autre configuration</h4>
                <div className='flex flex-wrap mt-4'>
                  <div className='px-1 py-2 flex align-items-center '>
                    <InputSwitch
                      checked={enableRowSelection}
                      onChange={(e) => toggleRowSelection(e.value)}
                    />
                    <strong className='ml-2'>Sélection de ligne</strong>
                  </div>
                  {hasContext ? (
                    <div className='px-1 py-2 flex align-items-center '>
                      <InputSwitch
                        checked={enableContextMenu}
                        onChange={(e) => setEnableContextMenu(e.value)}
                      />
                      <strong className='ml-2'>Menu contextuel</strong>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </OverlayPanel>
        </div>
      </div>
    )
  }

  const actionTemplate = (rowData) => {
    if (!Array.isArray(actions)) return
    let _actions = actions
      ?.map((_i) => ({..._i, data: rowData}))
      ?.filter(
        (a) =>
          typeof a.visible != 'function' ||
          (typeof a.visible == 'function' && a.visible(rowData, a) === true)
      )
    return (
      <div>
        {/* <SplitButton
          model={_actions}
          className='action-split-button  p-button-raised'
          menuButtonProps={{
            style: {width: '50px', height: '50px'},
            severity: 'primary',
            icon: rowActionIcon || 'pi pi-cog',
            className: 'border-round-sm',
          }}
          buttonClassName='hidden'
          label={<OlangItem olang='Actions' />}
        /> */}
        <SplitButton
          label={<OlangItem olang='Details' />}
          icon='pi pi-cog'
          model={_actions}
          // severity='secondary'
          menuButtonProps={{
            icon: rowActionIcon || 'pi pi-chevron-down',
            className:
              'border-none bg-transparent hover:bg-gray-100 text-gray-800 hover:text-blue-900',
          }}
          rounded
          buttonClassName='hidden'
          onClick={() => splitAction(rowData)}
        />
      </div>
    )
  }

  let selectBody = (_data, field) => {
    return (options) => {
      return (
        <MultiSelect
          filter
          value={(options.value || []).map((_i) => ({label: _i[field], id: _i['id']}))}
          style={{maxWidth: '200px'}}
          display='chip'
          options={_data.map((_i) => ({label: _i[field], id: _i['id']}))}
          onChange={(e) =>
            options.filterApplyCallback(
              (e.value || []).map((_i) => _data.find((_it) => _it[field] == _i.label))
            )
          }
        />
      )
    }
  }

  useEffect(() => {
    if (!Array.isArray(data) || data?.length == 0) return
    let filter = {}
    let filtersFiels = []
    let tblCols = _.cloneDeep(columns)
    let lst = _.cloneDeep(data)
    let storage = localStorage.getItem(session)
    if (typeof storage == 'string') storage = JSON.parse(storage)
    else storage = {}
    let filters = storage?.filters || {}

    tblCols.forEach((col) => {
      if (col.olang) col.header = <OlangItem olang={col.olang} />
      if (col.filter) {
        filter[col.field] = {value: filters[col.field]?.value, matchMode: FilterMatchMode.CONTAINS}
        filtersFiels.push(col.field)
        if (col.field.includes('.')) {
          let parts = col.field.split('.')
          if (parts?.length == 2) {
            if (lst.find((_it) => Array.isArray(_it[parts[0]]))) {
              lst.forEach((_it) => {
                _it['data' + parts[0]] = {
                  label: (_it[parts[0]] || []).map((_i) => _i[parts[1]]).join('|'),
                  value: (_it[parts[0]] || []).map((_i) => _i[parts[1]]).join('|'),
                }
              })

              parts[0] = 'data' + parts[0]
              parts[1] = 'label'
              filtersFiels[filtersFiels.length - 1] = parts[0] + '.label'
            }

            if (lst.find((_it) => Object.keys(_it[parts[0]] || {}).length)) {
              let _data = lst.map((_i) => {
                return _i[parts[0]]
              })
              _data = _data?.filter((_it) => _it?.[parts[1]])

              _data = _.uniqBy(_data, parts[1])

              col.filterElement = col?.filterElement || selectBody(_data, parts[1])
              delete filter[col.field]
              filter[parts[0]] = {value: null, matchMode: FilterMatchMode.IN}
              col.filterField = parts[0]
              // col.filterMenuStyle = { width: '14rem' }
            }
          }
        }
      }
    })

    setFilters(filter)
    setFiltersFields(filtersFiels)
    setTblColumns(tblCols)
  }, [data, columns])

  useEffect(() => {
    setEnableRowSelection(+localStorage.getItem('row-selection') === 1)
    // return () => (firstLoading.current = false)
  }, [])

  useEffect(() => {
    let keys = getDataFromStorage('exportableColumns')
    if (!_.isPlainObject(keys)) keys = {}
    if (Object.entries(keys).length > 0) return
    let cls = Array.isArray(columns) ? _.cloneDeep(columns) : []
    cls = cls.reduce((c, v) => {
      if (v.exportable === false) return c
      c[v.field] = true

      return c
    }, {})
    setFeatureInfosToStorage('exportableColumns', cls)
    setExportableColumns(cls)
  }, [columns])

  // fonctionalités d'export
  const exporter = {
    export(type) {
      let _columns = {...exportableColumns}
      let fields = []
      for (let [k, v] of Object.entries(_columns)) {
        if (v === true) fields.push(k)
      }
      fields = fields.map((v) => {
        let dt = columns.find((o) => o.field == v)
        if (!dt) return dt

        return {
          column: v,
          label: typeof dt.header == 'string' ? dt.header : v,
        }
      })

      fields = fields?.filter((o) => o != undefined)

      let data = _.cloneDeep(currentData || []).map((_i) =>
        fields.reduce((data, key, index) => {
          let keys = (key?.column || '').split('.')
          if (!keys.length) return data

          let val = ''
          const len = keys.length
          if (len == 1) val = _i[keys[0]]
          if (len == 2) {
            if (!key?.type || key.type == 'object')
              val = _i[keys[0]]?.[keys[1]] || _i[keys[0]]?.default || ''
            else if (key.type == 'array') {
              val = []
              for (const _it of _i[keys[0]]) {
                val.push(_it[keys[1]])
              }
              val = val.join('|')
            }
          }

          val = val || key?.default || ''

          return {...data, [key.label]: val}
        }, {})
      )
      switch (type) {
        case 'pdf':
          this.toPdf(data, fields)
          break
        case 'xlsx':
          this.toExcel(data, fields)
          break
        default:
          break
      }
    },
    toPdf(data, fields) {
      import('jspdf').then((jsPDF) => {
        exportColumns = fields.map((_i) => ({title: _i.label, dataKey: _i.label}))
        import('jspdf-autotable').then(() => {
          const doc = new jsPDF.default({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a2',
          })
          doc.autoTable(exportColumns, data)

          doc.save('raport_tache_' + moment().format('YYYY-MM-DD_HH:mm:ss'))
        })
      })
    },
    toExcel(data, fields) {
      import('xlsx').then((xlsx) => {
        let worksheet = xlsx.utils.json_to_sheet(data)
        let workbooks = {Sheets: {data: worksheet}, SheetNames: ['data']}
        const extension = 'xlsx'
        const excelBuffer = xlsx.write(workbooks, {bookType: extension, type: 'array'})

        this.save(excelBuffer, 'raport_tache_')
      })
    },

    save(buffer, filename, extension = '') {
      try {
        if (extension || typeof extension != 'string')
          throw 'No extension or wrong extension format ( expected a string )'

        import('file-saver').then((module) => {
          if (module && module.default) {
            let EXCEL_TYPE =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
            let EXCEL_EXTENSION = extension.charAt(0) == '.' ? extension : '.' + extension
            const data = new Blob([buffer], {
              type: EXCEL_TYPE,
            })
            module.default.saveAs(
              data,
              filename + moment().format('YYYY-MM-DD_HH:mm:ss') + EXCEL_EXTENSION
            )
          }
        })
      } catch (e) {
        console.error('error:', e.message)
      }
    },
  }

  const onRowToggle = (e) => {
    setExpandedRows(e.data)
  }

  const customHeaderTemplate = (column) => {
    const isCurrentColumn = orderBy?.field === column.field
    const isAscending = isCurrentColumn && orderBy?.order === 'ASC'
    const iconClass = isAscending ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short'
    const colorClass = isCurrentColumn ? 'text-blue-400' : 'text-gray-400'

    if (notSortedColumns?.includes(column.field))
      return <span className={'flex align-items-center flex-row gap-4'}>{column.header}</span>

    return (
      <span
        onClick={() => onOrderClick(column.field)}
        style={{cursor: 'pointer', width: column?.width || 'auto'}}
        className={
          'flex align-items-center flex-row gap-4' + (isCurrentColumn ? ' text-blue-400' : '')
        }
      >
        {column.header}
        {serverSearched && <i className={`fa-solid ${iconClass} ${colorClass}`}></i>}
      </span>
    )
  }

  const _allowExpenssion = (rowData) => {
    return typeof allowExpenssion == 'function'
      ? allowExpenssion
      : allowExpenssion === false
      ? allowExpenssion
      : true
  }

  const groupTemplate = (rowData) => {
    return rowData?.[rowGroupOptions?.groupBy]
  }

  const _rowGroupHeaderTemplate = () => {
    return rowGroupOptions?.groupMode == 'subheader'
      ? rowGroupTemplates?.[rowGroupOptions?.groupBy] || groupTemplate
      : null
  }

  const onRowSelection = (data) => {
    setSelectedData(data)
    if (typeof onSelections == 'function') onSelections(data)
  }

  useEffect(() => {
    const r = Array.isArray(rowActions) && rowActions?.length > 0
    setHasActions(r)
    setHasContext(r || (Array.isArray(contextMenuModel) && contextMenuModel?.length > 0))
  }, [rowActions])

  useEffect(() => {
    const r = Array.isArray(rowActions) && rowActions?.length > 0
    setActions(
      !r
        ? []
        : rowActions.map((action) => ({
            ...action,
            label: action.olang
              ? typeof langs?.[currentLang]?.[action.olang] === 'string'
                ? langs?.[currentLang]?.[action.olang]
                : action.olang
              : action.label,
          }))
    )
  }, [rowActions, currentLang, langs])

  return (
    <div class='shadow-3'>
      {/** Menu contextuel */}
      <ContextMenu
        model={
          Array.isArray(rowActions || contextMenuModel)
            ? (rowActions || contextMenuModel).map((a) => ({...a, data: selectedItem}))
            : []
        }
        ref={cmRef}
      />
      <DataTable
        sortField={sortField}
        sortOrder={sortOrder}
        sortable
        rowGroupMode={rowGroupOptions?.groupMode}
        groupRowsBy={rowGroupOptions?.groupBy}
        rowGroupHeaderTemplate={_rowGroupHeaderTemplate()}
        filters={filters}
        className='p-datatable-customers p-2 bg-white'
        paginatorTemplate={template}
        // onPage={onPageChange}
        first={first}
        filterDisplay='row'
        stateStorage='local'
        stateKey={session}
        selection={selectedData}
        onSelectionChange={(e) => onRowSelection(e.value)}
        isDataSelectable={(r) => {
          if (typeof isDataSelectable == 'function') return isDataSelectable(r.data)
          return true
        }}
        paginator
        size='small'
        ref={table}
        rows={rowsPerPage}
        value={list}
        lazy={lazy}
        totalRecords={totalRecords || list?.length}
        onPage={paginationChange}
        // dataKey='id'
        header={renderHeader()}
        expandedRows={expandedRows}
        onValueChange={(e) => setcurrentData(e)}
        rowExpansionTemplate={
          expanded ? (rowExpansionTemplate !== undefined ? rowExpansionTemplate : '') : ''
        }
        reorderableColumns
        onRowReorder={(e) => setList(e.value)}
        onRowToggle={onRowToggle}
        onContextMenu={(e) => (enableContextMenu ? cmRef.current.show(e.originalEvent) : null)}
        contextMenuSelection={enableContextMenu ? null : selectedItem}
        onContextMenuSelectionChange={(d) => (enableContextMenu ? setSelectedItem(d.value) : null)}
        globalFilterFields={filtersFields}
        style={styleDt}
        {...props}
      >
        {expanded ? (
          <Column key='expender-col' expander={_allowExpenssion()} style={{width: '2rem'}} />
        ) : null}
        {enableRowSelection ? (
          <Column selectionMode={selectionMode || 'multiple'} style={{width: '3rem'}} />
        ) : null}
        {hasActions && !enableContextMenu ? (
          <Column
            header={<OlangItem olang='action.action' />}
            body={actionTemplate}
            style={{width: '5rem'}}
          />
        ) : null}
        {(tblColumns || []).map((column, index) =>
          !visibility || visibility?.[column.field] ? (
            <Column
              key={index}
              {...column}
              header={customHeaderTemplate(column)}
              sortable={serverSearched ? false : column.sort === undefined ? true : column.sort}
              style={{width: column.width || 'auto'}}
            />
          ) : null
        )}
        {props?.editMode === 'row' && (
          <Column
            rowEditor
            headerStyle={{width: '10%', minWidth: '8rem'}}
            bodyStyle={{textAlign: 'center'}}
          />
        )}
      </DataTable>
    </div>
  )
}
