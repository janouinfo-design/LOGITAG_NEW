import {Chip, Checkbox, Button} from 'primereact'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  fetchGeofencings,
  fetchListNavixyLink,
  getGeofences,
  getListGeoNavixyLink,
  getSelectedGeofenceIds,
  removeGeoSite,
  removeGeofencing,
  setSelectedGeofenceId,
  setSelectedGeofenceIds,
} from '../../../store/slices/geofencing.slice'
import {useEffect, useState, memo, useRef} from 'react'
import {
  fetchPointsGeo,
  getGeoData,
  getGeofencing,
  getHashs,
  getSelectedGeo,
  getUserAuth,
  setSelectedGeo,
} from '../../Navigxy/slice/navixy.slice'
import {InputText} from 'primereact/inputtext'
import {
  addGeoToSite,
  fetchGeoForSite,
  getGeoSite,
  getSelectedSite,
  setGeoSite,
  setLinkTo,
} from '../../Site/slice/site.slice'
import {
  getSelectedGeoClient,
  getSelectedSiteClient,
  setSelectedGeoClient,
} from '../../../store/slices/customer.slice'
import {ProgressSpinner} from 'primereact/progressspinner'

import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog'
import {Toast} from 'primereact/toast'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const GeofencingList = ({workST}) => {
  const list = useAppSelector(getGeofences)
  let listNavixy = useAppSelector(getGeoData)
  let hash = useAppSelector(getHashs)
  let selectedGeo = useAppSelector(getSelectedGeoClient)
  let listGeoNavixyLink = useAppSelector(getListGeoNavixyLink)
  const selectedWorSite = useAppSelector(getSelectedSiteClient)

  let geoWorkSite = useAppSelector(getGeoSite)
  const toast = useRef(null)




  const selectedIds = useAppSelector(getSelectedGeofenceIds)
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [allGeo, setAllGeo] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [ls, setLs] = useState()

  const [geoId, setGeoId] = useState(null)
  const [obj, setObjet] = useState({
    hash: '',
    geoId: null,
  })

  const dispatch = useAppDispatch()
  const onSelect = (val, id) => {
    if (val) dispatch(setSelectedGeofenceIds([...selectedIds, id]))
    else dispatch(setSelectedGeofenceIds(selectedIds?.filter((v) => v != id)))
  }

  const filter = (val) => {
    setFilterText(val)
  }

  const toggleSelectAll = (e) => {
    setIsSelectAll(e.checked)
    if (e.checked) dispatch(setSelectedGeofenceIds(list.map((o) => o.id)))
    else dispatch(setSelectedGeofenceIds([]))
  }

  const onLayerClicked = (o) => {
    if (o.idnavixy !== null) {
      dispatch(setSelectedGeoClient(o))
      setGeoId(+o?.idnavixy)
      setObjet({
        hash: hash,
        geoId: +o?.idnavixy,
      })
    } else {
      dispatch(setSelectedGeoClient(o))
      dispatch(setSelectedGeofenceId(o.id))
    }
  }

  const onLinkClick = (o) => {
    // to know wish one i click
    dispatch(setSelectedGeoClient(o))
    setGeoId(o?.id)
    // just for fly in map for see geo
    setObjet({
      hash: hash,
      geoId: o?.id,
    })
    // dispatch(addGeoToSite({id: o.id, site: selectedWorSite}))
    dispatch(setLinkTo(true))
  }

  const removeRelation = (e) => {
    dispatch(removeGeoSite(e)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(setGeoSite([]))
        setAllGeo(list)
      }
    })
  }

  const removeGeofences = () => {
    setIsLoading(true)
    dispatch(removeGeofencing(selectedIds)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchGeofencings())
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    dispatch(getGeofencing(hash))
    dispatch(fetchListNavixyLink())
  }, [])

  useEffect(() => {
    let ids = list.map((o) => o.id)
    dispatch(setSelectedGeofenceIds(selectedIds?.filter((k) => ids.includes(k))))
  }, [])

  useEffect(() => {
    if (geoWorkSite.length === 0) {
      setAllGeo(list)
    } else {
      setAllGeo(geoWorkSite)
    }
  }, [geoWorkSite])


  const handleDelete = (data) => {
    removeRelation(data)
  }

  const accept = () => {
    toast.current.show({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'You have accepted',
      life: 3000,
    })
  }

  const reject = () => {
    toast.current.show({
      severity: 'warn',
      summary: 'Rejected',
      detail: 'You have rejected',
      life: 3000,
    })
  }

  const confirm1 = (data) => () => {
    confirmDialog({
      message: <OlangItem olang='Do.you.wanna.remove.relation' />,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => handleDelete(data), // Passing data to handleDelete
    })
  }

  useEffect(() => {
    dispatch(fetchPointsGeo(obj))
  }, [selectedGeo])

  return (
    <>
      {isLoading ? (
        <ProgressSpinner
          style={{width: '50px', height: '50px', margin: 'auto', display: 'block'}}
        />
      ) : list.length == 0 ? (
        <strong className='text-muted'>
          <OlangItem olang='No.Geofence' />
        </strong>
      ) : (
        <div>
          <Toast ref={toast} />
          <ConfirmDialog />
          {allGeo.length > 1 && (
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
          )}
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
          <div
            className='flex flex-column align-items-center'
            style={{maxHeight: '50vh', overflow: 'auto'}}
          >
            {allGeo.length > 0 &&
              allGeo?.map((o) => (
                <div
                  className='border-bottom flex w-full p-2 align-content-center justify-content-between hover:bg-gray-100 cursor-pointer'
                  onClick={() => onLayerClicked(o)}
                >
                  <div className=' flex gap-2'>
                    <div
                      className={`font-bold ${
                        o.idnavixy !== null ? 'text-primary' : 'text-red-700'
                      }`}
                    >
                      {o.idnavixy !== null ? 'N' : 'L'}
                    </div>
                    <div style={{width: '100%'}}>
                      <h5 className='w-full'>{o.label}</h5>
                      <p>{o.description}</p>
                      {'idnavixy' in o ? null : (
                        <div className='flex gap-1 flex-wrap'>
                          {(o.tags || '').split('|').map((t) => (
                            <strong>#{t}</strong>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {allGeo.length === 1 && (
                    <div className='flex justify-content-center w-2rem align-items-center text-red-600'>
                      <i
                        className='pi pi-times flex p-2 w-full justify-content-center align-content-center border-circle hover:bg-red-200'
                        onClick={confirm1(o)}
                      />
                    </div>
                  )}

                  {allGeo.length > 1 && (
                    <div className='flex justify-content-end align-items-center w-full '>
                      <i className='pi pi-check-circle mr-3' onClick={() => onLinkClick(o)}></i>
                      <Checkbox
                        onChange={(e) => onSelect(e.checked, o.id)}
                        checked={selectedIds.includes(o.id)}
                      />
                    </div>
                  )}
                </div>
              ))}
            {/* {geoListNavixy?.list
              ?.filter((o) => !filterText || new RegExp(filterText, 'gi').test(o.label))
              .map((o) => (
                <div
                  onClick={() => onLayerClickedNavixy(o)}
                  key={o.id}
                  className='border-bottom flex gap-2 p-2 justify-content-between hover:bg-gray-100 cursor-pointer'
                >
                  <div className='font-bold text-primary'>N</div>
                  <div className=' flex gap-2' style={{maxWidth: '90%'}}>
                    <div style={{width: '100%'}}>
                      <h5>{o.label}</h5>
                    </div>
                    <div>
                      <i className='pi pi-check-circle' onClick={() => onLinkClick(o)}></i>
                    </div>
                  </div>
                </div>
              ))} */}
          </div>
        </div>
      )}
    </>
  )
}

export default memo(GeofencingList)
