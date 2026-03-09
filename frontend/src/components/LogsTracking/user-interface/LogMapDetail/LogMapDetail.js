import React, {useEffect, useRef, useState} from 'react'
import {FeatureGroup, MapContainer, Marker} from 'react-leaflet'
import BaseMapLayerComponent from '../../../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import {Carousel} from 'primereact/carousel'
import _ from 'lodash'
import {Button} from 'primereact/button'
import Logo from '../../../../assets/icons/LOGITAGCMYK.png'
import L, {Icon} from 'leaflet'
import {fetchCompanyAddresses, getCompanyAddresses} from '../../../Company/slice/company.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {center} from '@turf/turf'

const icon = new Icon({
  iconUrl: Logo,
  iconSize: [30, 40],
})

function LogMapDetail({style, className, items}) {
  const dispatch = useAppDispatch()

  const addressCompany = useAppSelector(getCompanyAddresses)

  const mapRef = useRef()
  const geometryFeature = useRef()

  const [dataDetail, setDataDetail] = useState(null)
  const [position, setPosition] = useState(null)
  const [canter, setCanter] = useState({lat: 46.933295342561046, lng: 7.454324562997108})
  const [carouselInfos, setCarouseInfos] = useState([
    {title: 'Engins', description: 'àààà'},
    {title: 'Tags', description: 'àààà'},
  ])

  const [showCarousel, setShowCarousel] = useState(true)

  let removeFromList = () => {}
  const responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 4,
    },
    {
      breakpoint: '760px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '580px',
      numVisible: 1,
      numScroll: 1,
    },
  ]

  const template = (t) => {
    return (
      <div
        className='p-3 pt-0 border-righ-1 border-gray-400 cursor-pointer'
        style={{minHeight: '100px'}}
      >
        <div className='text-right'>
          <i className='pi hidden pi-times-circle' onClick={() => removeFromList(t.id)}></i>
        </div>
        <h6 className='bg-teal-700 p-2 text-white'>{t.title}</h6>
        {t.title != 'Metadata' && (
          <div
            className='flex flex-row flex-wrap'
            style={{maxHeight: '150px', gap: 5, overflow: 'auto'}}
          >
            {Array.isArray(t.data) &&
              (t.data.length == 0 ? (
                <strong className='text-gray-500'>Aucun {t.title}</strong>
              ) : (
                t.data.map((o) => (
                  // <div className='p-1 hidden border-round bg-blue-100'>
                  //   {
                  //     t.title === "Engins" ?
                  //     <strong className='text-sm text-blue-700'>{o.engin}</strong>:
                  //     <span className='text-sm text-indigo-700'>{o}</span>
                  //   }
                  // </div>
                  <div
                    className={`p-${
                      t.title === 'Engins' ? 2 : 3
                    } border-1 border-blue-500 border-round text-blue-600`}
                  >
                    {t.title === 'Engins' ? (
                      <div className='flex flex-column align-items-center'>
                        <strong>{o.engin}</strong>
                        <span className='' style={{fontSize: '12px'}}>
                          {' '}
                          ({o.tag})
                        </span>
                      </div>
                    ) : (
                      o
                    )}
                  </div>
                ))
              ))}
          </div>
        )}
        {t.title == 'Metadata' && (
          <div className='d-flex flex-wrap mt-2' style={{gap: 3}}>
            <div className='w-12 d-flex align-items-center' style={{gap: 3}}>
              <span className='pi pi-map-marker  text-gray-400'></span>
              <strong className='text-blue-500'>{t.data.address}</strong>
            </div>
            {
              <div className='w-12 d-flex align-items-center' style={{gap: 3}}>
                <span className='pi pi-home text-gray-400'></span>
                <strong className={t.data.locationName && 'text-orange-500'}>
                  {t.data.locationName || '_'}
                </strong>
              </div>
            }
            <div className='d-flex align-items-center' style={{gap: 3}}>
              <span className='pi pi-user text-gray-400'></span>
              <strong>{t?.data?.user || t?.data?.deviceId}</strong>
            </div>
            {t.data?.gateway && (
              <div className='flex align-items-center' style={{gap: 3}}>
                <span className='fa fa-signal-stream  text-gray-400'></span>
                <div className=' text-blue-500 '>{t.data?.gateway}</div>
              </div>
            )}
            <div className='w-12 d-flex align-items-center' style={{gap: 3}}>
              <span className='pi pi-calendar text-gray-400'></span>
              <strong>{t.data.dateFormated}</strong>
            </div>
          </div>
        )}
      </div>
    )
  }


  useEffect(() => {
    let infos = [
      {title: 'Engins', data: []},
      {title: 'Tags', data: []},
      {title: 'Metadata', data: {}},
    ]

    let detail = null
    if (Array.isArray(items)) {
      let tags = _.uniq(items.map((o) => o.macAddr).filter(o => o != '00'))
      let engins = _.uniqBy(items, 'engin')
        .map((o) => ({engin: o.engin, tag: o.macAddr}))
        .filter((o) => o.engin)

      detail = items?.[0]
      infos = [
        {title: 'Engins', data: engins},
        {title: 'Tags', data: tags},
        {title: 'Metadata', data: detail || {}},
      ]
    }
    setDataDetail(detail)
    setPosition(detail?.lat && detail?.lng ? [detail.lat, detail.lng] : null)
    setCarouseInfos(infos)
  }, [items])

  useEffect(() => {
    if (geometryFeature.current) geometryFeature.current.clearLayers()
    else return
    if (dataDetail?.locationGeometry) {
      let geoJson = {
        type: 'Feature',
        properties: {},
        geometry: dataDetail?.locationGeometry,
      }

      let feature = L.geoJson(geoJson)

      geometryFeature.current.addLayer(feature)
      mapRef.current.fitBounds(feature.getBounds())
    }
  }, [dataDetail])

  useEffect(() => {
    if (dataDetail && mapRef.current) {
      mapRef.current.flyTo({lat: dataDetail.lat, lng: dataDetail.lng})
      // mapRef.current.setZoom(17)
    }
  }, [dataDetail])

  useEffect(() => {
    if (!addressCompany) return
    const lat = addressCompany?.[0]?.lat
    const lng = addressCompany?.[0]?.lng
    if (!lat || !lng) return
    setCanter({lat: lat, lng: lng})
    if (mapRef.current) mapRef.current.setView({lat: +lat, lng: +lng}, 18)
  }, [mapRef.current])


  return (
    <div style={style} className={className}>
      <MapContainer
        ref={mapRef}
        minZoom={1}
        maxZoom={22}
        zoom={10}
        zoomControl={false}
        center={[+canter?.lat, +canter?.lng]}
        style={{width: '100%', height: '100vh'}}
      >
        <BaseMapLayerComponent top={15} right={15} />
        {position && <Marker position={position} icon={icon} />}
        {<FeatureGroup ref={geometryFeature} />}
      </MapContainer>
      {items && (
        <div
          className='position-absolute   bg-transparent'
          style={{bottom: '0', zIndex: '3', width: '100%'}}
        >
          <span
            className={`pi pi-${showCarousel ? 'times' : 'info'}-circle text-${
              showCarousel ? 'red' : 'orange'
            }-600 text-4xl`}
            onClick={() => setShowCarousel((old) => !old)}
          ></span>
          {showCarousel && (
            <Carousel
              className='bg-white'
              numVisible={4}
              numScroll={4}
              value={carouselInfos || []}
              itemTemplate={template}
              responsiveOptions={responsiveOptions}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default LogMapDetail
