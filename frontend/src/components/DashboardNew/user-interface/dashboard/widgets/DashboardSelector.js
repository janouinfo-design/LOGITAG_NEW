
import React from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { toast } from 'primereact/toast';

const DashboardSelector = ({
  selectedDashboard,
  onDashboardChange
}) => {
  const toastRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const dashboards = [
    { id: 'analyse-stocks', label: 'Analyse des stocks et mouvements', icon: 'pi pi-box' },
    { id: 'duree-presence', label: 'Durée de présence des engins', icon: 'pi pi-clock' },
    { id: 'classement-clients', label: 'Classement des clients', icon: 'pi pi-users' },
    { id: 'utilisation-engins', label: 'Suivi de l\'utilisation des engins', icon: 'pi pi-truck' },
    { id: 'frequence-visite', label: 'Fréquence de visite chez un client', icon: 'pi pi-calendar' }
  ];

  const handleDashboardChange = (dashboardId) => {
    onDashboardChange(dashboardId);
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      toastRef.current.show({
        severity: 'success',
        summary: 'Tableau de bord chargé',
        detail: `Tableau de bord "${dashboard.label}" chargé`,
        life: 3000
      });
    }
  };

  const menuItems = dashboards.map(dashboard => ({
    label: dashboard.label,
    icon: dashboard.icon,
    command: () => handleDashboardChange(dashboard.id)
  }));

  return (
    <>
      <Button 
        label="Tableaux de bord" 
        icon="pi pi-chart-bar"
        outlined
        onClick={(e) => menuRef.current.toggle(e)}
        className="p-button-sm"
      />
      <Menu 
        model={menuItems} 
        popup 
        ref={menuRef} 
        className="dashboard-selector-menu"
      />
      <toast ref={toastRef} />
    </>
  );
};

export default DashboardSelector;
