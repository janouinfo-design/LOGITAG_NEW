import {ProgressSpinner} from 'primereact/progressspinner'
import React from 'react'

const Loader = () => {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <ProgressSpinner
        style={{width: '50px', height: '50px'}}
        strokeWidth='4'
        fill='var(--surface-ground)'
        animationDuration='.5s'
      />
    </div>
  )
}

export default Loader
