import React from 'react'
import {Card} from 'primereact/card'

const WidgetPicker = ({onAddWidget}) => {
  const widgetTypes = [
    {
      type: 'kpi',
      label: 'KPI',
      description: 'Indicateur de performance',
      icon: <i className='pi pi-chart-line text-xl'></i>,
      colorClass: 'from-indigo-600 to-purple-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-indigo-500/20',
    },
    {
      type: 'chart',
      label: 'Graphique à barres',
      description: 'Visualisation par catégories',
      icon: <i className='pi pi-chart-bar text-xl'></i>,
      colorClass: 'from-emerald-600 to-teal-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-emerald-500/20',
      chartType: 'bar',
    },
    {
      type: 'chart',
      label: 'Graphique linéaire',
      description: 'Tendance sur une période',
      icon: <i className='pi pi-chart-line text-xl'></i>,
      colorClass: 'from-violet-600 to-fuchsia-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-violet-500/20',
      chartType: 'line',
    },
    {
      type: 'chart',
      label: 'Graphique circulaire',
      description: 'Distribution en pourcentage',
      icon: <i className='pi pi-chart-pie text-xl'></i>,
      colorClass: 'from-amber-500 to-orange-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-amber-500/20',
      chartType: 'pie',
    },
    {
      type: 'chart',
      label: 'Graphique zone',
      description: 'Volume sur une période',
      icon: <i className='pi pi-chart-line text-xl'></i>,
      colorClass: 'from-sky-600 to-blue-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-sky-500/20',
      chartType: 'area',
    },
    {
      type: 'chart',
      label: 'Graphique composé',
      description: 'Combinaison de styles',
      icon: <i className='pi pi-table text-xl'></i>,
      colorClass: 'from-rose-600 to-pink-700',
      bgClass: 'surface-card',
      hoverClass: 'hover:surface-hover',
      borderClass: 'border-rose-500/20',
      chartType: 'composed',
    },
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
      {widgetTypes.map((widget, index) => {
        const header = (
          <div className='flex justify-center my-2'>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${widget.colorClass} text-white`}
            >
              {widget.icon}
            </div>
          </div>
        )

        return (
          <Card
            key={index}
            className={`cursor-pointer border-1 transition-all duration-300 transform hover:scale-105 ${widget.borderClass} ${widget.bgClass} ${widget.hoverClass}`}
            header={header}
            onClick={() => onAddWidget(widget.type === 'chart' ? 'chart' : widget.type)}
          >
            <div className='text-center'>
              <h4 className='text-base font-semibold my-2'>{widget.label}</h4>
              <p className='text-sm text-color-secondary'>{widget.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default WidgetPicker
