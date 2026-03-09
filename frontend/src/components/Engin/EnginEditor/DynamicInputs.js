import React, {useState, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useAppSelector} from '../../../hooks'
import {Dialog} from 'primereact/dialog'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import {createOrUpdateEnginTypes, getSelectedEngine} from '../slice/engin.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'

const DynamicInputs = ({visible, onHide}) => {
  const dispatch = useDispatch()
  const selectedEngine = useAppSelector(getSelectedEngine)
  const [inputList, setInputList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isDelete, setIsDelete] = useState(false)

  const handleAddInput = () => {
    try {
      if (inputList.length === 0 || inputList[inputList.length - 1].type !== '') {
        const newInputList = [...inputList, {type: ''}]
        setInputList(newInputList)
      } else {
        setErrorMessage('Please complete the previous input before adding a new one.')
      }
    } catch (error) {
    }
  }

  const handleDeleteInput = (index) => {
    try {
      if (inputList.length === 1) {
        setIsDelete(true)
      }
      const newInputList = [...inputList]
      newInputList.splice(index, 1)
      setInputList(newInputList)
    } catch (error) {
    }
  }

  const resetInputs = () => {
    setInputList([])
  }

  useEffect(() => {
    if (selectedEngine?.types) {
      const parsedTypes = JSON.parse(selectedEngine.types)
      setInputList(parsedTypes)
    } else if (inputList.length === 0) {
      handleAddInput()
    }
  }, [selectedEngine])

  const handleSave = () => {
    try {
      if (isDelete) {
        const body = {enginID: selectedEngine?.id, types: ''}
        dispatch(createOrUpdateEnginTypes(body))
        setErrorMessage('')
        onHide()
        resetInputs()
        return
      }

      if (inputList.length === 0 || inputList.every((item) => item.type === '')) {
        setErrorMessage('Please fill fields before saving.')
        return
      }

      if (inputList[inputList.length - 1].type === '') {
        setErrorMessage('Please complete the last input before saving.')
        return
      }

      const body = {enginID: selectedEngine?.id, types: JSON.stringify(inputList)}
      dispatch(createOrUpdateEnginTypes(body))

      setErrorMessage('')

      onHide()
      resetInputs()
    } catch (error) {
    }
  }

  const handleOnHide = () => {
    try {
      resetInputs()
      setErrorMessage('')
      onHide()
    } catch (error) {
    }
  }

  const footer = (
    <div>
      <ButtonComponent onClick={handleAddInput}>
        <OlangItem olang='ADD.Type' />
      </ButtonComponent>
      <ButtonComponent onClick={handleSave}>
        <OlangItem olang='Save' />
      </ButtonComponent>
    </div>
  )

  return (
    <>
      <Dialog
        visible={visible}
        header='Edit Types'
        onHide={handleOnHide}
        footer={footer}
        style={{width: '40%'}}
      >
        <div style={{marginBottom: '16px'}}>
          {errorMessage && (
            <div className='p-error p-text-bold text-3xl' style={{marginBottom: '8px'}}>
              {errorMessage}
            </div>
          )}
        </div>
        {inputList.map(({type}, index) => (
          <div key={index} className='p-field' style={{marginBottom: '16px'}}>
            <InputText
              id={`input-${index}`}
              className='w-5'
              value={type}
              onChange={(e) => {
                const newInputList = [...inputList]
                newInputList[index].type = e.target.value
                setInputList(newInputList)
              }}
            />
            <i
              className='pi pi-times ml-4 cursor-pointer'
              onClick={() => handleDeleteInput(index)}
            ></i>
          </div>
        ))}
      </Dialog>
    </>
  )
}

export default DynamicInputs
