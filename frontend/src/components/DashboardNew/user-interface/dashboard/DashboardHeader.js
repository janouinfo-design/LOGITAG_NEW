
import React from 'react';
import { Button } from 'primereact/button';
import DashboardSelector from './widgets/DashboardSelector';

/**
 * Header component for the dashboard
 */
const DashboardHeader = ({ title, selectedDashboard, onDashboardChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border/40">
      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-logitag-primary to-logitag-secondary bg-clip-text text-transparent">{title}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <DashboardSelector 
          selectedDashboard={selectedDashboard} 
          onDashboardChange={onDashboardChange} 
        />
        
        <Button 
          icon="pi pi-download" 
          severity="secondary"
          outlined
          size="small"
          label="Exporter"
          className="p-button-sm"
        />
        <Button 
          icon="pi pi-print" 
          severity="secondary"
          outlined
          size="small"
          label="Imprimer"
          className="p-button-sm"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
