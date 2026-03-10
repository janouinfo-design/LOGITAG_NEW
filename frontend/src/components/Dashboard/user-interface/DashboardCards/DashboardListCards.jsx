import React, {useEffect, useRef} from 'react'
import CardDashboard from './CardDashboard'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getSelectedMode,
  setCardSelected,
  setLoadingCard,
  setSelectedMode,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

const DashboardListCards = () => {
  const dashboardData = useAppSelector(getDashboard)
  const modeSelected = useAppSelector(getSelectedMode)
  const dispatch = useAppDispatch()

  const handleSelectedCard = (item) => {
    let obj = {
      src: item.src,
      title: item.title,
      code: item.code,
      titledetail: item.titledetail,
    }
    dispatch(setCardSelected(obj))
    dispatch(setLoadingCard(true))
    dispatch(fetchDashboardDetail(item.code)).then(({payload}) => {
      if (payload) {
        dispatch(setLoadingCard(false))
      }
    })
  }

  const switchMode = () => {
    if (modeSelected === 'card') {
      dispatch(setSelectedMode('circle'))
    } else {
      dispatch(setSelectedMode('card'))
    }
  }

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [])

  return (
    <>
      <style>{`
        .lt-dashlist-container {
          width: 100%;
          padding: 4px;
        }
        .lt-dashlist-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .lt-dashlist-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .lt-dashlist-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #94A3B8;
          margin: 4px 0 0 0;
        }
        .lt-mode-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .lt-mode-btn:hover {
          border-color: #2563EB;
          color: #2563EB;
          box-shadow: 0 2px 8px rgba(37,99,235,0.12);
        }
        .lt-mode-btn i {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }
        .lt-mode-btn:hover i {
          transform: rotate(180deg);
        }
        .lt-dashlist-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          width: 100%;
        }
        .lt-dashlist-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px dashed #CBD5E1;
          width: 100%;
        }
        .lt-dashlist-empty i {
          font-size: 2.5rem;
          color: #CBD5E1;
          margin-bottom: 12px;
        }
        .lt-dashlist-empty p {
          font-family: 'Inter', sans-serif;
          font-size: 0.925rem;
          color: #94A3B8;
          margin: 0;
        }
      `}</style>

      <div className="lt-dashlist-container" data-testid="dashboard-list-cards">
        <div className="lt-dashlist-header">
          <div>
            <h1 className="lt-dashlist-title" data-testid="dashboard-main-title">Tableau de bord</h1>
            <p className="lt-dashlist-subtitle">Vue d'ensemble de vos actifs et performances</p>
          </div>
          <button className="lt-mode-btn" onClick={switchMode} data-testid="mode-switch-btn">
            <i className="pi pi-sync" />
            Mode
          </button>
        </div>

        {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
          <div className="lt-dashlist-grid">
            {dashboardData.map((item, index) => (
              <CardDashboard
                key={item.code || index}
                code={item.code}
                title={item.label || item.title}
                bgColor={item.bgColor}
                icon={item.icon}
                value={item.value}
                quantity={item.quantity}
                quantityLabel={item.quantityLabel}
                onSelectedCard={() => handleSelectedCard(item)}
              />
            ))}
          </div>
        ) : (
          <div className="lt-dashlist-empty">
            <i className="pi pi-chart-bar" />
            <p>Chargement des données du tableau de bord...</p>
          </div>
        )}
      </div>
    </>
  )
}

export default DashboardListCards
