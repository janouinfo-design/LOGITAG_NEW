import React from 'react'
import RapportList from './RapportList/RaportList'
import {useAppSelector} from '../../../hooks'
import {getChoseRapport, getShowSettingRapport} from '../slice/rapports.slice'
import RapportChose from './RapportList/RapportChose'
import RapportSetting from './RapportSetting/RapportSetting'
import RapportDisplay from './RapportDisplay'

const RapportComponent = ({clearList}) => {
  const show = useAppSelector(getChoseRapport)
  const settingShow = useAppSelector(getShowSettingRapport)

  return (
    <div className='flex flex-row '>
      {show ? <RapportChose /> : <RapportList />}
      {settingShow ? <RapportSetting /> : <RapportDisplay />}
    </div>
  )
}

export default RapportComponent
