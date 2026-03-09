import {useEffect, useRef, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import {Calendar} from 'primereact/calendar'
import {useFormik} from 'formik'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getSelectedFactureCalc,
  getSelectedInvoices,
  getShowCreateFac,
  setShowCreateFac,
  setSelectedInvoices,
  fetchInvoicePendingBilling,
  setSelectedFactureCalc,
  generateCrtPdfFac,
} from '../../slice/elementFacturable.slice'
import {
  getDataClient,
  getDataDeposit,
  getSelectedClientFc,
  invoiceSave,
} from '../../slice/facture.slice'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import moment from 'moment'
import {Chip} from 'primereact/chip'
import {Divider} from 'primereact/divider'
import PdfCreateFac from './PdfCreateFac'
import {
  fetchDetailClient,
  getDetailClient,
  getSelectedClientGl,
} from '../../slice/facturation.slice'
import HeaderInvoice from '../../../FacturesList/user-interface/DetailFacture/HeaderInvoice'
import {SelectButton} from 'primereact/selectbutton'
import {useLocation, useNavigate} from 'react-router-dom'
import {fetchDetailFacture, setVisibleDetailFac} from '../../../FacturesList/slice/factureListSlice'
import {setShowDetailFacFr} from '../../../FacturationFornisseur/slice/factureFornisseur.slice'

