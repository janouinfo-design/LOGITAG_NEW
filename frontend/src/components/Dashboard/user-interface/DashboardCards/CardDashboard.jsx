import React from 'react'
import {useAppSelector} from '../../../../hooks'
import {getCardSelected, getLoadingCard} from '../../slice/dashboard.slice'
import {ProgressSpinner} from 'primereact/progressspinner'
import {ProgressBar} from 'primereact/progressbar'

const CardDashboard = ({
  title,
  quantity,
  icon,
  value,
  bgColor,
  quantityLabel,
  onSelectedCard,
  code,
}) => {
  const selectedCard = useAppSelector(getCardSelected)
  const loadingCard = useAppSelector(getLoadingCard)
  const getColor = (value) => {
    if (value < 50) {
      return 'bg-green-500'
    } else if (value < 80) {
      return 'bg-yellow-500'
    } else {
      return 'bg-red-500'
    }
  }

  return (
    <div
      onClick={onSelectedCard}
      style={{
        height: '200px',
        backgroundColor: 'white',
        border: selectedCard?.code === code ? '6px solid' + bgColor : 'none',
      }}
      className='sm:w-full md:w-full lg:w-6 xl:w-28rem md:bg-blue-200 xl:bg-green-200 lg:bg-red-200 w-full zoomin animation-duration-1000 cursor-pointer border-round-lg shadow-2 relative hover:shadow-6 hover-scale flex align-items-center justify-content-center'
    >
      {selectedCard?.code === code && loadingCard && (
        <div style={{right: '10px', top: '10px'}} className='absolute'>
          <ProgressSpinner
            style={{width: '50px', height: '50px'}}
            strokeWidth='6'
            fill='var(--surface-ground)'
            animationDuration='1s'
          />
        </div>
      )}
      <div
        style={{width: '85%', height: '85%'}}
        className='p-2 flex flex-column justify-content-around'
      >
        <div className='flex flex-row align-items-center justify-content-between'>
          <div className='flex flex-row align-items-center'>
            <div
              style={{width: '60px', height: '60px', backgroundColor: bgColor}}
              className='border-circle flex flex-row align-items-center justify-content-center'
            >
              <i class={`fa-solid text-5xl text-white ${icon}`}></i>
            </div>
            <div className='text-4xl text-gray-500 font-semibold pl-3'>{title}</div>
          </div>
        </div>
        {/* <div
          style={{borderRadius: '10px'}}
          className='w-full h-2 bg-gray-200 animate-width animation-duration-3000'
        >
          <div
            style={{
              width: value + '%',
              borderTopLeftRadius: '10px',
              borderBottomLeftRadius: '10px',
              backgroundColor: bgColor,
            }}
            className={`text-gray-500 text-center`}
          >
            <span className='text-white'>{value}%</span>
          </div>
        </div> */}
        <ProgressBar color={bgColor} value={value}></ProgressBar>
        <div className='flex flex-row w-full align-items-center justify-content-between'>
          <div className='text-gray-700 text-xl'>{quantityLabel}</div>
          <div className='flex flex-row align-items-center'>
            <span className='text-xl font-semibold text-gray-700'>{quantity}</span>
            <i style={{color: bgColor}} class='fa-duotone fa-layer-group text-2xl pl-1'></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDashboard
