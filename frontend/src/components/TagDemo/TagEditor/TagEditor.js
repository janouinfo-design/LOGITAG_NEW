import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../hooks'

import _ from 'lodash'
import {
  createOrUpdateTag,
  getEditTag,
  getSelectedTag,
  setEditTag,
  setSelectedTag,
} from '../../../store/slices/tag.slice'

function TagEditor() {
  const visible = useAppSelector(getEditTag)
  const [inputs, setInputs] = useState({})
  const selectedTag = useAppSelector(getSelectedTag)

  const dispatch = useAppDispatch()

  const onInputChanged = (e) => {
    let old = _.cloneDeep(selectedTag)
    old = {...old, [e.target.name]: e.target.value}
    setInputs(old)
    dispatch(setSelectedTag(old))
  }

  const onHide = () => {
    dispatch(setEditTag(false))
  }

  const save = () => {
    dispatch(createOrUpdateTag()).then((res) => {
      if (res.payload) dispatch(setEditTag(false))
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
      <DialogComponent visible={visible} footer={footer} header='Nouveau tag' onHide={onHide}>
        <div>
          <label>Nom</label>
          <InputText
            value={selectedTag?.code}
            onChange={onInputChanged}
            name='code'
            className='w-full'
          />
        </div>
        <div className='my-3'>
          <label>Log</label>
          <InputText
            value={selectedTag?.log}
            onChange={onInputChanged}
            name='log'
            className='w-full'
          />
        </div>
        <div className='my-3'>
          <label>Adresse</label>
          <InputText
            value={selectedTag?.adresse}
            onChange={onInputChanged}
            name='adresse'
            className='w-full'
          />
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>Active</label>
          <InputSwitch
            checked={selectedTag?.active === true || selectedTag?.active === 1}
            onChange={onInputChanged}
            name='active'
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(TagEditor)
