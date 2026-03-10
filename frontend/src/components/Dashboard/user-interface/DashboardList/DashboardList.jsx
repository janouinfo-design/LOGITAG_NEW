import {Card} from 'primereact/card'
import {Fragment, useEffect} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {CircularProgressbar, CircularProgressbarWithChildren} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import ChangingProgressProvider from './ChangingProgressProvider'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getSelectedMode,
  setCardSelected,
  setEditDashboard,
  setSelectedDashboard,
  setSelectedMode,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

const DashboardList = () => {
  let dashboardData = useAppSelector(getDashboard)
  const modeSelected = useAppSelector(getSelectedMode)
  const dispatch = useAppDispatch()

  const handleEditDashboard = (item) => {
    dispatch(setEditDashboard(true))
    dispatch(fetchDashboardDetail(item.code))
    dispatch(
      setSelectedDashboard({
        title: item.title,
        code: item.code,
        src: item.src,
        titledetail: item.titledetail,
      })
    )
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
    <Fragment>
      <style>{`
        .lt-circle-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0 24px 0;
          width: 100%;
        }
        .lt-circle-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.65rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .lt-circle-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          justify-content: center;
          width: 100%;
          padding: 20px;
        }
        .lt-circle-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s ease;
          width: 280px;
          text-align: center;
          cursor: pointer;
        }
        .lt-circle-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transform: translateY(-3px);
          border-color: transparent;
        }
        .lt-circle-card-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 20px 0;
        }
        .lt-circle-progress {
          width: 160px;
          height: 160px;
          margin: 0 auto 20px;
        }
        .lt-circle-qty {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #64748B;
          margin: 0 0 16px 0;
        }
        .lt-circle-btn {
          padding: 8px 20px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lt-circle-btn:hover {
          border-color: #2563EB;
          color: #2563EB;
          background: #EFF6FF;
        }
        .lt-mode-btn2 {
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
        }
        .lt-mode-btn2:hover {
          border-color: #2563EB;
          color: #2563EB;
        }
      `}</style>

      <div className="lt-circle-header">
        <h1 className="lt-circle-title">
          <OlangItem olang={'dashboard'} />
        </h1>
        <button className="lt-mode-btn2" onClick={switchMode}>
          <i className="pi pi-sync" />
          Mode
        </button>
      </div>

      {Array.isArray(dashboardData) && (
        <div className="lt-circle-grid">
          {(dashboardData || [])?.map((item, index) => (
            <div className="lt-circle-card" key={index}>
              <p className="lt-circle-card-title">{item.title}</p>
              <div className="lt-circle-progress">
                <ChangingProgressProvider values={[0, 20, 40, 60, 80, 100]}>
                  {(percentage) => (
                    <CircularProgressbarWithChildren
                      value={item.value}
                      styles={{
                        path: {
                          stroke: `${item.color}`,
                          strokeLinecap: 'round',
                          strokeWidth: 8,
                        },
                        trail: {
                          stroke: '#F1F5F9',
                          strokeWidth: 8,
                        },
                      }}
                    >
                      <div style={{textAlign: 'center'}}>
                        <span style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          letterSpacing: '-0.03em',
                        }}>
                          {item.value}{item.unit}
                        </span>
                      </div>
                    </CircularProgressbarWithChildren>
                  )}
                </ChangingProgressProvider>
              </div>

              <p className="lt-circle-qty">
                {item.quantity} <small>{item.quantityLabel ?? ''}</small>
              </p>

              <button className="lt-circle-btn" onClick={() => handleEditDashboard(item)}>
                <OlangItem olang={'Voir.plus'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  )
}

export default DashboardList
