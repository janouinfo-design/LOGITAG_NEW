import moment from 'moment'
import {useEffect, useRef, useState} from 'react'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import * as _ from 'lodash'
import {
  facturedDropDownAutoFr,
  fetchFactureListFr,
  fetchFacturePendingFr,
  fetchListFr,
  getDropAutoFr,
  getFactureListFr,
  getFacturePendingFr,
  getListFr,
  getSelectedFrGlobal,
  getSelectedInvoicesFr,
  getStatFr,
  setFacPendingFr,
  setSelectedFrGlobal,
  setSelectedInvoicesFr,
  setShowDetailFacFr,
} from '../../slice/factureFornisseur.slice'
import {
  calculInvoice,
  getSelectedFactureCalc,
} from '../../../Facturation/slice/elementFacturable.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Dropdown} from 'primereact/dropdown'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {Calendar} from 'primereact/calendar'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {invoiceSave} from '../../../Facturation/slice/facture.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Chip} from 'primereact/chip'
import {
  facturedDropDownAuto,
  getDropClient,
  updateMultiPrice,
  updateServicePrice,
} from '../../../Facturation/slice/facturation.slice'
import {AutoComplete} from 'primereact/autocomplete'
import {useLocation, useNavigate} from 'react-router-dom'
import {ProgressBar} from 'primereact/progressbar'
import {useFormik} from 'formik'
import {Button} from 'primereact/button'
import {InputNumber} from 'primereact/inputnumber'
import ChangeMultiPrix from './ChangeMultiPrix'
import HeaderChoose from '../../../ui/HeaderChoose'
import {Divider} from 'primereact/divider'
import {ProgressSpinner} from 'primereact/progressspinner'
import {uploadFileFr} from '../../../../cors/utils/FileUplaodCsv/fileUplaodCsv'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {Dialog} from 'primereact/dialog'
import {
  fetchDetailFacture,
  fetchHistoryFormule,
  getFormulHistory,
} from '../../../FacturesList/slice/factureListSlice'
import CreateFacture from '../../../Facturation/user-interface/CreateFacture/CreateFacture'

