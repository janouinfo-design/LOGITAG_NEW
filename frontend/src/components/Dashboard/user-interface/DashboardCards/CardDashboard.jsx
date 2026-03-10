import React from 'react'
import {useAppSelector} from '../../../../hooks'
import {getCardSelected, getLoadingCard} from '../../slice/dashboard.slice'

const CardDashboard = ({
  title,
  quantity,
  icon,
  value,
  bgColor,
  quantityLabel,
  onSelectedCard,
  code,
}) => {
  const selectedCard = useAppSelector(getCardSelected)
  const loadingCard = useAppSelector(getLoadingCard)

  const isSelected = selectedCard?.code === code
  const numValue = parseFloat(value) || 0

  return (
    <>
      <style>{`
        .lt-card-dash {
          min-height: 180px;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          flex: 1 1 280px;
          max-width: 360px;
          min-width: 260px;
        }
        .lt-card-dash:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        .lt-card-dash.selected {
          border-color: var(--card-accent);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        .lt-card-dash-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .lt-card-dash-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .lt-card-dash-icon i {
          font-size: 1.3rem;
          color: #FFFFFF;
        }
        .lt-card-dash-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748B;
          margin: 0;
          letter-spacing: 0.01em;
        }
        .lt-card-dash-value {
          font-family: 'Manrope', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 4px 0 0 0;
        }
        .lt-card-progress-track {
          width: 100%;
          height: 6px;
          background: #F1F5F9;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .lt-card-progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 1.2s ease-out;
        }
        .lt-card-dash-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lt-card-dash-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.825rem;
          color: #94A3B8;
        }
        .lt-card-dash-qty {
          font-family: 'Manrope', sans-serif;
          font-size: 0.925rem;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lt-card-dash-badge {
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
        }
        .lt-card-dash-spinner {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 24px;
          height: 24px;
          border: 3px solid rgba(0,0,0,0.08);
          border-top-color: var(--card-accent);
          border-radius: 50%;
          animation: ltCardSpin 0.7s linear infinite;
        }
        @keyframes ltCardSpin { to { transform: rotate(360deg); } }
        @keyframes ltCardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lt-card-dash { animation: ltCardSlideIn 0.5s ease-out backwards; }
      `}</style>

      <div
        data-testid={`dashboard-card-${code}`}
        className={`lt-card-dash ${isSelected ? 'selected' : ''}`}
        style={{'--card-accent': bgColor, borderColor: isSelected ? bgColor : 'transparent'}}
        onClick={onSelectedCard}
      >
        {isSelected && loadingCard && (
          <div className="lt-card-dash-spinner" style={{'--card-accent': bgColor}} />
        )}

        <div className="lt-card-dash-top">
          <div>
            <p className="lt-card-dash-title">{title}</p>
            <p className="lt-card-dash-value">{quantity}</p>
          </div>
          <div className="lt-card-dash-icon" style={{background: bgColor}}>
            <i className={`${icon}`} />
          </div>
        </div>

        <div className="lt-card-progress-track">
          <div
            className="lt-card-progress-fill"
            style={{width: `${Math.min(numValue, 100)}%`, background: bgColor}}
          />
        </div>

        <div className="lt-card-dash-bottom">
          <span className="lt-card-dash-label">{quantityLabel || 'Total'}</span>
          <span
            className="lt-card-dash-badge"
            style={{background: `${bgColor}15`, color: bgColor}}
          >
            {value}%
          </span>
        </div>
      </div>
    </>
  )
}

export default CardDashboard
