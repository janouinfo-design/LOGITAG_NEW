import React, {useEffect, useState} from 'react'
import {fetchTrackerList, getTrackerList} from '../../../../Navigxy/slice/navixy.slice'
import {useAppDispatch, useAppSelector} from '../../../../../hooks'
import {Checkbox} from 'primereact/checkbox'
import {InputText} from 'primereact/inputtext'
import _ from 'lodash'
function NavixyVehiclesListComponent({onVehiclesSelected, onVehicleFiltered, onVehicleSelected}) {
  let navixyVehicules = useAppSelector(getTrackerList)
  let [list, setList] = useState([])
  let [filterText, setFilterText] = useState('')
  let [selectedVehicles, setSelectedVehicles] = useState([])
  let dispatch = useAppDispatch()

  let selectVehicle = (id) => {
    setSelectedVehicles((prev) => {
      let newData = _.cloneDeep(prev)
      if (!Array.isArray(prev)) newData = [id]
      if (prev.includes(id)) {
        newData = prev.filter((o) => o != id && id != 'all')
      } else {
        newData = [id, ...prev]
      }

      if (id != 'all' && !prev.includes(id) && typeof onVehicleSelected == 'function') {
        onVehicleSelected(list.find((o) => o.id == id))
      }
      return newData
    })
  }

  useEffect(() => {
    if (Array.isArray(navixyVehicules)) {
      let text = filterText
      if (typeof text != 'string') text = ''
      text = text.toLowerCase()
      let filter = navixyVehicules.filter(
        (o) =>
          o.label.toLowerCase().includes(text) ||
          (o.source?.device_id || '').toLowerCase().includes(text) ||
          (o.source?.phone || '').toLowerCase().includes(text)
      )
      let active = filter.filter((o) => o.state?.connection_status == 'active')
      let noactive = filter.filter((o) => o.state?.connection_status != 'active')
      filter = [...active, ...noactive]
      setList(filter)
      if (typeof onVehicleFiltered == 'function') onVehicleFiltered(filter)
    }
  }, [filterText, navixyVehicules])

  useEffect(() => {

    if (typeof onVehiclesSelected == 'function') {
      let data = []
      if (Array.isArray(selectedVehicles) && Array.isArray(navixyVehicules)) {
        if (selectedVehicles.includes('all')) data = _.cloneDeep(navixyVehicules)
        else {
          data = selectedVehicles.reduce((c, v) => {
            let vh = navixyVehicules.find((o) => o.id == v)
            if (vh) c.push(vh)
            return c
          }, [])
        }
      }
      onVehiclesSelected(data)
    }
  }, [selectedVehicles, navixyVehicules])

  useEffect(() => {
    dispatch(fetchTrackerList())
  }, [])

  return (
    <div className='bg-white' style={{width: '100%', maxHeight: '500px', overflow: 'auto'}}>
      {Array.isArray(list) && list?.length > 0 ? (
        <div className='relative'>
          <div
            className='sticky bg-white p-2 flex gap-2 align-items-center'
            style={{top: 0, zIndex: 2}}
          >
            <Checkbox
              checked={selectedVehicles.includes('all')}
              onChange={(e) => selectVehicle('all')}
            />
            <div className='p-input-icon-left p-input-icon-right w-full'>
              <i className='pi pi-search' />
              <InputText
                className=' w-full'
                placeholder='label,phone...'
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <i className='pi pi-times-circle' onClick={() => setFilterText('')} />
            </div>
          </div>
          <div className='p-2'>
            {list.map((o) => (
              <div
                onClick={(e) => selectVehicle(o.id)}
                className='cursor-pointer p-2 border-bottom-1 justify-content-between border-gray-100 flex align-items-center gap-3'
              >
                <Checkbox
                  checked={selectedVehicles.includes(o.id) || selectedVehicles.includes('all')}
                />
                <div className='flex flex-column w-10'>
                  <span>{o.label}</span>
                  <span className='text-sm text-gray-400 '>{o?.source?.device_id}</span>
                </div>
                <i
                  className={`pi pi-circle-on text-${
                    o.state?.connection_status == 'active' ? 'green' : 'orange'
                  }-500`}
                ></i>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='text-center p-3'>
          <strong className='text-xl text-gray-500'>Aucun vehicule trouvé</strong>
          <div className='text-gray-500 text-sm'>
            Verifier que vous avez un compte logitrak ou ajouter des vehicules depuis logitrak
          </div>
        </div>
      )}
    </div>
  )
}

export default NavixyVehiclesListComponent
