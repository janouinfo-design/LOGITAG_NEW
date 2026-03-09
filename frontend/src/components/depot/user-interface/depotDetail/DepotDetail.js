import {Card} from 'primereact/card'
import {Toast} from 'primereact/toast'
import {memo, useRef, useState} from 'react'
import {createOrUpdateDepot, getSelectedDepot, setSelectedDepot} from '../../slice/depot.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import {useFormik} from 'formik'
import {useAppSelector} from '../../../../hooks'
import {InputSwitch} from 'primereact/inputswitch'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {useDispatch} from 'react-redux'
import _ from 'lodash'
import {getValidator} from '../../../Inventory/slice/inventory.slice'

function DepotDetail() {
  const toast = useRef(null)
  const selectedDepot = useAppSelector(getSelectedDepot)
  const validators = useAppSelector(getValidator)
  const [isValid, setIsValid] = useState(true)

  const dispatch = useDispatch()
  const formik = useFormik({
    initialValues: {
      ..._.cloneDeep(selectedDepot),
      active: selectedDepot ? selectedDepot?.active === 1 : true,
    },
    validate: (data) => {
      let errors = {}
      validators.forEach((validator) => {
        const _regExp = new RegExp(validator.regExp.slice(1, -1))
        if (validator.isRequired) {
          if (!data[validator.id]) {
            errors[validator.id] = '*'
          }
          if (!_regExp.test(data[validator.id])) {
            errors[validator.id] = validator.messageError
          }
        }
      })
      setIsValid(Object.keys(errors).length === 0)
      return errors
    },
    onSubmit: (values, {resetForm}) => {
      dispatch(setSelectedDepot(values))
      const errors = formik.validateForm(values)
      if (Object.keys(errors).length === 0) {
        dispatch(createOrUpdateDepot()).then((res) => {
          if (res.payload) {
            toast.current.show({
              severity: 'success',
              summary: 'Successful',
              detail: 'Depot Updated',
              life: 2000,
            })
          }
        })
      }
    },
  })
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>Info.{selectedDepot?.label}</span>
    </>
  )
  const handleFormChange = (e) => {
    formik.handleChange(e)
  }
  const _codeValidator = validators?.find((field) => field.id === 'code')
  const _labelValidator = validators?.find((field) => field.id === 'label')
  return (
    <>
      <div className='flex align-items-center justify-content-between'></div>
      <Toast ref={toast} position='bottom-right' />
      <div className='flex'>
        <Card
          className='w-full md:w-10 lg:w-full xl:w-6 mt-3 p-2 ml-4'
          title={title}
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
            borderRadius: '15px',
          }}
        >
          <div className='my-3'>
            <label className='my-2 ml-1'>
              <OlangItem olang='label' />
              {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='label'
              className={`w-full font-semibold text-lg ${
                formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.label}
            />
          </div>
          <div className='my-3'>
            <label className='my-2 ml-1'>
              <OlangItem olang='code' />
              {_codeValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='code'
              className={`w-full font-semibold text-lg ${
                formik.errors?.code && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.code}
            />
          </div>
          <div className='my-3 flex align-items-center gap-2 mt-3'>
            <label className='my-2 ml-1'>
              <OlangItem olang='Active' />
            </label>
            <InputSwitch
              id='active'
              name='active'
              checked={formik.values.active}
              onChange={handleFormChange}
            />
          </div>
          <div>
            <div className='flex justify-content-end'>
              <ButtonComponent className='p-button-danger'>
                <OlangItem olang='Annuler' />
              </ButtonComponent>
              <ButtonComponent onClick={formik.handleSubmit} className='ml-2'>
                <OlangItem olang='Enregistrer' />
              </ButtonComponent>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

export default memo(DepotDetail)
