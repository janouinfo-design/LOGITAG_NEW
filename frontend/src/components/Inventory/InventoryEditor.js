import {Message} from 'primereact/message'
import {
  createOrUpdateInventory,
  fetchValidator,
  getEditInventory,
  getExistItem,
  getInventories,
  getSelectedInventory,
  getValidator,
  setEditInventory,
  setExistItem,
  setSelectedInventory,
} from './slice/inventory.slice'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import {useSelector} from 'react-redux'
import {useAppSelector} from '../../hooks'
import {useDispatch} from 'react-redux'
import {DialogComponent} from '../shared/DialogComponent/DialogComponent'
import {Button} from 'primereact/button'
import _ from 'lodash'
import {useEffect, useState} from 'react'
import {Calendar} from 'primereact/calendar'
import {Dropdown} from 'primereact/dropdown'
import {MultiSelect} from 'primereact/multiselect'
import {fetchDepots, getDepots} from '../depot/slice/depot.slice'
import {fetchCustomers, getCustomers} from '../../store/slices/customer.slice'
import {fetchFamilles, getFamilles} from '../Famillies/slice/famille.slice'
import {Checkbox} from 'primereact/checkbox'
import {fetchSites, getSites} from '../Site/slice/site.slice'
import {generateYupSchema} from '../Helpers/validationGene'
import {useFormik} from 'formik'

