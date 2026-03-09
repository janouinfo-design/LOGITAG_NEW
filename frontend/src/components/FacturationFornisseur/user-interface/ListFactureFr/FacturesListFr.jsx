import {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  closeFacture,
  closeMultipleFacture,
  fetchDetailFacture,
  getFactureList,
  getLoadingPdfRows,
  setLoadingPdfRows,
  setVisibleDetailFac,
} from '../../../FacturesList/slice/factureListSlice'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import moment from 'moment'
import {generateCrtPdfFac} from '../../../Facturation/slice/elementFacturable.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Chip} from 'primereact/chip'
import {
  fetchFactureListFr,
  fetchFacturePendingFr,
  fetchListFr,
  getFactureListFr,
  getFacturePendingFr,
  getListFr,
  getSelectedFrGlobal,
  getStatFr,
  setSelectedFrGlobal,
  setShowDetailFacFr,
} from '../../slice/factureFornisseur.slice'
import {Dropdown} from 'primereact/dropdown'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {FilterMatchMode} from 'primereact/api'
import {useFormik} from 'formik'
import {Calendar} from 'primereact/calendar'
import {Button} from 'primereact/button'
import HeaderChoose from '../../../ui/HeaderChoose'
import {Divider} from 'primereact/divider'
import {setAlertParams} from '../../../../store/slices/alert.slice'

