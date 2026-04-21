import React, {useEffect, useRef} from 'react'

/**
 * KPIInfoPopover — Popover style Navixy IoT affichant :
 *  - Titre + description
 *  - Section FORMULE (font mono)
 *  - Section COMPOSITION (dot + label + valeur)
 *  - Note threshold en bas (fond bleu)
 * Tout frontend, data-driven via props.
 */
const KPIInfoPopover = ({open, onClose, anchorRect, title, description, formula, composition, thresholdNote}) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', esc)
    }
  }, [open, onClose])

  if (!open) return null

  // Position: anchored below the info icon, clipped to viewport
  const top = (anchorRect?.bottom || 0) + 8
  const left = Math.max(12, Math.min((anchorRect?.left || 0) - 12, window.innerWidth - 380))

  return (
    <div
      ref={ref}
      className='kpi-info-pop'
      style={{top, left}}
      role='dialog'
      aria-label={title}
      data-testid='kpi-info-popover'
    >
      <div className='kpi-info-pop-head'>
        <h3 className='kpi-info-pop-title'>{title}</h3>
        <button className='kpi-info-pop-close' onClick={onClose} aria-label='Fermer' data-testid='kpi-info-close'>
          <i className='pi pi-times' />
        </button>
      </div>
      {description && <p className='kpi-info-pop-desc'>{description}</p>}

      {formula && (
        <div className='kpi-info-pop-section'>
          <div className='kpi-info-pop-label'>Formule</div>
          <pre className='kpi-info-pop-formula'>{formula}</pre>
        </div>
      )}

      {composition && composition.length > 0 && (
        <div className='kpi-info-pop-section'>
          <div className='kpi-info-pop-label'>Composition</div>
          <ul className='kpi-info-pop-comp'>
            {composition.map((c, i) => (
              <li key={i} className='kpi-info-pop-comp-row'>
                <span className='kpi-info-pop-comp-dot' style={{background: c.color || '#64748B'}} />
                <span className='kpi-info-pop-comp-lbl'>{c.label}</span>
                <span className='kpi-info-pop-comp-val' style={c.valueColor ? {color: c.valueColor} : undefined}>
                  {c.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {thresholdNote && (
        <div className='kpi-info-pop-note'>
          <i className='pi pi-info-circle' />
          <span>{thresholdNote}</span>
        </div>
      )}
    </div>
  )
}

export default KPIInfoPopover
