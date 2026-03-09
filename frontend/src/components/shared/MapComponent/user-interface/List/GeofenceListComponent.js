import {Chip, Checkbox, Button, Badge} from 'primereact'
import {useAppDispatch, useAppSelector} from '../../../../../hooks'
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
  setSelectedGeoClient,
  getSelectedGeoClient,
} from '../../slice/geofencing.slice'
import {useEffect, useState, memo, useRef} from 'react'
import {
  fetchPointsGeo,
  getGeoData,
  getGeofencing,
  getHashs,
  getSelectedGeo,
  getUserAuth,
  setSelectedGeo,
} from '../../slice/navixy.slice'
import {InputText} from 'primereact/inputtext'
import {
  fetchSites,
  getGeoSite,
  getSites,
  setGeoSite,
  setLinkTo,
} from '../../../../Site/slice/site.slice'

// import {
//   getSelectedGeoClient,
//   getSelectedSiteClient,
//   setSelectedGeoClient,
// } from '../../../../../store/slices/customer.slice'
import {ProgressSpinner} from 'primereact/progressspinner'

import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog'
import {Toast} from 'primereact/toast'

import {OlangItem} from '../../../Olang/user-interface/OlangItem/OlangItem'
import {Divider} from 'primereact/divider'
const GeofenceListComponent = ({workST}) => {
  const list = useAppSelector(getSites)
  let hash = useAppSelector(getHashs)
  let selectedGeo = useAppSelector(getSelectedGeoClient)

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
    let ids = val ? [...selectedIds, id] : selectedIds?.filter((v) => v != id)
    dispatch(setSelectedGeofenceIds(ids))
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
    onSelect(!selectedIds?.includes(o.id), o.id)
    dispatch(setSelectedGeofenceId(o.id))
    dispatch(setSelectedGeoClient(o))
  }

  const onLinkClick = (o) => {
    dispatch(setSelectedGeoClient(o))
    setGeoId(o?.id)

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
    dispatch(getUserAuth())
    dispatch(fetchSites())
    dispatch(getGeofencing(hash))
    dispatch(fetchListNavixyLink())
  }, [])

  // useEffect(() => {
  //   let ids = list.map((o) => o.id)
  //   dispatch(setSelectedGeofenceIds(selectedIds?.filter((k) => ids.includes(k))))
  // }, [])

  useEffect(() => {
    const filter = list?.filter((o) => {
      return o?.geofence.length > 0
    })
    setAllGeo(filter)
  }, [list])

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
      accept: () => handleDelete(data),
    })
  }

  useEffect(() => {
    dispatch(fetchPointsGeo(obj))
  }, [selectedGeo])

  return (
    <div className='bg-white p-4'>
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
            <div className='p-input-icon-left p-input-icon-right w-full flex flex-row align-items-center gap-2'>
              <div>
                <Checkbox
                  onChange={(e) => toggleSelectAll(e)}
                  checked={isSelectAll}
                  className='mr-2'
                />
              </div>
              {/* <i className='pi pi-search' /> */}
              <div style={{width: '80%'}} className='relative'>
                <InputText
                  className=' w-full'
                  placeholder='Geofencing...'
                  value={filterText}
                  onChange={(e) => filter(e.target.value)}
                />
                {/* <i
                  className='pi pi-times-circle  absolute  right-2 cursor-pointer'
                  onClick={() => setFilterText('')}
                /> */}
              </div>
            </div>
          )}
          <Divider />
          {/* {selectedIds.length > 0 ? (
            <div className='border-bottom py-2 hidden justify-content-end align-items-center mt-2'>
              <Button
                onClick={removeGeofences}
                rounded
                className='p-button-icon'
                icon='pi pi-trash'
                severity='danger'
              />
            </div>
          ) : null} */}
          <div
            className='flex flex-column align-items-center gap-1'
            style={{maxHeight: '50vh', overflow: 'auto'}}
          >
            {Array.isArray(allGeo) &&
              allGeo.length > 0 &&
              allGeo
                ?.filter(
                  (f) =>
                    f?.label?.toUpperCase().includes(filterText.toUpperCase()) || filterText === ''
                )
                .map((o) => (
                  <div
                    style={{
                      backgroundColor: selectedIds.includes(o.id) ? 'rgba(82, 63, 141, 0.3)' : '',
                    }}
                    className='border-bottom flex w-full border-round-lg px-2  py-1 align-content-center justify-content-between hover:bg-gray-100 cursor-pointer'
                    onClick={() => {
                      onLayerClicked(o)
                    }}
                  >
                    {allGeo.length > 1 && (
                      <div className='flex justify-content-end align-items-center w-full '>
                        {/* <i className='pi pi-check-circle mr-3' onClick={() => onLinkClick(o)}></i> */}
                        <Checkbox
                          onChange={(e) => onSelect(e.checked, o.id)}
                          checked={selectedIds.includes(o.id)}
                        />
                      </div>
                    )}
                    <div className='flex align-items-center gap-2'>
                      {/* <div
                        className={`font-bold text-xl ${
                          o?.geofence[0]?.idnavixy !== 0 ? 'text-primary' : 'text-red-700'
                        }`}
                      >
                        {o?.geofence[0]?.idnavixy !== 0 ? 'N' : 'L'}
                      </div> */}
                      <div className=' p-2' style={{width: '250px'}}>
                        <h5
                          style={{
                            color: selectedGeo?.id == o?.id ? 'black' : '',
                          }}
                          className='w-full hover:text-900'
                        >
                          {o.label}
                        </h5>
                        <p
                          style={{
                            color: selectedGeo?.id == o?.id ? 'black' : '',
                          }}
                        >
                          Entré(s) sur site:
                          <Badge className='ms-1' value={o.quantity} />
                        </p>
                        {'idnavixy' in o ? null : (
                          <div className='flex gap-1 bg-red-500'>
                            {(o.tags || '').split('|').map((t) => (
                              <strong>{t}</strong>
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
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(GeofenceListComponent)
