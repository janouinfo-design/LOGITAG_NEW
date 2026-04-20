import React from 'react'

/**
 * SidebarCard — premium card with inline styles to bypass PrimeReact/Tailwind CSS resets.
 * Usage:
 *   <SidebarCard title="Résumé">
 *     <SidebarRow label="Code" value="ENG-001" />
 *   </SidebarCard>
 */
export const SidebarCard = ({title, children, style}) => (
  <div style={{
    background: '#FFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    ...style,
  }}>
    {title && (
      <div style={{
        padding: '12px 16px',
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.76rem',
        fontWeight: 800,
        color: '#0F172A',
        borderBottom: '1px solid #F1F5F9',
        background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>{title}</div>
    )}
    <div style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
      {children}
    </div>
  </div>
)

export const SidebarRow = ({label, value, valueNode, isLast}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 0',
    fontSize: '0.8rem',
    borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
    gap: 12,
  }}>
    <span style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>{label}</span>
    <span style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>
      {valueNode != null ? valueNode : (value || '—')}
    </span>
  </div>
)

export const SidebarLink = ({label, count, isLast}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
    fontSize: '0.82rem',
  }}>
    <span style={{color: '#475569', fontWeight: 500}}>{label}</span>
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
      height: 24,
      padding: '0 8px',
      borderRadius: 6,
      background: '#EFF6FF',
      color: '#3B82F6',
      fontSize: '0.72rem',
      fontWeight: 800,
    }}>{count ?? 0}</span>
  </div>
)

export default SidebarCard
