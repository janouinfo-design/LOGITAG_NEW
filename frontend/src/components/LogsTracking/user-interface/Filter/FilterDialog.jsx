import React, {useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Calendar} from 'primereact/calendar'
import {Dropdown} from 'primereact/dropdown'
import {MultiSelect} from 'primereact/multiselect'

const FilterDialog = () => {
  const [datetime24h, setDateTime24h] = useState(null)
  const [datetime24hEnd, setDateTime24hEnd] = useState(null)

  return (
    <DialogComponent>
      <div className='text-xl font-semibold'>
        <OlangItem olang='Date.Range' />
        {' :'}
      </div>
      <div
        style={{width: '100%'}}
        className='flex flex-row justify-content-between align-items-center mt-3 justify-content-end'
      >
        <div
          style={{width: '40%'}}
          className='flex flex-row align-items-center justify-content-end'
        >
          <div className='text-xl text-gray-800 mr-4 font-semibold'>
            <OlangItem olang='From' />:{' '}
          </div>
          <Calendar
            className='text-center text-lg w-9'
            id='calendar-24h'
            value={datetime24h}
            onChange={(e) => setDateTime24h(e.value)}
            showTime
            hourFormat='24'
            showIcon
          />
        </div>
        <div style={{width: '40%'}} className='flex flex-row align-items-center'>
          <div className='text-xl text-gray-800 mr-4 font-semibold'>
            <OlangItem olang='To' />:{' '}
          </div>
          <Calendar
            className='text-center text-lg w-9'
            id='calendar-24h'
            value={datetime24hEnd}
            onChange={(e) => setDateTime24hEnd(e.value)}
            showTime
            hourFormat='24'
            showIcon
          />
        </div>
      </div>
      <div style={{width: '80%'}} className='flex flex-column mt-4'>
        <div className='text-xl font-semibold mr-4'>
          <OlangItem olang='User' />
          {' :'}
        </div>
        <div className='ml-7'>
          <MultiSelect
            placeholder='Select User'
            options={['Client 1', 'Client 2', 'Client 3']}
            className='w-6'
            filter
          />
        </div>
      </div>
    </DialogComponent>
  )
}

export default FilterDialog
