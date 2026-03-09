import {useDispatch} from 'react-redux'

import {
  createOrUpdateInventory,
  fetchTypes,
  fetchInventories,
  getEditInventory,
  getSelectedInventory,
  getTypes,
  setEditInventory,
  setSelectedInventory,
  setShow,
  getValidator,
  fetchValidator,
  fecthInventoryDetail,
  getInventoryDetail,
  getInventoryDetailVu,
  getInventoryDetailPasVu,
  getInventoryDetailScanPlus,
} from '../slice/inventory.slice'
import {Card} from 'primereact/card'
import {useEffect, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import _ from 'lodash'
import {TabPanel, TabView} from 'primereact/tabview'
import {Dropdown} from 'primereact/dropdown'
import InventoryEditor from '../InventoryEditor'
import {useAppSelector} from '../../../hooks'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Calendar} from 'primereact/calendar'
import VulaList from './VulaList'
import {useSelector} from 'react-redux'
import moment from 'moment'

const InventoryDetail = () => {
  const dispatch = useDispatch()
  const [viewStatus, setViewStatus] = useState('nonscan')
  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const [inputs, setInputs] = useState({})
  const [selectFuel, setSelectFuel] = useState({})
  const [typeOptions, setTypeOptions] = useState([])
  const validators = useSelector(getValidator)
  let fuelTypes = useAppSelector(getTypes)
  let selectedInventory = useAppSelector(getSelectedInventory)
  let editInventory = useAppSelector(getEditInventory)
  let inventoryDetailVu = useAppSelector(getInventoryDetailVu)
  let inventoryDetailPasVu = useAppSelector(getInventoryDetailPasVu)
  let inventoryDetailScanPlus = useAppSelector(getInventoryDetailScanPlus)
  const onHideEditInventory = () => {
    dispatch(setSelectedInventory(null))
    dispatch(setEditInventory(false))
  }
  const onSave = async (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedInventory?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
    dispatch(createOrUpdateInventory({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(fetchInventories())
        dispatch(setShow(true))
      }
    })
  }
  const onSaveInventory = (e) => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedInventory?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
    dispatch(createOrUpdateInventory({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(setEditInventory(false))
      }
    })
  }

  const onHide = () => {
    dispatch(setShow(true))
  }
  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedInventory)
    old = {
      ...old,
      [e.target.name]: e.target.value,
    }

    dispatch(setSelectedInventory(old))
    // const areAllRequiredFieldsFilled = validators
    //   .filter((validator) => validator.isRequired)
    //   .every((validator) => !!old[validator.id])
    // setIsNotValid(!areAllRequiredFieldsFilled)
  }

  useEffect(() => {
    setTypeOptions([
      ...fuelTypes?.map((typ) => ({
        name: typ.label,
        code: typ.id,
      })),
    ])
  }, [fuelTypes])

  // useEffect(() => {
  //   setInputs(selectedInventory || {})
  // }, [selectedInventory])

  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Inventory' /> {selectedInventory?.label}
      </span>
    </>
  )
  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={onSave} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )

  useEffect(() => {
    dispatch(fetchValidator('inventory'))
  }, [])

  useEffect(() => {
    dispatch(fecthInventoryDetail({id: selectedInventory?.id, type: 'nonscan'}))
    dispatch(fecthInventoryDetail({id: selectedInventory?.id, type: 'scan'}))
    dispatch(fecthInventoryDetail({id: selectedInventory?.id, type: 'scanplus'}))
  }, [selectedInventory.id])

  const _referenceValidator = validators?.find((field) => field.id === 'reference')
  const _descriptionValidator = validators?.find((field) => field.id === 'description')
  const _dateValidator = validators?.find((field) => field.id === 'date')

  return (
    <>
      <InventoryEditor
        onHide={onHideEditInventory}
        selectedInventory={selectedInventory}
        visible={editInventory}
        Inventory={true}
        onSubmitHandler={(e) => onSaveInventory(e)}
      />
      <div className='mt-3 flex align-items-center justify-content-between'>
        <div className='flex'>
          <div>
            <ButtonComponent onClick={() => dispatch(setShow(true))}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2 text-base font-semibold'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
          </div>
        </div>
        <div className=' w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>
            {selectedInventory?.reference || <OlangItem olang='current.Inventory' />}
          </strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Inventory.Info' />} leftIcon='pi pi-inventory mr-2'>
            <Card
              className='w-full md:w-10 lg:w-full xl:w-6 mt-3 p-2 ml-4'
              title={title}
              footer={footer}
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
            >
              <div className='flex flex-column justify-content-center'>
                <div className='my-4 mt-5'>
                  <label htmlFor='reference'>
                    <OlangItem olang='reference' />
                    {_referenceValidator?.isRequired == 1 && (
                      <span className='h3 text-danger'>*</span>
                    )}
                  </label>
                  <InputText
                    name='reference'
                    id='reference'
                    required={true}
                    value={selectedInventory?.reference}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['reference'] === false ? 'p-invalid' : ''}`}
                  />
                </div>

                <div className='my-4 mt-5'>
                  <label htmlFor='description'>
                    <OlangItem olang='description' />
                    {_descriptionValidator?.isRequired == 1 && (
                      <span className='h3 text-danger'>*</span>
                    )}
                  </label>
                  <InputText
                    name='description'
                    id='description'
                    required={true}
                    value={selectedInventory?.description}
                    onChange={onInputChange}
                    className={`w-full ${
                      inputValidity['description'] === false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                {/* <div className='my-4 mt-5'>
                  <label htmlFor='worksite'>
                    <OlangItem olang='worksite' />
                  </label>
                  <InputText
                    required={true}
                    value={selectedInventory?.worksite}
                    onChange={onInputChange}
                    className={`w-full`}
                  />
                </div> */}
                <div className='my-4 mt-5'>
                  <label htmlFor='inventoryDate'>
                    <OlangItem olang='inventory.date' />
                    {_dateValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <Calendar
                    id='inventoryDate'
                    name='inventoryDate'
                    showIcon
                    className={`w-full ${
                      inputValidity['inventoryDate'] === false ? 'p-invalid' : ''
                    }`}
                    dateFormat='dd/mm/yy'
                    onChange={onInputChange}
                    placeholder={'dd/mm/yy'}
                    value={moment(selectedInventory?.inventoryDate, 'DD/MM/YYYY').toDate()}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
          <TabPanel header={<OlangItem olang='Inventory.scann' />} leftIcon='pi pi-tags mr-2'>
            <div>
              <VulaList tableId={'PalaVu_table'} data={inventoryDetailVu} />
            </div>
          </TabPanel>
          <TabPanel header={<OlangItem olang='Inventory.nonscann' />} leftIcon='pi pi-tags mr-2'>
            <div>
              <VulaList tableId={'Vupala_table'} data={inventoryDetailPasVu} />
            </div>
          </TabPanel>
          <TabPanel header={<OlangItem olang='Inventory.scanplus' />} leftIcon='pi pi-tags mr-2'>
            <div>
              <VulaList tableId={'Vula_table'} data={inventoryDetailScanPlus} />
            </div>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default InventoryDetail