const FacturesListFr = () => {
  const [selectedFr, setSelectedFr] = useState(null)
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState([])

  const loadingPdfRows = useAppSelector(getLoadingPdfRows)
  const customers = useAppSelector(getCustomers)
  const factureList = useAppSelector(getFactureListFr)
  const selectedFrGlobal = useAppSelector(getSelectedFrGlobal)
  const statFr = useAppSelector(getStatFr)

  const calenderCreaRef = useRef(null)
  const calendarOrderRef = useRef(null)

  const listFr = useAppSelector(getListFr)


  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data?.id)).then(({payload}) => {
          if (payload) {
            dispatch(setShowDetailFacFr(true))
          }
        })
      },
    },
    {
      label: 'PDF',
      icon: 'pi pi-file-pdf text-red-500',
      command: (e) => {
        onClickPdfCrt(e.item.data)
      },
    },
    {
      label: 'Cloture',
      icon: 'pi pi-check text-green-500',
      command: (e) => {
        //dispatch(setSelectedInvoice(e.item.data))
        //navigate('/detailsTest')
        dispatch(
          setAlertParams({
            visible: true,
            message: 'Etes-vous sur de vouloir cloturer cette facture ?',
            confirm: () => {
              let obj = {
                id: e.item.data.id,
                client: selectedFr,
              }
              dispatch(closeFacture(obj)).then(({payload}) => {
                if (payload) {
                  fetchListFacture()
                  dispatch(setAlertParams({visible: false}))
                }
              })
            },
            reject: () => {
              dispatch(setAlertParams({visible: false}))
            },
          })
        )
      },
    },
  ]

  const formik = useFormik({
    initialValues: {
      creaDate: '',
      OrderDate: '',
    },
    onSubmit: (values) => {
      let data = {
        ID: selectedFrGlobal,
        orderDateFrom: moment(values?.OrderDate[0]).format('YYYY-MM-DD'),
        orderDateTo: moment(values?.OrderDate[1]).format('YYYY-MM-DD'),
        creaDateFrom: moment(values?.creaDate[0]).format('YYYY-MM-DD'),
        creaDateTo: moment(values?.creaDate[1]).format('YYYY-MM-DD'),
      }
      setLoadingSearchCustomer(true)
      dispatch(fetchFactureListFr(data)).then(() => {
        setLoadingSearchCustomer(false)
      })
    },
  })

  const onClickPdfCrt = async (rowData) => {
    dispatch(setLoadingPdfRows([rowData['id']]))
    let obj = {
      id: rowData['id'],
      src: 'invoice',
      fileType: 'pdf',
    }
    const {payload} = await dispatch(generateCrtPdfFac(obj))
  }

  const displayPdf = (rowData) => {
    return (
      <ButtonComponent
        label='PDF'
        icon='pi pi-file-pdf'
        className='p-button-danger p-button-sm rounded-3xl'
        loading={loadingPdfRows?.includes(rowData['id'])}
        disabled={loadingPdfRows?.length > 0}
        onClick={() => onClickPdfCrt(rowData)}
      />
    )
  }

  const clearFilters = () => {
    formik.resetForm()
    fetchListFacture()
  }

  const statusOptions = [
    {
      label: 'Valider',
      value: 'Valider',
      icon: 'pi pi-check text-white',
      backgroundColor: '#22c55e',
    },
    {
      label: 'Non Valider',
      value: 'Non Valider',
      icon: 'pi pi-times text-white',
      backgroundColor: '#ef4444',
    },
  ]

  const statusItemTemplate = (option) => {
    return (
      <Chip
        style={{background: option?.backgroundColor, color: 'white'}}
        icon={option.icon}
        label={option.label}
      />
    )
  }

  const filterElementTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statusOptions}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder='Select One'
        className='p-column-filter'
        showClear
        itemTemplate={statusItemTemplate}
        style={{minWidth: '12rem'}}
      />
    )
  }
  const displayDate = (date) => {
    return <Chip icon='pi pi-calendar' label={date} />
  }

  const searchCalendar = () => {
    formik.submitForm()
  }

  const clearDate = (name) => {
    formik.setFieldValue(name, '')
    fetchListFacture()
  }

  const footerCalendar = (calendarInstance) => {
    return (
      <div className='flex justify-content-between'>
        <Button
          label='Clear'
          severity='danger'
          onClick={() => {
            calendarInstance.hide()
            clearDate(calendarInstance.props.name)
          }}
        />
        <Button
          label='OK'
          severity='success'
          onClick={() => {
            calendarInstance.hide()
            searchCalendar()
          }}
        />
      </div>
    )
  }

  const dateFilterCrea = (options) => {
    return (
      <Calendar
        name={options.field}
        ref={calenderCreaRef}
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        placeholder='mm/dd/yyyy'
        dateFormat='mm/dd/yy'
        selectionMode='range'
        mask='99/99/9999'
        showIcon
        footerTemplate={() => footerCalendar(calenderCreaRef.current)}
      />
    )
  }

  const dateFilterOrder = (options) => {
    return (
      <Calendar
        name={options.field}
        ref={calendarOrderRef}
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        placeholder='mm/dd/yyyy'
        dateFormat='mm/dd/yy'
        selectionMode='range'
        mask='99/99/9999'
        showIcon
        footerTemplate={() => footerCalendar(calendarOrderRef.current)}
      />
    )
  }

  const onChangeDropdown = (value) => {
    dispatch(setSelectedFrGlobal(value))
  }

  const columns = [
    {field: 'reference', header: 'reference', olang: 'reference', filter: true},
    {
      field: 'creaDate',
      header: 'creaDate',
      olang: 'creaDate',
      body: (rowData) => displayDate(rowData?.creaDate),
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterCrea,
    },
    {
      field: 'OrderDate',
      header: 'OrderDate',
      olang: 'OrderDate',
      body: (rowData) => displayDate(rowData?.OrderDate),
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterOrder,
    },
    {
      field: 'labelstatus',
      header: 'Status',
      olang: 'Status',
      body: (rowData) => (
        <Chip
          style={{background: `${rowData?.backgroundColor || ''}`, color: 'white'}}
          icon={rowData?.icon || ''}
          label={rowData?.labelstatus || ''}
        />
      ),
      filterElement: filterElementTemplate,
      filter: true,
      showFilterMenu: false,
      filterMatchMode: FilterMatchMode.EQUALS,
    },
    {
      field: 'remarque',
      header: 'remarque',
      olang: 'remarque',
      body: (rowData) => <p>{rowData?.remarque || ''}</p>,
    },
    // {field: 'Pdf', header: 'Pdf', body: displayPdf},
  ]

  const multipleClose = () => {
    let ids = selectedInvoice?.map((item) => item.id).join('|')
    dispatch(
      setAlertParams({
        visible: true,
        message: 'Etes-vous sure de vouloir cloturer ces factures ?',
        confirm: () => {
          let obj = {
            ids: ids,
          }
          dispatch(closeMultipleFacture(obj)).then(({payload}) => {
            if (payload) {
              fetchListFacture()
              dispatch(setAlertParams({visible: false}))
            }
          })
        },
        reject: () => {
          dispatch(setAlertParams({visible: false}))
        },
      })
    )
  }

  const handleSelection = (selectedInv) => {
    setSelectedInvoice(selectedInv)
  }

  const extraHeader = (
    <Button
      disabled={selectedInvoice?.length === 0}
      icon='pi pi-check'
      rounded
      onClick={multipleClose}
      className='p-button-sm font-semibold text-gray-800 flex flex-row items-center gap-2 bg-transparent border-1 border-green-400 hover:text-green-400'
    >
      <OlangItem olang='Cloturer.All' />
    </Button>
  )

  const fetchListFacture = async () => {
    setLoadingSearchCustomer(true)
    await dispatch(fetchFactureListFr({IDProvider: selectedFrGlobal}))
    setLoadingSearchCustomer(false)
  }

  useEffect(() => {
    dispatch(fetchListFr())
    if (!selectedFrGlobal) return
    fetchListFacture()
  }, [])

  return (
    <>
      {false && (
        <div className='card bg-gray-100 mt-5'>
          <div className='text-xl text-gray-800 pl-4 py-2'>
            <OlangItem olang='list.fornisseur' />
          </div>
          <div className='flex pl-3 pb-3'>
            <Dropdown
              placeholder='selectionner un fournisseur'
              className=' h-3rem w-3'
              value={selectedFrGlobal}
              filter
              optionValue='id'
              optionLabel='name'
              options={listFr}
              onChange={(e) => dispatch(setSelectedFrGlobal(e.value))}
            />

            <ButtonComponent
              onClick={fetchListFacture}
              icon='pi pi-search'
              className='ml-3 h-3rem'
              loading={loadingSearchCustomer}
              disabled={!selectedFrGlobal || loadingSearchCustomer}
            />
          </div>
        </div>
      )}
      <HeaderChoose
        optionValue='id'
        optionLabel='name'
        title='Facture.List'
        items={listFr}
        selectedValue={selectedFrGlobal}
        loadingBtn={loadingSearchCustomer}
        onChangeDropdown={onChangeDropdown}
        onSearch={fetchListFacture}
        showDetail={true}
        cAffireValue={statFr?.caFacture}
        openFacValue={statFr?.invoiceAcloturer}
        prestValue={statFr?.totalServices}
      />
      <Divider className='my-4' />
      <DatatableComponent
        //exportFields={exportFields}
        tableId='factureList-table'
        data={factureList}
        columns={columns}
        // onSelections={handleSelection}
        rowActions={actions}
        minWithRow='15rem'
        //rowGroupTemplates={rowGroupTemplates}
        //contextMenuModel={actions}
        onSelections={handleSelection}
        selectedDataTb={selectedInvoice}
        isDataSelectable={false}
        selectionRowsProps={true}
        // rowActions={actions}
        // extraHeader={headear}
        onlyBtnExport={true}
        filterFunc={clearFilters}
        extraHeader={extraHeader}
      />
    </>
  )
}

export default FacturesListFr
