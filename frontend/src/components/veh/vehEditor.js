import {InputText} from 'primereact/inputtext'
import {DialogComponent} from '../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import {Message} from 'primereact/message'
import {
  createOrUpdateVehicule,
  fetchTypes,
  getEditVehicule,
  getExistItem,
  getSelectedVehicule,
  getTypes,
  setEditVehicule,
  setSelectedVehicule,
} from './slice/veh.slice'
import {useDispatch, useSelector} from 'react-redux'
import {useEffect, useState} from 'react'
import {useAppSelector} from '../../hooks'
import {Button} from 'primereact/button'
import _ from 'lodash'
import {Dropdown} from 'primereact/dropdown'
import {fetchValidator, getValidator} from '../Inventory/slice/inventory.slice'
import {fetchTeams, getTeams} from '../Teams/slice/team.slice'

const VehEditor = (props) => {
  const [isValid, setIsValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)
  const [selectFuel, setSelectFuel] = useState({})
  const [typeOptions, setTypeOptions] = useState([])

  const validators = useSelector(getValidator)
  const selectedVehicule = useSelector(getSelectedVehicule)
  const fuelTypes = useAppSelector(getTypes)
  const userList = useAppSelector(getTeams)
  const editVehicule = useSelector(getEditVehicule)
  const alreadyExist = useAppSelector(getExistItem)

  const dispatch = useDispatch()

  const header = (
    <div>
      {selectedVehicule?.id ? (
        <OlangItem olang='Edit.Vehicule' />
      ) : (
        <OlangItem olang='Create.Vehicule' />
      )}
    </div>
  )
  const onInputChange = (e) => {
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
        onHide()
      }
    })
  }

  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    //setIsValid(true)
    dispatch(setEditVehicule(false))
    dispatch(setSelectFuel(null))
    setIsNotValid(true)
    setInputValidity({})
  }
  const footer = (
    <div className='flex gap-3 justify-content-end'>
      <Button
        onClick={onHide}
        className=' p-button-danger'
        label={<OlangItem olang='Annuler' />}
        icon='pi pi-times'
      />
      <Button onClick={onSave} label={<OlangItem olang='Sauvegarder' />} icon='pi pi-check' />
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

  return (
    <div>
      <DialogComponent
        visible={editVehicule}
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
                text={<OlangItem olang='the.vehicule.is.already.existed' />}
                className='w-6'
              />
            )}
          </div>
          <div className='my-4 mt-5'>
            <label htmlFor='name'>
              <OlangItem olang='vehicule.name' />
              {_nameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='name'
              id='name'
              value={selectedVehicule?.name}
              onChange={onInputChange}
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['name'] === false ? 'p-invalid' : ''
              }`}
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
              value={selectedVehicule?.model}
              onChange={onInputChange}
              className={`w-full  ${inputValidity['model'] === false ? 'p-invalid' : ''}`}
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
              value={selectedVehicule?.platelicense}
              onChange={onInputChange}
              className={`w-full  ${inputValidity['platelicense'] === false ? 'p-invalid' : ''}`}
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
              value={selectedVehicule?.tankcapcityl}
              onChange={onInputChange}
              className={`w-full  ${inputValidity['tankcapcityl'] === false ? 'p-invalid' : ''}`}
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
              value={selectedVehicule?.speedmax}
              onChange={onInputChange}
              className={`w-full  ${inputValidity['speedmax'] === false ? 'p-invalid' : ''}`}
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
              value={selectFuel}
              className={`w-full  ${inputValidity['fuel'] === false ? 'p-invalid' : ''}`}
              optionLabel='name'
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}

export default VehEditor
