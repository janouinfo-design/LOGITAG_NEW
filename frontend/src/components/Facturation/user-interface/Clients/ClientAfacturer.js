import {useEffect, useRef, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getInvoicePendingBilling,
  fetchInvoicePendingBilling,
  getSelectedInvoices,
  setSelectedInvoices,
  getFactureId,
  setFactureId,
  setShowCreateFac,
  calculInvoice,
  getStatClient,
  setInvoicePendingBilling,
} from '../../slice/elementFacturable.slice'
import ButtonComponent from '../../../shared/ButtonComponent'
import {DialogComponent} from '../../../shared/DialogComponent'
import {Dropdown} from 'primereact/dropdown'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import {InputNumber} from 'primereact/inputnumber'
import {Button} from 'primereact/button'
import CreateFacture from '../CreateFacture/CreateFacture'
import {FilterMatchMode, FilterOperator} from 'primereact/api'
import {getSelectedClientFc, setSelectedClientFc} from '../../slice/facture.slice'
import moment from 'moment'
import {Calendar} from 'primereact/calendar'
import {AutoComplete} from 'primereact/autocomplete'
import {
  facturedDropDownAuto,
  fetchCustomersFac,
  fetchEtat,
  getClientFac,
  getDropClient,
  getIntervalFile,
  getPercentageFileVar,
  getPercentFile,
  getSelectedClientGl,
  setIntervalFile,
  setPercentageFile,
  setSelectedClientGl,
  updateMultiPrice,
  updateServicePrice,
  updateServicePriceCou,
  updateServiceStatus,
} from '../../slice/facturation.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'
import {useLocation} from 'react-router-dom'
import {Chip} from 'primereact/chip'
import {ProgressBar} from 'primereact/progressbar'
import * as _ from 'lodash'
import {Dialog} from 'primereact/dialog'
import EditStatus from './EditStatus'
import {fetchHistoryFormule, getFormulHistory} from '../../../FacturesList/slice/factureListSlice'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {SplitButton} from 'primereact/splitbutton'
import {Card, CardContent, CardHeader, CardTitle} from '../../../ui/Card'
import {ProgressSpinner} from 'primereact/progressspinner'
import {confirmDialog, ConfirmDialog} from 'primereact/confirmdialog'
import {Divider} from 'primereact/divider'
import {uploadFileCsv} from '../../../../cors/utils/FileUplaodCsv/fileUplaodCsv'
import CardStatus from '../../../ui/CardStatus'
import {InputText} from 'primereact/inputtext'
import {InputTextarea} from 'primereact/inputtextarea'

