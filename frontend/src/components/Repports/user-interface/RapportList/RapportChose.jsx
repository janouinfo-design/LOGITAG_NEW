import React from 'react'
import {
  fetchListRapport,
  setChoseRapport,
  setLoadingRpt,
  setSelectedRapport,
  setShowSettingRapport,
} from '../../slice/rapports.slice'
import {useAppDispatch} from '../../../../hooks'

const rapportTypes = [
  {
    category: 'Rapport d\'activité',
    icon: 'pi pi-chart-line',
    color: '#3B82F6',
    items: [
      {title: 'engList', label: 'Par Engin', desc: 'Temps de présence par site/adresse pour chaque engin', icon: 'pi pi-box', decs: 'engin'},
      {title: 'siteList', label: 'Par Site', desc: 'Temps de présence de chaque engin sur le site', icon: 'pi pi-building', decs: 'worksite'},
    ]
  },
]

const RapportChose = () => {
  const dispatch = useAppDispatch()

  const selectReport = (value) => {
    dispatch(setLoadingRpt(true))
    dispatch(setSelectedRapport({title: value.title, icon: value.icon, decs: value.decs}))
    dispatch(fetchListRapport(value.decs)).then(() => dispatch(setShowSettingRapport(true)))
  }

  return (
    <div className='lt-rpt-types-panel' data-testid="rapport-types-panel">
      <div className='lt-rpt-types-header'>
        <button
          onClick={() => {
            dispatch(setChoseRapport(false))
            dispatch(setShowSettingRapport(false))
          }}
          className='lt-rpt-back-btn'
          data-testid="rapport-back-btn"
        >
          <i className='pi pi-arrow-left'></i>
        </button>
        <span>Rapports disponibles</span>
      </div>

      <div className='lt-rpt-types-body'>
        {rapportTypes.map((cat, ci) => (
          <div key={ci} className='lt-rpt-category'>
            <div className='lt-rpt-category-title'>
              <i className={cat.icon} style={{color: cat.color, fontSize: '0.85rem'}}></i>
              <span>{cat.category}</span>
            </div>
            {cat.items.map((item, ii) => (
              <div
                key={ii}
                onClick={() => selectReport(item)}
                className='lt-rpt-type-item'
                data-testid={`rapport-type-${item.decs}`}
              >
                <div className='lt-rpt-type-icon' style={{background: `${cat.color}12`, color: cat.color}}>
                  <i className={item.icon}></i>
                </div>
                <div className='lt-rpt-type-info'>
                  <div className='lt-rpt-type-name'>{item.label}</div>
                  <div className='lt-rpt-type-desc'>{item.desc}</div>
                </div>
                <i className='pi pi-chevron-right' style={{color: '#CBD5E1', fontSize: '0.75rem'}}></i>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RapportChose
