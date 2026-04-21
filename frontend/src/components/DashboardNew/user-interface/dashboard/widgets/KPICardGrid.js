import React, {useMemo} from 'react'

/**
 * KPICardGrid — Executive Dashboard Premium (Stripe-inspired)
 * Cards with: colored icon badge, sparkline, delta pill, label, big value.
 */

// Deterministic sparkline path based on value + index
const buildSparklinePath = (seed, width = 80, height = 32) => {
  const pts = []
  let v = 16
  for (let i = 0; i < 10; i++) {
    const r = Math.sin(seed + i * 1.3) * 10
    v = Math.max(4, Math.min(28, v + r))
    pts.push({x: (i / 9) * width, y: v})
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

const ICON_STYLES = {
  default:  {bg: '#EFF6FF', color: '#2563EB'},
  red:      {bg: '#FEE2E2', color: '#DC2626'},
  blue:     {bg: '#DBEAFE', color: '#2563EB'},
  green:    {bg: '#DCFCE7', color: '#16A34A'},
  violet:   {bg: '#EFF6FF', color: '#2563EB'},
  orange:   {bg: '#FFEDD5', color: '#EA580C'},
}

const resolveIconStyle = (iconColor) => {
  if (!iconColor) return ICON_STYLES.default
  const k = String(iconColor).toLowerCase()
  if (k.includes('red') || k === '#dc2626') return ICON_STYLES.red
  if (k.includes('blue') || k === '#2563eb') return ICON_STYLES.blue
  if (k.includes('green') || k === '#16a34a') return ICON_STYLES.green
  if (k.includes('violet') || k.includes('purple') || k === '#7c3aed') return ICON_STYLES.violet
  if (k.includes('orange') || k === '#ea580c') return ICON_STYLES.orange
  return {bg: '#EFF6FF', color: iconColor}
}

const parseDelta = (change) => {
  if (!change) return null
  const str = String(change).trim()
  const isUp = str.startsWith('+') || (/^\d/.test(str) && !str.startsWith('-'))
  const cleanNum = str.replace(/^[+-]/, '').replace('%', '')
  return {
    raw: str,
    isUp,
    isZero: cleanNum === '0' || cleanNum === '0.00',
    display: (isUp ? '↗ ' : '↘ ') + str.replace(/^[+-]/, '') + (str.includes('%') ? '' : '%'),
  }
}

const KPICardGrid = ({cards}) => {
  if (!cards || cards.length === 0) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, 1fr)`,
        gap: 16,
        marginBottom: 20,
      }}
      data-testid='kpi-grid-premium'
    >
      {cards.map((card, index) => {
        const iconStyle = resolveIconStyle(card.iconColor)
        const delta = parseDelta(card.change)
        const seed = index * 1.7 + String(card.value).length
        const sparkPath = buildSparklinePath(seed)

        return (
          <div
            key={index}
            data-testid={`kpi-card-${index}`}
            style={{
              background: '#FFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: 18,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)'
            }}
          >
            {/* Colored icon badge — top right */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: iconStyle.bg,
                color: iconStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
              }}
            >
              <i className={card.icon || 'pi pi-chart-line'} />
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: '0.78rem',
                color: '#64748B',
                fontWeight: 600,
                marginBottom: 10,
                maxWidth: 'calc(100% - 50px)',
                letterSpacing: '0.01em',
              }}
            >
              {card.title}
            </div>

            {/* Value + sparkline row */}
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10}}>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1,
                  fontFamily: "'Manrope', -apple-system, sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                {card.value ?? '—'}
              </div>
              <svg width='80' height='32' viewBox='0 0 80 32' style={{flexShrink: 0}}>
                <path d={sparkPath} stroke={iconStyle.color} fill='none' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                <path
                  d={`${sparkPath} L80,32 L0,32 Z`}
                  fill={iconStyle.color}
                  opacity='0.08'
                />
              </svg>
            </div>

            {/* Delta badge */}
            {delta && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginTop: 10,
                  background: delta.isZero ? '#F1F5F9' : (delta.isUp ? '#DCFCE7' : '#FEE2E2'),
                  color: delta.isZero ? '#64748B' : (delta.isUp ? '#16A34A' : '#DC2626'),
                }}
              >
                {delta.display}
                <span style={{fontWeight: 500, opacity: 0.7, marginLeft: 4, fontSize: '0.68rem'}}>
                  vs période précédente
                </span>
              </div>
            )}

            {/* Description */}
            {card.description && (
              <div style={{fontSize: '0.72rem', color: '#94A3B8', marginTop: 8}}>{card.description}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default KPICardGrid
