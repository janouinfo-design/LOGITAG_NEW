import React from 'react'
import {Chart} from 'primereact/chart'

const PrimeChartDisplay = ({type, data, colors, height}) => {
  if (!data || data.length === 0) return null

  const keys = Object.keys(data[0]).filter((key) => key !== 'name')
  const labels = data.map((item) => item.name)

  const datasets = keys.map((key, index) => {
    const dataset = {
      label: key,
      data: data.map((item) => item[key]),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      tension: 0.4,
    }

    if (type === 'line' || type === 'area' || (type === 'composed' && index % 2 !== 0)) {
      dataset.fill = type === 'area'
      dataset.borderWidth = 2
    }

    return dataset
  })

  const chartData = {
    labels,
    datasets,
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#CBD5E1',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {color: '#64748B'},
        grid: {color: 'rgba(203, 213, 225, 0.2)'},
      },
      y: {
        ticks: {color: '#64748B'},
        grid: {color: 'rgba(203, 213, 225, 0.2)'},
      },
    },
  }

  const chartTypesMap = {
    bar: 'bar',
    line: 'line',
    area: 'line',
    pie: 'pie',
    composed: 'bar',
  }

  const pieChartData = {
    labels: keys,
    datasets: [
      {
        data: keys.map((key) => data.reduce((sum, item) => sum + (item[key] || 0), 0)),
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className='chart-container p-4 surface-card rounded-xl' style={{height}}>
      <Chart
        type={chartTypesMap[type]}
        data={type === 'pie' ? pieChartData : chartData}
        options={chartOptions}
        style={{height: '100%'}}
      />
    </div>
  )
}

export default PrimeChartDisplay
