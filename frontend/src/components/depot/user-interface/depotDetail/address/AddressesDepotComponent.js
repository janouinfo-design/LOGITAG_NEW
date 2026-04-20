import React from 'react'
import {useAppDispatch} from '../../../../../hooks'
import {setAddressDetail, setEditAddress, setSelectedAddress} from '../../../slice/addressDepot.slice'

const TYPE_STYLES = {
  default:      {bg: '#EEF2FF', color: '#6366F1', icon: 'pi pi-building'},
  facturation:  {bg: '#EEF2FF', color: '#6366F1', icon: 'pi pi-file'},
  chargement:   {bg: '#DCFCE7', color: '#16A34A', icon: 'pi pi-truck'},
  livraison:    {bg: '#DCFCE7', color: '#16A34A', icon: 'pi pi-truck'},
  depot:        {bg: '#EEF2FF', color: '#6366F1', icon: 'pi pi-home'},
  'dépôt':      {bg: '#EEF2FF', color: '#6366F1', icon: 'pi pi-home'},
  siege:        {bg: '#FEF3C7', color: '#D97706', icon: 'pi pi-building'},
  'siège':      {bg: '#FEF3C7', color: '#D97706', icon: 'pi pi-building'},
}
const resolveTypeStyle = (type) => {
  if (!type) return TYPE_STYLES.default
  const key = type.toString().toLowerCase()
  for (const k of Object.keys(TYPE_STYLES)) if (key.includes(k)) return TYPE_STYLES[k]
  return TYPE_STYLES.default
}

const AddressesDepotComponent = (props) => {
  const dispatch = useAppDispatch()
  const {type, Address, town, Email, Phone, isDefault, active, id, client} = props
  const style = resolveTypeStyle(type)
  const typeLabel = type ? `Adresse de ${type.toString().toLowerCase().replace(/^adresse de\s*/i, '')}` : 'Adresse'
  const isActive = active == 1 || active === true || active == null
  const isPrincipal = isDefault == 1 || isDefault === true

  const openEdit = () => {
    dispatch(setSelectedAddress(props))
    if (client) dispatch(setAddressDetail(true))
    else dispatch(setEditAddress(true))
  }

  return (
    <div data-testid={`address-depot-card-${id}`} style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', width: '100%', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
      <div style={{width: 56, height: 56, borderRadius: '50%', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <i className={style.icon} style={{color: style.color, fontSize: '1.2rem'}}></i>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10}}>
          <h3 style={{margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif"}}>{typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}</h3>
          {isPrincipal && <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '3px 9px', borderRadius: 999}}><i className='pi pi-check-circle' style={{fontSize: '0.65rem'}}></i>Par défaut</span>}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.82rem', color: '#475569'}}>
          {(Address || town) && <div style={{display: 'flex', alignItems: 'center', gap: 8}}><i className='pi pi-map-marker' style={{color: '#94A3B8', fontSize: '0.82rem', width: 16}}></i><span>{Address || '—'}{town ? `, ${town}` : ''}</span></div>}
          {Email && <div style={{display: 'flex', alignItems: 'center', gap: 8}}><i className='pi pi-envelope' style={{color: '#94A3B8', fontSize: '0.82rem', width: 16}}></i><span>{Email}</span></div>}
          {Phone && <div style={{display: 'flex', alignItems: 'center', gap: 8}}><i className='pi pi-phone' style={{color: '#94A3B8', fontSize: '0.82rem', width: 16}}></i><span>{Phone}</span></div>}
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: isActive ? '#DCFCE7' : '#F1F5F9', color: isActive ? '#16A34A' : '#64748B'}}>
          <span style={{width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16A34A' : '#94A3B8'}}></span>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        <div style={{display: 'flex', gap: 6}}>
          <button title='Voir' onClick={openEdit} data-testid={`address-depot-view-${id}`} style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className='pi pi-eye'></i></button>
          <button title='Modifier' onClick={openEdit} data-testid={`address-depot-edit-${id}`} style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className='pi pi-pencil'></i></button>
          <button title='Supprimer' data-testid={`address-depot-delete-${id}`} style={{width: 34, height: 34, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className='pi pi-trash'></i></button>
        </div>
      </div>
    </div>
  )
}

export default AddressesDepotComponent
