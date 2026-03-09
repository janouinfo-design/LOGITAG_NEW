import React from 'react'
import { useSelector } from 'react-redux'
// import { getLayoutParams } from '../../../../store/slices/layout.slice'
import { useWindowResize } from '../../../hooks/useWindowResize'
import './style.css'
export default function Subheader({template, children , style , parentStyle = {} , className}) {
  // let layoutParams = useSelector(getLayoutParams)
  let { width, height } = useWindowResize();
  return (
      !children ? null :
      <div className="fixed bg-white shadow-1" style={{
        ...parentStyle,
        top: '57px' ,  
        left: width > 767 ? `${70 /*layoutParams.asideWidth*/}px` : '0',
        zIndex:100,
        transition: 'all .5s',
        right: 0}}>
        {children}
      </div>
  )
}

//,  
