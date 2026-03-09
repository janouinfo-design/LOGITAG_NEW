import React from 'react'
import ListEngRpt from './ListEngRpt'
import DateSettings from './DateSettings'

const RapportSetting = ({clearList}) => {
  return (
    <div
      className='bg-gray-100  flex border-round-md'
      style={{
        width: '50%',
        height: '80vh',
        boxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
        WebkitBoxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
        MozBoxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
      }}
    >
      <ListEngRpt clearList={clearList} style={{width: '50%', borderRight: '1px solid #adb5bd'}} />
      <DateSettings style={{width: '50%'}} />
    </div>
  )
}

export default RapportSetting
