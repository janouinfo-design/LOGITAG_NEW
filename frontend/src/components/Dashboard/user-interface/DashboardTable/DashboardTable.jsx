import React, {useState, useRef} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getCardSelected, setCardSelected} from '../../slice/dashboard.slice'
import DashboardDetail from '../DashboardDetail/DashboardDetail'
import {Panel} from 'primereact/panel'

const DashboardTable = () => {
  const selectedCard = useAppSelector(getCardSelected)
  const [viewMode, setViewMode] = useState('cards')
  const ref = useRef(null)
  const dispatch = useAppDispatch()

  const onHideTable = () => {
    dispatch(setCardSelected(null))
  }

  return (
    <>
      <style>{`
        .lt-detail-container {
          width: 100%;
          animation: ltSlideIn 0.4s ease-out;
          padding: 0 16px;
        }
        @keyframes ltSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lt-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 8px;
          gap: 16px;
        }
        .lt-detail-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .lt-detail-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .lt-detail-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lt-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFF;
          color: #94A3B8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 1.1rem;
        }
        .lt-close-btn:hover {
          border-color: #EF4444;
          color: #EF4444;
          background: #FEF2F2;
        }
        .lt-view-toggle {
          display: flex;
          align-items: center;
          background: #F1F5F9;
          border-radius: 10px;
          padding: 4px;
          gap: 2px;
        }
        .lt-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748B;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .lt-toggle-btn:hover {
          color: #334155;
        }
        .lt-toggle-btn.active {
          background: #2563EB;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .lt-toggle-btn i {
          font-size: 0.9rem;
        }
        .lt-detail-body {
          padding: 0 8px;
        }
      `}</style>

      <div className="lt-detail-container" data-testid="dashboard-table">
        <div className="lt-detail-header">
          <div className="lt-detail-header-left">
            <button className="lt-close-btn" onClick={onHideTable} data-testid="detail-close-btn" title="Fermer">
              <i className="pi pi-arrow-left" />
            </button>
            <h2 className="lt-detail-title" data-testid="detail-title">{selectedCard?.titledetail || ''}</h2>
          </div>
          <div className="lt-detail-header-right">
            <div className="lt-view-toggle" data-testid="view-toggle">
              <button
                className={`lt-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                data-testid="toggle-table-btn"
              >
                <i className="pi pi-list" />
                Tableau
              </button>
              <button
                className={`lt-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                data-testid="toggle-cards-btn"
              >
                <i className="pi pi-th-large" />
                Cartes
              </button>
            </div>
            <button className="lt-close-btn" onClick={onHideTable} title="Fermer">
              <i className="pi pi-times" />
            </button>
          </div>
        </div>

        <div className="lt-detail-body">
          <DashboardDetail viewMode={viewMode} />
        </div>
      </div>
    </>
  )
}

export default DashboardTable
