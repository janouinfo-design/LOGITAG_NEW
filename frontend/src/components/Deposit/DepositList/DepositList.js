import {memo, useEffect, useState} from 'react'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  fetchDeposits,
  getDeposits,
  removeDeposit,
  setEditDeposit,
  setSelectedDeposit,
} from '../../../store/slices/deposit.slice'
import {SplitButton} from 'primereact/splitbutton'
import {Chip} from 'primereact/chip'
import { OlangItem } from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import { FileUploadeComponent } from '../../shared/FileUploaderComponent/FileUploadeComponent'

const DepositList = () => {
  let deposits = useAppSelector(getDeposits)
  const dispatch = useAppDispatch()

  let actions = [
    {
      label: "Supprimerr",
      olang: "remove",
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(removeDeposit({id: e.item.data.id}))
      },
    },
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {
        dispatch(setSelectedDeposit(e.item.data))
        dispatch(setEditDeposit(true))
      },
    },
    {
      label: 'Desactiver',
      icon: 'pi pi-check text-blue-500',
      command: (e) => {
        // toast.current.show({severity: 'success', summary: "success", detail: "Supprimer avec success!!!"})
        // dispatch(setSelectedUser(e.item.data))
        // dispatch(setEditUser(true))
      },
    },
  ]

  const actionTemplate = (rowData) => {
    actions = actions.map((_i) => ({..._i, data: rowData}))
    return (
      <div>
        <SplitButton
          model={actions}
          className='p-button-help p-button-raised  p-button-outlined p-button-sm'
          icon='pi pi-cog'
        />
      </div>
    )
  }
  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      className={'text-white ' + (rowData?.active == 1 ? 'bg-green-500' : 'bg-red-500')}
    />
  )

  // columns with olang
  const columns = [
    {field: 'label', header: "Label" , olang: 'desposit.label'}, // specifing olang key
    {field: 'code' , olang:"deposit.code"}, // no header needed if olang key is specified
    {field: 'active', header: <OlangItem olang="status.active" />, body: activeTemplate}, // or can use OlangItem component directly for header
  ]

  const create = () => {
    dispatch(setEditDeposit(true))
    dispatch(setSelectedDeposit(null))
  }

  useEffect(() => {
    dispatch(fetchDeposits())
  }, [])

  const exportFields = [
    // { label: 'INTITULE', column: 'label' },
    {label: 'NOM', column: 'label'},
    {label: 'CODE', column: 'code'},
    {label: 'ACTIF', column: 'active'},
  ]

  const rowGroupTemplates = {
    label: (rowData) => <Chip label={rowData?.label} />,
    active: activeTemplate,
  }

  const onUploadFinished = (res)=>{
  }

  return (
    <div>
      <FileUploadeComponent onUploadFinished={onUploadFinished} uploadExtraInfo={{src: 'desposit' , srcID: 14 , desc: 'logo'}} uploadUrl={''} onUploadFinished={onUploadFinished}/>
      <DatatableComponent
        tableId='deposit-table'
        data={deposits}
        columns={columns}
        onNew={create}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        rowExpansionTemplate={(data) => <DatatableComponent data={deposits} columns={columns} />}
        contextMenuModel={actions}
        rowActions={actions}
        expanded={true}
      />
    </div>
  )
}

export default memo(DepositList)
