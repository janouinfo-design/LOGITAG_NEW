import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Divider} from 'primereact/divider'
import {getDetailFacFr} from '../../slice/factureFornisseur.slice'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

const DetailFactFr = () => {
  const dispatch = useAppDispatch()
  const facDetail = useAppSelector(getDetailFacFr)

  const onHideDetail = () => {}

  const columns = [
    {field: 'OTAdresse1', header: 'OTAdresse1', olang: 'OTAdresse1'},
    {field: 'OTDestinNom', header: 'OTDestinNom', olang: 'OTDestinNom'},
    {field: 'OTNoBL', header: 'OTNoBL', olang: 'OTNoBL'},
    {field: 'OTTel2', header: 'OTTel2', olang: 'OTTel2'},
    {field: 'np_livraison', header: 'np_livraison', olang: 'np_livraison'},
    {field: 'ville_livraison', header: 'ville_livraison', olang: 'ville_livraison'},
    // {field: 'PDF', header: 'PDF', olang: 'PDF', body: (rowData) => displayPdf(rowData)},
  ]

  return (
    <div>
      <div>
        <ButtonComponent
          label='Retour'
          icon='fas fa-solid fa-share fa-flip-horizontal'
          onClick={onHideDetail}
        />
      </div>
      <div className='flex flex-row mt-2 w-full bg-gray-300 p-4 border-round-2xl h-9rem align-items-center justify-content-between'>
        <div className='flex flex-column gap-2'>
          <div className='flex flex-row gap-2 align-items-center'>
            <div className='text-lg text-gray-600'>Reference: </div>
            <strong className='text-xl text-gray-800'>{facDetail?.reference || '_'}</strong>
          </div>
          <div className='flex flex-row gap-2 align-items-center'>
            <div className='text-lg text-gray-600'>Description: </div>
            <strong className='text-xl text-gray-800'>{facDetail?.description || '_'}</strong>
          </div>
        </div>
        <div
          className='border-round-2xl'
          style={{width: '5px', height: '100%', backgroundColor: 'white'}}
        />
        <div>
          <Chip
            style={{backgroundColor: '#3699ff', color: 'white'}}
            className=' w-6rem flex align-items-center justify-content-center'
            label='Crée'
            icon='fas fa-duotone fa-regular fa-pen-to-square'
            // template={content}
          />
        </div>
        <div
          className='border-round-2xl'
          style={{width: '5px', height: '100%', backgroundColor: 'white'}}
        />
        <div className='flex flex-column gap-2'>
          <div className='flex flex-row gap-2 align-items-center'>
            <div className='text-lg text-gray-600'>CreaDate: </div>
            <strong className='text-xl text-gray-800'>{facDetail?.creaDate || '_'}</strong>
          </div>
          <div className='flex flex-row gap-2 align-items-center'>
            <div className='text-lg text-gray-600'>OrderDate: </div>
            <strong className='text-xl text-gray-800'>{facDetail?.OrderDate || '_'}</strong>
          </div>
        </div>
      </div>
      <Divider />
      <DatatableComponent
        tableId={'facture-table-detail'}
        data={facDetail?.detailInvoice || []}
        columns={columns}
        actions={[]}
      />
    </div>
  )
}

export default DetailFactFr
