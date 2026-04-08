import React, {useEffect, useRef} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getCardSelected, setCardSelected} from '../../slice/dashboard.slice'
import DashboardDetail from '../DashboardDetail/DashboardDetail'
import {Panel} from 'primereact/panel'

const DashboardTable = () => {
  const selectedCard = useAppSelector(getCardSelected)
  const ref = useRef(null)

  const dispatch = useAppDispatch()

  const onHideTable = () => {
    dispatch(setCardSelected(null))
  }

  return (
    <div className='w-full fadeinleft animation-duration-2000 flex flex-column justify-content-center align-items-center'>
      <div
        style={{width: '95%'}}
        className='flex flex-row justify-content-between align-items-center py-3'
      >
        <div className='text-3xl font-bold text-700'>{selectedCard?.titledetail || ''}</div>
        <ButtonComponent
          icon='pi pi-times'
          rounded
          outlined
          severity='danger'
          aria-label='Cancel'
          onClick={onHideTable}
        />
      </div>
      <Panel ref={ref} header='Table' toggleable style={{width: '96%'}}>
        <DashboardDetail />
      </Panel>
    </div>
  )
}

export default DashboardTable
