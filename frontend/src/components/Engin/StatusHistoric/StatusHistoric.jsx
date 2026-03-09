import React, {useEffect, useRef, useState} from 'react'
import {Timeline} from 'primereact/timeline'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getSelectedEngine,
  getStatusList,
  getStatusListHistory,
  getStatusVisible,
  modifyStatus,
  setSelectedEngine,
  setStatusVisible,
} from '../slice/engin.slice'
import {ScrollPanel} from 'primereact/scrollpanel'
import {Dialog} from 'primereact/dialog'
import BaseMapLayerComponent from '../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import {FeatureGroup, MapContainer, Marker, useMapEvents} from 'react-leaflet'
import {getCompanyAddresses} from '../../Company/slice/company.slice'
import IconMap from '../../../assets/icons/marker.png'
import L from 'leaflet'
import {setToastParams} from '../../../store/slices/ui.slice'
import {Card} from 'primereact/card'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import RedMarker from '../../../assets/icons/redMarker (2).png'
import moment from 'moment'
import {Button} from 'primereact/button'
import {SpeedDial} from 'primereact/speeddial'
import {Dropdown} from 'primereact/dropdown'
import {useFormik} from 'formik'
import {getSites} from '../../Site/slice/site.slice'
import {Tag} from 'primereact/tag'
import * as turf from '@turf/turf'
import {formateDate} from '../../../cors/utils/formateDate'
import { Badge } from 'primereact/badge'
import LastSeenComponent from '../EnginDetail/LastSeenComponent'

const customIcon = new L.Icon({
  iconUrl: IconMap,
  iconSize: [60, 60],
})
const redIcon = new L.Icon({
  iconUrl: RedMarker,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
})

