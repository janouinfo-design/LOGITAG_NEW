import React from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {removeTagTeam} from '../../slice/team.slice'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {useAppDispatch} from '../../../../hooks'

const TeamTag = ({tagStaff, selectedTeam}) => {
  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: `${e.item.data?.code} voulez-vous vraiment supprimer ce tag?`,
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeTagTeam({objId: selectedTeam?.relationId}))
            },
          })
        )
      },
    },
  ]

  const addresseeTemplate = ({addressName}) => {
    return (
      <div>
        {addressName ? (
          <Chip
            label={addressName}
            className='w-11rem m-1 flex justify-content-center align-items-center'
          />
        ) : (
          'No address found.'
        )}
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

  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID.Tag',
    },
    {
      header: 'Creation Date',
      field: null,
      olang: 'Creation.Date',
      body: addresseeTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  return (
    <DatatableComponent
      tableId={'team-tag-table'}
      data={tagStaff}
      columns={columns}
      rowActions={actions}
      sortOrder={-1}
      sortField={'id'}
    />
  )
}

export default TeamTag
