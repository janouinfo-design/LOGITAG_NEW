import React, { useEffect, useMemo, useState } from 'react'
import { DatatableComponent } from '../../../shared/DatatableComponent/DataTableComponent'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { fetchEnginCountByLocation, getEnginCountByLocation } from '../../../Dashboard/slice/dashboard.slice'
import { Badge } from 'primereact/badge'
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Calendar } from 'primereact/calendar'
import { Chip } from 'primereact/chip'
import moment from 'moment'

const locationsType = [
  {label: 'Tout' , value: ''},
  {label: 'Dépot' , value: 'deposit'},
  {label: 'Client' , value: 'worksite'}
]
function CustomerDashboard() {
  const [filters ,setFilters] = useState({srcLocation: ''})
  const list = useAppSelector(getEnginCountByLocation)
  const dispatch = useAppDispatch()
  const [lastSeenFrom, setLastSeenFrom] = useState(null)
  const lastSeenDateRef = React.useRef(null)

  const countTemplate = (r)=>(
    <Badge value={r.engineCount || '-'} size="xlarge" severity="info"/>
  )

  const labelTemplate = (r)=>(
    <div className='flex gap-2 align-items-center text-xl'>
        <span className={`text-gray-500 text-2xl ${r?.locationType == 'worksite' ? 'pi pi-user' : 'pi pi-home'}`}></span>
        <strong className='text-gray-800 text-bo'>{r.locationName}</strong>
    </div>
  )

  const typeTemplate = (r)=>(
    <span>{r.locationType == 'deposit' ?'Dépot':'Client'}</span>
  )
  const exportFields = useMemo(()=> [
    {field: "locationName" , header:"Libélé"},
    {field: "locationType" , header:"Type"},
    {field: "engineCount" , header:"Nombre de bouteil"},
  ], []) 

  const columns = useMemo(()=> [
    {field: "locationName" , header:"Libélé" , body: labelTemplate},
    {field: "locationType" , header:"Type", body: typeTemplate},
    {field: "engineCount" , header:"Nombre de bouteil" , body: countTemplate},
  ], [])

  const getData = ()=>{
    let obj = {...filters}
    if(filters?.lastSeenFrom){
      obj.lastSeenFrom = moment(lastSeenFrom).utc().format('YYYY-MM-DD')
    }
    dispatch(fetchEnginCountByLocation(obj))

  }
  useEffect(()=>{
    getData()
  },[])
  return (
    <div>
      <div className='flex gap-3 justify-content-end'>
        <Calendar value={filters?.lastSeenFrom} 
                    placeholder='Vu depuis le'
                    className='p-0'
                    style={{minHeight: '35px'}}
                    onChange={ (e) => setFilters({...filters, LastSeenFrom: e.value})} 
                    />
        <Dropdown
          value={filters.srcLocation}
          options={locationsType}
          onChange={(e) => setFilters({...filters, srcLocation: e.value})}
          placeholder='Type'
        />
        <Button onClick={getData} size='small' severity='warning' icon="pi pi-filter" label='Filtrer'/>
      </div>
      <Divider />
      <DatatableComponent tableId="engin-per-customer" exportFields={exportFields} data={list} columns={columns} />
    </div>
  )
}

export default CustomerDashboard