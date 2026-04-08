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
    <div className="lt-page" data-testid="rapports-page">
      <div className="lt-page-header" data-testid="rapports-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)'}}>
            <i className="pi pi-chart-bar"></i>
          </div>
          <div>
            <h1 className="lt-page-title">Rapports</h1>
            <p className="lt-page-subtitle">Génération et consultation des rapports</p>
          </div>
        </div>
      </div>

      <div className="lt-rapports-layout" data-testid="rapports-layout">
        <div className="lt-rapports-sidebar">
          {show ? <RapportChose /> : <RapportList />}
        </div>
        <div className="lt-rapports-content">
          {settingShow ? <RapportSetting /> : <RapportDisplay />}
        </div>
      </div>
    </div>
  )
}

export default RapportComponent
