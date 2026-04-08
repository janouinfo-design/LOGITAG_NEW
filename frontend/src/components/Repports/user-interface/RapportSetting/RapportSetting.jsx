import React from 'react'
import ListEngRpt from './ListEngRpt'
import DateSettings from './DateSettings'

const RapportSetting = ({clearList}) => {
  return (
    <div className='lt-rpt-setting-wrap' data-testid="rapport-setting">
      <ListEngRpt clearList={clearList} />
      <DateSettings />
    </div>
  )
}

export default RapportSetting
