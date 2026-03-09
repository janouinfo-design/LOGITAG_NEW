import moment from 'moment'
import {Avatar} from 'primereact/avatar'
import {Button} from 'primereact/button'
import {Chip} from 'primereact/chip'
import {Divider} from 'primereact/divider'
import _ from 'lodash'
import React, {useEffect, useState} from 'react'
import {Badge} from 'primereact/badge'

const CardLogsList = ({
  first,
  last,
  date,
  lengthScan,
  address,
  onShowDetail,
  userName,
  loading,
  image,
  items,
  selected,
}) => {
  const [engins, setEngins] = useState([])
  const [infos, setInfos] = useState({})


  const dateFormatted = (date) => {
    if (!date || typeof date != 'string') return '_'
    if (date.includes('+')) return moment(date).format('DD/MM/YYYY')
    return moment.utc(date).format('DD/MM/YYYY')
  }

  const dateFormattedMin = (date) => {
    if (!date || typeof date != 'string') return '_'
    if (date.includes('+')) return moment(date).format('HH:mm:ss')
    return moment.utc(date).format('HH:mm:ss')
  }

  useEffect(() => {
    let data = _.cloneDeep(items)
    if (!Array.isArray(data)) data = []
    setInfos(data?.[0] || {})
    data = _.uniqBy(data, 'macAddr')
      .filter((o) => o.engin)
      .map((o) => ({id: o.enginId, label: o.engin, macAddr: o.macAddr}))
    setEngins(data)
  }, [items])

  return (
    <div
      style={{overflowX: 'auto'}}
      className={`${
        selected && 'bg-blue-50'
      }  m-2 px-3 py-1 flex flex-row scalein animation-duration-3000 align-items-center justify-content-between border-round-2xl border-2 border-blue-200`}
    >
      <div className='cursor-pointer hover:shadow-sm flex-row align-items-center justify-content-between px-2'>
        <div style={{gap: 5}} className='flex justify-content-between align-items-center'>
          <div className='text-xl flex flex-column font-semibold text-gray-500'>
            <span>{dateFormatted(date)}</span>
            <strong className='text-yellow-600'>{dateFormattedMin(date)}</strong>
          </div>
          {items?.[0]?.userID > 0 && (
            <div className='flex align-items-center' style={{gap: 3}}>
              <Avatar
                image={process.env.REACT_APP_IMAGE_BASE_URL + image}
                size='normal'
                shape='circle'
                className='ml-3'
              />
              <div className='ml-2 text-xl text-gray-500'>{userName}</div>
              <i className='fas fa-solid fa-mobile text-2xl text-blue-500'></i>
            </div>
          )}
          {items?.[0]?.deviceId && items?.[0]?.userID == 0 && (
            <div className='flex align-items-center' style={{gap: 3}}>
              <span
                title={items?.[0]?.deviceType}
                className={`fas ${
                  items?.[0]?.deviceType === 'gateway'
                    ? 'fa-signal-stream'
                    : 'fa-location-crosshairs'
                }  text-2xl text-blue-500`}
              ></span>
              <div className='ml-2 text-xl text-gray-500'>{items?.[0]?.deviceId}</div>
            </div>
          )}
          <Badge value={lengthScan} severity='warning' />
          {/* <div className='flex flex-column ml-3 align-items-center'>
            {!first && <div style={{width: '5px'}} className='bg-green-500 h-2rem'></div>}
            <div className='bg-green-500 h-2rem w-2rem border-circle fas fa-duotone fa-file-lines text-white flex align-items-center justify-content-center'></div>
            {!last && <div style={{width: '5px'}} className='bg-green-500 h-2rem'></div>}
          </div> */}
        </div>
        <div className='w-12 mt-2 d-flex align-items-center' style={{gap: 2}}>
          <span className='pi pi-map-marker  text-gray-400'></span>
          <strong className='text-blue-500'>
            {/* {address} */}
            {items?.[0]?.locationName && (
              <span style={{fontSize: '17px'}} className='text-orange-500'>
                {' '}
                ({items?.[0]?.locationName})
              </span>
            )}
          </strong>
        </div>
        <div className=''>
          <div className='flex align-items-center' style={{gap: 10}}>
            <Divider>
              <strong className='text-gray-800'>{engins.length} Engin(s)</strong>
            </Divider>
          </div>
          <div
            className='flex flex-wrap'
            style={{gap: 5, maxHeight: '100px', width: '100%', overflowX: 'auto'}}
          >
            {engins.map((o) => (
              // <Button outlined key={o.macAddr}>
              //     <strong>{o.label}</strong>
              // </Button>
              <div className='p-1 border-round bg-indigo-100'>
                <strong className='text-sm text-indigo-700'>{o.label} </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardLogsList
