import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import _ from 'lodash'
import {
  createOrUpdateDepot,
  getAlreadyExist,
  getEditDepot,
  getSelectedDepot,
  setEditDepot,
  setExistItem,
  setSelectedDepot,
} from '../../slice/depot.slice'
import {Message} from 'primereact/message'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {getValidator} from '../../../Inventory/slice/inventory.slice'

function DepotEditor() {
  const visible = useAppSelector(getEditDepot)
  const selectedDepot = useAppSelector(getSelectedDepot)
  const existItem = useAppSelector(getAlreadyExist)
  const dispatch = useAppDispatch()
  const validators = useAppSelector(getValidator)
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)
  const onHide = () => {
    dispatch(setEditDepot(false))
    dispatch(setSelectedDepot(null))
    dispatch(setExistItem(false))
    setIsNotValid(true)
    setInputValidity({})
  }

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedDepot)
    old = {...old, [e.target.name]: e.target.value}
    dispatch(setSelectedDepot(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  const save = () => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedDepot?.[validator.id]
        })

      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateDepot()).then((res) => {
      if (res.payload) {
        onHide()
      }
    })
  }

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={save} />
    </div>
  )

  const _labelValidator = validators?.find((field) => field.id === 'label')
  const _codeValidator = validators?.find((field) => field.id === 'code')

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={`${selectedDepot?.id ? 'Edit Depot' : 'New Depot'}`}
        onHide={onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Deposit is Already Exist' className='w-6' />
          )}
        </div>

        <div className='my-3'>
          <label htmlFor='Label'>
            <OlangItem olang='Label' />
            {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            id='label'
            name='label'
            onChange={onInputChange}
            value={selectedDepot?.label}
            className={`w-full ${existItem ? 'p-invalid' : null} ${
              inputValidity['label'] === false ? 'p-invalid' : ''
            }`}
          />
        </div>
        <div className='my-3'>
          <label htmlFor='Code'>
            <OlangItem olang='Code' />
            {_codeValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            id='code'
            name='code'
            className={`w-full ${existItem ? 'p-invalid' : null} ${
              inputValidity['code'] === false ? 'p-invalid' : ''
            }`}
            onChange={onInputChange}
            value={selectedDepot?.code}
          />
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>Active</label>
          <InputSwitch
            name='active'
            checked={
              selectedDepot?.active ? true : false || selectedDepot?.active == null ? true : null
            }
            onChange={onInputChange}
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(DepotEditor)
