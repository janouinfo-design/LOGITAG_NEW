import {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  closeFacture,
  closeMultipleFacture,
  fetchDetailFacture,
  fetchFactureList,
  getFactureList,
  getLoadingPdfRows,
  setLoadingPdfRows,
  setVisibleDetailFac,
} from '../slice/factureListSlice'
import {Dropdown} from 'primereact/dropdown'
import {fetchCustomers, getCustomers} from '../../../store/slices/customer.slice'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import moment from 'moment'
import {generateCrtPdfFac, getStatClient} from '../../Facturation/slice/elementFacturable.slice'
import {Chip} from 'primereact/chip'
import {FilterMatchMode} from 'primereact/api'
import {
  fetchCustomersFac,
  getClientFac,
  getSelectedClientGl,
  setSelectedClientGl,
} from '../../Facturation/slice/facturation.slice'
import {useFormik} from 'formik'
import {Calendar} from 'primereact/calendar'
import {Button} from 'primereact/button'
import HeaderChoose from '../../ui/HeaderChoose'
import {setSelectedFrGlobal} from '../../FacturationFornisseur/slice/factureFornisseur.slice'
import {Divider} from 'primereact/divider'
import {setAlertParams} from '../../../store/slices/alert.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const FacturesList = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState([])

  const calenderCreaRef = useRef(null)
  const calendarOrderRef = useRef(null)

  const loadingPdfRows = useAppSelector(getLoadingPdfRows)
  const customers = useAppSelector(getClientFac)
  const factureList = useAppSelector(getFactureList)
  const selectedClientGbl = useAppSelector(getSelectedClientGl)
  const statClient = useAppSelector(getStatClient)


  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data.id)).then(({payload}) => {
          if (payload) {
            dispatch(setVisibleDetailFac(true))
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
        // let obj = {
        //   id: e.item.data.id,
        //   client: selectedCustomer,
        // }
        // dispatch(closeFacture(obj)).then(({payload}) => {
        //   if (payload) {
        //     fetchListFacture()
        //   }
        // })
        dispatch(
          setAlertParams({
            visible: true,
            message: 'Etes-vous sur de vouloir cloturer cette facture ?',
            confirm: () => {
              let obj = {
                id: e.item.data.id,
                client: selectedCustomer,
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

  const checkDateAndFormat = (data) => {
    if (data) {
      return moment(data).format('YYYY-MM-DD')
    }
    return ''
  }

  const formik = useFormik({
    initialValues: {
      creaDate: '',
      OrderDate: '',
    },
    onSubmit: (values) => {
      let data = {
        IDClient: selectedClientGbl,
        orderDateFrom: checkDateAndFormat(values?.OrderDate[0]),
        orderDateTo: checkDateAndFormat(values?.OrderDate[1]),
        creaDateFrom: checkDateAndFormat(values?.creaDate[0]),
        creaDateTo: checkDateAndFormat(values?.creaDate[1]),
      }

      setLoadingSearchCustomer(true)
      dispatch(fetchFactureList(data)).then(() => {
        setLoadingSearchCustomer(false)
      })
    },
  })

  const onClickPdfCrt = async (rowData) => {
    dispatch(setLoadingPdfRows([rowData?.id]))
    let obj = {
      id: rowData?.id,
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
        loading={loadingPdfRows?.includes(rowData?.id)}
        disabled={loadingPdfRows?.length > 0}
        onClick={() => onClickPdfCrt(rowData)}
      />
    )
  }

  const clearFilters = () => {
    formik.resetForm()
    fetchListFacture()
  }

  let statusOptions = [
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

  const searchCalendar = () => {
    formik.submitForm()
  }

  const clearDate = (name) => {
    // setLoadingSearchCustomer(true)
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

  const columns = [
    {field: 'reference', header: 'Reference', olang: 'Reference', filter: true},
    {
      field: 'creaDate',
      header: 'creaDate',
      olang: 'creaDate',
      // body: displayDate,
      body: (rowData) => <Chip label={rowData?.creaDate} />,
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterCrea,
    },
    {
      header: 'OrderDate',
      field: 'OrderDate',
      olang: 'OrderDate',
      body: (rowData) => <Chip label={rowData?.OrderDate} />,
      filterElement: dateFilterOrder,
      filter: true,
      showFilterMenu: false,
    },
    {field: 'description', header: 'description', olang: 'description'},

    {
      field: 'labelstatus',
      header: 'Status',
      olang: 'Status',
      body: (rowData) => (
        <Chip
          style={{background: `${rowData['backgroundColor']}`, color: 'white'}}
          icon={rowData['icon']}
          label={rowData['labelstatus']}
        />
      ),
      filterElement: filterElementTemplate,
      filter: true,
      showFilterMenu: false,
      filterMatchMode: FilterMatchMode.EQUALS,
    },
    {field: 'remarque', header: 'remarque', olang: 'remarque'},
    // {field: 'Pdf', header: 'Pdf', body: displayPdf},
  ]

  const handleSelection = (selectedInv) => {
    setSelectedInvoice(selectedInv)
  }

  const onChangeDropdown = (value) => {
    dispatch(setSelectedClientGl(value))
  }

  const fetchListFacture = async () => {
    setLoadingSearchCustomer(true)
    await dispatch(fetchFactureList({IDClient: selectedClientGbl}))
    setLoadingSearchCustomer(false)
  }

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

  useEffect(() => {
    setSelectedInvoice([])
    dispatch(fetchCustomersFac())
    if (selectedClientGbl) {
      fetchListFacture()
    }
  }, [])


  return (
    <>
      <HeaderChoose
        title='Factures'
        selectedValue={selectedClientGbl}
        items={customers}
        loadingBtn={loadingSearchCustomer}
        onSearch={fetchListFacture}
        optionLabel={'Nom'}
        optionValue={'ClientID'}
        onChangeDropdown={onChangeDropdown}
        showDetail={true}
        openFacValue={statClient?.[0]?.totalInvoices}
        cAffireValue={statClient?.[0]?.caFacture}
        prestValue={statClient?.[0]?.totalServices}
      />
      <Divider className='my-3' />
      <DatatableComponent
        //exportFields={exportFields}
        tableId='factureList-table'
        data={factureList}
        columns={columns}
        onSelections={handleSelection}
        selectedDataTb={selectedInvoice}
        rowActions={actions}
        minWithRow='15rem'
        //rowGroupTemplates={rowGroupTemplates}
        //contextMenuModel={actions}
        isDataSelectable={false}
        selectionRowsProps={true}
        onlyBtnExport={true}
        // rowActions={actions}
        extraHeader={extraHeader}
        filterFunc={clearFilters}
      />
    </>
  )
}

export default FacturesList
