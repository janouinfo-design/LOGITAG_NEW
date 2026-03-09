import {useDispatch} from 'react-redux'
import {useAppSelector} from '../../hooks'
import ButtonComponent from '../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  createOrUpdateVehicule,
  fetchTypes,
  fetchVehicules,
  getEditVehicule,
  getSelectedVehicule,
  getTypes,
  setEditVehicule,
  setSelectedVehicule,
  setShow,
} from './slice/veh.slice'
import VehEditor from './vehEditor'
import {Card} from 'primereact/card'
import {useEffect, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import _ from 'lodash'
import {TabPanel, TabView} from 'primereact/tabview'
import {Dropdown} from 'primereact/dropdown'
import {fetchValidator, getValidator} from '../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {fetchTeams, getTeams} from '../Teams/slice/team.slice'

const VehDetail = () => {
  const dispatch = useDispatch()
  const [isValid, setIsValid] = useState(true)

  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const [inputs, setInputs] = useState({})
  const [selectFuel, setSelectFuel] = useState('')
  const [typeOptions, setTypeOptions] = useState([])

  const fuelTypes = useAppSelector(getTypes)
  const selectedVehicule = useAppSelector(getSelectedVehicule)
  const editVehicule = useAppSelector(getEditVehicule)
  const validators = useSelector(getValidator)
  const userList = useAppSelector(getTeams)

  const onHideEditVehicule = () => {
    dispatch(setSelectedVehicule(null))
    dispatch(setEditVehicule(false))
  }
  const onSave = async (e) => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedVehicule?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateVehicule({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(fetchVehicules())
        dispatch(setShow(true))
      }
    })
  }
  const onSaveVehicule = (e) => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedVehicule?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateVehicule({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(setEditVehicule(false))
      }
    })
  }

  const onHide = () => {
    dispatch(setShow(true))
  }
  const onInputChange = (e) => {
    setIsValid(true)
    let old = _.cloneDeep(selectedVehicule)
    old = {
      ...old,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedVehicule(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }


  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Vehicule' /> {selectedVehicule?.label}
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

  const _nameValidator = validators?.find((field) => field.id === 'name')
  const _modelValidator = validators?.find((field) => field.id === 'model')
  const _platelicense = validators?.find((field) => field.id === 'platelicense')
  const _tankcapcityl = validators?.find((field) => field.id === 'tankcapcityl')
  const _speedmax = validators?.find((field) => field.id === 'speedmax')
  const _fuel = validators?.find((field) => field.id === 'fuel')

  useEffect(() => {
    setTypeOptions([
      ...fuelTypes?.map((typ) => ({
        name: typ.label,
        code: typ.id,
      })),
    ])
  }, [fuelTypes])

  useEffect(() => {
    let obj = {
      type: 'CHAUFFEURS',
    }
    dispatch(fetchTeams(obj))
    dispatch(fetchTypes('vehiculeType'))
  }, [])

  useEffect(() => {
    setInputs(selectedVehicule || {})
  }, [selectedVehicule])

  return (
    <>
      <VehEditor
        onHide={onHideEditVehicule}
        selectedVehicule={selectedVehicule}
        visible={editVehicule}
        vehicule={true}
        onSubmitHandler={(e) => onSaveVehicule(e)}
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
            {selectedVehicule?.name ?? <OlangItem olang='current.vehicule' />}
          </strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Customer.Info' />} leftIcon='pi pi-user mr-2'>
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
                  <label htmlFor='name'>
                    <OlangItem olang='vehicule.name' />
                    {_nameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='name'
                    id='name'
                    required={true}
                    value={selectedVehicule?.name}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['name'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4'>
                  <label htmlFor='user'>
                    <OlangItem olang='user.list' />
                  </label>
                  <Dropdown
                    name='userID'
                    id='userID'
                    options={userList}
                    onChange={(e) => {
                      onInputChange(e)
                    }}
                    placeholder='select user'
                    value={+selectedVehicule?.userID}
                    className={`w-full`}
                    optionLabel='firstname'
                    optionValue='userID'
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='model'>
                    <OlangItem olang='vehicule.modele' />
                    {_modelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='model'
                    id='model'
                    required={true}
                    value={selectedVehicule?.model}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['model'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='platelicense'>
                    <OlangItem olang='vehicule.platelicense' />
                    {_platelicense?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='platelicense'
                    id='platelicense'
                    required={true}
                    value={selectedVehicule?.platelicense}
                    onChange={onInputChange}
                    className={`w-full ${
                      inputValidity['platelicense'] === false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='capacity'>
                    <OlangItem olang='vehicule.capacity' />
                    {_tankcapcityl?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='tankcapcityl'
                    id='tankcapcityl'
                    required={true}
                    value={selectedVehicule?.tankcapcityl}
                    onChange={onInputChange}
                    className={`w-full ${
                      inputValidity['tankcapcityl'] === false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='speedmax'>
                    <OlangItem olang='vehicule.allowedSpeed' />
                    {_speedmax?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='speedmax'
                    id='speedmax'
                    required={true}
                    value={selectedVehicule?.speedmax}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['speedmax'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4'>
                  <label htmlFor='fuel'>
                    <OlangItem olang='fuel.list' />
                    {_fuel?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <Dropdown
                    id='fuel'
                    options={typeOptions}
                    onChange={(e) => {
                      setIsValid(true)
                      setSelectFuel(e.value)
                      onInputChange(e)
                    }}
                    placeholder='select fuel'
                    value={
                      selectFuel
                        ? selectFuel
                        : {code: selectedVehicule.fuelTypeId, name: selectedVehicule.fueltype}
                    }
                    className={`w-full ${inputValidity['fuel'] === false ? 'p-invalid' : ''}`}
                    optionLabel='name'
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default VehDetail
