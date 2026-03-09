import {Divider} from 'primereact/divider'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Dropdown} from 'primereact/dropdown'
import {
  fetchArchivedFr,
  fetchListFr,
  getArchiveListFr,
  getListFr,
  getSelectedFrGlobal,
  setSelectedFrGlobal,
  setVisibleArchivedFr,
} from '../../slice/factureFornisseur.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {useEffect, useState} from 'react'
import {Chip} from 'primereact/chip'
import moment from 'moment'
import {Button} from 'primereact/button'
import HeaderChoose from '../../../ui/HeaderChoose'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../../../ui/Card'
import {Calendar} from 'primereact/calendar'
import {InputText} from 'primereact/inputtext'
import {fetchDetailFacture, setLoadingPdfRows} from '../../../FacturesList/slice/factureListSlice'
import {generateCrtPdfFac} from '../../../Facturation/slice/elementFacturable.slice'

const ArchivedFornisseur = () => {
  const [loadingSearchCustomer, setLoadingSearchCustomer] = useState(false)
  const [txtFilter, setTxtFilter] = useState('')
  const [filterDate, setFilterDate] = useState(new Date())
  const [listData, setListData] = useState([])
  const selectedFrGlobal = useAppSelector(getSelectedFrGlobal)
  const listArchived = useAppSelector(getArchiveListFr)
  const listFr = useAppSelector(getListFr)

  const dispatch = useAppDispatch()

  const displayPdf = (rowData) => {
    return (
      <ButtonComponent
        label='PDF'
        icon='pi pi-file-pdf'
        className='p-button-danger p-button-sm'
        // loading={loadingPdfRows?.includes(rowData?.id)}
        // disabled={loadingPdfRows?.length > 0}
        // onClick={() => onClickPdfCrt(rowData)}
      />
    )
  }

  const onChangeDropdown = (value) => {
    dispatch(setSelectedFrGlobal(value))
  }

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
      label: 'PDF',
      icon: 'pi pi-file-pdf text-red-500',
      command: (e) => {
        onClickPdfCrt(e.item.data)
      },
    },
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data?.id)).then(({payload}) => {
          if (payload) {
            dispatch(setVisibleArchivedFr(true))
          }
        })
      },
    },
  ]

  const columns = [
    // {
    //   field: 'export',
    //   header: 'export',
    //   olang: 'export',
    //   filter: true,
    //   body: (rowData) => <Button icon='fas fa-solid fa-file-export' />,
    //   width: '5rem',
    // },
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
    await dispatch(fetchArchivedFr({IDProvider: selectedFrGlobal})).then(({payload}) =>
      setListData(payload)
    )
    setLoadingSearchCustomer(false)
  }

  useEffect(() => {
    dispatch(fetchListFr())
    if (!selectedFrGlobal) return
    fetchListFacture()
  }, [])

  return (
    <>
      <Card className='bg-gradient-to-br rounded-3xl p-2 border-2 border-gray-300 from-white to-gray-50 mt-2'>
        <CardHeader>
          <CardTitle>
            <OlangItem olang='ArchivedFornisseur' />
          </CardTitle>
          <CardDescription className='text-base text-gray-500'>
            <OlangItem olang='descArchived' />
          </CardDescription>
        </CardHeader>
        <CardContent className='p-2'>
          <div className='flex flex-row gap-6 items-end justify-between'>
            <div className='flex flex-col flex-1'>
              <label className='text-xl font-semibold text-gray-800'>
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
              <label className='text-xl font-semibold text-gray-800'>
                <OlangItem olang='fournisseur' />
              </label>
              <Dropdown
                value={selectedFrGlobal}
                filter
                optionValue='id'
                optionLabel='name'
                options={listFr}
                onChange={(e) => onChangeDropdown(e.value)}
                placeholder='Selectionner un fournisseur'
                className='text-lg font-semibold h-[3]'
                onKeyDown={(e) => e.key === 'Enter' && fetchListFacture()}
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl font-semibold text-gray-800'>
                <OlangItem olang='reference.fct' />
              </label>
              <InputText
                onChange={onChangeTxtFilter}
                value={txtFilter}
                placeholder='ex: 123456'
                className='h-[3]'
              />
            </div>
            <div className='flex flex-col flex-[1/2]'>
              <Button
                className='h-16 flex rounded-3xl flex-row gap-2 items-center justify-center'
                icon='pi pi-search'
                onClick={fetchListFacture}
                loading={loadingSearchCustomer}
                disabled={!selectedFrGlobal || loadingSearchCustomer}
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

export default ArchivedFornisseur
