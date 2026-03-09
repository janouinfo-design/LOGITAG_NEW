import {Chip, Checkbox, Button} from 'primereact'
import {useAppDispatch, useAppSelector} from '../../../../../../hooks'
import {
  fetchListNavixyLink,
  getGeofencesSelectedDepot,
  getSelectedGeofenceIdsSelectedDepot,
  removeGeoDepot,
  removeGeofencing,
  setSelectedGeofenceIdsSelectedDepot,
} from '../../../../../shared/MapComponent/slice/geofencing.slice'
import {useEffect, useState, memo, useRef} from 'react'
import {
  fetchPointsGeo,
  getGeofencing,
  getHashSelectedDepot,
} from '../../../../../shared/MapComponent/slice/navixy.slice'
import {InputText} from 'primereact/inputtext'

import {ProgressSpinner} from 'primereact/progressspinner'

import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog'
import {Toast} from 'primereact/toast'
import * as turf from '@turf/turf'
import {OlangItem} from '../../../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {setAlertError, setAlertParams} from '../../../../../../store/slices/alert.slice'
import {getSelectedGeoClientSelectedSite} from '../../../../../../store/slices/customer.slice'
import {
  addGeoToDepot,
  fetchGeoForDepot,
  getGeoDepot,
  getSelectedDepot,
  setGeoDepotSelectedDepot,
} from '../../../../slice/depot.slice'
import {getAddresses} from '../../../../slice/addressDepot.slice'
import {fetchAllGeo} from '../../../../../Site/slice/site.slice'
const GeofenceListSelectedDepotComponent = (props) => {
  const list = useAppSelector(getGeofencesSelectedDepot)
  let hash = useAppSelector(getHashSelectedDepot)
  let selectedGeo = useAppSelector(getSelectedGeoClientSelectedSite)

  let geoWorkSite = useAppSelector(getGeoDepot)
  const toast = useRef(null)

  const selectedIds = useAppSelector(getSelectedGeofenceIdsSelectedDepot)
  const selectedLocation = useAppSelector(getAddresses)
  const selectedDepot = useAppSelector(getSelectedDepot)


  const [isSelectAll, setIsSelectAll] = useState(false)
  const [link, setLink] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [ls, setLs] = useState()

  const [geoId, setGeoId] = useState(null)
  const [obj, setObjet] = useState({
    hash: '',
    geoId: null,
  })

  const dispatch = useAppDispatch()
  const onSelect = (val, id) => {
    if (val) dispatch(setSelectedGeofenceIdsSelectedDepot([...selectedIds, id]))
    else dispatch(setSelectedGeofenceIdsSelectedDepot(selectedIds?.filter((v) => v != id)))
  }

  const filter = (val) => {
    setFilterText(val)
  }

  const toggleSelectAll = (e) => {
    setIsSelectAll(e.checked)
    if (e.checked) dispatch(setSelectedGeofenceIdsSelectedDepot(list.map((o) => o.id)))
    else dispatch(setSelectedGeofenceIdsSelectedDepot([]))
  }
  const isPointInsideCircle = (point, circleCenter, radius) => {
    // Convert coordinates to Point geometry
    const pointGeometry = turf.point([point.lng, point.lat])
    const circleCenterGeometry = turf.point([circleCenter.lng, circleCenter.lat])

    // Calculate distance between point and circle center
    const distance = turf.distance(circleCenterGeometry, pointGeometry, {units: 'meters'})

    // Check if the distance is less than or equal to the radius
    return distance <= radius
  }

  const onLayerClicked = (o) => {
    let pt = [selectedLocation?.[0].lat, selectedLocation?.[0].lng]
    pt = [parseFloat(pt[1].replace(/,/g, '.')), parseFloat(pt[0].replace(/,/g, '.'))]
    let point = turf.point([pt[1], pt[0]])
    let checkCondition = false
    if (o.idnavixy !== null && o.type === 'polygon') {
      let bnds = JSON.parse(o?.bounds)
      dispatch(fetchPointsGeo(+o.idnavixy)).then((res) => {
        let geoJsonFeatures = res?.payload?.list?.map((point) => [point.lat, point.lng])
        let lastPoint = [geoJsonFeatures[0][0], geoJsonFeatures[0][1]]
        geoJsonFeatures.push(lastPoint)
        let poly = turf.polygon([geoJsonFeatures])
        let check = turf.booleanPointInPolygon(point, poly)
        checkCondition = check
        let obj = {
          from: 'navixy',
          geometry: {
            type: 'Polygon',
            geometry: {
              type: 'Feature',
              coordinates: geoJsonFeatures,
            },
            properties: {},
          },
        }
        dispatch(setGeoDepotSelectedDepot(obj))
      })
      return checkCondition
    } else if (o.idnavixy !== null && o.type === 'circle') {
      let center = JSON.parse(o?.center)
      let radius = +o?.radius
      let obj = {
        from: 'navixy',
        geometry: {
          type: 'Circle',
          radius: radius,
          center: center,
        },
      }
      dispatch(setGeoDepotSelectedDepot(obj))
      return checkCondition
    } else {
      let geoJsonFeatures = o.geometry.geometry.coordinates[0].map((point) => [point[1], point[0]])
      let poly = turf.polygon([geoJsonFeatures])
      let check = turf.booleanPointInPolygon(point, poly)
      checkCondition = check
      dispatch(setGeoDepotSelectedDepot(o))
      return checkCondition
    }
  }

  const onLinkClick = (o) => {
    const link = onLayerClicked(o)
    if (link) {
      dispatch(
        setAlertParams({
          title: 'Confirmation',
          message: 'Are you sure you want to link this geofence?',
          acceptClassName: 'p-button-info',
          icon: 'pi pi-question-circle',
          visible: true,
          accept: () => {
            dispatch(addGeoToDepot(o))
          },
        })
      )
    } else {
      dispatch(
        setAlertError({
          visible: true,
          header: 'Error',
          message: 'This geofence in not match your address',
          icon: 'pi-ban',
          accept: () => {
            dispatch(setAlertError({visible: false}))
          },
        })
      )
    }
  }
  const removeRelation = (e) => {
    props.removeLayer()
    dispatch(removeGeoDepot(e)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchGeoForDepot(selectedDepot?.id || 0))
      }
    })
  }

  const removeGeofences = () => {
    setIsLoading(true)
    dispatch(removeGeofencing(selectedIds)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchGeoForDepot(selectedDepot[0]?.id || 0))
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    dispatch(getGeofencing(hash))
    dispatch(fetchListNavixyLink())
  }, [])

  useEffect(() => {
    let ids = list?.map((o) => o.id)
    dispatch(setSelectedGeofenceIdsSelectedDepot(selectedIds?.filter((k) => ids?.includes(k))))
  }, [])

  const handleDelete = (data) => {
    dispatch(setGeoDepotSelectedDepot([]))
    removeRelation(data)
    dispatch(fetchAllGeo())
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
      {Array.isArray(geoWorkSite) && geoWorkSite?.length > 0 && geoWorkSite[0]?.result !== '[]' ? (
        <div className='bg-white p-4'>
          {isLoading ? (
            <ProgressSpinner
              style={{width: '50px', height: '50px', margin: 'auto', display: 'block'}}
            />
          ) : list?.length === 0 ? (
            <strong className='text-muted'>
              <OlangItem olang='No.Geofence' />
            </strong>
          ) : (
            <div>
              <Toast ref={toast} />
              <ConfirmDialog />
              {Array.isArray(geoWorkSite) && geoWorkSite?.length > 1 && (
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
                {Array.isArray(geoWorkSite) &&
                  geoWorkSite?.length > 0 &&
                  geoWorkSite?.map((o) => (
                    <div
                      className='border-bottom flex w-full p-2 align-content-center justify-content-between hover:bg-gray-100 cursor-pointer'
                      onClick={() => props.onClickGeo(o)}
                      key={o.id}
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
                          <h5 className='w-full w-16rem p-2'>{o.label}</h5>
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
                      {geoWorkSite?.length === 1 && (
                        <div className='flex justify-content-center w-2rem align-items-center text-red-600'>
                          <i
                            className='pi pi-times flex p-2 w-full justify-content-center align-content-center border-circle hover:bg-red-200'
                            onClick={confirm1(o)}
                          />
                        </div>
                      )}

                      {Array.isArray(geoWorkSite) && geoWorkSite?.length > 1 && (
                        <div className='flex justify-content-end align-items-center w-full '>
                          <i className='pi pi-check-circle mr-3' onClick={() => onLinkClick(o)}></i>
                          <Checkbox
                            onChange={(e) => onSelect(e.checked, o.id)}
                            checked={selectedIds?.includes(o.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}

export default memo(GeofenceListSelectedDepotComponent)