const ClientAfacturer = () => {
  const [visible, setVisible] = useState(false)

  const [visibleInput, setVisibleInput] = useState(false)
  // const [factureId, setFactureId] = useState(null)

  const [loadingCreateFct, setLoadingCreateFct] = useState(false)
  const [filters, setFilters] = useState(null)
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const dispatch = useAppDispatch()
  const [isSaved, setIsSaved] = useState(false)
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [selectedFacDropdown, setSelectedFacDropdown] = useState(null)
  const [showPriceEdit, setShowPriceEdit] = useState(false)
  const [multiPrice, setMultiPrice] = useState(0)
  const [editStatus, setEditStatus] = useState(false)
  const [loadingSt, setLoadingSt] = useState(false)
  const [loadingMultiPrice, setLoadingMultiPrice] = useState(false)
  const [histoFormuleVisible, setHistoFormuleVisible] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [loadingFile, setLoadingFile] = useState(false)
  const [fileData, setFileData] = useState(null)
  const [loadingHisto, setLoadingHisto] = useState(false)
  const [srcHisto, setSrcHisto] = useState(null)
  const [fileNewVisible, setFileNewVisible] = useState(false)

  const calendarRefOtd = useRef(null)
  const calendarRefService = useRef(null)
  const calendarRef = useRef(null)
  const selectedRowRef = useRef(null)
  const selectedColRef = useRef(null)
  const selectedGenerateRef = useRef(null)
  const intervalFile = useRef(null)
  const withFile = useRef(null)

  const selectedInvoices = useAppSelector(getSelectedInvoices)
  const factureId = useAppSelector(getFactureId)
  const elementFacturable = useAppSelector(getInvoicePendingBilling)
  const customers = useAppSelector(getClientFac)
  const selectedCustomer = useAppSelector(getSelectedClientFc)
  const dropFactClient = useAppSelector(getDropClient)
  const statClient = useAppSelector(getStatClient)
  const selectedClientGbl = useAppSelector(getSelectedClientGl)
  const historyFormule = useAppSelector(getFormulHistory)
  const dataPercentage = useAppSelector(getPercentageFileVar)
  const intervalGet = useAppSelector(getIntervalFile)
  const location = useLocation()

  const toast = useRef(null)

  const emptyData = [
    {
      OTID: '',
      OTDateLivraison: '',
      OTDateAcquitement: null,
      DDO1: '',
      OTDESTNP: '',
      'N° de BL (ou dossier)': '',
      CLIENT: '',
      Magasin: '',
      VMM: 0,
      OTEtat: '',
      Ville: '',
      Prix: 0,
      Produit: '',
      RefCmdClient: '',
      servicestatutDate: '',
      OTNoBL: '',
      serviceId: '',
    },
  ]

  const formik = useFormik({
    initialValues: {
      OTDateLivraison: '',
      servicestatutDate: '',
    },
    onSubmit: (values) => {
      setLoadingSearchCustomer(true)
      let data = {
        ID: selectedClientGbl,
        deliveryDateFrom: values?.OTDateLivraison[0]
          ? moment(values?.OTDateLivraison[0]).format('YYYY-MM-DD')
          : null,
        deliveryDateTo: values?.OTDateLivraison[1]
          ? moment(values?.OTDateLivraison[1]).format('YYYY-MM-DD')
          : null,
        serviceDateFrom: values?.servicestatutDate[0]
          ? moment(values?.servicestatutDate[0]).format('YYYY-MM-DD')
          : null,
        serviceDateTo: values?.servicestatutDate[1]
          ? moment(values?.servicestatutDate[1]).format('YYYY-MM-DD')
          : null,
      }
      dispatch(fetchInvoicePendingBilling(data)).then(() => {
        setLoadingSearchCustomer(false)
      })
    },
  })

  const formikFile = useFormik({
    initialValues: {
      reference: '',
      desc: '',
      date: new Date(),
    },
    onSubmit: (values) => {
      let data = {
        desc: values?.desc,
        destination: 'Import/uploads',
        name: fileData.name,
        orderId: selectedFacDropdown?.id || 0,
        orderDate: moment(values?.date).format('YYYY-MM-DD'),
        file: fileData,
      }
      saveFile(data)
    },
  })

  const onHide = () => {
    setVisible(false)
  }
  const onHideInput = () => {
    setVisibleInput(false)
    setSelectedFacDropdown(null)
  }
  const handleChange = (e) => {
    const findCustomer = customers?.find((customer) => customer.ClientID == e.target.value)
    dispatch(
      setSelectedClientFc({
        value: e.target.value,
        label: findCustomer.Nom,
        code: findCustomer.CodeClient,
      })
    )
  }

  const saveFile = async (obj) => {
    setLoadingFile(true)
    let data = {
      desc: 'Imported Service',
      destination: 'Import/uploads',
      name: fileData.name,
      orderId: selectedFacDropdown?.id || 0,
      orderDate: '2025-03-03',
      file: fileData,
    }
    if (obj) data = obj
    // return
    let response = await uploadFileCsv(data)
    setLoadingFile(false)
    setVisible(false)
    setFileNewVisible(false)
    setVisibleInput(false)
    withFile.current = null
    let id = response?.data?.result?.[0]?.orderId
    let inter = setInterval(async () => {
      await dispatch(getPercentFile({orderId: id}))
    }, 5000)
    dispatch(setIntervalFile(inter))

    setLoadingFile(false)
  }

  const handleSaveFacture = async () => {
    try {
      if (fileData && !withFile.current) {
        setFileNewVisible(true)
        return
      }
      if (fileData && withFile.current) {
        saveFile()
        return
      }
      setLoadingCreateFct(true)
      let parcData = JSON.parse(selectedFacDropdown?.detailInvoice || '[]')
      if (!Array.isArray(parcData) && parcData.length === 0) return
      const modifiedArray = parcData.map((obj) => {
        const {d, ...rest} = obj
        return rest
      })
      let mergeData = selectedInvoices?.concat(modifiedArray)
      await dispatch(calculInvoice(mergeData))
      dispatch(setShowCreateFac(true))
      setVisibleInput(false)
      setLoadingCreateFct(false)
      setVisible(false)
      setSelectedFacDropdown(null)
    } catch (error) {
      setLoadingCreateFct(false)
      console.error('There was an error!', error)
      setSelectedFacDropdown(null)
    }
  }

  const handleFilter = () => {
    formik.resetForm()
    handleSearch()
  }

  const handleCancel = () => {
    setFactureId(null)
    setVisibleInput(false)
    withFile.current = false
    setFileData(null)
  }

  const goLink = (id) => {
    let link = 'http://tricolis.duperrex.ch/tricolis/Ajout/AfficherOTPlus/' + id
    window.open(link, '_blank')
  }

  const initFilters = () => {
    setFilters({
      OTNoBL: {
        operator: FilterOperator.AND,
        constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
      },
      'country.name': {
        operator: FilterOperator.AND,
        constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
      },
      representative: {value: null, matchMode: FilterMatchMode.IN},
      date: {
        operator: FilterOperator.AND,
        constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}],
      },
      balance: {
        operator: FilterOperator.AND,
        constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
      },
      status: {
        operator: FilterOperator.OR,
        constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
      },
      activity: {value: null, matchMode: FilterMatchMode.BETWEEN},
      verified: {value: null, matchMode: FilterMatchMode.EQUALS},
    })
    setGlobalFilterValue('')
  }

  const dateTemplate = (date) => {
    if (date) {
      return moment(date).format('DD/MM/YYYY')
    }
    return '______'
  }

  const searchCalendar = () => {
    formik.submitForm()
  }

  const clearDate = (name) => {
    formik.setFieldValue(name, '')
    handleSearch()
  }
  const formatPercentageColor = (percentage) => {
    if (percentage > 20 && percentage < 50) {
      return '#ffba08'
    }
    if (percentage > 50 && percentage < 90) {
      return '#ffb703'
    }
    if (percentage > 90) {
      return '#9ef01a'
    }
    return '#ad2e24'
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
  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        ref={calendarRefOtd}
        name={options.field}
        showIcon
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        dateFormat='dd/mm/yy'
        placeholder='mm/dd/yyyy'
        selectionMode='range'
        footerTemplate={() => footerCalendar(calendarRefOtd.current)}
      />
    )
  }
  const dateFilterTemplateSer = (options) => {
    return (
      <Calendar
        ref={calendarRefService}
        name={options.field}
        showIcon
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        dateFormat='dd/mm/yy'
        placeholder='mm/dd/yyyy'
        selectionMode='range'
        footerTemplate={() => footerCalendar(calendarRefService.current)}
      />
    )
  }
  const onChangePrice = (index, value, name) => {
    let data = _.cloneDeep(elementFacturable)

    if (data[index][name] === value) return
    data[index][name] = value
    dispatch(setInvoicePendingBilling(data))
    handleSearch()
  }

  const priceEditor = (options) => {
    return (
      <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />
    )
  }

  const onEditSt = (rowData) => {
    selectedRowRef.current = rowData
    setEditStatus(true)
  }

  const onSaveSt = (values) => {
    setLoadingSt(true)
    let obj = {
      id: selectedRowRef.current.serviceId,
      statut: values?.Etat,
      reasonText: values?.reasonText,
      reasonCode: values?.reasonCode,
      date: moment(values?.date).format('YYYY-MM-DD HH:mm:ss'),
    }
    dispatch(updateServiceStatus(obj)).then(({payload}) => {
      if (payload) {
        handleSearch()
        onHideSt()
        setLoadingSt(false)
      }
    })
  }

  const onHideSt = () => {
    setEditStatus(false)
  }

  const otEtatTemplate = (rowData) => {
    return (
      <div className='flex flex-row justify-content-between align-items-center'>
        <Chip label={rowData?.EtatLabel} />
        <Button
          rounded
          size='small'
          className='p-button-sm'
          icon='fas fa-solid fa-pencil'
          severity='warning'
          onClick={() => onEditSt(rowData)}
        />
      </div>
    )
  }

  const onChangeClient = (value) => {
    if (value) {
      const findClient = customers?.find((client) => client.ClientID == value)
      setSelectedLabel(findClient.Nom)
    }
    dispatch(setSelectedClientGl(value))
  }

  const getHistoryPrice = (rowData, srcObject) => {
    setLoadingHisto(true)
    selectedColRef.current = rowData?.serviceId
    let obj = {
      ID: rowData?.serviceId,
      srcObject: srcObject || 'update_price',
    }
    setSrcHisto(srcObject || 'update_price')
    dispatch(fetchHistoryFormule(obj)).then(({payload}) => {
      if (payload) {
        setLoadingHisto(false)
        setHistoFormuleVisible(true)
        return
      }
      dispatch(
        setToastParams({
          show: true,
          severity: 'info',
          summary: 'Info',
          detail: 'Historique non trouvée',
          position: 'top-right',
        })
      )
      setLoadingHisto(false)
    })
  }

  const paramsTemplate = (rowData) => {
    return (
      // <SplitButton
      //   icon='pi pi-cog'
      //   model={actions.map((action) => ({...action, data: rowData}))}
      //   severity='secondary'
      //   menuButtonProps={{
      //     icon: 'pi pi-chevron-down',
      //     className:
      //       'border-0  border-circle bg-gray-100 hover:bg-gray-300 text-gray-600 hover:text-gray-800',
      //   }}
      //   rounded
      //   buttonClassName='hidden'
      //   // onClick={() => splitAction(rowData)}
      // />
      <Button
        rounded
        size='small'
        className='p-button-sm bg-transparent border-0 text-gray-600 hover:bg-gray-300'
        icon='fas fa-light fa-up-right-from-square text-blue-500'
        onClick={() => goLink(rowData?.OTID)}
      />
    )
  }
  const priceTemplate = (rowData) => {
    return (
      <div className='flex flex-row justify-content-between align-items-center'>
        <InputNumber inputClassName='border-blue-500' value={rowData?.Prix} disabled />
        <Button
          rounded
          size='small'
          className='p-button-sm bg-transparent border-0 text-gray-600 hover:bg-gray-300'
          icon='fas fa-regular fa-list-timeline'
          onClick={() => getHistoryPrice(rowData)}
        />
      </div>
    )
  }
  const priceCouTemplate = (rowData) => {
    return (
      <div className='flex flex-row justify-content-between align-items-center'>
        <InputNumber inputClassName='border-blue-500' value={rowData?.CoutPrestation} disabled />
        <Button
          rounded
          size='small'
          className='p-button-sm bg-transparent border-0 text-gray-600 hover:bg-gray-300'
          icon='fas fa-regular fa-list-timeline'
          onClick={() => getHistoryPrice(rowData, 'update_CoutPrestation')}
        />
      </div>
    )
  }

  const formikFilterElement = useFormik({
    initialValues: {
      OTNoBL: '',
      Produit: '',
      Prix: '',
      CoutPrestation: '',
      EtatLabel: '',
      DDO1: '',
      CLIENT: '',
      Ville: '',
      OTDESTNP: '',
      VMM: '',
      RefCmdClient: '',
      Magasin: '',
    },
    onSubmit: (values) => {
    },
  })

  const filterElementTxt = (options) => {
    return (
      <InputText
        name={options.field}
        type='text'
        value={options.value}
        onChange={(e) => {
          formikFilterElement.setFieldValue(options.field, e.target.value)
          options.filterApplyCallback(e.target.value)
        }}
      />
    )
  }
  const columns = [
    {
      field: 'Parametre',
      header: 'Parametre',
      olang: 'Parametre',
      body: paramsTemplate,
      width: '5rem',
    },
    {
      header: 'N° de BL (ou dossier)',
      field: 'OTNoBL',
      olang: 'N.de.BL',
      filter: true,
      filterElement: filterElementTxt,
    },
    // {
    //   header: 'Historique',
    //   field: 'Historique',
    //   olang: 'Historique',
    //   body: historyPriceTemplate,
    //   width: '5rem',
    // },
    {
      header: 'Produit',
      field: 'Produit',
      olang: 'Produit',
      filter: true,
      filterElement: filterElementTxt,
    },
    {
      header: 'Prix',
      field: 'Prix',
      olang: 'Prix',
      filter: true,
      body: priceTemplate,
      editor: priceEditor,
      onCellEditComplete: (props) => {
        if (props.newValue == props?.rowData?.Prix) return
        onChangePrice(props.rowIndex, props.newValue, 'Prix')
        let data = {
          ID: props.rowData.serviceId,
          Price: props.newValue,
        }
        dispatch(updateServicePrice(data))
      },
      filterElement: filterElementTxt,
    },
    {
      header: 'Prix.Coup',
      field: 'CoutPrestation',
      olang: 'Prix.Coup',
      filter: true,
      body: priceCouTemplate,
      editor: priceEditor,
      onCellEditComplete: (props) => {
        if (props.newValue == props?.rowData?.CoutPrestation) return
        onChangePrice(props.rowIndex, props.newValue, 'CoutPrestation')
        let data = {
          ID: props.rowData.serviceId,
          CoutPrestation: props.newValue,
        }
        dispatch(updateServicePriceCou(data))
      },
      filterElement: filterElementTxt,
    },
    {
      header: 'calculInf',
      field: 'calculInf',
      olang: 'calculInf',
    },
    {
      header: 'OTDateLivraison',
      field: 'OTDateLivraison',
      olang: 'OTDateLivraison',
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterTemplate,
      body: (rowData) => (
        <Chip
          icon='pi pi-calendar text-blue-500'
          label={moment(rowData?.OTDateLivraison).format('DD/MM/YYYY')}
        />
      ),
    },
    {
      header: 'servicestatutDate',
      field: 'servicestatutDate',
      olang: 'servicestatutDate',
      body: (rowData) =>
        rowData?.servicestatutDate ? (
          <Chip
            icon='pi pi-calendar text-blue-500'
            label={moment(rowData?.servicestatutDate).format('DD/MM/YYYY')}
          />
        ) : null,
      // filterElement: filterDateTemplate,
      filterElement: dateFilterTemplateSer,
      filter: true,
      showFilterMenu: false,
    },
    {
      header: 'EtatLabel',
      field: 'EtatLabel',
      olang: 'EtatLabel',
      filter: true,
      body: otEtatTemplate,
      filterElement: filterElementTxt,
    },
    {
      header: 'DDO1',
      olang: 'DDO1',
      field: 'DDO1',
      filter: true,
      filterElement: filterElementTxt,
    },
    {
      header: 'OTDateAcquitement',
      olang: 'OTDateAcquitement',
      field: 'OTDateAcquitement',
      body: (rowData) => <strong>{dateTemplate(rowData?.OTDateAcquitement)}</strong>,

      // filter: true,

      //body: activeTemplate,
    },
    {
      header: 'CLIENT',
      field: 'CLIENT',
      olang: 'CLIENT',
      filter: true,
      filterElement: filterElementTxt,
    },
    {
      header: 'Magasin',
      field: 'Magasin',
      olang: 'Magasin',
      filter: true,
      filterElement: filterElementTxt,
    },

    {
      header: 'Ville',
      field: 'Ville',
      olang: 'Ville',
      filter: true,
      filterElement: filterElementTxt,
    },
    {
      header: 'OTDESTNP',
      field: 'OTDESTNP',
      olang: 'OTDESTNP',
      filter: true,
      filterElement: filterElementTxt,
    },
    {
      header: 'VMM',
      field: 'VMM',
      olang: 'VMM',
      filter: true,
      filterElement: filterElementTxt,
    },

    {
      header: 'RefCmdClient',
      field: 'RefCmdClient',
      olang: 'RefCmdClient',
      filter: true,
      filterElement: filterElementTxt,
    },
  ]

  const columnsHistory = [
    {
      field: 'Date',
      header: 'Date',
      olang: 'date.price',
      body: (rowData) => moment(rowData?.Date).format('DD/MM/YYYY HH:mm'),
    },
    {
      field: 'user',
      header: 'user',
      olang: 'user',
      filter: true,
    },
    srcHisto == 'update_price'
      ? {
          field: 'formuleCalcule',
          header: 'formuleCalcule',
          olang: 'formuleCalcule',
        }
      : null,
    srcHisto == 'update_price'
      ? {field: 'Prix', header: 'Prix', olang: 'Prix'}
      : {field: 'CoutPrestation', header: 'CoutPrestation', olang: 'CoutPrestation'},
  ]

  let actions = [
    {
      label: 'Detail',
      icon: 'fas fa-light fa-up-right-from-square text-blue-500',
      command: (e) => {
        goLink(e.item.data.OTID)
      },
    },
  ]

  // let LineFacture = []
  const headear = (
    <div className='flex flex-row gap-2 '>
      <Button
        label='Edit'
        icon='fas fa-regular fa-pen-to-square'
        onClick={() => setShowPriceEdit(true)}
        className='rounded-lg font-normal bg-transparent text-gray-600 border-0 text-xl cursor-pointer hover:bg-gray-300'
        disabled={selectedInvoices?.length === 0}
      />
      <ButtonComponent
        label='Facturer'
        onClick={() => setVisible(true)}
        className='rounded-lg font-normal bg-transparent text-gray-600 border-0 text-xl cursor-pointer hover:bg-gray-300'
        icon='fas fa-regular fa-file-invoice'
        disabled={selectedInvoices?.length === 0 || !selectedClientGbl}
      />
    </div>
  )

  const footerFactureId = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent
          label='Annuler'
          className='border-none bg-transparent hover:bg-red-300 text-gray-600 hover:text-red-500'
          onClick={handleCancel}
          icon='pi pi-times'
        />
        <ButtonComponent
          className='border-none bg-transparent hover:bg-green-300 text-gray-600 hover:text-green-500'
          label='OK'
          disabled={!selectedFacDropdown}
          onClick={handleSaveFacture}
          icon='pi pi-check'
        />
      </div>
    )
  }

  const onSaveMultiPrice = () => {
    setLoadingMultiPrice(true)
    let data = {
      Services: selectedInvoices,
      Price: multiPrice,
    }
    dispatch(updateMultiPrice(data)).then(() => {
      setMultiPrice(0)
      dispatch(fetchInvoicePendingBilling({ID: selectedClientGbl}))
      handleSelection([])
      // const newData = selectedInvoices.map((sitem) => {
      //   return {...item, Prix: multiPrice}
      // })
      // const mergedData = [...selectedInvoices, ...newData]
      // dispatch(setInvoicePendingBilling(newData))
      setShowPriceEdit(false)
      setLoadingMultiPrice(false)
    })
  }

  const footerPrice = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent
          label='Annuler'
          severity='danger'
          onClick={() => setShowPriceEdit(false)}
        />
        <ButtonComponent
          label='OK'
          loading={loadingMultiPrice}
          disabled={loadingMultiPrice}
          onClick={onSaveMultiPrice}
        />
      </div>
    )
  }

  const handleSelection = (selectedInv) => {
    dispatch(setSelectedInvoices(selectedInv))
  }

  const handleSearch = () => {
    handleSelection([])
    setLoadingSearchCustomer(true)
    dispatch(setSelectedInvoices([]))
    dispatch(fetchInvoicePendingBilling({ID: selectedClientGbl})).then(() => {
      setLoadingSearchCustomer(false)
    })
  }

  const search = (e) => {
    let obj = {
      IDClient: selectedClientGbl,
      filttre: e.query,
    }
    dispatch(facturedDropDownAuto(obj))
  }

  const templateDropAuto = (e) => {
    return (
      <div className='flex flex-col bg-slate-100 p-3 border-1 border-gray-200 border-round-xl'>
        <div className='flex items-center flex-row gap-2'>
          <i className='fas fa-regular fa-file-invoice'></i>
          <strong>{e.reference}</strong>
        </div>
        <Divider />
        <div className='flex items-center flex-row justify-between'>
          <span>
            <p>Crea Date: </p>
            <strong>{e.creaDate}</strong>
          </span>
          <span>
            <p>Order Date: </p>
            <strong>{e.OrderDate}</strong>
          </span>
          <span>
            <p>Crea Date: </p>
            <strong>{e.creaDate}</strong>
          </span>
        </div>
      </div>
    )
  }

  const handleOnChangeFile = async (e) => {
    if (!e.target.files.length) return alert('Please select a file!')
    // setLoadingFile(true)
    const selectedFile = e.target.files[0]

    selectedGenerateRef.current = 'generateFile'
    setFileData(e.target.files[0])
    setVisible(true)
    // let response = await uploadFileCsv(data)
    // let id = response?.data?.result?.[0]?.orderId
    // intervalFile.current = setInterval(async () => {
    //   await dispatch(getPercentFile({orderId: id}))
    // }, 5000)

    // setLoadingFile(false)
  }

  const clearProgressBar = () => {
    clearInterval(intervalGet)
    setLoadingFile(false)
    setFileData(null)
    dispatch(setPercentageFile({}))
    formikFile.resetForm()
  }

  useEffect(() => {
    handleSelection([])
    initFilters()
    dispatch(fetchCustomersFac())
    dispatch(fetchEtat())
    if (selectedClientGbl) {
      const findClient = customers?.find((client) => client.ClientID == selectedClientGbl)
      setSelectedLabel(findClient.Nom)
      handleSearch()
    }
  }, [])

  // useEffect(() => {
  //   dispatch(fetchInvoicePendingBilling({ID: selectedCustomer?.id}))
  //   dispatch(fetchCustomers())
  // }, [isSaved])

  useEffect(() => {
    const handleBeforeLeave = () => {
      setVisible(false)
    }
    return () => {
      handleBeforeLeave()
    }
  }, [location])

  const debouncedSubmit = _.debounce(() => {
    formikFilterElement.handleSubmit()
  }, 300) // Adjust the delay as needed

  useEffect(() => {
    debouncedSubmit()
    // Cleanup debounce on unmount
    return () => {
      debouncedSubmit.cancel()
    }
  }, [formikFilterElement.values])

  useEffect(() => {
    if (+dataPercentage?.done >= 100) {
      clearInterval(intervalGet)
      // clearProgressBar()
    }
  }, [dataPercentage])

  return (
    <div>
      <Dialog
        header='Historique formule'
        onHide={() => setHistoFormuleVisible(false)}
        visible={histoFormuleVisible}
        style={{width: '50vw'}}
        modal={true}
      >
        <DatatableComponent
          tableId={'hsito-formule-client'}
          data={historyFormule || []}
          columns={columnsHistory}
        />
      </Dialog>
      <Dialog
        header='Creat Facture'
        onHide={() => {
          setLoadingFile(false)
          setFileNewVisible(false)
        }}
        visible={fileNewVisible}
        style={{width: '30vw'}}
        modal={true}
      >
        <div className='flex flex-col gap-2 items-center justify-center w-full'>
          <div style={{width: '90%'}} className='flex flex-col gap-1 w-full'>
            <label htmlFor='reference' className='font-bold block mb-2'>
              <OlangItem olang='reference' />
            </label>
            <InputText
              name='reference'
              value={formikFile.values.reference}
              onChange={formikFile.handleChange}
              className='w-full h-[3rem] rounded-xl'
              placeholder='reference'
            />
          </div>
          <div style={{width: '90%'}} className='flex flex-col gap-1 w-full'>
            <label htmlFor='description' className='font-bold block mb-2'>
              <OlangItem olang='description' />
            </label>
            <InputTextarea
              name='desc'
              value={formikFile.values.desc}
              onChange={formikFile.handleChange}
              className='w-full rounded-xl'
              placeholder='Description'
            />
          </div>
          <div style={{width: '90%'}} className='flex flex-col gap-1 w-full'>
            <label htmlFor='date' className='font-bold block mb-2'>
              <OlangItem olang='date' />
            </label>
            <Calendar
              className='w-full rounded-xl'
              name='date'
              placeholder='Date'
              value={formikFile.values.date}
              onChange={formikFile.handleChange}
              showIcon
            />
          </div>
          <Divider />
          <div style={{width: '90%'}}>
            <Button
              onClick={formikFile.submitForm}
              loading={loadingFile}
              disabled={loadingFile}
              icon='pi pi-plus'
              className='flex border-none bg-gray-100 items-center justify-center flex-row gap-2 w-full rounded-xl text-gray-800 hover:bg-gray-300'
            >
              <OlangItem olang='create' />
            </Button>
          </div>
        </div>
      </Dialog>
      <EditStatus loading={loadingSt} onHide={onHideSt} visible={editStatus} onSave={onSaveSt} />
      <Dialog
        header='Changer le prix'
        visible={showPriceEdit}
        onHide={() => setShowPriceEdit(false)}
        position='center'
        style={{width: '20vw'}}
        footer={footerPrice}
      >
        <div className='flex flex-column gap-2 justify-content-center align-items-center'>
          <div>
            <label htmlFor='price' className='font-bold block mb-2'>
              <OlangItem olang='price' />
            </label>
            <InputNumber
              value={multiPrice}
              onValueChange={(e) => setMultiPrice(e.value)}
              className='w-11'
              placeholder='Prix'
              useGrouping={false}
            />
          </div>
        </div>
      </Dialog>
      <div className='space-y-3'>
        <Card className='border-gray-300 h-[200px] border-2 drop-shadow-none rounded-3xl'>
          {/* <CardHeader>
            <CardTitle className='text-xl'>Client</CardTitle>
          </CardHeader> */}
          <div className='mt-4 ml-5'>
            <h1 className='text-2xl font-semibold text-gray-800'>
              <OlangItem olang='Client' />
            </h1>
          </div>
          <CardContent>
            <div className='flex gap-4'>
              <div className='flex flex-row items-end w-full gap-3'>
                <div style={{width: '40%'}}>
                  <Dropdown
                    placeholder='Selectionnez un client'
                    className='h-3rem flex-1 items-center w-full rounded-2xl'
                    value={selectedClientGbl}
                    filter
                    optionValue='ClientID'
                    optionLabel='Nom'
                    options={customers}
                    onChange={(e) => onChangeClient(e.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  />
                </div>

                {selectedLabel?.length > 0 &&
                  selectedLabel?.includes('01-') &&
                  (!dataPercentage?.waiting > 0 ? (
                    <div className='relative w-16rem '>
                      <input
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                        type='file'
                        id='csvFileInput'
                        accept='.csv'
                        onChange={handleOnChangeFile}
                        title='Select a CSV file'
                        disabled={loadingFile}
                      />
                      <label
                        htmlFor='csvFileInput'
                        className='flex flex-col items-center w-16rem h-[3rem] justify-center border-1 border-gray-400 rounded-2xl cursor-pointer hover:bg-gray-300'
                      >
                        <div className='flex flex-row items-center gap-3 justify-center'>
                          {loadingFile ? (
                            <i className='pi pi-spin pi-spinner text-xl text-gray-400 font-semibold'></i>
                          ) : (
                            <i className='pi pi-upload text-xl text-gray-400 font-semibold'></i>
                          )}
                          <OlangItem olang='Import' />
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div style={{width: '25%'}}>
                      <label className='font-bold block mb-2'>
                        <OlangItem olang='Import.encours' />
                      </label>
                      <div className='flex flex-row items-center gap-2'>
                        <ProgressBar
                          value={+dataPercentage?.done}
                          color={formatPercentageColor(dataPercentage?.done)}
                          className='text-gray-800'
                          style={{width: '100%'}}
                        ></ProgressBar>
                        <Button
                          onClick={clearProgressBar}
                          text
                          disabled={dataPercentage?.waiting > 0}
                          icon='fas fa-regular fa-circle-xmark text-xl text-gray-400'
                        />
                      </div>
                    </div>
                  ))}
                <ButtonComponent
                  onClick={() => handleSearch(selectedCustomer)}
                  text
                  icon='pi pi-search text-xl text-gray-800'
                  className='w-3rem'
                  loading={loadingSearchCustomer}
                  disabled={!selectedClientGbl || loadingSearchCustomer}
                />
              </div>
              <CardStatus
                icon={'fa-solid fa-file-invoice'}
                iconColor={'text-gray-400'}
                desc={'Factures.overt'}
                backgroundColor={'#fff4de'}
                value={statClient?.totalInvoices}
              />
              <CardStatus
                icon={'fa-solid fa-money-bill-trend-up'}
                iconColor={'text-green-600'}
                desc={'C.Affaire'}
                backgroundColor={'#c9f7f5'}
                value={statClient?.caFacture}
              />
              <CardStatus
                icon={'fa-light fa-receipt'}
                iconColor={'text-blue-600'}
                desc={'Prestations.overt'}
                backgroundColor={'#f8f9fa'}
                value={statClient?.totalServices}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='mt-4'>
        {!loadingSearchCustomer ? (
          <DatatableComponent
            //exportFields={exportFields}
            tableId='element-Afacture-client'
            data={elementFacturable}
            columns={columns}
            onSelections={handleSelection}
            // rowActions={actions}
            minWithRow='20rem'
            //rowGroupTemplates={rowGroupTemplates}
            // contextMenuModel={actions}
            isDataSelectable={false}
            selectionRowsProps={true}
            // rowActions={actions}
            extraHeader={headear}
            selectedDataTb={selectedInvoices}
            filterFunc={handleFilter}
            // dataKeyTb={'OTID'}
          />
        ) : (
          <div className='w-full flex justify-content-center'>
            <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth='4' />
          </div>
        )}
      </div>
      <CreateFacture selectedUser={selectedClientGbl} selectedFacture={selectedFacDropdown} />
      {/* <Dialog > 

      </Dialog> */}
      <Dialog
        header='Facturer les elements selectionné'
        visible={visible}
        onHide={onHide}
        style={{width: '30vw'}}
        position='center'
      >
        <p>
          Vous tes sur le point de facturer {selectedInvoices?.length} l ment(s) selectionn (s).
        </p>
        <Divider />
        <div className='flex flex-row w-full items-center justify-center gap-4 mt-4'>
          <ButtonComponent
            label='Créer une nouvelle facture'
            className='bg-transparent border-0 text-gray-600 hover:bg-gray-300 hover:text-gray-800'
            icon='fas fa-light fa-file-invoice'
            onClick={handleSaveFacture}
            loading={loadingCreateFct}
            // disabled={ selectedInvoices?.length === 0 || loadingCreateFct}
          />
          <ButtonComponent
            icon='fas fa-regular fa-file-arrow-down'
            className='bg-transparent border-0 text-gray-600 hover:bg-gray-300 hover:text-gray-800'
            label='Ajouter à une facture existante'
            onClick={() => {
              withFile.current = true
              setVisibleInput(true)
            }}
          />
        </div>
      </Dialog>
      <Dialog
        header='Entrer la reference de la facture'
        visible={visibleInput}
        onHide={onHideInput}
        style={{width: '30vw'}}
        footer={footerFactureId}
      >
        <div className='flex justify-content-center'>
          <AutoComplete
            inputStyle={{width: '100%'}}
            className='w-full'
            field='reference'
            value={selectedFacDropdown}
            suggestions={dropFactClient}
            completeMethod={search}
            itemTemplate={templateDropAuto}
            // selectedItemTemplate={templateDropAutoSelected}
            placeholder='Enter facture reference or description'
            onChange={(e) => {
              setSelectedFacDropdown(e.value)
            }}
          />
        </div>
      </Dialog>
    </div>
  )
}

export default ClientAfacturer
