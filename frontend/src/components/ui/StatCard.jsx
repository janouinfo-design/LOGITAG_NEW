import React from 'react'
import {Card} from './Card'

const StatCard = ({title, value, icon, description, ...props}) => {
  return (
    <Card className='size-[30%] cursor-pointer p-6 bg-gradient-to-br rounded-3xl from-white to-gray-50 border border-gray-100  shadow-sm hover:scale-[1.05] hover:shadow-xl transition-shadow'>
      <div className='flex items-center gap-4'>
        <div
          style={{width: '50px', height: '50px'}}
          className='flex items-center justify-center rounded-full bg-sky-100 text-primary'
        >
          <i style={{color: props.backgroundColor}} className={icon + ' text-3xl'}></i>
        </div>
        <div>
          <h3 className='text-xl font-semibold text-gray-800 text-muted-foreground'>{title}</h3>
          <p className='text-3xl font-semibold'>{value}</p>
          <p className='text-base text-gray-600 text-muted-foreground mt-1'>{description}</p>
        </div>
      </div>
    </Card>
  )
}

export default StatCard
