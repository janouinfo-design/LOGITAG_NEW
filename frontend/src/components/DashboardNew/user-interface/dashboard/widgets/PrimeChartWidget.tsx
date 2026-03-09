
import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import PrimeChartDisplay from './charts/PrimeChartDisplay';
import { downloadCSV, downloadPDF } from './charts/PrimeChartExport';

type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'composed';

interface ChartWidgetProps {
  title: string;
  data: any[];
  type?: ChartType;
  colors?: string[];
  height?: number;
  className?: string;
  showControls?: boolean;
}

const PrimeChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  data,
  type = 'bar',
  colors = ['#1E88E5', '#E91E63', '#66BB6A'],
  height = 300,
  className = '',
  showControls = true
}) => {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const chartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<Menu>(null);
  const downloadMenuRef = useRef<Menu>(null);
  
  const handleSaveEdit = () => {
    setIsEditing(false);
  };
  
  const chartTypeItems = [
    {
      label: 'Bar Chart',
      icon: 'pi pi-chart-bar',
      command: () => setChartType('bar')
    },
    {
      label: 'Line Chart',
      icon: 'pi pi-chart-line',
      command: () => setChartType('line')
    },
    {
      label: 'Area Chart',
      icon: 'pi pi-chart-line',
      command: () => setChartType('area')
    },
    {
      label: 'Pie Chart',
      icon: 'pi pi-chart-pie',
      command: () => setChartType('pie')
    },
    {
      label: 'Composed Chart',
      icon: 'pi pi-chart-bar',
      command: () => setChartType('composed')
    }
  ];
  
  const downloadItems = [
    {
      label: 'CSV',
      icon: 'pi pi-download',
      command: () => downloadCSV(data, editedTitle || title)
    },
    {
      label: 'PDF',
      icon: 'pi pi-file-pdf',
      command: () => downloadPDF(chartRef, editedTitle || title)
    }
  ];

  const headerContent = (
    <div className="flex justify-content-between align-items-center">
      {isEditing ? (
        <InputText
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          className="w-full mr-3"
          autoFocus
        />
      ) : (
        <h3 className="text-xl font-medium m-0">{editedTitle || title}</h3>
      )}
      
      {showControls && (
        <div className="flex gap-2">
          <Button 
            icon="pi pi-cog" 
            rounded 
            text 
            aria-label="Chart options"
            onClick={(e) => menuRef.current?.toggle(e)}
          />
          <Menu model={chartTypeItems} popup ref={menuRef} />
          
          <Button 
            icon="pi pi-download" 
            rounded 
            text 
            aria-label="Download options"
            onClick={(e) => downloadMenuRef.current?.toggle(e)}
          />
          <Menu model={downloadItems} popup ref={downloadMenuRef} />
          
          <Button 
            icon="pi pi-pencil" 
            rounded 
            text 
            aria-label="Edit title"
            onClick={() => setIsEditing(true)}
          />
          
          <Button 
            icon="pi pi-trash" 
            rounded 
            text 
            severity="danger" 
            aria-label="Delete widget"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={`h-full overflow-hidden ${className}`} ref={chartRef}>
      <Card header={headerContent} className="h-full">
        <div className="p-2">
          <PrimeChartDisplay 
            type={chartType}
            data={data}
            colors={colors}
            height={height}
          />
        </div>
      </Card>
    </div>
  );
};

export default PrimeChartWidget;
