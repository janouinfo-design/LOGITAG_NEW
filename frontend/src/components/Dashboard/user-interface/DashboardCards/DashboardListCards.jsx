import React, {useEffect, useRef} from 'react'
import CardDashboard from './CardDashboard'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getSelectedMode,
  setCardSelected,
  setLoadingCard,
  setSelectedMode,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {SplitButton} from 'primereact/splitbutton'

const DashboardListCards = () => {
  const dashboardData = useAppSelector(getDashboard)
  const modeSelected = useAppSelector(getSelectedMode)
  const toast = useRef(null)

  const dispatch = useAppDispatch()


  const items = [
    {
      label: 'Circles',
      icon: 'pi pi-chart-pie',
      command: () => {
        dispatch(setCardSelected(null))
        dispatch(setSelectedMode('circle'))
      },
    },
    {
      label: 'Cards',
      icon: 'pi pi-id-card',
      command: () => {
        dispatch(setSelectedMode('card'))
      },
    },
  ]

  const handleSelectedCard = (item) => {
    let obj = {
      src: item.src,
      title: item.title,
      code: item.code,
      titledetail: item.titledetail,
    }
    dispatch(setCardSelected(obj))
    dispatch(setLoadingCard(true))
    dispatch(fetchDashboardDetail(item.code)).then(({payload}) => {
      if (payload) {
        dispatch(setLoadingCard(false))
      }
    })
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
    <div style={{width: '98%'}} className=' p-3'>
      <div className='py-3 flex flex-row align-items-center justify-content-between'>
        <h1 className='text-700'>
          <OlangItem olang={'Dashboard'} />
        </h1>
        <div>
          <SplitButton onClick={switchMode} label='Mode' icon='pi pi-sync' model={items} />
        </div>
      </div>
      <div className='flex align-items-center justify-content-between w-full '>
        {Array.isArray(dashboardData) && dashboardData.length > 0 && (
          <div className='flex flex-wrap gap-6 align-items-center  w-full'>
            {dashboardData?.map((item) => (
              <CardDashboard
                code={item.code}
                title={item.label || item.title}
                bgColor={item.bgColor}
                icon={item.icon}
                value={item.value}
                quantity={item.quantity}
                quantityLabel={item.quantityLabel}
                onSelectedCard={() => handleSelectedCard(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardListCards
