import {Dialog} from 'primereact'

import React from 'react'

export const DialogComponent = (props) => {
  const onHide = () => typeof props.onHide === 'function' && props.onHide()

  return (
    <Dialog
      visible={true}
      {...props}
      className={
        props.className + ` w-11 ${(props.className || '').includes('md:') ? '' : 'md:w-6'} z-10 `
      }
    >
      {props.children}
    </Dialog>
  )
}
