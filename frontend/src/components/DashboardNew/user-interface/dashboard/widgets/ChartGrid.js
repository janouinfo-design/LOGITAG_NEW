import React, {useEffect, useState} from 'react'
import {Card} from 'primereact/card'
import ChartWidget from './ChartWidget'
import {Chart} from 'primereact/chart'
import {Button} from 'primereact/button'

const ChartGrid = ({charts}) => {
  const [chartData, setChartData] = useState([])
  const [chartOptions, setChartOptions] = useState({})

  console.log('charts', charts)

  const header = (title) => {
    return (
      <div className='flex flex-row justify-between'>
        <h1 className='text-2xl font-semibold'>{title}</h1>
        <Button label='Exporter' severity='secondary' className='p-button-sm' />
      </div>
    )
  }

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    let formattedCharts = charts?.map((chart, index) => {
      console.log('chart', chart)
      return {
        title: chart.label || chart.title,
        labels: chart.labels,
        datasets: [
          {
            type: 'bar',
            label:chart.label || chart.title,
            backgroundColor: documentStyle.getPropertyValue(
              index % 2 === 0 ? '--blue-500' : '--green-500'
            ),
            data: chart.values,
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      }
    })
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    }

    setChartData(formattedCharts)
    setChartOptions(options)
  }, [charts])

  console.log('chartData', chartData)

  return (
    <div className='flex flex-wrap flex-row-reverse items-center gap-4 w-full'>
      {chartData?.map((item, index) => (
        <Card
          key={index}
          className='shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl border-none w-full'
          // header={() => header(item.title)}
          title={item.label || item.title}
          pt={{
            header: {
              className:
                'bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border-b border-border/20',
            },
            title: {className: 'text-lg font-medium'},
          }}
        >
          <Chart type='line' data={item} options={chartOptions} />
        </Card>
      ))}
    </div>
  )
}

export default ChartGrid