const CreateFacture = ({selectedFacture, selectedUser}) => {
  const [selectedArow, setSelectedArow] = useState([])
  const [total, setTotal] = useState(0)
  const [visibleCrtPdf, setVisibleCrtPdf] = useState(false)

  const options = ['Oui', 'Non']
  const [value, setValue] = useState(options[0])

  const invoiceId = useRef(null)

  const dispatch = useAppDispatch()
  const location = useLocation()

  const visible = useAppSelector(getShowCreateFac)
  const selectedClient = useAppSelector(getSelectedClientGl)
  const selectClientData = useAppSelector(getDataClient)
  const getDepositData = useAppSelector(getDataDeposit)
  const selecttedLineFacture = useAppSelector(getSelectedFactureCalc)
  const detailClient = useAppSelector(getDetailClient)

  let navigate = useNavigate()

  const detailsTemplate = (e) => {
    return (
      <div>
        <Chip
          label={e.otNoBL}
          onClick={() => {
          }}
        />
      </div>
    )
  }

  const onHideCrtPdf = () => {
    setVisibleCrtPdf(false)
    dispatch(setShowCreateFac(false))
    dispatch(fetchInvoicePendingBilling({ID: selectedClient}))
  }

  const onClickPdfCrt = async () => {
    let obj = {
      id: invoiceId.current,
      src: 'invoice',
      fileType: 'pdf',
    }
    const {payload} = await dispatch(generateCrtPdfFac(obj))
    onHideCrtPdf()
  }

  const columns = [
    {
      header: 'N° de BL (ou dossier)',
      field: 'OTNoBL',
      olang: 'OTNoBL',
      filter: true,
      body: detailsTemplate,
    },
    {
      header: 'Service',
      field: 'produit',
      olang: 'Service',
      filter: true,
    },

    {
      header: 'DeliveryDate',
      olang: 'DeliveryDate',
      field: 'otDateLivraison',
      body: (rowData) => <strong>{moment(rowData?.otDateLivraison).format('DD/MM/YYYY')}</strong>,
    },

    {
      header: 'NP',
      field: 'otdestnp',
      olang: 'NP',
    },
    {
      header: 'formuleCalcule',
      field: 'formuleCalcule',
      olang: 'formuleCalcule',
    },
    {
      header: 'Price',
      field: 'prix',
      olang: 'Price',
    },

    {
      header: 'formule',
      field: 'formule',
      olang: 'formule',
    },
  ]

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        //dispatch(setSelectedInvoice(e.item.data))
        //dispatch(removeInvoice(e.item.data))
      },
    },
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        // goLink(e.item.data.OTID)
        //dispatch(setSelectedInvoice(e.item.data))
        //navigate('/detailsTest')
      },
    },
  ]

  const formik = useFormik({
    initialValues: {
      description: '',
      date: new Date(),
      reference: '',
    },
    // validationSchema: Yup.object({
    //   description: Yup.string().required('Description is required'),
    //   date: Yup.date().required('Date is required'),
    //   reference: Yup.string().required('Reference is required'),
    // }),
    onSubmit: (values) => {
      dispatch(setSelectedFactureCalc([]))
      // let factureLineClear = JSON.parse(localStorage.getItem('element-Afacture-configs'))
      const transformedData = selecttedLineFacture?.invoices?.map((item) => ({
        serviceId: item.serviceId,
        prix: item.prix,
        formuleCalcule: item.formuleCalcule,
        formule: item.formule,
        tarif: item.tarif,
      }))

      dispatch(setSelectedInvoices([]))
      let obj = {
        description: values.description,
        orderDate: values.date,
        customerId: selectedClient,
        reference: values.reference,
      }
      dispatch(
        invoiceSave({
          id: selectedFacture?.id || 0,
          src: 'Client',
          isValidate: value == 'Oui' ? 1 : 0,
          info: obj,
          Services: transformedData,
        })
      ).then(({payload}) => {
        if (payload) {
          invoiceId.current = payload
          dispatch(setSelectedFactureCalc([]))
          dispatch(setSelectedInvoices([]))
          dispatch(setShowCreateFac(false))
          setVisibleCrtPdf(true)
          formik.resetForm()
          if (location.pathname == '/facture/clientAfacturer') {
            dispatch(fetchDetailFacture(payload)).then(({payload}) => {
              if (payload) {
                dispatch(setVisibleDetailFac(true))
                navigate('/facture/clientFacturer')
              }
            })
          } else {
            dispatch(fetchDetailFacture(payload)).then(({payload}) => {
              if (payload) {
                dispatch(setShowDetailFacFr(true))
                navigate('/facture/fournisseurFacturer')
              }
            })
          }
          // let clearedStorage = JSON.parse(localStorage.getItem('element-Afacture-configs')) ?? {}
          // clearedStorage.selection = []
          // localStorage.setItem('element-Afacture-configs', JSON.stringify(clearedStorage)) // Clear local storage
        }
      })
    },
  })

  const header = (
    <div className='text-xl font-semibold'>
      <OlangItem olang='Create.Fac' />

      {/* <div className='ml-3 text-lg font-bold font-semibold'>
        {' '}
        {moment(new Date()).format('DD-MM-YYYY HH:mm')}
      </div> */}
    </div>
  )

  const onHide = () => {
    dispatch(setShowCreateFac(false))
    setTotal(0)
    formik.resetForm()
  }

  useEffect(() => {
    if (!Array.isArray(selecttedLineFacture)) return
    const total = selecttedLineFacture?.reduce((total, item) => total + item.prix, 0)
    setTotal(total)
  }, [selecttedLineFacture])

  useEffect(() => {
    if (!selectedFacture) return
    formik.setValues({
      description: selectedFacture.description || '',
      date: selectedFacture?.creaDate ? moment(selectedFacture?.creaDate).toDate() : null,
      reference: selectedFacture.reference || '',
    })
  }, [selectedFacture])

  useEffect(() => {
    if (selectedUser) {
      let obj = {
        ID: selectedUser,
        src: 'Client',
      }
      dispatch(fetchDetailClient(obj))
    }
  }, [selectedUser])

  // useEffect(() => {
  //   const handleInvalid = () => {
  //     const invalidElement = document.querySelector('.p-invalid')
  //     if (invalidElement) {
  //       invalidElement.scrollIntoView({behavior: 'smooth', block: 'center'})
  //     }
  //   }

  //   if (!formik.isValid && formik.submitCount > 0) {
  //     handleInvalid()
  //   }
  // }, [formik.isValid, formik.submitCount])

  return (
    <DialogComponent
      header={header}
      visible={visible}
      onHide={onHide}
      className='md:w-7 right-0'
      position='center'
    >
      <div className='grid'>
        <HeaderInvoice
          img={process.env.REACT_APP_IMAGE_BASE_URL + '/logos/logo.png'}
          reference={formik.values.reference}
          creaDate={formik.values.date}
          // OrderDate={'2020-20-20'}
          {...detailClient[0]}
        />

        {/* <div className='col bg-red-300'>
          <div
            style={{'text-align': 'end'}}
            className='flex-1 border-0   justify-content-end flex-wrap  font-bold m-2 px-5 py-3 border-round'
          >
            <div className='w-full'>
              <p>
                <div className='p-m-4'>
                  <h2>{getDepositData?.client}</h2>
                  <ul className='p-list p-component' style={{listStyle: 'none', padding: 0}}>
                    <li>{getDepositData?.adresse}</li>
                    <li>{getDepositData?.NP}</li>
                    <li>{getDepositData?.Ville} </li>
                    <li>{getDepositData?.Tel}</li>
                  </ul>
                </div>
              </p>
            </div>
          </div>
        </div> */}
      </div>
      <hr />
      {/* <div className='overflow-hidden bg-red-300'>
        <div className='flex'>
          <div className='flex-1 border-0 flex align-items-center justify-content-center  font-bold m-2 px-5 py-3 border-round'>
            <div className='w-full'>
              <p>
                <div className='p-m-4'>
                  <h2>
                    {selectClientData?.client} - {selectClientData?.CodeClient}
                  </h2>
                  <ul className='p-list p-component' style={{listStyle: 'none', padding: 0}}>
                    <li>{selectClientData?.adresse}</li>
                    <li>{selectClientData?.NP}</li>
                    <li>{selectClientData?.Ville} </li>
                    <li>{selectClientData?.Tel}</li>
                  </ul>
                </div>
              </p>
            </div>
          </div>
          <div
            style={{'text-align': 'end'}}
            className='flex-1 border-0   justify-content-end flex-wrap  font-bold m-2 px-5 py-3 border-round'
          >
            <div className='w-full'>
              <p>
                <div className='p-m-4'>
                  <ul className='p-list p-component' style={{listStyle: 'none', padding: 0}}>
                    <li>
                      <b olang='reference'>reference</b>: {formik.values?.reference}
                    </li>
                    <li>
                      <b olang='date'>date</b>:{' '}
                      {moment(formik?.values?.date || new Date()).format('DD-MM-YYYY')}
                    </li>
                  </ul>
                </div>
              </p>
            </div>
          </div>
        </div>
      </div> */}
      <div className='flex flex-column w-full '>
        <div className='flex flex-row w-full justify-content-around'>
          <div className='flex flex-column w-5 justify-content-between'>
            <div className='text-xl font-semibold'>
              <OlangItem olang='reference' />:
            </div>
            <InputText
              className={
                formik.errors.reference && formik.touched.reference
                  ? 'p-invalid p-error border-red-500 w-8'
                  : 'w-8'
              }
              name='reference'
              placeholder='Reference'
              value={formik.values.reference}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex flex-column w-5 justify-content-between'>
            <div className='text-xl font-semibold'>
              <OlangItem olang='Description' />:
            </div>
            <InputText
              className={
                formik.errors.description && formik.touched.description
                  ? 'p-invalid p-error border-red-500 w-8'
                  : 'w-8'
              }
              name='description'
              placeholder='Description'
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex flex-column w-4 justify-content-between'>
            <div className='text-xl font-semibold'>
              <OlangItem olang='date' />:
            </div>
            <Calendar
              onChange={formik.handleChange}
              value={formik.values.date}
              name='date'
              dateFormat='dd/mm/yy'
              placeholder='dd/mm/yyyy'
              showIcon
              className={
                formik.errors.date && formik.touched.date
                  ? 'p-invalid p-error border-red-500 w-8'
                  : 'w-8'
              }
            />
          </div>
          <div className='flex flex-column w-4 justify-content-between'>
            <div className='text-xl font-semibold mb-1'>
              <OlangItem olang='Fac.Valider' />:
            </div>
            <SelectButton value={value} onChange={(e) => setValue(e.value)} options={options} />
          </div>
        </div>
        <Divider />
        <DatatableComponent
          tableId='element-AfactureItemssssss'
          data={selecttedLineFacture?.invoices}
          columns={columns}
          // exportFields={columns}
          minWithRow='15rem'
          isDataSelectable={true}
        />
        <div>
          <div className='flex flex-row shadow-lg pb-2 shadow-black rounded-2xl  mt-4 border-1 border-gray-500 items-center justify-end'>
            <div className=' flex flex-row   mt-4 justify-content-end border-0'>
              <tr>
                <td></td>
                <td className='pr-4'>
                  <h2 className='font-normal text-gray-600'>
                    <OlangItem olang='Total.HT' />:{' '}
                  </h2>
                </td>
                <td className='pr-4 text-gray-800 font-bold text-4xl'>
                  {selecttedLineFacture?.info?.ht}
                </td>
              </tr>
              <Divider align='center' type='solid' layout='vertical' />
              <tr>
                <td></td>
                <td className='pr-4'>
                  <h2 className='font-normal text-gray-600'>
                    <OlangItem olang='Total.TTC' />:{' '}
                  </h2>
                </td>
                <td className='pr-4 text-gray-800 font-bold text-4xl'>
                  {selecttedLineFacture?.info?.totalPrix}
                </td>
              </tr>
              <Divider align='center' type='solid' layout='vertical' />
              <tr>
                <td></td>
                <td className='pr-4'>
                  <h2 className='font-normal text-gray-600'>
                    <OlangItem olang='Total.TVA' />:{' '}
                  </h2>
                </td>
                <td className='pr-4 text-gray-800 font-bold text-4xl'>
                  {selecttedLineFacture?.info?.tva}
                </td>
              </tr>
            </div>
          </div>
        </div>
        <div className='flex flex-row w-full mt-4 justify-content-end'>
          <ButtonComponent
            label='Annuler'
            className='bg-transparent text-red-500'
            text
            onClick={onHide}
          />
          <ButtonComponent
            label='Enregistrer'
            severity='success'
            className='ml-2'
            onClick={formik.handleSubmit}
          />
        </div>
      </div>
      <PdfCreateFac
        visiblePdfCrt={visibleCrtPdf}
        onHidePdfCrt={onHideCrtPdf}
        onClickPdfCrt={onClickPdfCrt}
      />
    </DialogComponent>
  )
}

export default CreateFacture
