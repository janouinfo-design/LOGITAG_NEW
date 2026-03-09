import {Dialog} from 'primereact'

import React from 'react'

export const DialogComponent = (props) => {
  const onHide = () => typeof props.onHide === 'function' && props.onHide()

  return (
    <Dialog visible={true} {...props} className={'w-11 md:w-6 z-10 ' + props.className}>
      {props.children}
    </Dialog>
  )
}
