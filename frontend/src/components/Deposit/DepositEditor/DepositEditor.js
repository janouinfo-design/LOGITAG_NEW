import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateDeposit,
  getEditDeposit,
  getSelectedDeposit,
  setEditDeposit,
  setSelectedDeposit,
} from '../../../store/slices/deposit.slice'

import _ from 'lodash'

function DepositEditor() {
  const visible = useAppSelector(getEditDeposit)
  const [inputs, setInputs] = useState({})
  const selectedDepot = useAppSelector(getSelectedDeposit)

  const dispatch = useAppDispatch()

  const onInputChanged = (e) => {
    let old = _.cloneDeep(selectedDepot)
    old = {...old, [e.target.name]: e.target.value}
    setInputs(old)
    dispatch(setSelectedDeposit(old))
  }

  const onHide = () => {
    dispatch(setEditDeposit(false))
  }

  const save = () => {
    dispatch(createOrUpdateDeposit()).then((res) => {
      if (res.payload) dispatch(setEditDeposit(false))
    })
  }

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregitrer' onClick={save} />
    </div>
  )

  return (
    <div>
      <DialogComponent visible={visible} footer={footer} header='Nouveau depot' onHide={onHide}>
        <div>
          <label>Nom du depot</label>
          <InputText
            value={selectedDepot?.name || selectedDepot?.label}
            onChange={onInputChanged}
            name='name'
            className='w-full'
          />
        </div>
        <div className='my-3'>
          <label>Code du depot</label>
          <InputText
            value={selectedDepot?.code}
            onChange={onInputChanged}
            name='code'
            className='w-full'
          />
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>Active</label>
          <InputSwitch
            checked={selectedDepot?.active === true || selectedDepot?.active == 1}
            onChange={onInputChanged}
            name='active'
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(DepositEditor)