const InventoryEditor = (props) => {
  const [inputValidity, setInputValidity] = useState({}) ///
  const [familleTag, setFamilleTag] = useState([])
  const [selectedDepot, setSelectedDepot] = useState(null)
  const [selectedSites, setSelectedSites] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const editInventory = useSelector(getEditInventory)
  const [isNotValid, setIsNotValid] = useState(true)

  const selectedInventory = useSelector(getSelectedInventory)
  const listDepots = useAppSelector(getDepots)
  const listCostumers = useAppSelector(getCustomers)
  const listFamilles = useAppSelector(getFamilles)
  const listWorksites = useAppSelector(getSites)
  let alreadyExist = useAppSelector(getExistItem)
  const validators = useSelector(getValidator)


  const validationSchema = generateYupSchema(validators)

  const dispatch = useDispatch()

  const header = (
    <div>
      {selectedInventory?.id ? (
        <OlangItem olang='Edit.Inventory' />
      ) : (
        <OlangItem olang='Create.Inventory' />
      )}
    </div>
  )

  const formik = useFormik({
    initialValues: {
      reference: '',
      description: '',
      client: '',
      depots: null,
      sites: null,
      inventoryDate: null,
      familleAuth: [],
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(setSelectedInventory(values))
      dispatch(createOrUpdateInventory()).then((res) => {
        if (res.payload) {
          onHide()
        }
      })
    },
  })

  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setEditInventory(false))
    dispatch(setExistItem(false))
    setIsNotValid(true)
    formik.resetForm()
  }

  const footer = (
    <div className='flex gap-3 justify-content-end'>
      <Button
        onClick={onHide}
        className=' p-button-danger'
        label={<OlangItem olang='Annuler' />}
        icon='pi pi-times'
      />
      <Button
        onClick={formik.handleSubmit}
        label={<OlangItem olang='Sauvegarder' />}
        icon='pi pi-check'
        //disabled={isNotValid}
      />
    </div>
  )


  useEffect(() => {
    dispatch(fetchValidator('inventory'))
    dispatch(fetchDepots())
    dispatch(fetchCustomers())
    dispatch(fetchFamilles({src: 'tagType'})).then(({payload}) => {
      setFamilleTag(payload)
    })
    dispatch(fetchSites())
  }, [])

  useEffect(() => {
    if (!Array.isArray(familleTag)) return
    formik.setFieldValue(
      'familleAuth',
      familleTag?.map((item) => item.id)
    )
  }, [editInventory])

  const _referenceValidator = validators?.find((field) => field.id === 'reference')
  const _descriptionValidator = validators?.find((field) => field.id === 'description')
  const _dateValidator = validators?.find((field) => field.id === 'inventoryDate')

  return (
    <div>
      <DialogComponent
        visible={editInventory}
        header={header}
        onHide={onHide}
        className='w-11 md:w-6'
        footer={footer}
      >
        <div className='flex flex-column justify-content-center'>
          <div className='flex justify-content-center'>
            {alreadyExist && (
              <Message
                severity='error'
                text={<OlangItem olang='the.inventory.is.already.existed' />}
                className='w-6'
              />
            )}
          </div>

          <div className='my-2 mt-5'>
            <label htmlFor='reference'>
              <OlangItem olang='reference' />
              {_referenceValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='reference'
              id='reference'
              value={formik.values.reference}
              onChange={formik.handleChange}
              className={`w-full font-semibold text-lg ${
                formik.errors.reference && formik.touched.reference ? 'p-invalid' : ''
              }`}
            />
            {formik.errors.reference && formik.touched.reference && (
              <div className='p-error'>{formik.errors.reference}</div>
            )}
          </div>
          <div className='my-2 mt-5'>
            <label htmlFor='description'>
              <OlangItem olang='description' />
              {_descriptionValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='description'
              id='description'
              value={formik.values.description}
              onChange={formik.handleChange}
              className={`w-full ${
                formik.errors.description && formik.touched.description ? 'p-invalid' : ''
              }`}
            />
            {formik.errors.description && formik.touched.description && (
              <div className='p-error'>{formik.errors.description}</div>
            )}
          </div>
          <div className='my-2 mt-5'>
            <label htmlFor='client'>
              <OlangItem olang='Client' />
              {_descriptionValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <Dropdown
              name='client'
              value={formik.values.client}
              onChange={formik.handleChange}
              options={listCostumers}
              optionValue='id'
              optionLabel='label'
              placeholder='Select a client'
              filter
              className={`w-full ${
                formik.errors.client && formik.touched.client ? 'p-invalid' : ''
              }`}
            />
            {formik.errors.client && formik.touched.client && (
              <div className='p-error'>{formik.errors.client}</div>
            )}
          </div>
          <div className='my-2 mt-5'>
            <label htmlFor='Depot'>
              <OlangItem olang='Depot' />
              {_descriptionValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <MultiSelect
              name='depots'
              display='chip'
              value={formik.values.depots}
              onChange={formik.handleChange}
              options={listDepots}
              optionValue='id'
              optionLabel='label'
              placeholder='Select a Depot'
              filter
              className={`w-full ${
                formik.errors.depots && formik.touched.depots ? 'p-invalid' : ''
              }`}
            />
            {formik.errors.depots && formik.touched.depots && (
              <div className='p-error'>{formik.errors.depots}</div>
            )}
          </div>
          <div className='my-2 mt-5'>
            <label htmlFor='Worksite'>
              <OlangItem olang='Worksite' />
              {_descriptionValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <MultiSelect
              name='sites'
              display='chip'
              value={formik.values.sites}
              onChange={formik.handleChange}
              options={listWorksites}
              optionValue='id'
              optionLabel='label'
              placeholder='Select a worksite'
              filter
              className={`w-full ${formik.errors.sites && formik.touched.sites ? 'p-invalid' : ''}`}
            />
            {formik.errors.sites && formik.touched.sites && (
              <div className='p-error'>{formik.errors.sites}</div>
            )}
          </div>

          <div className='my-2 mt-5'>
            <label htmlFor='inventoryDate'>
              <OlangItem olang='inventory.date' />
              {_dateValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <Calendar
              name='inventoryDate'
              id='inventoryDate'
              showIcon
              className={`w-full ${
                formik.errors.inventoryDate && formik.touched.inventoryDate ? 'p-invalid' : ''
              }`}
              dateFormat='dd/mm/yy'
              onChange={formik.handleChange}
              placeholder={'dd/mm/yy'}
              value={formik.values.date}
            />
            {formik.errors.date && formik.touched.date && (
              <div className='p-error'>{formik.errors.date}</div>
            )}
          </div>
          <div className='my-2 mt-5'>
            <label htmlFor='Worksite'>
              <OlangItem olang='Allowed' />
              {_descriptionValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <MultiSelect
              name='familleAuth'
              display='chip'
              value={formik.values.familleAuth}
              onChange={formik.handleChange}
              options={familleTag}
              optionValue='id'
              optionLabel='label'
              placeholder='Select a worksite'
              filter
              className={`w-full ${
                formik.errors.familleAuth && formik.touched.familleAuth ? 'p-invalid' : ''
              }`}
            />
            {formik.errors.familleAuth && formik.touched.familleAuth && (
              <div className='p-error'>{formik.errors.familleAuth}</div>
            )}
          </div>
          {/* <div className='flex flex-row align-items-center my-2 mt-5 border-1 border-gray-200 '>
            <div className='flex flex-row align-items-center justify-content-center'>
              <div className='ml-2 text-xl font-semibold'>
                <OlangItem olang='Allowed' />:
              </div>
              <ul className='flex flex-row list-none mt-3'>
                {listFamilles?.map((famille) => (
                  <li key={famille.id} className='mr-2'>
                    <label htmlFor={famille.id} className='mr-2'>
                      {famille.label}
                    </label>
                    <Checkbox
                      name='familles'
                      value={famille.id}
                      onChange={onAllowedChange}
                      id={famille.id}
                      checked={allowed?.includes(famille?.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div> */}
        </div>
      </DialogComponent>
    </div>
  )
}

export default InventoryEditor
