import {memo, useEffect, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchPointsGeo,
  getGeoData,
  getGeofencing,
  getHashs,
  getSelectedGeo,
  setSelectedGeo,
} from '../../../Navigxy/slice/navixy.slice'
import {setLinkTo} from '../../slice/site.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchGeofencings,
  getGeofences,
  getSelectedGeofenceIds,
  removeGeofencing,
  setSelectedGeofenceId,
  setSelectedGeofenceIds,
} from '../../../../store/slices/geofencing.slice'
import {Checkbox} from 'primereact/checkbox'
import {Button} from 'primereact/button'

function GeoList() {
  const [filterText, setFilterText] = useState('')
  const [filterList, setFilterList] = useState('')
  const [geoId, setGeoId] = useState(null)
  const [obj, setObjet] = useState({
    hash: '',
    geoId: null,
  })
  const [getFetch, setGetFetch] = useState(false)

  const dispatch = useAppDispatch()

  const selectedIds = useAppSelector(getSelectedGeofenceIds)
  let hash = useAppSelector(getHashs)
  let selectedGeo = useAppSelector(getSelectedGeo)
  const list = useAppSelector(getGeofences)
  let listNavixy = useAppSelector(getGeoData)

  const filter = (val) => {
    setFilterText(val)
  }

  const onLayerClicked = (o) => {
    dispatch(setSelectedGeo(o))
    setGeoId(o?.id)
    setObjet({
      hash: hash,
      geoId: o?.id,
    })
  }
  const onSelect = (val, id) => {
    if (val) dispatch(setSelectedGeofenceIds([...selectedIds, id]))
    else dispatch(setSelectedGeofenceIds(selectedIds?.filter((v) => v != id)))
  }
  const removeGeofences = () => {
    dispatch(removeGeofencing(selectedIds)).then(() => {
      dispatch(fetchGeofencings())
    })
  }

  const onLinkClick = (o) => {
    dispatch(setSelectedGeo(o))
    setGeoId(o?.id)
    setObjet({
      hash: hash,
      geoId: o?.id,
    })
    dispatch(setLinkTo(true))
  }
  useEffect(() => {
    dispatch(fetchGeofencings())
    // dispatch(getGeofencing())
  }, [])

  useEffect(() => {
    if (selectedGeo?.idnavixy !== null) {
      dispatch(fetchPointsGeo({hash: hash, geoId: +selectedGeo?.idnavixy}))
    }
  }, [selectedGeo])


  return (
    <div>
      {
        <div className='p-input-icon-left p-input-icon-right w-full'>
          <i className='pi pi-search' />
          <InputText
            className=' w-full'
            placeholder='Geofencing...'
            value={filterText}
            onChange={(e) => filter(e.target.value)}
          />
          <i className='pi pi-times-circle' onClick={() => setFilterText('')} />
        </div>
      }
      {selectedIds.length > 0 ? (
        <div className='border-bottom py-2 flex justify-content-end align-items-center'>
          <Button
            onClick={removeGeofences}
            rounded
            className='p-button-icon'
            icon='pi pi-trash'
            severity='danger'
          />
        </div>
      ) : null}
      <div className='' style={{maxHeight: '50vh', overflow: 'auto'}}>
        <div className='p-2 flex align-items-center justify-content-between'>
          <OlangItem olang='All.Geofences' />
          <div className='flex'>
            <div className='flex ml-3 font-bold text-2xl align-items-center text-primary'>
              N{' '}
              <Checkbox
                className='ml-2'
                onChange={(e) => setFilterList(e.value)}
                value={'navixy'}
                checked={filterList.includes('navixy')}
              ></Checkbox>
            </div>
            <div className='flex ml-3 font-bold text-2xl align-items-center text-red-600'>
              L{' '}
              <Checkbox
                className='ml-2'
                onChange={(e) => setFilterList(e.value)}
                value={'local'}
                checked={filterList.includes('local')}
              ></Checkbox>
            </div>
          </div>
        </div>
        {list
          ?.filter((o) => !filterText || new RegExp(filterText, 'gi').test(o.label))
          .filter((o) => !filterList || o?.geofenceType === filterList)
          .map((o) => (
            <div
              key={o?.id}
              className='border-bottom flex gap-2 p-2  justify-content-between hover:bg-gray-100 cursor-pointer'
              style={{borderLeft: `3px #${o.color} solid`}}
              onClick={() => onLayerClicked(o)}
            >
              <div className=' flex gap-2' style={{maxWidth: '90%'}}>
                <div style={{width: '100%'}} className='flex'>
                  <div
                    className={`font-bold text-lg mr-2 ${
                      o?.idnavixy !== null ? 'text-blue-600' : 'text-red-600'
                    } `}
                  >
                    {o?.idnavixy !== null ? 'N' : 'L'}
                  </div>
                  <h6>{o.label}</h6>
                </div>
              </div>
              {o?.idnavixy === null && (
                <div className='flex justify-content-end w-full'>
                  <Checkbox
                    onChange={(e) => onSelect(e.checked, o.id)}
                    checked={selectedIds.includes(o.id)}
                  />
                </div>
              )}
              {/* <div>
                <i className='pi pi-check-circle' onClick={() => onLinkClick(o)}></i>
              </div> */}
            </div>
          ))}
      </div>
    </div>
  )
}

export default memo(GeoList)
