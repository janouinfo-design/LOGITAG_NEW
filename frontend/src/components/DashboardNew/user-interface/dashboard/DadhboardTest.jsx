import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {Chart} from 'primereact/chart'
import {fetchAllDashboards} from '../../service/dashboardService'
import {ProgressBar} from 'primereact/progressbar'
import {ProgressSpinner} from 'primereact/progressspinner'
import {Divider} from 'primereact/divider'

const DashboardTest = () => {
  const [dashboardJSON, setDashboardJSON] = useState(null)
  const [chartData, setChartData] = useState([])
  const [chartOptions, setChartOptions] = useState({})
  let [dashboards, setDashboards] = useState([])
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAllDashboards().then((response) => {
      setLoading(false)
      if (response?.success) {
        setDashboards(response.response)
      } else {
        setDashboards([])
      }
    })
  }, [])

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border')
    let data = dashboards
      .filter((o) => Array.isArray(o.values))
      .map((o) => ({
        title: o.title,
        data: {
          labels: o.labels,
          datasets: [
            {
              label: o.title,
              backgroundColor: documentStyle.getPropertyValue('--blue-500'),
              borderColor: documentStyle.getPropertyValue('--orange-500'),
              data: o.values,
            },
          ],
        },
      }))

    const options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            fontColor: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    }

    console.log('dataaaa:', data)
    setChartData(data)
    setChartOptions(options)
  }, [dashboards])

  console.log('dashboards:', dashboards)

  return (
    <div>
      <h3 className='text-gray-500'>Les KPI</h3>
      <Divider />
      {loading ? (
        <div className='flex flex-column align-items-center justify-content-center'>
          <ProgressSpinner />
          <strong>Chargement...</strong>
        </div>
      ) : (
        <div className='flex flex-wrap'>
          {chartData.map((o) => (
            <div className='w-6 p-3'>
              <div
                className='shadow-2 p-3'
                style={
                  {
                    /*maxHeight: '400px' , overflow: 'auto'*/
                  }
                }
              >
                <Chart
                  style={{height: '570px' /*o.data.labels.length*25+'px'*/}}
                  type='bar'
                  data={o.data}
                  options={chartOptions}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardTest
