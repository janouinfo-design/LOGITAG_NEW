import {Chip} from 'primereact/chip'
import React from 'react'
import {useAppSelector} from '../../../../hooks'
import {getListDetail, getListTagLogs} from '../../slice/logs.slice'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'

function TagListLog() {
  const list = useAppSelector(getListTagLogs)
  const info = useAppSelector(getListDetail)

  const addresseeTemplate = () => {
    return (
      <>
        {
          <div>
            {info[0]?.address ? (
              <Chip
                label={info[0]?.address}
                className='w-11rem m-1 flex justify-content-center align-items-center cursor-pointer'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }

  const familleTemplate = (rowData) => {
    return (
      <Chip
        label={rowData?.familleTag}
        icon={rowData?.icon}
        style={{background: rowData?.bgColorTag, color: 'white'}}
      />
    )
  }

  const worksiteTemplate = (rowData) => {
    const label = rowData?.locationObjectname ? rowData?.locationObjectname : 'No worksite found.'
    return (
      <Chip
        icon='pi pi-map'
        label={label}
        className='w-11rem m-1 font-semibold text-lg flex justify-content-center align-items-center cursor-pointer'
      />
    )
  }

  const columns = [
    {
      header: 'MacAddr',
      field: 'macAddr',
      olang: 'MacAddr',
      filter: true,
    },
    {
      header: 'Famille',
      field: 'famille',
      olang: 'Famille',
      body: familleTemplate,
    },
    {
      header: 'Address',
      olang: 'Address',
      body: addresseeTemplate,
    },
    {
      header: 'Worksite',
      olang: 'Worksite',
      body: worksiteTemplate,
    },
  ]

  return (
    <>
      <DatatableComponent
        tableId='Log-table-tag'
        data={list}
        columns={columns}
      />
    </>
  )
}

export default TagListLog
