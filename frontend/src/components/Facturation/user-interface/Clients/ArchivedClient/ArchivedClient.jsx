import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../../hooks'
import {
  fetchArchivedClient,
  fetchCustomersFac,
  getArchivedClient,
  getClientFac,
  getSelectedClientGl,
  setSelectedClientGl,
  setVisibelArchivedCl,
} from '../../../slice/facturation.slice'
import {fetchCustomers, getCustomers} from '../../../../../store/slices/customer.slice'
import ButtonComponent from '../../../../shared/ButtonComponent/ButtonComponent'
import {Chip} from 'primereact/chip'
import {OlangItem} from '../../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Dropdown} from 'primereact/dropdown'
import {DatatableComponent} from '../../../../shared/DatatableComponent/DataTableComponent'
import {Divider} from 'primereact/divider'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../../../../ui/Card'
import {Calendar} from 'primereact/calendar'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import moment from 'moment'
import {
  fetchDetailFacture,
  setLoadingPdfRows,
} from '../../../../FacturesList/slice/factureListSlice'
import {generateCrtPdfFac} from '../../../slice/elementFacturable.slice'

const ArchivedClient = () => {
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [filterDate, setFilterDate] = useState(new Date())
  const [txtFilter, setTxtFilter] = useState('')
  const [listData, setListData] = useState([])
  const selectedClientGb = useAppSelector(getSelectedClientGl)
  const listArchived = useAppSelector(getArchivedClient)
  const listClient = useAppSelector(getClientFac)

  const dispatch = useAppDispatch()

  const onClickPdfCrt = async (rowData) => {
    dispatch(setLoadingPdfRows([rowData?.id]))
    let obj = {
      id: rowData?.id,
      src: 'invoice',
      fileType: 'pdf',
    }
    const {payload} = await dispatch(generateCrtPdfFac(obj))
  }

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data?.id)).then(({payload}) => {
          if (payload) {
            dispatch(setVisibelArchivedCl(true))
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
  ]

  const displayPdf = (rowData) => {
    return (
      <ButtonComponent
        label='PDF'
        icon='pi pi-file-pdf'
        className='p-button-danger p-button-sm rounded-3xl'
        // loading={loadingPdfRows?.includes(rowData?.id)}
        // disabled={loadingPdfRows?.length > 0}
        // onClick={() => onClickPdfCrt(rowData)}
      />
    )
  }

  const onChangeDropdown = (value) => {
    dispatch(setSelectedClientGl(value))
  }

  const columns = [
    {
      field: 'reference',
      header: 'Reference',
      olang: 'Reference',
      filter: true,
      body: (rowData) => <strong className='text-lg'>{rowData?.reference}</strong>,
    },
    {
      field: 'creaDate',
      header: 'creaDate',
      olang: 'creaDate',
      // body: displayDate,
      body: (rowData) => <Chip label={rowData?.creaDate} />,
      // filter: true,
      // showFilterMenu: false,
      // filterElement: dateFilterCrea,
    },
    {
      header: 'OrderDate',
      field: 'OrderDate',
      olang: 'OrderDate',
      body: (rowData) => <Chip label={rowData?.OrderDate} />,
      // filterElement: dateFilterOrder,
      // filter: true,
      // showFilterMenu: false,
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
    },
    {field: 'remarque', header: 'remarque', olang: 'remarque'},
    // {field: 'Pdf', header: 'Pdf', body: displayPdf},
  ]

  const onChangeTxtFilter = (e) => {
    setTxtFilter(e.target.value)
    if (e.target.value && Array.isArray(listArchived)) {
      let txt = e.target.value.toLowerCase()
      const filtered = listArchived?.filter((item) => item?.reference?.toLowerCase().includes(txt))
      setListData(filtered)
    }
    if (!e.target.value) {
      setListData(listArchived)
    }
  }

  const fetchListFacture = async () => {
    setLoadingSearchCustomer(true)
    await dispatch(
      fetchArchivedClient({ID: selectedClientGb, year: moment(filterDate).format('YYYY')})
    ).then(({payload}) => {
      setListData(payload)
    })
    setLoadingSearchCustomer(false)
  }

  useEffect(() => {
    dispatch(fetchCustomersFac())
    if (!selectedClientGb) return
    fetchListFacture()
  }, [selectedClientGb])

  return (
    <>
      {/* <div className='card bg-gray-100 mt-5'>
        <div className='text-xl text-gray-800 pl-4 py-2'>
          <OlangItem olang='Client' />
        </div>
        <div className='flex pl-3 pb-3'>
          <Dropdown
            placeholder='Selectionnez un client'
            className=' h-3rem w-22rem'
            value={selectedClientGb}
            filter
            optionValue='ClientID'
            optionLabel='Nom'
            options={listClient}
            onChange={(e) => dispatch(setSelectedClientGl(e.value))}
          />

          <ButtonComponent
            onClick={fetchListFacture}
            icon='pi pi-search'
            className='ml-3 h-3rem'
            loading={loadingSearchCustomer}
            disabled={!selectedClientGb || loadingSearchCustomer}
          />
        </div>
      </div>
      <Divider /> */}
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
                value={selectedClientGb}
                filter
                optionValue='ClientID'
                optionLabel='Nom'
                options={listClient}
                onChange={(e) => onChangeDropdown(e.value)}
                placeholder='Selectionner un fournisseur'
                className='text-lg font-semibold h-[3]'
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='N.Facture' />
              </label>
              <InputText onChange={onChangeTxtFilter} placeholder='ex: 123456' className='h-[3]' />
            </div>
            <div className='flex flex-col flex-[1/2]'>
              <Button
                className='h-16 flex rounded-3xl flex-row gap-2 items-center justify-center'
                icon='pi pi-search'
                onClick={fetchListFacture}
                loading={loadingSearchCustomer}
                disabled={!selectedClientGb || loadingSearchCustomer}
              >
                <OlangItem olang='Search' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Divider className='my-4' />
      <DatatableComponent
        rowActions={actions}
        tableId='archivedList-table-fr'
        data={listData}
        columns={columns}
      />
    </>
  )
}

export default ArchivedClient
