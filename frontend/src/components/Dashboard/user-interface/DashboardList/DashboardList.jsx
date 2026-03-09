import {Card} from 'primereact/card'
import {Fragment, useEffect} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {CircularProgressbar, CircularProgressbarWithChildren} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import ChangingProgressProvider from './ChangingProgressProvider'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getSelectedMode,
  setCardSelected,
  setEditDashboard,
  setSelectedDashboard,
  setSelectedMode,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {SplitButton} from 'primereact/splitbutton'

const DashboardList = () => {
  let dashboardData = useAppSelector(getDashboard)
  const modeSelected = useAppSelector(getSelectedMode)
  const dispatch = useAppDispatch()

  const items = [
    {
      label: 'Circles',
      icon: 'pi pi-chart-pie',
      command: () => {
        dispatch(setSelectedMode('circle'))
      },
    },
    {
      label: 'Cards',
      icon: 'pi pi-id-card',
      command: () => {
        dispatch(setSelectedDashboard(null))
        dispatch(setCardSelected(null))
        dispatch(setSelectedMode('card'))
      },
    },
  ]

  const handleEditDashboard = (item) => {
    dispatch(setEditDashboard(true))
    dispatch(fetchDashboardDetail(item.code))
    dispatch(
      setSelectedDashboard({
        title: item.title,
        code: item.code,
        src: item.src,
        titledetail: item.titledetail,
      })
    )
  }
  const switchMode = () => {
    if (modeSelected === 'card') {
      dispatch(setSelectedMode('circle'))
    } else {
      dispatch(setSelectedMode('card'))
    }
  }

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [])

  return (
    <Fragment>
      <div className='py-3 flex flex-row align-items-center justify-content-between'>
        <h1 className='text-700'>
          <OlangItem olang={'dashboard'} />
        </h1>
        <div>
          <SplitButton onClick={switchMode} label='Mode' icon='pi pi-sync' model={items} />
        </div>
      </div>

      {Array.isArray(dashboardData) && (
        <div className='p-5 flex justify-content-center flex-wrap'>
          {(dashboardData || [])?.map((item, index) => (
            <Card key={index} className='m-2'>
              <p className='p-1 m-2 text-center text-2xl font-semibold text-900'>{item.title}</p>
              <ChangingProgressProvider values={[0, 20, 40, 60, 80, 100]}>
                {(percentage) => (
                  <CircularProgressbarWithChildren
                    value={item.value}
                    styles={{
                      path: {
                        stroke: `${item.color}`,
                      },
                    }}
                  >
                    <i
                      style={{color: `${item.color}`}}
                      className={`${item.icon}  text-7xl`}
                      aria-hidden='true'
                    ></i>
                    <p className=''>{'______________'}</p>
                    <div>
                      <p className='text-900 text-6xl font-medium '>
                        {item.value}
                        {item.unit}
                      </p>
                    </div>
                  </CircularProgressbarWithChildren>
                )}
              </ChangingProgressProvider>

              <div className='text-center p-5'>
                <p className='text-4xl'>
                  {item.quantity} <small>{item.quantityLabel ?? 'NO LABEL check DB'}</small>
                </p>
              </div>

              <div className='text-center'>
                <ButtonComponent
                  label={<OlangItem olang={'Voir.plus'} />}
                  onClick={() => handleEditDashboard(item)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Fragment>
  )
}

export default DashboardList
