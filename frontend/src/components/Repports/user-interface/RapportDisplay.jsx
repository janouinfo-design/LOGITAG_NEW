import React from 'react'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {useAppSelector} from '../../../hooks'
import {getDataRapport} from '../slice/rapports.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Button} from 'primereact/button'

const RapportDisplay = () => {
  const rapportList = useAppSelector(getDataRapport)


  const columns = [
    {
      header: 'Référence',
      field: 'reference',
      olang: 'Reference',
    },

    {
      header: 'start',
      field: 'start',
      olang: 'start',
    },
    {
      header: 'end',
      field: 'end',
      olang: 'end',
    },
    {
      header: 'Duration',
      field: 'DurationFormatted',
      olang: 'duration',
    },
    {
      header: 'workSite',
      field: 'Resource',
      olang: 'workSite',
    },
  ]

  const exportFields = [
    {label: 'Référence', column: 'reference'},
    {label: 'start', column: 'start'},
    {label: 'end', column: 'end'},
    {label: 'DurationFormatted', column: 'DurationFormatted'},
    {label: 'Resource', column: 'Resource'},
  ]

  return (
    <div className='w-full pl-5'>
      <div className='w-full text-2xl font-bold text-700 text-center p-2 '>
        {rapportList[0]?.title || <OlangItem olang='Rapport.list' />}
      </div>
      <DatatableComponent
        tableId='rapport-table'
        data={rapportList}
        columns={columns}
        //   onNew={create}
        // exportFields={exportFields}
        //   rowGroupTemplates={rowGroupTemplates}
        //   allowedGroupFields={allowedGroupFields}
        //   rowActions={actions}
        // onlyExcel={true}
      />
    </div>
  )
}

export default RapportDisplay
