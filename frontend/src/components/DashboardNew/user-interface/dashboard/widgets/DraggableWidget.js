
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const DraggableWidget = ({
  id,
  title,
  children,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isEditMode = false
}) => {
  return (
    <div
      className={`h-full rounded-lg overflow-hidden shadow-sm border transition-all ${isEditMode ? "shadow-md border-dashed hover:border-primary cursor-grab active:cursor-grabbing" : ""}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
    >
      {isEditMode && (
        <div className="flex items-center justify-between p-2 bg-muted/50">
          <div className="flex items-center text-sm text-muted-foreground">
            <i className="pi pi-bars mr-2" style={{ fontSize: '1.2rem' }}></i>
            {title}
          </div>
          <Button 
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-text p-button-sm"
            onClick={() => onRemove(id)}
          />
        </div>
      )}
      <div className="h-full">{children}</div>
    </div>
  );
};

export default DraggableWidget;
