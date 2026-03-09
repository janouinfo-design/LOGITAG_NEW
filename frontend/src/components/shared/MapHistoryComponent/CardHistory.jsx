import {Image} from 'primereact/image'
import React from 'react'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {Divider} from 'primereact/divider'

const CardHistory = ({image, date, famille, icon, iconBgColor, enginName, key, onClick}) => {
  return (
    <>
      <div
        className='flex flex-row justify-between items-center cursor-pointer hover:bg-gray-100 p-2'
        key={key}
        onClick={onClick}
      >
        <Image src={API_BASE_URL_IMAGE + image} alt='EngineImage' width='50' height='50' preview />
        <div className='text-left flex flex-column pl-3'>
          <strong className='text-xl'>
            <span className='text-gray-500 text-xl'>Engin:</span> {enginName}
          </strong>
          <strong className='text-xl'>
            <span className='text-gray-500 text-xl'>Date:</span> {date}
          </strong>
          <div
            style={{backgroundColor: iconBgColor, width: '80px'}}
            className='p-2 border-round-3xl flex flex-row justify-content-center align-items-center'
          >
            <i className={`fa-solid ${icon} text-2xl text-white`} />
            <strong className='text-lg pl-2 text-white'>{famille}</strong>
          </div>
        </div>
      </div>
      <Divider style={{width: '100%'}} />
    </>
  )
}

export default CardHistory
