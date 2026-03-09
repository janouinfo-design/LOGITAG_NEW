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
  createOrUpdateTag,
  fetchTags,
  fetchTagsWithEngin,
  getAlreadyExist,
  getEditTag,
  getSelectedTag,
  getStatus,
  setEditTag,
  setExistItem,
  setSelectedTag,
} from '../../../Tag/slice/tag.slice'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import {useFormik} from 'formik'
import {seTagEdit} from '../../../Engin/slice/engin.slice'

function StatusEditor({selectedTag, visible, client, engin, onHide, onSubmitHandler}) {
  // const visible = useAppSelector(getEditTag)
  let status = useAppSelector(getStatus)

  // const selectedTag = useAppSelector(getSelectedTag)
  const existItem = useAppSelector(getAlreadyExist)
  const dispatch = useAppDispatch()


  const [isValid, setIsValid] = useState(false)
  const [inputs, setInputs] = useState({})
  const [switchInput, setSwitchInput] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [statusOption, setStatusOption] = useState()
  const [statusClick, setStatusClick] = useState()

  const formik = useFormik({
    initialValues: {
      ...selectedTag,
      active: selectedTag ? selectedTag?.active === 1 : true,
    },
    onSubmit: (values, {resetForm}) => {
      onSubmitHandler(values)
      setTimeout(() => {
        resetForm()
      }, 6000)
    },
  })

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedTag)
    old = {
      ...old,
      active: switchInput,
      IDCustomer: selectedCustomer?.codeClient || selectedTag?.IDCustomer,
      [e.target.name]: e.target.value,
    }
    setInputs(old)
    dispatch(setSelectedTag(old))
  }

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
    setIsValid(true)
  }

  useEffect(() => {
    formik.setValues({
      ...selectedTag,
      active: selectedTag ? selectedTag.active === 1 : true,
    })
  }, [selectedTag])

  useEffect(() => {
    setStatusOption([
      {name: 'selectionner', value: 0},
      ...status?.map((st) => ({
        name: st.label,
        value: st.status,
      })),
    ])
  }, [status])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={formik.handleSubmit} />
    </div>
  )

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={`${selectedTag?.id ? 'Modifier Le Tag' : 'Nouveau Tag'}`}
        onHide={onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Tag is Already Exist' className='w-6' />
          )}
        </div>
        {/* {!selectedTag?.id && (
          <div className='my-3'>
            <label>Customer</label>
            <Dropdown
              filter
              options={customerOptions}
              onChange={(e) => setSelectedCustomer(e.value)}
              value={selectedCustomer}
              placeholder={`select Client`}
              className='w-full'
            />
          </div>
        )} */}
        {selectedTag?.id ? (
          <div className='flex justify-content-center border-1 border-solid border-blue-500 p-2'>
            <h3>ID TAG {selectedTag?.code}</h3>
          </div>
        ) : (
          <div>
            <label>Id Tag</label>
            <InputText
              name='code'
              className={`w-full ${existItem ? 'p-invalid' : null}`}
              onChange={formik.handleChange}
              value={formik.values?.code}
            />
          </div>
        )}
        {selectedTag?.id && (
          <div className='my-3'>
            <label>Label</label>
            <InputText
              name='label'
              className='w-full'
              onChange={formik.handleChange}
              value={formik.values?.label}
            />
          </div>
        )}
        {!client && (
          <div className='my-3'>
            <label>Status</label>
            <Dropdown
              name='status'
              value={formik.values?.status}
              options={statusOption}
              optionLabel='name'
              onChange={(e) => {
                formik.setFieldValue('status', e.value)
              }}
              placeholder={`${selectedTag?.status || 'Select status'}`}
              className='w-full'
            />
          </div>
        )}
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

export default memo(StatusEditor)
