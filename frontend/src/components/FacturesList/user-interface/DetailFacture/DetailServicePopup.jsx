import {Dialog} from 'primereact/dialog'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getDetailFacture, getDetailService, setDetailService} from '../../slice/factureListSlice'
import {Button} from 'primereact/button'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {SplitButton} from 'primereact/splitbutton'

const DetailServicePopup = ({visible, onHide}) => {
  const detailService = useAppSelector(getDetailService)
  const facDetail = useAppSelector(getDetailFacture)
  const dispatch = useAppDispatch()


  const removeColumn = (rowData) => {
    dispatch(
      setAlertParams({
        visible: true,
        message: 'tu veux vraiment supprimer cette ligne?',
        confirm: () => {
          if (rowData?.OTID) {
            let newDetail = detailService?.filter((item) => item.OTID != rowData?.OTID)
            dispatch(setDetailService(newDetail))
            dispatch(setAlertParams({visible: false}))
            // onHide()
          }
        },
        reject: () => {
          onHide()
          dispatch(setAlertParams({visible: false}))
        },
      })
    )
  }

  const header = (
    <div className='text-lg text-gray-800'>
      <OlangItem olang='DetailService' />
    </div>
  )

  const goLink = (id) => {
    let link = 'http://tricolis.duperrex.ch/tricolis/Ajout/AfficherOTPlus/' + id
    window.open(link, '_blank')
  }

  let actions = [
    {
      label: 'Detail',
      icon: 'fas fa-light fa-up-right-from-square text-blue-500',
      command: (e) => {
        goLink(e.item.data.OTID)
      },
    },

    {
      label: 'Remove',
      icon: 'fas fa-duotone fa-solid fa-arrow-up-from-bracket text-red-500',
      command: (e) => {
        removeColumn(e.item.data)
      },
    },
  ]

  const templateDetail = (rowData) => {
    let newActions = [...actions]
    if (facDetail?.codeStatus === 'cloturer' || facDetail?.codeStatus === 'confirmed') {
      newActions = newActions.filter((action) => action.label !== 'Remove')
    }
    return (
      <div className='flex flex-row gap-2'>
        <SplitButton
          icon='pi pi-cog'
          model={newActions.map((action) => ({...action, data: rowData}))}
          severity='secondary'
          menuButtonProps={{
            icon: 'pi pi-chevron-down',
            className:
              'border-0  border-circle bg-gray-100 hover:bg-gray-300 text-gray-600 hover:text-gray-800',
          }}
          rounded
          buttonClassName='hidden'
          // onClick={() => splitAction(rowData)}
        />
      </div>
    )
  }

  const columns = [
    {
      field: 'setting',
      header: 'setting',
      olang: 'setting',
      body: templateDetail,
    },
    {field: 'OTNoBL', header: 'OTNoBL', olang: 'OTNoBL', filter: true},
    {field: 'produit', header: 'produit', olang: 'produit'},
    {field: 'TVA', header: 'TVA', olang: 'TVA'},
    {field: 'prix', header: 'prix', olang: 'prix'},
    {field: 'OTDestinNom', header: 'OTDestinNom', olang: 'OTDestinNom'},
    {field: 'OTID', header: 'OTID', olang: 'OTID', filter: true},
    {field: 'CoutPrestation', header: 'CoutPrestation', olang: 'CoutPrestationv'},
    {field: 'OTAdresse1', header: 'OTAdresse1', olang: 'OTAdresse1'},
  ]

  return (
    <Dialog
      position='bottom-right'
      header={header}
      visible={visible}
      style={{width: '80vw', height: '80vh'}}
      onHide={onHide}
    >
      <div className='mt-2'>
        <DatatableComponent
          tableId={'invoice-table-detail'}
          data={detailService}
          columns={columns}
          onlyBtnExport={true}
        />
      </div>
    </Dialog>
  )
}

export default DetailServicePopup