const FornesseurAFacurer = () => {
  const [visible, setVisible] = useState(false)
  const [visibleCreateFac, setVisibleCreateFac] = useState(false)
  const [visibleInput, setVisibleInput] = useState(false)
  const [loadingCreateFct, setLoadingCreateFct] = useState(false)
  const [isTableEmpty, setIsTableEmpty] = useState(true)
  const [idFacture, setIdFacture] = useState(null)
  const [visibleUpdateFactureBtn, setVisibleUpdateFactureBtn] = useState(true)
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [histoFormuleVisible, setHistoFormuleVisible] = useState(false)
  const [selectedFacDropdown, setSelectedFacDropdown] = useState(null)
  const [changesRender, setChangesRender] = useState(1)
  const [visibleMultiPrix, setVisibleMultiPrix] = useState(false)
  const [loadingMultiPrice, setLoadingMultiPrice] = useState(false)
  const [fileSelected, setFileSelected] = useState(null)
  const [srcHisto, setSrcHisto] = useState(null)

  const dispatch = useAppDispatch()
  const location = useLocation()

  const filtersRef = useRef({
    OTDateLivraison: {value: ''},
    OTNoFacture: {value: ''},
    OTDate: {value: ''},
    OTDateFacture: {value: ''},
    OTDateFactureFin: {value: ''},
  })

  const activeComponentRef = useRef(null)
  const calendarRefOtd = useRef(null)
  const calendarRefService = useRef(null)
  const selectedColRef = useRef(null)

  const selectedInvoices = useAppSelector(getSelectedInvoicesFr)
  const elementFacturable = useAppSelector(getFacturePendingFr)
  const customers = useAppSelector(getCustomers)
  const listFr = useAppSelector(getListFr)
  const selectedFactCalc = useAppSelector(getSelectedFactureCalc)
  const dropFactFR = useAppSelector(getDropAutoFr)
  const statFr = useAppSelector(getStatFr)
  const selectedFrGlobal = useAppSelector(getSelectedFrGlobal)
  const historyFormule = useAppSelector(getFormulHistory)

  let navigate = useNavigate()


  const formik = useFormik({
    initialValues: {
      OTDatelivDemande: '',
      servicestatutDate: '',
    },
    onSubmit: (values) => {
      let data = {
        IDProvider: selectedFrGlobal,
        deliveryDateFrom: moment(values?.OTDatelivDemande[0]).format('YYYY-MM-DD'),
        deliveryDateTo: moment(values?.OTDatelivDemande[1]).format('YYYY-MM-DD'),
        serviceDateFrom: moment(values?.servicestatutDate[0]).format('YYYY-MM-DD'),
        serviceDateTo: moment(values?.servicestatutDate[1]).format('YYYY-MM-DD'),
      }
      // dispatch(fetchInvoicePendingBilling(data)).then(() => {})
    },
  })

  const onHide = () => {
    setVisible(false)
  }
  const handleSaveFacture = async () => {
    try {
      setLoadingCreateFct(true)
      let parcData = JSON.parse(selectedFacDropdown?.detailInvoice || '[]')
      if (!Array.isArray(parcData) && parcData.length === 0) return
      const modifiedArray = parcData.map((obj) => {
        const {d, ...rest} = obj // Destructure and exclude `city`
        return rest // Return the remaining properties
      })
      let mergeData = selectedInvoices?.concat(modifiedArray)
      await dispatch(calculInvoice(mergeData))
      if (visibleInput) setVisibleInput(false)
      setVisibleCreateFac(true)
      setLoadingCreateFct(false)
      setVisible(false)
    } catch (error) {
      setLoadingCreateFct(false)
      console.error('There was an error!', error)
    }
  }

  const handleCancel = () => {
    // setFactureId(null)
    setVisibleInput(false)
    setSelectedFacDropdown(null)
  }

  const goLink = (id) => {
    let link = 'http://tricolis.duperrex.ch/tricolis/Ajout/AfficherOTPlus/' + id
    window.open(link, '_blank')
  }

  const onChangeFilter = (e, field) => {
    const value = e.value
    let _filters = {...filtersRef.current}
    if (_filters[field]) {
      _filters[field].value = value
    } else {
      console.error(`Field "${field}" does not exist in filters.`)
    }

    filtersRef.current = _filters
  }

  const handleFilter = () => {
    formik.resetForm()
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
    // setLoadingSearchCustomer(true)
    formik.setFieldValue(name, '')
    // dispatch(fetchFacturePendingFr({IDProvider: selectedFrGlobal})).then(() => {
    //   setLoadingSearchCustomer(false)
    // })
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
        <Button label='OK' severity='success' onClick={searchCalendar} />
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

  const priceEditor = (options) => {
    return (
      <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />
    )
  }

  const onChangePrice = (index, value) => {
    let data = _.cloneDeep(elementFacturable)
    data[index].Prix = value
    dispatch(setFacPendingFr(data))
  }

  const paramsTemplate = (rowData) => {
    return (
      // <SplitButton
      //   icon='pi pi-cog'
      //   model={actions}
      //   severity='secondary'
      //   menuButtonProps={{
      //     severity: 'secondary',
      //     icon: 'pi pi-chevron-down',
      //     className: 'border-circle',
      //   }}
      //   raised
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

  const columnsHistory = [
    {
      field: 'Date',
      header: 'Date',
      olang: 'Date',
      body: (rowData) => moment(rowData?.Date).format('DD/MM/YYYY'),
    },
    srcHisto == 'update_price'
      ? {field: 'Prix', header: 'Prix', olang: 'Prix'}
      : {field: 'CoutPrestation', header: 'CoutPrestation', olang: 'CoutPrestation'},
  ]

  const getHistoryPrice = (rowData, srcObject) => {
    // setLoadingHisto(true)
    selectedColRef.current = rowData?.serviceId
    let obj = {
      ID: rowData?.serviceId,
      srcObject: srcObject || 'update_price',
    }
    setSrcHisto(srcObject || 'update_price')
    dispatch(fetchHistoryFormule(obj)).then(({payload}) => {
      if (payload) {
        // setLoadingHisto(false)
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
      // setLoadingHisto(false)
    })
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
      header: 'DATEPLAN',
      field: 'DATEPLAN',
      olang: 'DATEPLAN',
      filter: true,
      showFilterMenu: false,
    },
    {
      header: 'N° de BL (ou dossier)',
      field: 'N° de BL (ou dossier)',
      olang: 'N.de.BL',
      filter: true,
      showFilterMenu: false,
    },
    {
      header: 'produit',
      field: 'produit',
      olang: 'produit',
      filter: true,
      showFilterMenu: false,
    },

    {
      header: 'Prix',
      field: 'Prix',
      olang: 'Prix',

      showFilterMenu: false,
      filter: true,
      editor: priceEditor,
      body: (rowData) => (
        <div className='flex flex-row items-center gap-2'>
          <InputNumber inputClassName='border-blue-500' value={rowData?.Prix} disabled />
          <Button
            rounded
            size='small'
            className='p-button-sm bg-transparent border-0 text-gray-600 hover:bg-gray-300'
            icon='fas fa-regular fa-list-timeline'
            onClick={() => getHistoryPrice(rowData)}
          />
        </div>
      ),
      onCellEditComplete: (props) => {
        if (props.newValue == props?.rowData?.Prix) return
        onChangePrice(props.rowIndex, props.newValue)
        let data = {
          ID: props.rowData.serviceId,
          Price: props.newValue,
        }
        dispatch(updateServicePrice(data))
      },
    },
    {
      header: 'Prix.Coup',
      field: 'CoutPrestation',
      olang: 'Prix.Coup',
      showFilterMenu: false,
      filter: true,
      editor: priceEditor,
      body: (rowData) => (
        <div className='flex flex-row items-center gap-2'>
          <InputNumber inputClassName='border-blue-500' value={rowData?.CoutPrestation} disabled />
          <Button
            rounded
            size='small'
            className='p-button-sm bg-transparent border-0 text-gray-600 hover:bg-gray-300'
            icon='fas fa-regular fa-list-timeline'
            onClick={() => getHistoryPrice(rowData, 'update_CoutPrestation')}
          />
        </div>
      ),
      onCellEditComplete: (props) => {
        if (props.newValue == props?.rowData?.CoutPrestation) return
        onChangePrice(props.rowIndex, props.newValue)
        let data = {
          ID: props.rowData.serviceId,
          Price: props.newValue,
        }
        dispatch(updateServicePrice(data))
      },
    },
    {
      header: 'servicestatutDate',
      field: 'servicestatutDate',
      olang: 'servicestatutDate',
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterTemplateSer,
      body: (rowData) => <Chip label={moment(rowData?.servicestatutDate).format('DD/MM/YYYY')} />,
    },
    {
      header: 'OTDatelivDemande',
      field: 'OTDatelivDemande',
      olang: 'OTDatelivDemande',
      filter: true,
      showFilterMenu: false,
      body: (rowData) => <Chip label={moment(rowData?.OTDatelivDemande).format('DD/MM/YYYY')} />,
      filterElement: dateFilterTemplate,
    },
    {
      header: 'Client',
      olang: 'Client',
      field: 'Client',
      filter: true,
      showFilterMenu: false,
    },
    {
      header: 'calculInf',
      olang: 'calculInf',
      field: 'calculInf',
    },
    {
      header: 'RefProduit',
      field: 'RefProduit',
      olang: 'RefProduit',
      filter: true,
      showFilterMenu: false,
    },
  ]

  let actions = [
    {
      label: 'Detail',
      icon: 'fas fa-light fa-up-right-from-square text-blue-500',
      command: (e) => {
        goLink(e.item.data.OTID)
        //dispatch(setSelectedInvoice(e.item.data))
        //navigate('/detailsTest')
      },
    },
  ]
  const headear = (
    <div className='flex gap-2 flex-row align-items-center'>
      <Button
        icon='fas fa-regular fa-pen-to-square'
        onClick={() => setVisibleMultiPrix(true)}
        className='flex flex-row items-center justify-center gap-2 rounded-lg font-normal bg-transparent text-gray-600 border-0 text-xl cursor-pointer hover:bg-gray-300'
        disabled={selectedInvoices?.length === 0}
        rounded
      >
        <OlangItem olang='Modifier' />
      </Button>
      <ButtonComponent
        rounded
        icon='fas fa-regular fa-file-invoice'
        className='flex flex-row items-center justify-center gap-2 rounded-lg font-normal bg-transparent text-gray-600 border-0 text-xl cursor-pointer hover:bg-gray-300'
        onClick={() => setVisible(true)}
        disabled={selectedInvoices?.length === 0 || !selectedFrGlobal}
      >
        <OlangItem olang='Facturer' />
      </ButtonComponent>
    </div>
  )
  const footerFactureId = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent label='Annuler' onClick={handleCancel} />
        <ButtonComponent label='OK' disabled={!selectedFacDropdown} onClick={handleSaveFacture} />
      </div>
    )
  }

  const onHideCreateFac = () => {
    setVisibleCreateFac(false)
  }
  const onSaveFacture = (values) => {
    const transformedData = selectedFactCalc?.invoices?.map((item) => ({
      serviceId: item.serviceId,
      prix: item.prix,
      formuleCalcule: item.formuleCalcule,
      formule: item.formule,
      tarif: item.tarif,
    }))
    // const findId = listFr?.find((item) => item.code === selectedFr)
    let obj = {
      description: values.description,
      orderDate: values.date,
      customerId: selectedFrGlobal,
      reference: values.reference,
    }

    dispatch(
      invoiceSave({
        id: 0,
        src: 'Fournisseurs',
        info: obj,
        Services: transformedData || [],
        isValidate: values?.isValidate == 'Oui' ? 1 : 0,
      })
    ).then(({payload}) => {
      if (payload) {
        setVisibleCreateFac(false)
        handleSelection([])
        handleSearch()
        dispatch(fetchDetailFacture(payload)).then(({payload}) => {
          if (payload) {
            dispatch(setShowDetailFacFr(true))
            navigate('/facture/fournisseurFacturer')
          }
        })
      }
    })
  }

  const handleSearch = () => {
    setLoadingSearchCustomer(true)
    dispatch(fetchFacturePendingFr({IDProvider: selectedFrGlobal})).then(() => {
      setLoadingSearchCustomer(false)
      handleSelection([])
      // setIsTableEmpty(false)
    })
  }

  const search = (e) => {
    let obj = {
      IDProvider: selectedFrGlobal,
      filttre: e.query,
    }
    dispatch(facturedDropDownAutoFr(obj))
  }

  const handleSelection = (selectedInv) => {
    dispatch(setSelectedInvoicesFr(selectedInv))
  }

  const onHidePrix = () => {
    setVisibleMultiPrix(false)
  }

  const saveMultiPrix = (values) => {
    setLoadingMultiPrice(true)
    let data = {
      Services: selectedInvoices,
      Price: values,
    }
    dispatch(updateMultiPrice(data)).then(() => {
      dispatch(fetchFacturePendingFr({IDProvider: selectedFrGlobal}))
      setVisibleMultiPrix(false)
      setLoadingMultiPrice(false)
    })
  }

  const onChangeFile = (event) => {
    setFileSelected(event.target.files[0])
  }

  const importBtn = (
    <div className='relative w-3/12 '>
      <input
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        type='file'
        id='csvFileInput'
        accept='.csv'
        onChange={onChangeFile}
        title='Select a CSV file'
        // disabled={loadingFile}
      />
      <label
        htmlFor='csvFileInput'
        className='flex flex-col items-center w-16rem h-[3rem] justify-center border-1 border-gray-400 rounded-2xl cursor-pointer hover:bg-gray-300'
      >
        <div className='flex flex-row items-center gap-3 justify-center'>
          {false ? (
            <i className='pi pi-spin pi-spinner text-xl text-gray-400 font-semibold'></i>
          ) : (
            <i className='pi pi-upload text-xl text-gray-400 font-semibold'></i>
          )}
          <OlangItem olang='Import' />
        </div>
      </label>
    </div>
  )

  const onChangeDropdown = (value) => {
    dispatch(setSelectedFrGlobal(value))
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
  const percentage = (invoiceAcloturer, totalInvoices) => {
    return (invoiceAcloturer / totalInvoices) * 100
  }

  useEffect(() => {
    dispatch(fetchListFr())
    if (!selectedFrGlobal) return
    handleSearch()
  }, [])

  useEffect(() => {
    const uploadFile = async () => {
      if (!fileSelected) return
      try {
        const response = await uploadFileFr(fileSelected)
        if (response) {
          dispatch(
            setToastParams({
              show: true,
              severity: 'success',
              summary: 'SUCCESS',
              detail: 'File uploaded successfully',
              position: 'top-right',
            })
          )
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERROR',
            detail: 'File upload failed!',
            position: 'top-right',
          })
        )
      }
    }
    uploadFile()
  }, [fileSelected])

  return (
    <div ref={activeComponentRef} data-status='active-component'>
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
      <ChangeMultiPrix
        loading={loadingMultiPrice}
        visible={visibleMultiPrix}
        onHide={onHidePrix}
        onSave={saveMultiPrix}
      />

      <HeaderChoose
        optionValue='id'
        optionLabel='name'
        title='src.A.Facture'
        items={listFr}
        selectedValue={selectedFrGlobal}
        loadingBtn={loadingSearchCustomer}
        onChangeDropdown={onChangeDropdown}
        onSearch={handleSearch}
        showDetail={true}
        cAffireValue={statFr?.caFacture}
        openFacValue={statFr?.invoiceAcloturer}
        prestValue={statFr?.totalServices}
        // children={importBtn}
      />
      <Divider className='my-4' />
      {loadingSearchCustomer ? (
        <div className='flex items-center justify-center mt-8'>
          <ProgressSpinner className='w-4rem h-4rem' strokeWidth='4' />
        </div>
      ) : (
        <DatatableComponent
          //exportFields={exportFields}
          tableId='table-Afacture-fournisseur'
          data={elementFacturable}
          columns={columns}
          onSelections={handleSelection}
          // rowActions={actions}
          minWithRow='15rem'
          selectedDataTb={selectedInvoices}
          //rowGroupTemplates={rowGroupTemplates}
          //contextMenuModel={actions}
          isDataSelectable={true}
          selectionRowsProps={true}
          // rowActions={actions}
          extraHeader={headear}
          filterFunc={handleFilter}
          // onlyBtnExport={true}
        />
      )}
      <CreateFacture
        selectedUser={selectedFrGlobal}
        onHideClick={onHideCreateFac}
        visible={visibleCreateFac}
        onHide={() => setVisibleCreateFac(false)}
        onSaveClick={onSaveFacture}
        selectedFacture={selectedFacDropdown}
      />
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
            onClick={() => setVisibleInput(true)}
          />
        </div>
      </Dialog>

      <DialogComponent
        header="Entrer l'id de la facture"
        visible={visibleInput}
        onHide={() => setVisibleInput(false)}
        className='w-6'
        footer={footerFactureId}
      >
        <div className='flex justify-content-center'>
          <AutoComplete
            inputStyle={{width: '100%'}}
            className='w-full'
            field='reference'
            value={selectedFacDropdown}
            suggestions={dropFactFR}
            completeMethod={search}
            itemTemplate={templateDropAuto}
            // selectedItemTemplate={templateDropAutoSelected}
            placeholder='Enter facture reference or description'
            onChange={(e) => {
              setSelectedFacDropdown(e.value)
            }}
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default FornesseurAFacurer
