import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Message} from 'primereact/message'
import {Dropdown} from 'primereact/dropdown'
import _ from 'lodash'
import {
  getAlreadyExist,
  getStatus,
  setEditTag,
  setExistItem,
  setSelectedTag,
} from '../../../Tag/slice/tag.slice'
import {fetchCustomers} from '../../../../store/slices/customer.slice'
import {useFormik} from 'formik'
import {getFamilles} from '../../../Famillies/slice/famille.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'

function TagEditor({selectedTag, visible, client, engin, onHide, onSubmitHandler}) {
  // const visible = useAppSelector(getEditTag)
  let status = useAppSelector(getStatus)

  // const selectedTag = useAppSelector(getSelectedTag)
  const existItem = useAppSelector(getAlreadyExist)
  const dispatch = useAppDispatch()


  const validators = useSelector(getValidator)
  const [inputs, setInputs] = useState({})
  const [switchInput, setSwitchInput] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [statusOption, setStatusOption] = useState()
  const [familleOptions, setfamilleOptions] = useState([])
  const [selectFamille, setSelectFamille] = useState('')
  const [selectStatus, setSelectStatus] = useState({name: 'Disponible', code: 1})
  const [statusClick, setStatusClick] = useState()
  const familles = useAppSelector(getFamilles)
  const [isValid, setIsValid] = useState(true)

  const formik = useFormik({
    initialValues: {
      ...selectedTag,
      active: selectedTag ? selectedTag?.active == 1 : true,
    },
    validate: (data) => {
      let errors = {}
      validators.forEach((validator) => {
        if (validator.isRequired) {
          if (!data[validator.id]) {
            errors[validator.id] = '*'
          }
        }
      })
      setIsValid(Object.keys(errors).length === 0)
      return errors
    },
    onSubmit: (values, {resetForm}) => {
      const errors = formik.validateForm()
      if (Object.keys(errors).length === 0) {
        onSubmitHandler({...values, familleId: selectFamille?.code, status: selectStatus?.code})
        resetForm()
        handleOnHide()
      }
    },
  })

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [])

  useEffect(() => {
    if (selectedTag?.active === 1) {
      setSwitchInput(true)
    } else if (selectedTag?.active === 0) {
      setSwitchInput(false)
    } else {
      setSwitchInput(true)
    }
  }, [selectedTag])

  const handleFormChange = (e) => {
    formik.handleChange(e)
  }

  useEffect(() => {
    formik.setValues({
      ...selectedTag,
      active: selectedTag ? selectedTag.active === 1 : true,
    })
  }, [selectedTag])

  useEffect(() => {
    setStatusOption([
      //{name: 'selectionner', code: 0},
      ...status?.map((st) => ({
        name: st.label,
        code: st.status,
        //gg
      })),
    ])
  }, [status])

  useEffect(() => {
    setfamilleOptions([
      ...familles?.map((typ) => ({
        name: typ.label,
        code: typ.id,
      })),
    ])
  }, [familles])

  const resetFormEdit = () => {
    formik.resetForm()
  }

  const handleOnHide = () => {
    resetFormEdit()
    setSelectedTag(null)
    dispatch(setExistItem(false))
    setSelectFamille('')
    dispatch(setEditTag(false))
  }

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={handleOnHide} />
      <ButtonComponent label='Enregistrer' onClick={formik.handleSubmit} />
    </div>
  )

  // useEffect(() => {
  //dispatch(fetchValidator('tagadd'))
  // }, [])

  const _codeValidator = validators?.find((field) => field.id === 'code')
  const _labelValidator = validators?.find((field) => field.id === 'label')
  const _statusValidator = validators?.find((field) => field.id === 'status')
  const _familleValidator = validators?.find((field) => field.id === 'famille')

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={`${selectedTag?.id ? 'Modifier Le Tag' : 'Nouveau Tag'}`}
        onHide={handleOnHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Tag is Already Exist' className='w-6' />
          )}
        </div>

        {selectedTag?.id ? (
          <div className='flex justify-content-center border-1 border-solid border-blue-500 p-2'>
            <h3>ID TAG {selectedTag?.code}</h3>
          </div>
        ) : (
          <div>
            <label htmlFor='IdTag'>
              <OlangItem olang='IdTag' />
              {_codeValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              id='code'
              name='code'
              className={`w-full ${existItem ? 'p-invalid' : null} ${
                formik.errors?.code && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.code}
            />
          </div>
        )}
        {selectedTag?.id && (
          <div className='my-3'>
            <label htmlFor='Label'>
              <OlangItem olang='Label' />
              {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              id='label'
              name='label'
              className={`w-full ${
                formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
              onChange={handleFormChange}
              value={formik.values?.label}
            />
          </div>
        )}
        {!client && (
          <div className='my-3'>
            <label htmlFor='Status'>
              <OlangItem olang='Status' />
              {_statusValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <Dropdown
              id='status'
              name='status'
              value={selectStatus}
              options={statusOption}
              optionLabel='name'
              onChange={(e) => {
                setSelectStatus(e.value)
                handleFormChange(e)
              }}
              placeholder={`${selectedTag?.status || 'Select status'}`}
              className={`w-full ${
                formik.errors?.status && formik.submitCount > 0 ? 'p-invalid' : null
              }`}
            />
          </div>
        )}
        <div className='my-3'>
          <OlangItem olang='famille.list' />
          {_familleValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          <Dropdown
            id='famille'
            name='famille'
            options={familleOptions}
            onChange={(e) => {
              setSelectFamille(e.value)
              handleFormChange(e)
            }}
            placeholder='select famille'
            value={selectFamille}
            className={`w-full ${
              formik.errors?.famille && formik.submitCount > 0 ? 'p-invalid' : null
            }`}
            optionLabel='name'
          />
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>Active</label>
          <InputSwitch
            id='active'
            name='active'
            checked={formik.values.active}
            onChange={handleFormChange}
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(TagEditor)
