import React , { useEffect } from 'react'
import {Card} from 'primereact/card'

const KPICardGrid = ({cards}) => {
  console.log(cards, 'KPICardGrid')
  if (!cards || cards.length === 0) {
    return null
  }

  const headerTemplate = (title, icon, backgroundColor) => {
    return (
      <div className='flex justify-content-between align-items-center p-3'>
        <span className='text-lg font-medium'>{title}</span>
        <span className='text-2xl font-bold'>
          <i style={{color: backgroundColor}} className={icon + ' text-3xl'} />
        </span>
      </div>
    )
  }

  

  return (
    <div className='flex justify-content-between flex-wrap align-items-center'>
      {cards.map((card, index) => (
        <Card className='w-2 h-15rem' key={index} header={() => headerTemplate(card.title, card.icon, card.iconColor)}>
          <div className='text-3xl font-bold'>{card.value}</div>
          {card.change && (
            <p className='text-xs text-muted-foreground'>
              {card.change.startsWith('+') ? (
                <span className='text-green-500'>{card.change}</span>
              ) : (
                <span className='text-red-500'>{card.change}</span>
              )}{' '}
              par rapport au mois dernier
            </p>
          )}
          <p className='text-xs text-muted-foreground mt-1'>{card.description}</p>
        </Card>
      ))}
    </div>
  )
}

export default KPICardGrid
