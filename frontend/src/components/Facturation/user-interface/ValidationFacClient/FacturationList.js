import {useLocation, useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {removeInvoice, setSelectedInvoice} from '../../../Invoices/slice/invoice.slice'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import {getStatus} from '../../../Tag/slice/tag.slice'
import {Chip} from 'primereact/chip'
import {SplitButton} from 'primereact/splitbutton'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {memo, useEffect, useRef, useState} from 'react'
import {SpeedDial} from 'primereact/speeddial'
import {Button} from 'react-bootstrap'
import {Dropdown} from 'primereact/dropdown'
import {
  getElementsFacture,
  getFactures,
  getOptionsConfirmation,
  getOptionsValid,
  getSelectedFacture,
  getSelectedOptionsValid,
  setElementsFacture,
  setFactures,
  setSelectedFacture,
  setSelectedOptionsValid,
} from '../../slice/facture.slice'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import ButtonComponent from '../../../shared/ButtonComponent'
import {InputText} from 'primereact/inputtext'
import {InputTextarea} from 'primereact/inputtextarea'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchCustomersFac,
  fetchFactureValidation,
  getClientFac,
  getFactureValidation,
  getSelectedClientGl,
  setDetailVisibleValid,
  setFactureValidation,
  setSelectedClientGl,
} from '../../slice/facturation.slice'
import {
  fetchStatusFacture,
  getListStatusFac,
  saveStatusFac,
} from '../../../FacturationFornisseur/slice/factureFornisseur.slice'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'
import {FilterMatchMode} from 'primereact/api'
import {fetchDetailFacture} from '../../../FacturesList/slice/factureListSlice'
import {useFormik} from 'formik'
import HeaderChoose from '../../../ui/HeaderChoose'
import {ScrollPanel} from 'primereact/scrollpanel'
import {Card, CardContent, CardDescription, CardTitle} from '../../../ui/Card'
import {Divider} from 'primereact/divider'
import {confirmDialog, ConfirmDialog} from 'primereact/confirmdialog'
import {Dialog} from 'primereact/dialog'
const FacturationList = () => {
  const [valueConfirmation, setValueConfirmation] = useState(null)
  const [valueValid, setValueValid] = useState(null)
  const [visible, setVisible] = useState(false)
  const [visibleValidation, setVisibleValidation] = useState(false)
  const [visibleComment, setVisibleComment] = useState(false)
  const [comment, setComment] = useState('')
  const [archive, setArchive] = useState(true)
  const [textDialogStatus, setTextDialogStatus] = useState('')
  const [isFournisseur, setIsFournisseur] = useState(false)
  const [isClient, setIsClient] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)
  const [loadingSearchClient, setLoadingSearchClient] = useState(false)
  const [filterDate, setFilterDate] = useState(new Date())
  const [txtFilter, setTxtFilter] = useState('')
  const [listData, setListData] = useState([])

  const statusSelectedRef = useRef(null)
  const rowFacSelectedRef = useRef(null)
  const calenderCreaRef = useRef(null)
  const calendarOrderRef = useRef(null)

  let factures = useAppSelector(getFactures)
  let optionsValid = useAppSelector(getOptionsValid)
  let selectedOptionsValid = useAppSelector(getSelectedOptionsValid)
  let selectedFacture = useAppSelector(getSelectedFacture)
  let optionsConfirmation = useAppSelector(getOptionsConfirmation)
  let elementsFacture = useAppSelector(getElementsFacture)
  const listFactureValidation = useAppSelector(getFactureValidation)
  const statusList = useAppSelector(getListStatusFac)
  const customers = useAppSelector(getClientFac)
  const selectedClientGbl = useAppSelector(getSelectedClientGl)

  const location = useLocation()
  const dispatch = useAppDispatch()

  const optionNonAutorise = [
    {
      id: 3,
      name: 'Action Non Autorisé',
      value: false,
    },
  ]

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data.id)).then(({payload}) => {
          if (payload) {
            dispatch(setDetailVisibleValid(true))
          }
        })
      },
    },
  ]


  const onClickDetail = (data) => {
    dispatch(fetchDetailFacture(data?.id)).then(({payload}) => {
      if (payload) {
        dispatch(setDetailVisibleValid(true))
      }
    })
  }

  const formik = useFormik({
    initialValues: {
      creaDate: '',
      OrderDate: '',
    },
    onSubmit: (values) => {
      let data = {
        ID: selectedClientGbl,
        orderDateFrom: values?.OrderDate[0]
          ? moment(values?.OrderDate[0]).format('YYYY-MM-DD')
          : '',
        orderDateTo: values?.OrderDate[1] ? moment(values?.OrderDate[1]).format('YYYY-MM-DD') : '',
        creaDateFrom: values?.creaDate[0] ? moment(values?.creaDate[0]).format('YYYY-MM-DD') : '',
        creaDateTo: values?.creaDate[1] ? moment(values?.creaDate[1]).format('YYYY-MM-DD') : '',
      }
      setLoadingSearchClient(true)
      dispatch(fetchFactureValidation(data)).then(() => {
        setLoadingSearchClient(false)
      })
    },
  })

  const onChangeTxtFilter = (e) => {
    setTxtFilter(e.target.value)
    if (e.target.value && Array.isArray(listFactureValidation)) {
      let txt = e.target.value.toLowerCase()
      const filtered = listFactureValidation?.filter((item) =>
        item?.reference?.toLowerCase().includes(txt)
      )
      setListData(filtered)
    }
    if (!e.target.value) {
      setListData(listFactureValidation)
    }
  }

  const onHide = () => {
    setVisible(false)
    setVisibleComment(false)
    setVisibleValidation(false)
  }
  const save = () => {
    const updatedFactures = factures.map((facture) => {
      if (facture.identifiant === selectedFacture.identifiant) {
        return {
          ...facture,
          isValid: valueValid,
        }
      }
      return facture
    })
    dispatch(setFactures(updatedFactures))
    //setIsDisabled(true)
    setVisible(false)
    setComment('')
    setVisibleComment(valueValid === false)
  }

  const onHideSave = () => {
    setVisible(false)
  }

  const onSaveStatus = (e, rowData) => {
    setVisible(true)
    statusSelectedRef.current = e
    rowFacSelectedRef.current = rowData
    if (e === 'confirmed') {
      setTextDialogStatus('Vous voulez confirmer cette facture ?')
    } else {
      setTextDialogStatus('Vous voulez annuler cette facture ?')
    }
  }

  const onSaveFacNonConfirmed = () => {
    let obj = {
      src: 'Client',
      id: rowFacSelectedRef.current.id,
      status: statusSelectedRef.current,
      description: comment,
    }
    dispatch(saveStatusFac(obj)).then(({payload}) => {
      if (payload) {
        searchByClient()
        setVisibleComment(false)
      }
    })
  }

  const onSaveFac = () => {
    let obj = {
      src: 'Client',
      id: rowFacSelectedRef.current.id,
      status: statusSelectedRef.current,
    }
    if (obj.status === 'confirmed') {
      dispatch(saveStatusFac(obj)).then(({payload}) => {
        if (payload) {
          setVisible(false)
          searchByClient()
        }
      })
    } else {
      setVisible(false)
      setVisibleComment(true)
    }
  }

  const footer = (onHideBtn, saveConfirmation) => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent
          size='small'
          label='Annuler'
          className='bg-transparent border-none text-gray-800 hover:bg-red-200 hover:text-red-600'
          onClick={onHideBtn}
        />
        <ButtonComponent
          className='bg-transparent border-none text-gray-800 hover:bg-green-200 hover:text-green-600'
          size='small'
          label='Enregistrer'
          onClick={saveConfirmation}
        />
      </div>
    )
  }

  const addComment = (rowData) => {
    setComment(rowData.comment)
    setVisibleComment(true)
    dispatch(setSelectedFacture(rowData))
  }

  const handleChange = (e, rowData) => {
    if (isClient) {
      setValueValid(e.value)
      setVisible(true)
      dispatch(setSelectedFacture(rowData))
    }
  }

  const handleChangeValidation = (e, rowData) => {
    if (isFournisseur) {
      setValueConfirmation(e.value)
      dispatch(setSelectedFacture(rowData))
      setVisibleValidation(true)
    }
  }

  const addresseeTemplate = (date) => {
    const convertDate = moment(date).format('DD/MM/YYYY')
    return (
      <>
        <Chip label={convertDate} icon='pi pi-calendar text-blue-500' />
      </>
    )
  }

  const actionValidate = (rowData) => {
    return (
      <div>
        {rowData.codeStatus === 'Cree' ? (
          <Dropdown
            value={rowData.isValid}
            options={statusList}
            optionLabel='label'
            optionValue='name'
            placeholder='pas de status'
            className='w-full md:w-10.3rem'
            onChange={(e) => onSaveStatus(e, rowData)}
          />
        ) : rowData.isValid == true ? (
          <Chip
            label='valide'
            icon='pi pi-check'
            className='bg-green-500'
            style={{color: `${rowData.color}`}}
            onClick={() => dispatch(setSelectedFacture(rowData))}
          />
        ) : rowData.isValid == false ? (
          <div>
            <Chip
              label='non valide'
              icon='pi pi-file-edit'
              className='bg-red-500'
              style={{color: `${rowData.color}`}}
              onClick={isClient ? () => addComment(rowData) : null}
            />{' '}
            <p>
              <Chip
                label={rowData.comment.substring(0, 15)}
                className='w-7rem m-1 flex justify-content-center align-items-center'
              />
            </p>
          </div>
        ) : (
          <Chip
            label={rowData?.status}
            icon='pi pi-times'
            className='bg-red-500'
            style={{color: `${rowData.color}`}}
            onClick={() => dispatch(setSelectedFacture(rowData))}
          />
        )}
      </div>
    )
  }

  const searchCalendar = () => {
    formik.submitForm()
  }

  const clearDate = (name) => {
    formik.setFieldValue(name, '')
    searchByClient()
  }

  const footerCalendar = (calendarInstance) => {
    return (
      <div className='flex justify-content-between'>
        <ButtonComponent
          label='Clear'
          severity='danger'
          onClick={() => {
            calendarInstance.hide()
            clearDate(calendarInstance.props.name)
          }}
        />
        <ButtonComponent
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

  const columns = [
    {
      header: 'reference',
      olang: 'reference',
      field: 'reference',
      // body: addresseeTemplate,
      filter: true,
    },
    {
      header: 'description',
      field: 'description',
      olang: 'description',
    },
    {
      header: 'creaDate',
      field: 'creaDate',
      olang: 'creaDate',
      body: (rowData) => addresseeTemplate(rowData?.creaDate),
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterCrea,
    },
    {
      header: 'OrderDate',
      field: 'OrderDate',
      olang: 'OrderDate',
      body: (rowData) => addresseeTemplate(rowData?.OrderDate),
      filterElement: dateFilterOrder,
      filter: true,
      showFilterMenu: false,
    },
    {
      header: 'status',
      field: 'status',
      olang: 'status',
      body: actionValidate,
    },
  ]

  const confirm1 = () => {
    confirmDialog({
      message: textDialogStatus,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: () => {
      },
      reject: () => {
      },
    })
  }

  // if (!isClient) {
  //   columns.push({
  //     header: 'Validation Fournisseur',
  //     olang: 'Validation Fournisseur',
  //     field: 'validationFournisseur',
  //     body: activeTemplate,
  //   })
  // } else {
  //   columns.push({
  //     field: null,
  //     header: 'Validation Client',
  //     body: actionValidate,
  //   })
  // }


  const exportFields = [
    {label: 'Date', column: 'date'},
    {label: 'Tourne', column: 'nTourne'},
    {label: 'Identifiant', column: 'identifiant'},
    {label: 'Prestation', column: 'prestation'},
    {label: 'Adresse de changement', column: 'changeAdr'},
    {label: 'Adresse de livraison', column: 'livraisonAdr'},
    {label: 'Formule', column: 'formule'},
    {label: 'Tarif', column: 'tarif'},
    {label: 'Validation', column: 'validation'},
    {label: 'Remarque', column: 'remarque'},
    {label: 'Validation Client', column: 'validationClient'},
  ]

  const onChangeDropdown = (value) => {
    dispatch(setSelectedClientGl(value))
  }

  const searchByClient = () => {
    setLoadingSearchClient(true)
    dispatch(
      fetchFactureValidation({IDClient: selectedClientGbl, year: moment(filterDate).format('YYYY')})
    ).then(({payload}) => {
      setListData(payload)
      setLoadingSearchClient(false)
    })
  }

  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.code} />,
  }

  useEffect(() => {
    return () => {
      if (location.pathname === '/facture/clientValidation') {
        dispatch(setFactureValidation([]))
      }
    }
  }, [location.pathname])

  useEffect(() => {
    dispatch(fetchStatusFacture())
    dispatch(fetchCustomersFac())
    // dispatch(fetchFactureValidation())
  }, [])

  useEffect(() => {
    if (selectedClientGbl) {
      searchByClient()
    }
  }, [])

  return (
    <div>
      <ConfirmDialog />
      <Dialog
        header='Confirmation'
        style={{width: '400px'}}
        onHide={onHideSave}
        visible={visible}
        footer={() => footer(onHideSave, onSaveFac)}
      >
        <div className='text-xl text-gray-800'>
          {textDialogStatus}
          {/* <OlangItem olang='Voulez Vraiment Enregistrer?' /> */}
          <Divider />
        </div>
      </Dialog>

      <Card className='bg-gradient-to-br rounded-3xl p-2 border-2 border-gray-300 from-white to-gray-50 mt-2'>
        <div className='p-4 flex flex-col gap-2'>
          <CardTitle>
            <OlangItem olang='ArchivedClient' />
          </CardTitle>
          <CardDescription className='text-base text-gray-500'>
            <OlangItem olang='ArchivedClient.desc' />
          </CardDescription>
        </div>
        <CardContent className='p-2'>
          <div className='flex flex-row gap-6 items-end justify-between'>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='annee' />
              </label>
              <Calendar
                value={filterDate}
                // showIcon
                // showButtonBar
                dateFormat='yy'
                view='year'
                selectionMode='single'
                yearNavigator
                yearRange='1900:2050'
                inputClassName='h-[3] text-lg font-semibold'
                onChange={(e) => setFilterDate(e.value)}
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='Client' />
              </label>
              <Dropdown
                value={selectedClientGbl}
                filter
                optionValue='ClientID'
                optionLabel='Nom'
                options={customers}
                onChange={(e) => onChangeDropdown(e.value)}
                placeholder='Selectionner un fournisseur'
                className='text-lg font-semibold h-[3]'
                onKeyDown={(e) => e.key === 'Enter' && searchByClient()}
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='N.Facture' />
              </label>
              <InputText onChange={onChangeTxtFilter} placeholder='ex: 123456' className='h-[3]' />
            </div>
            <div className='flex flex-col flex-[1/2]'>
              <ButtonComponent
                className='h-16 flex rounded-3xl flex-row gap-2 items-center justify-center'
                icon='pi pi-search'
                onClick={searchByClient}
                loading={loadingSearchClient}
                disabled={!selectedClientGbl || loadingSearchClient}
              >
                <OlangItem olang='Search' />
              </ButtonComponent>
            </div>
          </div>
        </CardContent>
      </Card>
      <Divider className='my-4' />
      <ScrollPanel style={{height: '60vh'}}>
        <div className='flex flex-col gap-4 items-center '>
          {Array.isArray(listData) && listData?.length > 0 ? (
            listData?.map((item) => (
              <Card
                key={item?.id}
                className='shadow-sm p-2 border-gray-300 border-2 rounded-xl flex items-center justify-center w-full'
              >
                <CardContent className='w-full flex items-center justify-items-center'>
                  <div className='w-full'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h3 className='text-2xl font-semibold'>{item?.reference}</h3>
                        <p className='text-sm text-muted-foreground'>
                          <OlangItem olang='Client' />
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <ButtonComponent
                          className='flex flex-row text-lg font-semibold gap-2 hover:text-red-500 hover:bg-red-200 bg-slate-50 text-gray-600 border-0'
                          icon='fas fa-regular fa-circle-xmark'
                          size='sm'
                          text
                          rounded
                          onClick={(e) => onSaveStatus('NotConfirmed', item)}
                        >
                          {/* <XCircle className="w-4 h-4 mr-1" /> */}
                          <OlangItem olang='Rejeter' />
                        </ButtonComponent>
                        <ButtonComponent
                          className='flex flex-row gap-2 bg-slate-100 hover:text-green-500 text-gray-600 hover:bg-green-200 border-0 text-lg font-semibold'
                          icon='fas fa-regular fa-memo-circle-check'
                          size='sm'
                          text
                          rounded
                          onClick={(e) => {
                            // confirm1()
                            onSaveStatus('confirmed', item)
                          }}
                        >
                          {/* <CheckCircle className="w-4 h-4 mr-1" /> */}
                          <OlangItem olang='Valider' />
                        </ButtonComponent>
                      </div>
                    </div>
                    <Divider />
                    <div className='mt-4 flex flex-row justify-between items-center'>
                      <div>
                        <p className='text-muted-foreground text-base text-gray-500 font-semibold'>
                          <OlangItem olang='Montant' />
                        </p>
                        <p className='font-semibold text-xl '>{item?.Tottal} CHF</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground  text-base text-gray-500 font-semibold'>
                          <OlangItem olang='Date' />
                        </p>
                        <p className='font-semibold text-xl '>{item?.creaDate}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground  text-base text-gray-500 font-semibold'>
                          <OlangItem olang='Echeance' />
                        </p>
                        <p className='font-semibold text-xl'>{item?.OrderDate}</p>
                      </div>
                      <div>
                        <ButtonComponent
                          icon='fas fa-solid fa-eye text-2xl'
                          className='bg-transparent text-gray-600 hover:bg-gray-300 border-0'
                          size='small'
                          onClick={() => onClickDetail(item)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className='flex flex-row gap-4 items-center mt-4'>
              <i className='pi pi-info-circle text-5xl text-gray-500' />
              <h3 className='text-2xl font-semibold text-gray-800'>
                <OlangItem olang='NoData' />
              </h3>
            </div>
          )}
        </div>
      </ScrollPanel>
      <DialogComponent
        visible={visibleComment}
        footer={() => footer(onHideSave, onSaveFacNonConfirmed)}
        onHide={onHide}
      >
        <div>
          <h5>Ajouter une Remarque</h5>
          {/* <InputText value={comment}  onChange={(e) => setComment(e.target.value)} className="w-8 mt-2" /> */}
          <InputTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            cols={80}
            className='w-8 mt-4'
          />
        </div>
      </DialogComponent>

      {/* <DatatableComponent
        exportFields={exportFields}
        tableId='facturation-table'
        data={listFactureValidation}
        columns={columns}
        rowGroupTemplates={rowGroupTemplates}
        // contextMenuModel={actions}
        rowActions={actions}
        //onSelections={}
      /> */}
    </div>
  )
}

export default memo(FacturationList)
