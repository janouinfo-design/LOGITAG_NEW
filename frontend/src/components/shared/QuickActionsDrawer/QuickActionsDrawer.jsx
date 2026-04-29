import React, {useState} from 'react'
import {Sidebar} from 'primereact/sidebar'
import {useNavigate} from 'react-router-dom'
import './QuickActionsDrawer.css'

const ACTIONS = [
  {
    group: 'Gestion',
    items: [
      {label: 'Nouvel engin', icon: 'pi pi-box', route: '/view/engin/index', color: '#6366F1', desc: 'Ajouter un véhicule/asset'},
      {label: 'Nouveau tag', icon: 'pi pi-tag', route: '/tag/index', color: '#3B82F6', desc: 'Enregistrer un tag BLE'},
      {label: 'Nouveau client', icon: 'pi pi-briefcase', route: '/customer/index', color: '#10B981', desc: 'Créer un client B2B'},
    ],
  },
  {
    group: 'Organisation',
    items: [
      {label: 'Nouveau site', icon: 'pi pi-map-marker', route: '/worksite/index', color: '#F59E0B', desc: 'Déclarer un site'},
      {label: 'Nouveau dépôt', icon: 'pi pi-home', route: '/deposit/index', color: '#EF4444', desc: 'Ajouter un dépôt'},
      {label: 'Utilisateurs', icon: 'pi pi-users', route: '/view/staff/index', color: '#8B5CF6', desc: 'Gérer l\'équipe'},
    ],
  },
  {
    group: 'Analyse',
    items: [
      {label: 'Rapports', icon: 'pi pi-file', route: '/rapports/index', color: '#0EA5E9', desc: 'Générer un rapport'},
      {label: 'Carte live', icon: 'pi pi-map', route: '/tour/index', color: '#14B8A6', desc: 'Voir la carte temps réel'},
      {label: 'Inventaire', icon: 'pi pi-list', route: '/inventory/index', color: '#F97316', desc: 'Campagne inventaire'},
      {label: 'Réservations', icon: 'pi pi-calendar', route: '/reservations/index', color: '#A855F7', desc: 'Planning Gantt'},
    ],
  },
]

const QuickActionsDrawer = () => {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  const handleClick = (route) => {
    setVisible(false)
    if (route) navigate(route)
  }

  return (
    <>
      <button
        className='lt-fab'
        onClick={() => setVisible(true)}
        data-testid='quick-actions-fab'
        title='Actions rapides'
      >
        <i className='pi pi-bolt'></i>
      </button>

      <Sidebar
        visible={visible}
        position='right'
        onHide={() => setVisible(false)}
        className='lt-quick-drawer'
        showCloseIcon={false}
        data-testid='quick-actions-drawer'
      >
        <div className='lt-quick-drawer-head'>
          <div>
            <div className='lt-quick-drawer-title'><i className='pi pi-bolt' style={{marginRight: 8, color: '#F59E0B'}}></i>Actions rapides</div>
            <div className='lt-quick-drawer-sub'>Raccourcis vers les opérations fréquentes</div>
          </div>
          <button className='lt-quick-drawer-close' onClick={() => setVisible(false)} data-testid='quick-actions-close'>
            <i className='pi pi-times'></i>
          </button>
        </div>

        <div className='lt-quick-drawer-body'>
          {ACTIONS.map((group) => (
            <div key={group.group} className='lt-quick-group'>
              <div className='lt-quick-group-label'>{group.group}</div>
              <div className='lt-quick-grid'>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className='lt-quick-item'
                    onClick={() => handleClick(item.route)}
                    data-testid={`quick-action-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className='lt-quick-item-icon' style={{background: `${item.color}15`, color: item.color}}>
                      <i className={item.icon}></i>
                    </div>
                    <div className='lt-quick-item-text'>
                      <div className='lt-quick-item-label'>{item.label}</div>
                      <div className='lt-quick-item-desc'>{item.desc}</div>
                    </div>
                    <i className='pi pi-chevron-right lt-quick-item-arrow'></i>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sidebar>
    </>
  )
}

export default QuickActionsDrawer
