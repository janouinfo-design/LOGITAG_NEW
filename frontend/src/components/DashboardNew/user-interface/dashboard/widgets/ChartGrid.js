import React, {useEffect, useState} from 'react'
import {Chart} from 'primereact/chart'
import {Button} from 'primereact/button'

const ChartGrid = ({charts}) => {
  const [chartData, setChartData] = useState([])
  const [chartOptions, setChartOptions] = useState({})

  const chartColors = [
    { gradient: ['rgba(37,99,235,0.8)', 'rgba(37,99,235,0.1)'], border: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    { gradient: ['rgba(16,185,129,0.8)', 'rgba(16,185,129,0.1)'], border: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    { gradient: ['rgba(249,115,22,0.8)', 'rgba(249,115,22,0.1)'], border: '#F97316', bg: 'rgba(249,115,22,0.08)' },
    { gradient: ['rgba(139,92,246,0.8)', 'rgba(139,92,246,0.1)'], border: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  ]

  useEffect(() => {
    let formattedCharts = charts?.map((chart, index) => {
      const colorSet = chartColors[index % chartColors.length]
      return {
        title: chart.label || chart.title,
        labels: chart.labels,
        datasets: [
          {
            type: 'bar',
            label: chart.label || chart.title,
            backgroundColor: colorSet.border + '20',
            borderColor: colorSet.border,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            data: chart.values,
            hoverBackgroundColor: colorSet.border + '40',
          },
        ],
      }
    })

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#0F172A',
          titleFont: { family: 'Manrope', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          boxPadding: 6,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 },
            maxRotation: 45,
          },
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 },
          },
          grid: {
            color: '#F1F5F9',
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
    }

    setChartData(formattedCharts)
    setChartOptions(options)
  }, [charts])

  if (!chartData || chartData.length === 0) return null

  return (
    <>
      <style>{`
        .lt-chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 20px;
          width: 100%;
        }
        .lt-chart-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .lt-chart-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          border-color: transparent;
        }
        .lt-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }
        .lt-chart-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .lt-chart-actions {
          display: flex;
          gap: 6px;
        }
        .lt-chart-actions .p-button {
          width: 34px !important;
          height: 34px !important;
          padding: 0 !important;
          border-radius: 10px !important;
        }
        .lt-chart-body {
          padding: 16px 24px 24px;
          height: 320px;
        }
        @keyframes ltChartFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lt-chart-card { animation: ltChartFade 0.5s ease-out backwards; }
        .lt-chart-card:nth-child(1) { animation-delay: 0.1s; }
        .lt-chart-card:nth-child(2) { animation-delay: 0.2s; }
        .lt-chart-card:nth-child(3) { animation-delay: 0.3s; }
        @media (max-width: 768px) {
          .lt-chart-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="lt-chart-grid" data-testid="chart-grid">
        {chartData?.map((item, index) => (
          <div className="lt-chart-card" key={index} data-testid={`chart-card-${index}`}>
            <div className="lt-chart-header">
              <h3 className="lt-chart-title">{item.title}</h3>
              <div className="lt-chart-actions">
                <Button
                  icon="pi pi-download"
                  className="p-button-text p-button-sm"
                  tooltip="Exporter"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            </div>
            <div className="lt-chart-body">
              <Chart type="bar" data={item} options={chartOptions} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ChartGrid
