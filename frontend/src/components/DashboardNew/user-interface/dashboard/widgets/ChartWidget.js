import {useState, useRef} from 'react'
import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import {Menu} from 'primereact/menu'
import {InputText} from 'primereact/inputtext'
import {Chart} from 'primereact/chart'

const ChartWidget = ({
  title,
  data,
  type = 'bar',
  colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'],
  height = 300,
  className = '',
  showControls = true,
}) => {
  const [chartType, setChartType] = useState(type)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const chartMenuRef = useRef(null)
  const exportMenuRef = useRef(null)

  const keys = data.length ? Object.keys(data[0]).filter((k) => k !== 'name') : []

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const chartTypeItems = [
    {label: 'Bar Chart', icon: 'pi pi-chart-bar', command: () => setChartType('bar')},
    {label: 'Line Chart', icon: 'pi pi-chart-line', command: () => setChartType('line')},
    {label: 'Pie Chart', icon: 'pi pi-chart-pie', command: () => setChartType('pie')},
    {label: 'Doughnut Chart', icon: 'pi pi-chart-pie', command: () => setChartType('doughnut')},
    {label: 'Radar Chart', icon: 'pi pi-chart-bar', command: () => setChartType('radar')},
  ]

  const exportItems = [
    {
      label: 'CSV',
      icon: 'pi pi-download',
      command: () => downloadCSV(data, editedTitle || title),
    },
    {
      label: 'PDF',
      icon: 'pi pi-file-pdf',
    },
  ]

  const downloadCSV = (data, filename) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n')
    const blob = new Blob([csv], {type: 'text/csv'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${filename}.csv`
    a.click()
  }

  const getChartData = () => {
    const labels = data.map((d) => d.name)
    const datasets = keys.map((key, i) => ({
      label: key,
      data: data.map((d) => d[key]),
      backgroundColor: chartType === 'bar' ? colors[i % colors.length] : undefined,
      borderColor: colors[i % colors.length],
      fill: chartType === 'line' ? false : true,
    }))

    if (chartType === 'pie' || chartType === 'doughnut') {
      const pieValues = keys.map((key, i) => ({
        label: key,
        value: data.reduce((sum, d) => sum + (d[key] || 0), 0),
        color: colors[i % colors.length],
      }))

      return {
        labels: pieValues.map((p) => p.label),
        datasets: [
          {
            data: pieValues.map((p) => p.value),
            backgroundColor: pieValues.map((p) => p.color),
          },
        ],
      }
    }

    return {labels, datasets}
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#495057',
        },
      },
    },
    scales:
      chartType === 'pie' || chartType === 'doughnut'
        ? {}
        : {
            x: {ticks: {color: '#495057'}, grid: {color: '#ebedef'}},
            y: {ticks: {color: '#495057'}, grid: {color: '#ebedef'}},
          },
  }

  return (
    <Card className={`h-full dashboard-widget ${className}`}>
      <div className='flex justify-between items-center pb-3 px-3 pt-3'>
        {isEditing ? (
          <InputText
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            className='w-full'
            autoFocus
          />
        ) : (
          <div className='text-lg font-semibold'>{editedTitle || title}</div>
        )}

        {showControls && (
          <div className='flex items-center space-x-2'>
            <Button
              icon='pi pi-chart-bar'
              className='p-button-rounded p-button-outlined p-button-sm'
              onClick={(e) => chartMenuRef.current.toggle(e)}
            />
            <Menu model={chartTypeItems} popup ref={chartMenuRef} />

            <Button
              icon='pi pi-download'
              className='p-button-rounded p-button-outlined p-button-sm'
              onClick={(e) => exportMenuRef.current.toggle(e)}
            />
            <Menu model={exportItems} popup ref={exportMenuRef} />

            <Button
              icon='pi pi-pencil'
              className='p-button-rounded p-button-outlined p-button-sm'
              onClick={() => setIsEditing(true)}
            />
            <Button
              icon='pi pi-trash'
              className='p-button-rounded p-button-outlined p-button-danger p-button-sm'
            />
          </div>
        )}
      </div>

      <div className='px-3 pb-3' style={{height: `${height}px`}}>
        <Chart type={chartType} data={getChartData()} options={chartOptions} />
      </div>
    </Card>
  )
}

export default ChartWidget
