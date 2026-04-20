import React from 'react'

const TYPES = {
  edit: { icon: 'pi pi-pencil', label: 'Modifier', variant: 'primary' },
  save: { icon: 'pi pi-check', label: 'Enregistrer', variant: 'primary' },
  communicate: { icon: 'pi pi-comment', label: 'Communication', variant: 'secondary' },
  more: { icon: 'pi pi-ellipsis-h', label: '', variant: 'ghost' },
  back: { icon: 'pi pi-arrow-left', label: 'Retour', variant: 'ghost' },
  add: { icon: 'pi pi-plus', label: 'Ajouter', variant: 'primary' },
  delete: { icon: 'pi pi-trash', label: 'Supprimer', variant: 'danger' },
}

const PrimaryActionButton = ({ type = 'edit', label, icon, onClick, disabled, className = '', style = {}, ...props }) => {
  const config = TYPES[type] || TYPES.edit
  const finalLabel = label ?? config.label
  const finalIcon = icon ?? config.icon

  return (
    <button
      className={`lt-action-btn lt-action-btn--${config.variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      data-testid={`action-btn-${type}`}
      {...props}
    >
      <i className={finalIcon}></i>
      {finalLabel && <span>{finalLabel}</span>}
    </button>
  )
}

export default PrimaryActionButton
