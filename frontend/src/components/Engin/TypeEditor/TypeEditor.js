import React, {useEffect, useState} from 'react'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateEnginTypes,
  createOrUpdateEngine,
  fetchEngines,
  getEditType,
  getEngines,
  getSelectedEngine,
  getTypeFields,
  setTypeEdit,
  setTypeFields,
} from '../slice/engin.slice'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {Button} from 'primereact/button'
import {AutoComplete} from 'primereact/autocomplete'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const TypeEditor = () => {
  const dispatch = useAppDispatch()
  const editType = useAppSelector(getEditType)
  let typesFields = useAppSelector(getTypeFields)
  const engines = useAppSelector(getEngines)
  const selectedEngin = useAppSelector(getSelectedEngine)
  const [inputFields, setInputFields] = useState([{type: ''}])
  const [values, setValues] = useState([{type: ''}])
  const [items, setItems] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const onHide = () => {
    try {
      dispatch(setTypeEdit(false))
      setInputFields([{type: ''}])
      setValues([{type: ''}])
    } catch (error) {
    }
  }

  const addInput = () => {
    try {
      const newField = {type: ''}
      setInputFields([...inputFields, newField])
      setValues([...values, {type: ''}])
    } catch (error) {
    }
  }

  const handleChange = (e, index) => {
    try {
      const newValues = [...values]
      newValues[index] = {type: e.value}
      setValues(newValues)
    } catch (error) {
    }
  }

  const search = (e) => {
    try {
      const filteredItems = items.filter((item) =>
        item.type.toLowerCase().includes(e.query.toLowerCase())
      )
      setSuggestions(filteredItems)
    } catch (error) {
    }
  }

  const onSave = () => {
    try {
      const flattenedTypes = values.map((ele) => {
        if (typeof ele.type !== 'object') {
          return {type: ele.type}
        } else if (typeof ele.type === 'object' && ele.type.type) {
          return {type: ele.type.type}
        }
      })

      let enginID = selectedEngin?.id
      let types = JSON.stringify(flattenedTypes)
      dispatch(setTypeFields(flattenedTypes))
      dispatch(createOrUpdateEnginTypes({enginID, types})).then((res) => {
        if (res.payload) {
          dispatch(setTypeEdit(false))
          setInputFields([{type: ''}])
        }
      })
    } catch (error) {
    }
  }

  useEffect(() => {
    dispatch(fetchEngines())
  }, [])

  useEffect(() => {
    const getTp = []
    if (Array.isArray(engines) && engines?.length > 0) {
      engines?.map((eng) => {
        if (eng.types) {
          try {
            const parseTp = JSON.parse(eng.types)
            getTp.push(parseTp)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        }
      })
      const flattenedArray = getTp.reduce((acc, current) => [...acc, ...current], [])
      setItems(flattenedArray)
    }
  }, [engines])
  const removeFields = (index) => {
    try {
      let data = [...inputFields]
      data.splice(index, 1)
      setInputFields(data)
    } catch (error) {
    }
  }

  const footer = (
    <div className='flex gap-3 justify-content-end'>
      <ButtonComponent
        onClick={onHide}
        className=' p-button-danger'
        label={<OlangItem olang='Annuler' />}
        icon='pi pi-times'
      />
      <ButtonComponent
        onClick={onSave}
        label={<OlangItem olang='Sauvegarder' />}
        icon='pi pi-check'
      />
    </div>
  )

  return (
    <>
      <DialogComponent visible={editType} footer={footer} onHide={onHide} className='w-6 md:w-6 '>
        <div className='w-full flex align-items-center flex-column'>
          <div className='flex justify-content-start align-items-start w-6'>
            <label className='font-medium text-2xl'>
              <OlangItem olang='Type' />
            </label>
          </div>
          {inputFields?.map((input, index) => {
            return (
              <div key={index} className='flex flex-column w-6 mt-3'>
                <div className='flex justify-content-start align-items-center'>
                  <AutoComplete
                    value={values[index].type}
                    suggestions={suggestions}
                    completeMethod={(e) => search(e)}
                    onChange={(e) => handleChange(e, index)}
                    field='type'
                    inputClassName='w-full'
                    style={{width: '100%'}}
                  />
                  <i
                    className='pi pi-times ml-4 cursor-pointer'
                    onClick={() => removeFields(index)}
                  ></i>
                </div>
              </div>
            )
          })}
          <div className='w-6 flex justify-content-center mt-4'>
            <Button label='ADD More' onClick={addInput} className='w-full' />
          </div>
        </div>
      </DialogComponent>
    </>
  )
}

export default TypeEditor
