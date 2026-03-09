
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import DraggableWidget from '../widgets/DraggableWidget';
import { classNames } from 'primereact/utils';

const CustomDashboard = ({ 
  dashboardId, 
  onDeleteDashboard 
}) => {
  const [dashboard, setDashboard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Simplified for the conversion - actual implementation would use dashboardId
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('widgetId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    // Simplified drag and drop implementation
  };

  const handleRemoveWidget = (id) => {
    // Simplified widget removal
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {isEditing ? (
          <InputText
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nom du tableau de bord"
            className="w-full max-w-md"
          />
        ) : (
          <h2 className="text-2xl font-bold">
            {dashboard?.name || 'Tableau de bord personnalisé'}
          </h2>
        )}

        <div className="flex space-x-2">
          <Button
            icon={isEditing ? "pi pi-save" : "pi pi-pencil"}
            label={isEditing ? "Enregistrer" : "Modifier"}
            onClick={handleToggleEdit}
            className={classNames(
              'p-button-sm',
              isEditing ? 'p-button-success' : 'p-button-outlined'
            )}
          />
          
          {isEditing && (
            <Button
              icon="pi pi-trash"
              label="Supprimer"
              className="p-button-danger p-button-sm"
              onClick={() => onDeleteDashboard && onDeleteDashboard(dashboardId)}
            />
          )}
        </div>
      </div>

      {dashboard?.widgets && dashboard.widgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.widgets.map((widget, index) => (
            <DraggableWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isEditMode={isEditing}
            >
              {/* Widget content would go here */}
              <div className="p-4 text-center">
                <h3>{widget.title}</h3>
                <p className="text-muted-foreground">Widget content placeholder</p>
              </div>
            </DraggableWidget>
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <div className="p-8">
            <h3 className="text-xl mb-4">Aucun widget disponible</h3>
            <p className="text-muted-foreground mb-4">
              Ce tableau de bord est vide. Ajoutez des widgets pour l'enrichir.
            </p>
            {isEditing ? (
              <Button 
                icon="pi pi-plus" 
                label="Ajouter un widget" 
                className="p-button-success"
              />
            ) : (
              <Button 
                icon="pi pi-pencil" 
                label="Commencer l'édition" 
                onClick={handleToggleEdit}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomDashboard;
