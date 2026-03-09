
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import ChartWidget from '@/components/dashboard/widgets/ChartWidget';
import { cn } from '@/lib/utils';

const DraggableWidget = ({
  widget,
  index,
  onRemove,
  onEdit,
  isEditing
}) => {
  const { id, type, title, config } = widget;
  const [isHovering, setIsHovering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const renderWidget = () => {
    if (type === 'kpi') {
      const trendValue = config.trend || "";
      const isPositive = trendValue.startsWith('+');
      
      return (
        <div className="h-full flex flex-col justify-center items-center pt-4">
          <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text">
            {config.value}
          </div>
          {config.trend && (
            <Badge 
              value={config.trend} 
              severity={isPositive ? "success" : "danger"} 
              className="p-2"
            >
              {isPositive ? (
                <i className="pi pi-arrow-up mr-1" style={{ fontSize: '0.8rem' }} />
              ) : (
                <i className="pi pi-arrow-down mr-1" style={{ fontSize: '0.8rem' }} />
              )}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground mt-3 text-center px-2">
            {config.description}
          </p>
        </div>
      );
    } else if (type === 'chart') {
      return (
        <ChartWidget
          title=""
          data={config.data}
          type={config.type}
          colors={config.colors}
          height={isExpanded ? 300 : 200}
          showControls={false}
        />
      );
    }
    return null;
  };

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!isEditing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "relative transition-all duration-300",
            snapshot.isDragging ? "z-10" : "",
            isExpanded ? "md:col-span-2 md:row-span-2" : ""
          )}
          style={{
            ...provided.draggableProps.style,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Card 
            className={cn(
              "h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-border/40",
              snapshot.isDragging ? "ring-2 ring-primary shadow-xl scale-[1.02]" : "",
              isHovering && !snapshot.isDragging ? "scale-[1.01]" : "",
              isExpanded ? "col-span-2 row-span-2" : "",
              type === 'kpi' ? "bg-gradient-to-br from-card to-background" : "bg-card"
            )}
            header={
              <div className={cn(
                "flex flex-row items-center justify-between p-3",
                "border-b border-border/20"
              )}>
                <div className="text-sm font-medium flex items-center">
                  {title}
                  {!isEditing && type === 'chart' && (
                    <Button 
                      icon={isExpanded ? "pi pi-chevron-down" : "pi pi-chevron-up"} 
                      className="p-button-text p-button-sm ml-2"
                      onClick={() => setIsExpanded(!isExpanded)}
                    />
                  )}
                </div>
                {isEditing ? (
                  <div className="flex space-x-1">
                    <div {...provided.dragHandleProps} className="cursor-move">
                      <Button 
                        icon="pi pi-bars" 
                        className="p-button-text p-button-sm" 
                      />
                    </div>
                    <Button 
                      icon="pi pi-cog" 
                      className="p-button-text p-button-sm"
                      onClick={() => onEdit(widget)}
                    />
                    <Button 
                      icon="pi pi-times" 
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={() => onRemove(id)}
                    />
                  </div>
                ) : (
                  <Badge 
                    value={type === 'kpi' ? 'KPI' : config.type}
                    severity={type === 'kpi' ? "info" : "secondary"}
                    className="p-badge-sm"
                  />
                )}
              </div>
            }
          >
            <div className="p-3">
              {renderWidget()}
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableWidget;