const StatusHistoric = () => {
  const [selectedSt, setSelectedSt] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [cardEnter, setCardEnter] = useState(false)

  const indexCard = useRef(0)

  const companyAddress = useAppSelector(getCompanyAddresses)

  const [center, setCenter] = useState([
    companyAddress?.[0]?.lat || 0,
    companyAddress?.[0]?.lng || 0,
  ])

  const [editStatus, setEditStatus] = useState(false)

  const refMap = useRef(null)
  const modifyRef = useRef(null)
  const editorRef = useRef(null)

  const visible = useAppSelector(getStatusVisible)
  const statusList = useAppSelector(getStatusListHistory)
  const selectedEng = useAppSelector(getSelectedEngine)
  const sites = useAppSelector(getSites)
  const enginStatus = useAppSelector(getStatusList)

  const [lastPosition, setLastPosition] = useState({
    lat: selectedEng?.position?.last_lat || 0,
    lng: selectedEng?.position?.last_lng || 0,
  })


  const [centerModify, setCenterModify] = useState([
    selectedEng?.last_lat || 0,
    selectedEng?.last_lng || 0,
  ])

  const dispatch = useAppDispatch()

  const events = [
    {
      status: 'Ordered',
      date: '15/10/2020 10:30',
      icon: 'pi pi-shopping-cart',
      color: '#9C27B0',
      image: 'game-controller.jpg',
    },
    {
      status: 'Processing',
      date: '15/10/2020 14:00',
      icon: 'pi pi-cog',
      color: '#673AB7',
    },
    {
      status: 'Shipped',
      date: '15/10/2020 16:15',
      icon: 'pi pi-shopping-cart',
      color: '#FF9800',
    },
    {
      status: 'Delivered',
      date: '16/10/2020 10:00',
      icon: 'pi pi-check',
      color: '#607D8B',
    },
    {
      status: 'Shipped',
      date: '15/10/2020 16:15',
      icon: 'pi pi-shopping-cart',
      color: '#FF9800',
    },
    {
      status: 'Delivered',
      date: '16/10/2020 10:00',
      icon: 'pi pi-check',
      color: '#607D8B',
    },
    {
      status: 'Shipped',
      date: '15/10/2020 16:15',
      icon: 'pi pi-shopping-cart',
      color: '#FF9800',
    },
    {
      status: 'Delivered',
      date: '16/10/2020 10:00',
      icon: 'pi pi-check',
      color: '#607D8B',
    },
    {
      status: 'Shipped',
      date: '15/10/2020 16:15',
      icon: 'pi pi-shopping-cart',
      color: '#FF9800',
    },
    {
      status: 'Delivered',
      date: '16/10/2020 10:00',
      icon: 'pi pi-check',
      color: '#607D8B',
    },
  ]

  const formik = useFormik({
    initialValues: {
      locationId: null,
      statusName: null,
    },

    onSubmit: (values) => {
      dispatch(modifyStatus({...values, centerModify})).then(({payload}) => {
        if (payload) {
          setEditStatus(false)
          formik.resetForm()
        }
      })
    },
  })

  const headerModify = (
    <div className='flex flex-row gap-2'>
      <strong className='text-700'>
        <OlangItem olang='Modify' />
      </strong>
      <i className='fa-duotone fa-solid fa-pencil text-blue-500 text-lg'></i>
    </div>
  )
  const headerCard = (
    <div className='flex flex-row gap-2'>
      <i class='fa-duotone fa-solid fa-user text-xl'></i>
      <span className='text-700'>{selectedEng?.reference}</span>
    </div>
  )

  const customizedMarker = (item) => {
    return (
      <span
        className='flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1'
        style={{backgroundColor: item.statusBgColor}}
      >
        <i className={item.statusIcon + ' text-white'}></i>
      </span>
    )
  }

  const items = [
    {
      label: 'Modify',
      icon: 'pi pi-pencil',
      command: (e) => {
        setEditStatus(true)
      },
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => {
      },
    },
  ]

  const onChangeSite = (e) => {
    formik.setFieldValue('locationId', e.value)
    const findSite = sites.find((site) => site.id == e.value)
    if (findSite) {
      const geofence = findSite.geofence?.[0]
      const geometry = geofence?.geometry
      if (geometry?.type !== 'Feature') return
      const coordinates = geometry?.geometry?.coordinates
      if (!coordinates) return
      const centerGeo = turf.centerOfMass(geometry)
      modifyRef.current.setView(centerGeo.geometry.coordinates.reverse(), 19)
    }
  }

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const {lat, lng} = e.latlng
        setCenterModify([lat, lng])
        modifyRef.current.setView([lat, lng], 20)
      },
    })
    return null // No component rendered
  }

  const customizedContent = (item) => {
    return (
      <Card
        onClick={() => goToPosition(item)}
        // style={{borderColor: item.statusBgColor}}
        onMouseEnter={() => {
          indexCard.current = item.uid
          setCardEnter(true)
        }}
        onMouseLeave={() => {
          setCardEnter(false)
          indexCard.current = null
        }}
        className='cursor-pointer hover:bg-blue-100 shadow-2 relative'
      >
        <div className='flex flex-column gap-2'>
          <div className='flex flex-row align-items-center gap-2'>
            <i
              className={`fa-duotone ${
                item?.mode === 'gps'
                  ? 'fa-location-crosshairs'
                  : item?.mode === 'GATEWAY'
                  ? 'fa-signal-stream'
                  : 'fa-duotone fa-solid fa-user'
              } text-xl`}
            ></i>
            <div  className=' text-gray-6 flex gap-1 align-items-center'>
              <strong className='text-lg'>{item?.mac}</strong>
              {item?.rssi && <Badge title="force du signal" value={item?.rssi} severity="warning"></Badge>}
            </div>
            
            {/* <strong className='text-lg'>{item?.mac}</strong>
            <strong className='text-lg'>{item?.rssi}</strong> */}
          </div>
          <div className='flex flex-row gap-2 align-items-center'>
            <i
              // style={{color: item.statusBgColor}}
              className={`fas fa-solid ${item?.icon} text-lg text-blue-400`}
            ></i>
            <div className='text-lg text-800 font-semibold'>{item?.srcLocationLabel}</div>
          </div>
          <div className='flex flex-row gap-2 align-items-center'>
            <i
              style={{color: item.statusBgColor}}
              className={`fas fa-solid ${item.statusIcon} text-lg`}
            ></i>
            <div className='text-lg text-800 font-semibold'>{item.label}</div>
          </div>
          <div className='flex flex-row gap-2 align-items-center'>
            <i class='fa-duotone fa-solid fa-location-dot text-xl text-blue-500'></i>
            <div className='text-lg text-800 font-semibold'>
              {item?.enginAddress || 'No location'}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const dateFormatted = (data) => {
    return  <LastSeenComponent data={data} />
    if (!data?.lastSeenAt || typeof data?.lastSeenAt != 'string') return '_'
    if (data?.lastSeenAt.includes('+')) return moment(data?.lastSeenAt).format('DD/MM/YYYY HH:mm')
    return moment.utc(data?.lastSeenAt).format('DD/MM/YYYY HH:mm')
  }

  const onCancelStatus = () => {
    setEditStatus(false)
    formik.resetForm()
  }

  const footerEdit = () => {
    return (
      <div className='flex flex-row justify-content-end gap-2'>
        <Button
          label='Cancel'
          icon='pi pi-times'
          className='p-button-danger'
          onClick={onCancelStatus}
        />
        <Button
          onClick={formik.submitForm}
          label='Save'
          icon='pi pi-check'
          className='p-button-success'
        />
      </div>
    )
  }

  const selectedTemplate = (option, props) => {
    if (option) {
      return (
        <Tag
          className='cursor-pointer gap-2'
          value={option?.label}
          style={{background: option?.backgroundColor}}
          icon={option?.icon}
        />
      )
    }

    return <span>{props.placeholder}</span>
  }

  const onAddStatus = () => {
    setEditStatus(true)
    setCenterModify([selectedEng?.last_lat, selectedEng?.last_lng])
    modifyRef.current.setView([selectedEng?.last_lat, selectedEng?.last_lng], 20)
  }

  const dialogHeader = () => {
    return (
      <div className='flex flex-row justify-content-between align-items-center mx-3'>
        <div className='flex flex-row gap-3 align-items-center'>
          <strong className='text-2xl font-semibold'>
            {selectedEng?.reference || selectedEng?.label}
          </strong>
          <Button
            label={<OlangItem olang='add' />}
            icon='pi pi-pencil'
            className='p-button-success'
            onClick={onAddStatus}
          />
        </div>
        <div
          style={{width: '30%'}}
          className='flex flex-row justify-content-end align-items-center'
        >
          <div
            onClick={handleLastSeen}
            style={{width: '100%'}}
            className='flex flex-row shadow-2 p-ripple justify-content-between cursor-pointer align-items-center bg-white border-round-xl border-2 border-gray-300 h-6rem px-3 rounded-lg'
          >
            <div className='flex flex-row align-items-center gap-2'>
              <i className='fa-solid fa-eye text-2xl text-blue-500'></i>
              <div>
                {/* <OlangItem olang='Last.Seen' />: */}
              </div>
              <strong>{dateFormatted(selectedEng)}</strong>
            </div>
            <i className='fas fa-solid fa-location-dot text-2xl text-red-500 ml-2'></i>
          </div>
        </div>
      </div>
    )
  }

  const handleLastSeen = () => {
    if (selectedEng?.last_lat == 0 || selectedEng?.last_lng == null) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERREUR',
          detail: 'Erreur de position',
          position: 'top-right',
        })
      )
      return
    }
    if (!refMap.current) return
    const currentZoom = refMap.current.getZoom()
    refMap.current.setView([selectedEng.last_lat, selectedEng.last_lng], currentZoom)
    setLastPosition({lat: selectedEng.last_lat, lng: selectedEng.last_lng})
  }

  const goToPosition = (item, index) => {
    if (editorRef.current) editorRef.current.clearLayers()
    setSelectedSt(index)
    if (item?.lat == 0 || item.lat == -1) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'WARNING',
          detail: 'No Location Found',
          position: 'top-right',
        })
      )
      return
    }
    if (refMap.current && item?.lat) {
      const getZoom = refMap.current.getZoom()
      setCenter([item?.lat, item?.lng])
      refMap.current.setView([item?.lat, item?.lng], getZoom)
    }
    if (Object.keys(item?.geofence?.[0]?.geometry).length > 0) {
      const geometry = item?.geofence?.[0]?.geometry
      const coordinates = geometry?.geometry?.coordinates
      if (!coordinates) return
      const layer = L.geoJSON(geometry, {color: 'red', weight: 0.7, id: item?.id})
      editorRef.current.addLayer(layer)
      // refMap.current.setView(coordinates.reverse(), 19)
    }
  }

  const onHide = () => {
    dispatch(setSelectedEngine(null))
    dispatch(setStatusVisible(false))
  }

  useEffect(() => {
    const timeId = setTimeout(() => {
      if (refMap.current && selectedEng?.last_lat) {
        setCenter([selectedEng.last_lat, selectedEng.last_lng])
        refMap.current.setView([selectedEng.last_lat, selectedEng.last_lng], 18)
      }
    }, 300)

    return () => {
      clearTimeout(timeId)
    }
  }, [statusList])

  return (
    <>
      <Dialog
        position='bottom-right'
        style={{width: '80vw', height: '89vh', backgroundColor: 'red'}}
        visible={visible}
        header={dialogHeader}
        onHide={onHide}
      >
        <Dialog
          header={headerModify}
          position='center'
          style={{width: '50vw'}}
          visible={editStatus}
          footer={footerEdit}
          onHide={() => setEditStatus(false)}
        >
          <div className='flex flex-row gap-2'>
            <div className='w-6 flex flex-column gap-4'>
              <labe className='text-2xl font-semibold'>
                <OlangItem olang='site' />
              </labe>
              <Dropdown
                name='locationId'
                value={formik.values.locationId}
                options={sites}
                className='w-11 h-4rem'
                optionLabel='label'
                optionValue='id'
                placeholder='Select Site'
                onChange={onChangeSite}
                filter
              />
              <labe className='text-2xl font-semibold'>
                <OlangItem olang='status' />
              </labe>
              <Dropdown
                name='statusName'
                value={formik.values.statusName}
                options={enginStatus}
                className='w-11 h-4rem'
                optionLabel='label'
                optionValue='name'
                placeholder='Select Status'
                valueTemplate={selectedTemplate}
                itemTemplate={selectedTemplate}
                onChange={formik.handleChange}
              />
            </div>
            <div style={{width: '50%'}}>
              <MapContainer
                zoomControl={true}
                scrollWheelZoom={true}
                zoom={18}
                ref={modifyRef}
                center={centerModify}
                style={{with: '100%', height: '50vh', zIndex: 5}}
              >
                <BaseMapLayerComponent top={10} right={15} />
                <MapClickHandler />
                {centerModify && <Marker position={centerModify} icon={customIcon}></Marker>}
              </MapContainer>
            </div>
          </div>
        </Dialog>
        <div style={{width: '100%'}} className='flex flex-row gap-2'>
          <ScrollPanel
            className='bg-gray-100 pt-3'
            style={{width: '55%', height: '80vh', overflow: 'hidden'}}
          >
            <Timeline
              value={statusList}
              align='alternate'
              className='customized-timeline'
              marker={customizedMarker}
              content={customizedContent}
              opposite={(item) => (
                <div
                  className='py-2 px-3 border-round-xl'
                  style={{
                    backgroundColor: indexCard.current === item.uid ? item.statusBgColor : '',
                  }}
                >
                  <strong
                    style={{color: indexCard.current === item.uid ? 'white' : ''}}
                    className='text-2xl font-bold my-3'
                  >
                    {formateDate(item?.satDate)}
                  </strong>
                </div>
              )}
            />
          </ScrollPanel>
          <div style={{width: '45%'}}>
            <MapContainer
              zoomControl={true}
              scrollWheelZoom={true}
              zoom={18}
              ref={refMap}
              center={center}
              style={{with: '100%', height: '80vh', zIndex: 5}}
            >
              <FeatureGroup ref={editorRef}></FeatureGroup>
              <BaseMapLayerComponent top={10} right={15} />
              {center && <Marker position={center} icon={customIcon}></Marker>}
              {lastPosition?.lat != 0 && <Marker position={lastPosition} icon={redIcon}></Marker>}
            </MapContainer>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default StatusHistoric
