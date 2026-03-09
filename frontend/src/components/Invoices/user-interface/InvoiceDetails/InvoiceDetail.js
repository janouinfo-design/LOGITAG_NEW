import {Chip} from 'primereact/chip'
import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {Accordion, AccordionTab} from 'primereact/accordion'
import {Card} from 'primereact/card'
import {Divider} from 'primereact/divider'
import {TabView, TabPanel} from 'primereact/tabview'
import {
  createOrUpdateInvoice,
  fetchInvoices,
  fetchPdf,
  getSelectedInvoice,
  setDetailInvoice,
  setEditInvoice,
  setSelectedInvoice,
} from '../../slice/invoice.slice'
import _ from 'lodash'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {getInvoiceDetail} from '../../slice/invoice.slice'
import {fetchInvoiceDetailData, fetchInvoicesPs} from '../../api/api'
import {Image} from 'primereact/image'
import {fetchInvoiceDetail} from '../../slice/invoice.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import InvoiceEditor from '../InvoiceEditor/InvoiceEditor'
import {useNavigate} from 'react-router-dom'
import jsPDF from 'jspdf'
import {Button} from 'primereact/button'
import { API_BASE_URL_IMAGE } from '../../../../api/config'

const InvoiceDetail = () => {
  let selectedInvoice = useAppSelector(getSelectedInvoice)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()


  const [inputs, setInputs] = useState({})
  const [invoiceArticle, setInvoiceArticle] = useState([])

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedInvoice)
    old = {...old, [e.target.name]: e.target.value}
    setInputs(old)
    dispatch(setSelectedInvoice(old))
  }

  const handleChange = () => {
    dispatch(setEditInvoice(true))
  }

  const exportToPrint = () => {
    const printableContent = `
      <html>
        <head>
          <title>Invoice Detail</title>
          <style>
            body {
              font-family: 'Helvetica', sans-serif;
            }
            .table-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: #333;
              margin: 20px;
              padding: 10px;
              border-radius: 5px;
              box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
            }
            .table-container .column {
              width: 48%;
            }
            .table-container p {
              margin: 10px 0;
            }
            .table-container .font-bold {
              font-weight: bold;
            }
            .divider {
              border-top: 1px solid #ccc;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="table-container">
            <div class="column">
              <p>Reference</p>
              <p class="font-bold">${selectedInvoice?.reference}</p>
              <div class="divider"></div>
  
              <p>Description</p>
              <p class="font-bold">${selectedInvoice?.description}</p>
              <div class="divider"></div>
  
              <p>Date</p>
              <p class="font-bold">${selectedInvoice?.creaDate}</p>
              <div class="divider"></div>
  
              <p>Name</p>
              <p class="font-bold">${selectedInvoice?.Customername}</p>
            </div>
            <div class="column">
              <p>Adresse</p>
              <p class="font-bold">42 Rue de la Paix</p>
              <div class="divider"></div>
  
              <p>Contact de Client</p>
              <p class="font-bold">Marie Dupont</p>
              <div class="divider"></div>
  
              <p>Code Postal</p>
              <p class="font-bold">1202</p>
              <div class="divider"></div>
  
              <p>le Numero de client</p>
              <p class="font-bold">987654321</p>
              <div class="divider"></div>
  
              <p>Ville</p>
              <p class="font-bold">Geneva</p>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.open()
    printWindow.document.write(printableContent)
    printWindow.document.close()

    printWindow.print()
  }

  const save = () => {
    dispatch(createOrUpdateInvoice()).then((res) => {
      if (res.payload) {
        dispatch(fetchInvoices())
      }
    })
  }
  const footer = (
    <ButtonComponent onClick={handleChange} className={'w-27rem flex  justify-content-center'}>
      Update
    </ButtonComponent>
  )

  const imageTemplate = (rowData) => (
    <img
      src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
      alt='EngineImage'
      width='60'
      height='60'
      className='image-preview rounded'
      preview 
    />
  )

  const columns = [
    {
      header: 'SLarticles_image',
      olang: 'image',
      field: null,
      body: imageTemplate,
    },
    {
      header: 'Label',
      olang: 'label',
      field: 'Label',
    },
    {
      header: 'Quantity',
      olang: 'Quantity',
      field: 'Quantity',
    },
    {
      header: 'Quantity Used',
      olang: 'Quantity.used',
      field: 'QuantityUsed',
    },
    {
      header: 'Create Date',
      olang: 'create.date',
      field: 'creaDate',
    },
  ]

  const exportFields = [
    {label: 'SLarticles_image', column: 'SLarticles_image'},
    {label: 'SLarticles_label', column: 'SLarticles_label'},
    {label: 'CAB', column: 'CAB'},
    {label: 'SLarticles_quantity', column: 'SLarticles_quantity'},
    {label: 'SLarticles_price', column: 'SLarticles_price'},
    {label: 'SLarticles_tva', column: 'SLarticles_tva'},
    {label: 'SLarticles_remise', column: 'SLarticles_remise'},
    {label: 'SLarticles_htPrice', column: 'SLarticles_htPrice'},
    {label: 'SLarticles_tvaPrice', column: 'SLarticles_tvaPrice'},
    {label: 'SLarticles_ttcPrice', column: 'SLarticles_ttcPrice'},
  ]

  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.code} />,
  }

  const handlePdf = () => {
    dispatch(fetchPdf(selectedInvoice?.id)).then((res) => {
      if (res.payload) {
        const pdfUrl = `${API_BASE_URL_IMAGE}file/${selectedInvoice?.id}/Bon_Invoice.pdf`
        const a = document.createElement('a')
        a.href = pdfUrl
        a.download = 'Bon_Invoice.pdf'
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.click()
      }
    })
  }

  useEffect(() => {
    if (selectedInvoice == null) {
      dispatch(setDetailInvoice(true))
    } else {
      try {
        const parseInvoiceArticle = JSON.parse(selectedInvoice?.Articles)
        setInvoiceArticle(parseInvoiceArticle)
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    }
  }, [selectedInvoice])


  return (
    <>
      <InvoiceEditor />
      <div class='card'>
        <div className='mt-3 flex align-items-center justify-content-between my-2'>
          <div>
            <ButtonComponent onClick={() => dispatch(setDetailInvoice(true))}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2 text-base font-semibold'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
            <Button
              type='button'
              icon='pi pi-file-pdf'
              label='PDF'
              className='p-button-outlined ml-2 text-red-500'
              onClick={handlePdf}
            />
          </div>
          <div className='bg-primary w-3 flex align-items-center justify-content-center text-xl'>
            <strong className=' text-white p-2'>
              <OlangItem olang='Reference.' />
              {selectedInvoice?.reference}
            </strong>
          </div>
        </div>
      </div>

      <Accordion multiple activeIndex={[0]}>
        <AccordionTab
          header={
            <div className='flex align-items-center'>
              <i className='pi pi-bars mr-2'></i>
              <span className='vertical-align-middle'>
                <OlangItem olang='invoice.informations' />
              </span>
            </div>
          }
        >
          <div className='flex align-items-center justify-content-between text-gray-900 m-2 px-5 py-3 border-round'>
            <Card
              title={<OlangItem olang='invoice.informations' />}
              className='w-30rem'
              footer={footer}
              style={{boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'}}
            >
              <div className='flex align-items-center justify-content-between m-3'>
                <p className='text-base'>
                  <OlangItem olang='Reference' />
                </p>
                <p className='text-lg font-bold'>{selectedInvoice?.reference}</p>
              </div>
              <Divider />

              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Description' />
                </p>
                <p className='text-lg font-bold'>{selectedInvoice?.description}</p>
              </div>
              <Divider />

              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Date' />
                </p>
                <p className='text-lg font-bold'>{selectedInvoice?.creaDate}</p>
              </div>
              <Divider />

              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Name' />
                </p>
                <p className='text-lg font-bold'>{selectedInvoice?.Customername}</p>
              </div>
            </Card>
            <Card
              title={<OlangItem olang='quote.addresses' />}
              style={{boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', width: '60%'}}
            >
              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Adresse' />
                </p>
                <p className='text-lg font-bold'>42 Rue de la Paix</p>
              </div>
              <Divider />
              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Contact.de.Client' />
                </p>
                <p className='text-lg font-bold'>Marie Dupont</p>
              </div>
              <Divider />
              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Contact.de.Client' />
                </p>
                <p className='text-lg font-bold'>1202</p>
              </div>
              <Divider />
              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='le.Numero.de.client' />
                </p>
                <p className='text-lg font-bold'>987654321</p>
              </div>
              <Divider />
              <div className='flex align-items-center justify-content-between m-2'>
                <p className='text-base'>
                  <OlangItem olang='Ville' />
                </p>
                <p className='text-lg font-bold'>Geneva</p>
              </div>
            </Card>
          </div>
        </AccordionTab>
      </Accordion>
      <TabView>
        <TabPanel header='invoice Detail'>
          <DatatableComponent
            tableId='invoiceDetail-table'
            data={invoiceArticle || []}
            columns={columns}
            exportFields={exportFields}
            rowGroupTemplates={rowGroupTemplates}
          />
        </TabPanel>
      </TabView>
    </>
  )
}

export default InvoiceDetail
