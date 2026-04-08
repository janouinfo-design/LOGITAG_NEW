import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setToastParams } from '../../../../store/slices/ui.slice'
import { fetchUsers, getUsers, removeUser, setSelectedUser, setUserView } from '../../slice/user.slice'
import { useNavigate } from 'react-router-dom'
import { InputSwitch } from 'primereact/inputswitch'
import { setAlertParams } from '../../../../store/slices/alert.slice'
import { DatatableComponent } from '../../../shared/DatatableComponent/DataTableComponent'
import { API_BASE_URL_IMAGE } from '../../../../api/config'

export const UserList = ({root}) => {
  const data = useSelector(getUsers)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleUsrActive = (id , value)=>{
    return
    dispatch(setAlertParams({ 
      title: 'ATTENTION',
      message: `Voulez vous vraiment ${value ? 'activer' : 'desactiver'}  cet utilisateur ?`, 
      visible: true 
    }))
  }

  let actions = [
    {
      label: "Supprimer",
      icon: "pi pi-trash text-red-500",
      command: (e) => {
        dispatch(removeUser({ id: e.item.data.id })).then(res => {
          if (!res.payload.success)
            dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
          else
            dispatch(setToastParams({ show: true, severity: 'success', detail: "Supprimé avec succès !!!" }))
        })
      }
    },
    {
      label: "Modifier",
      icon: "pi pi-pencil text-blue-500",
      command: (e) => {
        dispatch(setSelectedUser(e.item.data))
        navigate(root+'/edit')
      }
    }
  ]

  const colors = ['blue', 'indigo', 'cyan', 'purple', 'teal', 'green']

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

  const profileTemplate = (rowData) => {
    const color = getRandomColor()
    const photo = rowData.photo || rowData.image
    return (
      <div className="lt-user-cell" data-testid="user-profile-cell">
        {photo ? (
          <img
            src={photo.startsWith('http') ? photo : `${API_BASE_URL_IMAGE}${photo}`}
            alt={rowData.pseudo || ''}
            className="lt-user-avatar"
            style={{objectFit: 'cover', border: '1.5px solid var(--lt-border)'}}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div
            className="lt-user-avatar"
            style={{
              background: `var(--${color}-100, #EFF6FF)`,
              color: `var(--${color}-600, #2563EB)`,
              border: '1.5px solid var(--lt-border)',
            }}
          >
            {(rowData.pseudo || rowData.fname?.charAt(0) || '?').toUpperCase().charAt(0)}
          </div>
        )}
        <div className="lt-user-info">
          <span className="lt-user-name">{rowData.fname} {rowData.sname}</span>
          <span className="lt-user-login">{rowData.login}</span>
        </div>
      </div>
    )
  }

  const emailTemplate = (rowData) => (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
      <i className="pi pi-envelope" style={{color: 'var(--lt-accent)', fontSize: '0.85rem'}}></i>
      <span style={{fontSize: '0.85rem', color: 'var(--lt-text-secondary)'}}>{rowData?.email || '-'}</span>
    </div>
  )

  const roleTemplate = (rowData) => {
    const isAdmin = rowData?.role === 'admin'
    return (
      <span
        className={`lt-badge ${isAdmin ? 'lt-badge-purple' : 'lt-badge-info'}`}
        data-testid="user-role-badge"
      >
        <i className={`pi pi-${isAdmin ? 'shield' : 'user'}`} style={{fontSize: '0.7rem'}}></i>
        {rowData?.role || '-'}
      </span>
    )
  }

  const activeTemplate = (rowData) => {
    const isActive = rowData?.active == 1
    return (
      <span
        className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-neutral'}`}
        data-testid="user-active-badge"
      >
        <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-neutral'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    )
  }

  const columns = [
    { field: 'fname', header: 'Profil', body: profileTemplate, filter: true },
    { field: 'email', header: 'Email', body: emailTemplate, filter: true },
    { field: 'role', header: 'Rôle', body: roleTemplate, filter: true },
    { field: 'active', header: 'Statut', body: activeTemplate, filter: true },
  ]

  useEffect(() => {
    dispatch(fetchUsers())
  }, [])

  return (
    <div className="lt-page" data-testid="user-list-page">
      <div className="lt-page-header" data-testid="user-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)'}}>
            <i className="pi pi-users"></i>
          </div>
          <div>
            <h1 className="lt-page-title">Utilisateurs</h1>
            <p className="lt-page-subtitle">Gestion des comptes utilisateurs</p>
          </div>
        </div>
        <div className="lt-page-header-right">
          {data && data.length > 0 && (
            <div className="lt-count-badge" data-testid="user-total-count">
              <i className="pi pi-users" style={{fontSize: '0.75rem'}}></i>
              <strong>{data.length}</strong> utilisateurs
            </div>
          )}
        </div>
      </div>

      <div className="lt-table-wrap" data-testid="user-table">
        <DatatableComponent
          tableId='users-list'
          data={data}
          columns={columns}
          onNew={() => {
            dispatch(setSelectedUser(null))
            dispatch(setUserView('editor'))
            navigate(root + '/edit')
          }}
          rowActions={actions}
        />
      </div>
    </div>
  )
}
