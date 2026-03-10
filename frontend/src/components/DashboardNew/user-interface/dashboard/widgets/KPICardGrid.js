import React from 'react'

const KPICardGrid = ({cards}) => {
  if (!cards || cards.length === 0) {
    return null
  }

  const getGradient = (index) => {
    const gradients = [
      { bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', iconBg: '#2563EB', iconColor: '#FFFFFF', accent: '#2563EB' },
      { bg: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)', iconBg: '#EF4444', iconColor: '#FFFFFF', accent: '#EF4444' },
      { bg: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)', iconBg: '#10B981', iconColor: '#FFFFFF', accent: '#10B981' },
      { bg: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', iconBg: '#F97316', iconColor: '#FFFFFF', accent: '#F97316' },
      { bg: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)', iconBg: '#8B5CF6', iconColor: '#FFFFFF', accent: '#8B5CF6' },
      { bg: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)', iconBg: '#EC4899', iconColor: '#FFFFFF', accent: '#EC4899' },
    ]
    return gradients[index % gradients.length]
  }

  const parseValue = (val) => {
    if (!val) return { current: 0, total: 0, percent: 0 }
    const str = String(val)
    const match = str.match(/(\d+)\s*\/\s*(\d+)/)
    if (match) {
      const current = parseInt(match[1])
      const total = parseInt(match[2])
      return { current, total, percent: total > 0 ? Math.round((current / total) * 100) : 0 }
    }
    return { current: val, total: null, percent: null }
  }

  return (
    <>
      <style>{`
        .lt-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
        }
        .lt-kpi-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .lt-kpi-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          transform: translateY(-2px);
          border-color: transparent;
        }
        .lt-kpi-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .lt-kpi-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .lt-kpi-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748B;
          margin: 0;
          letter-spacing: 0.01em;
        }
        .lt-kpi-value {
          font-family: 'Manrope', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 4px 0;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .lt-kpi-sub {
          font-size: 0.8rem;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lt-kpi-progress-track {
          width: 100%;
          height: 6px;
          background: #F1F5F9;
          border-radius: 6px;
          margin-top: 16px;
          overflow: hidden;
        }
        .lt-kpi-progress-bar {
          height: 100%;
          border-radius: 6px;
          transition: width 1s ease-out;
        }
        .lt-kpi-percent {
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(37,99,235,0.08);
          color: #2563EB;
        }
        @keyframes ltKpiSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lt-kpi-card { animation: ltKpiSlideIn 0.5s ease-out backwards; }
        .lt-kpi-card:nth-child(1) { animation-delay: 0s; }
        .lt-kpi-card:nth-child(2) { animation-delay: 0.08s; }
        .lt-kpi-card:nth-child(3) { animation-delay: 0.16s; }
        .lt-kpi-card:nth-child(4) { animation-delay: 0.24s; }
        .lt-kpi-card:nth-child(5) { animation-delay: 0.32s; }
        .lt-kpi-card:nth-child(6) { animation-delay: 0.4s; }
      `}</style>
      <div className="lt-kpi-grid" data-testid="kpi-card-grid">
        {cards.map((card, index) => {
          const theme = getGradient(index)
          const parsed = parseValue(card.value)
          return (
            <div className="lt-kpi-card" key={index} data-testid={`kpi-card-${index}`}>
              <div className="lt-kpi-card-top">
                <div>
                  <p className="lt-kpi-title">{card.title}</p>
                </div>
                <div
                  className="lt-kpi-icon-box"
                  style={{ background: theme.iconBg, color: theme.iconColor }}
                >
                  <i className={card.icon || 'pi pi-box'} />
                </div>
              </div>

              <div className="lt-kpi-value">{card.value}</div>

              {card.description && (
                <p className="lt-kpi-sub">{card.description}</p>
              )}

              {parsed.percent !== null && (
                <>
                  <div className="lt-kpi-progress-track">
                    <div
                      className="lt-kpi-progress-bar"
                      style={{
                        width: `${parsed.percent}%`,
                        background: theme.accent,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="lt-kpi-sub">{card.label || 'Progression'}</span>
                    <span className="lt-kpi-percent" style={{ background: `${theme.accent}12`, color: theme.accent }}>
                      {parsed.percent}%
                    </span>
                  </div>
                </>
              )}

              {card.change && (
                <div style={{ marginTop: '12px' }}>
                  <span
                    className="lt-kpi-percent"
                    style={{
                      background: card.change.startsWith('+') ? '#ECFDF5' : '#FEF2F2',
                      color: card.change.startsWith('+') ? '#10B981' : '#EF4444',
                    }}
                  >
                    {card.change.startsWith('+') ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    )}
                    {card.change}
                  </span>
                  <span className="lt-kpi-sub" style={{ marginLeft: '6px', display: 'inline' }}>vs mois dernier</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default KPICardGrid
