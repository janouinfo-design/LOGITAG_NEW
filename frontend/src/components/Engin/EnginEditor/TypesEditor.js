import React, {useEffect, useState} from 'react'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateEnginTypes,
  createOrUpdateEngine,
  getSelectedEngine,
  setTypeFields,
} from '../slice/engin.slice'
import {InputText} from 'primereact/inputtext'
import {useFormik} from 'formik'
import _ from 'lodash'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {Button} from 'primereact/button'

const TypesEditor = ({setVisible, visible}) => {
  const [inputFields, setInputFields] = useState([])
  const [types, setTypes] = useState()
  const [tempTypes, setTempTypes] = useState([])
  const [objTypes, setObjTypes] = useState([])

  const dispatch = useAppDispatch()

  const selectedEngine = useAppSelector(getSelectedEngine)

  const handleTypeChange = (index, value) => {
    const newTypes = [...types]
    newTypes[index] = value
    setTypes(newTypes)
  }

  const handleSubmit = (event) => {
    let obj = []
    // types.map((t) => {
    //   obj.push({
    //     type: t,
    //   })
    // })
    let arrType = []
    arrType = tempTypes?.concat(inputFields)

    dispatch(setTypeFields(arrType))
    let _types = JSON.stringify(arrType)

    if (arrType.length > 0) {
      dispatch(createOrUpdateEnginTypes({enginID: selectedEngine?.id, types: _types})).then(
        (res) => {
          if (res.payload) {
            onHide()
            setInputFields(null)
          }
        }
      )
    }
  }
  const removeType = (index) => {
    let _tempTypes = types
    _tempTypes.splice(index)
    let obj = []
    types.map((t) => {
      obj.push({
        type: t,
      })
    })
    let arrType = []
    arrType = obj?.concat(inputFields)
    arrType?.splice(index)
    setTempTypes(arrType)
    setTypes(arrType)
    dispatch(setTypeFields(arrType))
    // if (arrType.length >= 0) {
    //   dispatch(createOrUpdateEngine({})).then((res) => {
    //     if (res.payload) {
    //       onHide()
    //       setInputFields(null)
    //     }
    //   })
    // }
  }

  const addField = () => {
    let newField = {type: ''}
    setInputFields([...inputFields, newField])
  }
  const handleInputFieldChange = (e, index) => {
    let data = [...inputFields]
    data[index][e.target.name] = e.target.value
    setInputFields(data)
  }

  useEffect(() => {
    if (selectedEngine && selectedEngine?.types !== '') {
      try {
        const parsedTypes = JSON.parse(selectedEngine.types)
        if (Array.isArray(parsedTypes)) {
          setTypes(parsedTypes.map((item) => item.type))
          setTempTypes(parsedTypes)
        }
      } catch (error) {
        console.error('Error parsing types:', error)
      }
    }
  }, [selectedEngine, visible])

  const removeFields = (index) => {
    let data = [...inputFields]
    data.splice(index, 1)
    setInputFields(data)
  }

  const onHide = () => {
    setVisible(false)
    setInputFields([])
  }

  const footer = (
    <>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={handleSubmit}>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </>
  )


  return (
    <>
      <DialogComponent
        visible={visible}
        header='Edit Types'
        onHide={onHide}
        footer={footer}
        style={{with: '40%'}}
      >
        <div className='flex flex-column justify-content-center'>
          <div className='my-3'>
            <label className='my-2 text-lg font-semibold'>
              <OlangItem olang='Types' />
            </label>
            {tempTypes?.map(({type}, index) => {
              return (
                <div key={index} className='flex justify-content-start align-items-center'>
                  <InputText
                    name={`types.${index}`}
                    className='w-5 m-2'
                    value={type}
                    onChange={(event) => handleTypeChange(index, event.target.value)}
                  />
                  <div>
                    <i
                      className='pi pi-times ml-4 cursor-pointer'
                      onClick={() => removeType(index)}
                    ></i>
                  </div>
                </div>
              )
            })}

            {inputFields?.map((field, index) => (
              <div key={index} className='flex flex-column'>
                <div className='flex justify-content-start align-items-center'>
                  <InputText
                    name='type'
                    value={field.type}
                    onChange={(e) => {
                      handleInputFieldChange(e, index)
                    }}
                    className='w-5 m-2'
                  />
                  <i
                    className='pi pi-times ml-4 cursor-pointer'
                    onClick={() => removeFields(index)}
                  ></i>
                </div>
              </div>
            ))}
            <div>
              <Button
                className='w-5 ml-2 flex align-items-center justify-content-center font-semibold text-lg'
                onClick={addField}
              >
                <OlangItem olang='ADD.Type' />
              </Button>
            </div>
          </div>
        </div>
      </DialogComponent>
    </>
  )
}

export default TypesEditor
