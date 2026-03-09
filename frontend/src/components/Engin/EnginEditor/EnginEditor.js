import React, {useEffect, useState} from 'react'
import {InputNumber, InputText, InputTextarea} from 'primereact'
import {Button} from 'primereact'
import {FileUpload} from 'primereact/fileupload'
import {useDispatch, useSelector} from 'react-redux'
import {DialogComponent} from '../../shared/DialogComponent'
import {
  createOrUpdateEngine,
  fetchTypesList,
  getEditEngine,
  getExistItem,
  getSelectedEngine,
  getTypeList,
  setEditEngine,
  setExistItem,
  setSelectedEngine,
} from '../slice/engin.slice'
import _ from 'lodash'
import {FileUploadeComponent} from '../../shared/FileUploaderComponent/FileUploadeComponent'
import {fetchTags} from '../../Tag/slice/tag.slice'
import {useAppSelector} from '../../../hooks'
import {Dropdown} from 'primereact/dropdown'
import {Image} from 'primereact/image'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Message} from 'primereact/message'
import {fetchFamilles, getFamilles} from '../../Famillies/slice/famille.slice'
import {fetchValidator, getValidator} from '../../Inventory/slice/inventory.slice'

export const EnginEditor = (props) => {
  const [inputs, setInputs] = useState({})
  const [inputValidity, setInputValidity] = useState({}) ///
  const [isNotValid, setIsNotValid] = useState(true)
  const [isValid, setIsValid] = useState(true)
  const [imageChange, setImageChange] = useState(false)
  const [selectType, setSelectType] = useState()
  const selectedEngin = useSelector(getSelectedEngine)
  const editEngin = useSelector(getEditEngine)
  const [imageId, setImageId] = useState()
  const [typeOptions, setTypeOptions] = useState([])
  const [familleOptions, setfamilleOptions] = useState([])
  const [selectFamille, setSelectFamille] = useState('')
  const familles = useAppSelector(getFamilles)
  const validators = useSelector(getValidator)

  const dispatch = useDispatch()
  let types = useAppSelector(getTypeList)
  let alreadyExist = useAppSelector(getExistItem)

  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setSelectedEngine(null))
    dispatch(setEditEngine(false))
    setSelectType(null)
    setSelectFamille(null)
    setIsNotValid(true)
    setInputValidity({})
  }

  const validateFields = (validators, old) => {
    let isValid = true
    validators.forEach((validator) => {
      const _regExp = new RegExp(validator.regExp.slice(1, -1))
      if (validator.isRequired && _regExp.test(old[validator.id]) === false) {
        isValid = false
      }
    })

    return isValid
  }

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedEngin)
    old = {
      ...old,
      imageid: imageId,
      typeID: selectType?.code,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedEngine(old))
    let isValid = validateFields(validators, old)
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled || !isValid)
  }

  useEffect(() => {
    dispatch(fetchTypesList())
  }, [])

  useEffect(() => {
    if (!selectedEngin?.id) {
      setImageChange(true)
    } else if (selectedEngin?.id) {
      setImageChange(false)
    }
  }, [selectedEngin])

  const onSave = async (e) => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedEngin?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateEngine({imageId: imageId, familleId: selectFamille?.code})).then(
      (res) => {
        if (res.payload) {
          onHide()
        }
      }
    )
  }
  useEffect(() => {
    let dt = types
    if(!Array.isArray(dt)) dt = []
    setTypeOptions([
      {name: 'selectionner', code: 0},
      ...dt.map((typ) => ({
        name: typ.label,
        code: typ.typeID,
      })),
    ])
  }, [types])

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

  const header = (
    <div>
      {selectedEngin?.id ? <OlangItem olang='Edit.Engin' /> : <OlangItem olang='Create.Engin' />}
    </div>
  )

  useEffect(() => {
    if (alreadyExist) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [alreadyExist])

  useEffect(() => {
    dispatch(fetchFamilles('enginType'))
  }, [])

  useEffect(() => {
    let fml = familles;
    if(!Array.isArray(fml)) fml = []
    setfamilleOptions([
      ...fml.map((typ) => ({
        name: typ.label,
        code: typ.id,
      })),
    ])
  }, [familles])

  const _referenceValidator = validators?.find((field) => field.id === 'reference')
  const _brandValidator = validators?.find((field) => field.id === 'brand')
  const _modelValidator = validators?.find((field) => field.id === 'model')
  const _immatriculationValidator = validators?.find((field) => field.id === 'immatriculation')
  const _vinValidator = validators?.find((field) => field.id === 'vin')
  const _infosAdditionnellesValidator = validators?.find(
    (field) => field.id === 'infosAdditionnelles'
  )
  const _familleValidator = validators?.find((field) => field.id === 'famille')

  return (
    <div>
      <DialogComponent
        visible={editEngin}
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
                text={<OlangItem olang='the.engine.is.already.existed' />}
                className='w-6'
              />
            )}
          </div>

          <div className='my-4 mt-5'>
            <label htmlFor='reference'>
              <OlangItem olang='Reference' />
              {_referenceValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>

            <InputText
              name='reference'
              id='reference'
              value={selectedEngin?.reference}
              onChange={onInputChange}
              // maxLength={15}
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['reference'] === false ? 'p-invalid' : ''
              }`}
            />
            {_referenceValidator?.isRequired == 1 && (
              <small className='p-error'>{_referenceValidator?.messageError}</small>
            )}
          </div>
          <div className='my-4 mt-5'>
            <label htmlFor='brand'>
              <OlangItem olang='Brand' />
              {_brandValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='brand'
              id='brand'
              value={selectedEngin?.brand}
              onChange={onInputChange}
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['brand'] === false ? 'p-invalid' : ''
              }`}
            />
          </div>

          <div className='my-4'>
            <label>
              <OlangItem olang='Model' />
              {_modelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              id='model'
              name='model'
              value={selectedEngin?.model}
              onChange={onInputChange}
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['model'] === false ? 'p-invalid' : ''
              }`}
            />
          </div>

          <div className='my-4'>
            <label htmlFor='immatriculation'>
              <OlangItem olang='immatriculation' />
              {_immatriculationValidator?.isRequired == 1 && (
                <span className='h3 text-danger'>*</span>
              )}
            </label>
            <InputText
              id='immatriculation'
              value={selectedEngin?.immatriculation}
              onChange={onInputChange}
              name='immatriculation'
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['immatriculation'] === false ? 'p-invalid' : ''
              }`}
            />
          </div>
          <div className='my-4'>
            <label htmlFor='vin'>
              <OlangItem olang='Engine.Vin' />
              {_vinValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              id='vin'
              value={selectedEngin?.vin}
              onChange={onInputChange}
              name='vin'
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['vin'] === false ? 'p-invalid' : ''
              }`}
            />
          </div>
          <div className='my-4'>
            <label htmlFor='infosAdditionnelles'>
              <OlangItem olang='Informations.additionnelles' />
              {_infosAdditionnellesValidator?.isRequired == 1 && (
                <span className='h3 text-danger'>*</span>
              )}
            </label>
            <InputText
              id='infosAdditionnelles'
              value={selectedEngin?.infosAdditionnelles}
              onChange={onInputChange}
              name='infosAdditionnelles'
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['infosAdditionnelles'] === false ? 'p-invalid' : ''
              }`}
            />
          </div>
          <div className='my-4'>
            <label htmlFor='famille'>
              <OlangItem olang='famille.list' />
              {_familleValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <Dropdown
              id='famille'
              name='famille'
              options={familleOptions}
              onChange={(e) => {
                setIsValid(true)
                setSelectFamille(e.value)
                onInputChange(e)
              }}
              placeholder='select famille'
              value={selectFamille}
              className={`w-full ${alreadyExist ? 'p-invalid' : null} ${
                inputValidity['famille'] === false ? 'p-invalid' : ''
              }`}
              optionLabel='name'
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}
