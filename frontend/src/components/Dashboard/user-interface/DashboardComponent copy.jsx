import {Card} from 'primereact/card'
import {Fragment, useEffect, useState} from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Chart} from 'primereact/chart'

const DashboardComponent = () => {
  const data = [
    {title: "Taux d'utilisation", value: '45%', icon: 'fas fa-tachometer-alt', color: 'primary'},
    {title: 'Taux de panne', value: '70%', icon: 'fas fa-exclamation-triangle', color: 'danger'},
    {title: "Taux d'engin tagué", value: '60%', icon: 'fas fa-tag', color: 'success'},
    {title: 'Taux de tags actifs', value: '20%', icon: 'fas fa-check-circle', color: 'secondry'},
  ]
  const [chartData, setChartData] = useState({})
  const [chartOptions, setChartOptions] = useState({})
  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement)
    const data = {
      labels: ['All', 'Success', 'Failed'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: ['#707173', '#523F8D', '#D64B70'],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--red-400'),
          ],
        },
      ],
    }
    const options = {
      cutout: '60%',
    }

    setChartData(data)
    setChartOptions(options)
  }, [])
  return (
    <Fragment>
      {/* <div style={{backgroundColor: '#53408C'}} className='header p-5 rounded'>
        <h1 className='text-white'>
          <OlangItem olang={'dashboard'} />
        </h1>
      </div>
      <div className='flex justify-content-center'>
        <Chart
          type='doughnut'
          data={chartData}
          options={chartOptions}
          className='w-full md:w-30rem'
        />
      </div> */}

      <div style={{backgroundColor: '#53408C'}} className='header p-5 rounded'>
        <h1 className='text-white'>
          <OlangItem olang={'dashboard'} />
        </h1>
      </div>
      <div className='p-5 flex justify-content-center'>
        {data.map((item, index) => (
          <Card className='md:w-25rem m-2 text-center'>
            <h4 style={{backgroundColor: '#704D8F'}} className='text-white  p-1'>
              {item.title}
            </h4>
            <i className={`${item.icon} text-6xl  p-3 text-${item.color}`} aria-hidden='true'></i>
            <h5>{item.value}</h5>
          </Card>
        ))}
      </div>
    </Fragment>
  )
}

export default DashboardComponent
