import {InputText} from 'primereact/inputtext'
import React, {useEffect, useState} from 'react'
import ButtonComponent from '../../../shared/ButtonComponent'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputNumber} from 'primereact/inputnumber'
import DialogContent from '../DialogContent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchMatrices,
  fetchParameters,
  fetchTarifs,
  getMatrices,
  getParametersList,
  getSelectedMatrix,
  getTarifs,
  setFormuleCalcul,
  setFormuleCondition,
  setSelectedMatrix,
  setSelectedParam,
  setSelectedTarif,
  setVisibleCalcul,
} from '../../slice/facturation.slice'
import {ColumnsParameters, columnsMatrice, columnsTarif} from '../columns'

const CalculatorPopup = (props) => {
  const [calculatorInput, setCalculatorInput] = useState('')
  const [calcInp, setCalcInp] = useState([])
  const [displayValue, setDisplayValue] = useState('')
  const [visibleValue, setVisibleValue] = useState(false)
  const [value, setValue] = useState()
  const [visibleParametre, setVisibleParametre] = useState(false)
  const [visibleMatrice, setVisibleMatrice] = useState(false)
  const [visibleTarif, setVisibleTarif] = useState(false)
  const [parametreChange, setParametreChange] = useState([])
  const [matriceChange, setMatriceChange] = useState([])
  const [tarifChange, setTarifChange] = useState([])

  let selectedMatrix = useAppSelector(getSelectedMatrix)

  const dispatch = useAppDispatch()

  let ParamatersList = useAppSelector(getParametersList)
  let MatriceList = useAppSelector(getMatrices)
  let TarifList = useAppSelector(getTarifs)

  const handleButtonClick = (text) => {
    setCalculatorInput((prevInput) => prevInput + text + ' ')
    setDisplayValue((prevInput) => prevInput + text + ' ')
    setCalcInp((prevCalcInp) => [...prevCalcInp, text])
  }

  const handleClearAll = () => {
    setCalcInp([])
    setDisplayValue('')
  }

  const onHide = () => {
    setVisibleValue(false)
    setValue(null)
  }

  const handleClearLast = () => {
    if (calcInp.length > 0) {
      const updatedCalcInp = [...calcInp]
      updatedCalcInp.pop()
      setCalcInp(updatedCalcInp)
      setDisplayValue(updatedCalcInp.join(''))
    }
  }

  const handleSaveValue = () => {
    handleButtonClick(`{V:${value}}`)
    setVisibleValue(false)
    setValue(null)
  }

  const handleSelectionParametre = (parametre) => {
    setParametreChange(parametre)
  }

  const handleSelectionMatrice = (matrice) => {
    setMatriceChange(matrice)
    // if (matrice?.id !== matriceChange?.id || !matriceChange?.id) {
    //   setVisibleMatrice(false)
    // }
  }
  const handleSelectionTarif = (tarif) => {
    setTarifChange(tarif)
  }

  const saveSelctedTarif = () => {
    dispatch(setSelectedTarif(tarifChange))
    handleButtonClick(`{T:${tarifChange?.code}}`)
    setVisibleTarif(false)
  }
  const saveSelctedParam = () => {
    dispatch(setSelectedParam(parametreChange))
    handleButtonClick(`{P:${parametreChange?.FieldName}}`)
    setVisibleParametre(false)
  }
  const saveSelctedMatrice = () => {
    dispatch(setSelectedMatrix(matriceChange))
    handleButtonClick(`{M:${matriceChange?.Code}}`)
    setVisibleMatrice(false)
  }

  const saveFormuleCondition = () => {
    // if (props.type === 'condition') {
    props.handleSaveCalc(displayValue)
    // } else {
    dispatch(setFormuleCondition(displayValue))
    dispatch(setVisibleCalcul(false))
    // }
    dispatch(setFormuleCondition(displayValue))
    dispatch(setVisibleCalcul(false))
  }

  const saveFormuleCalcul = () => {
    props.handleSaveCalc(displayValue)
    dispatch(setFormuleCalcul(displayValue))
    dispatch(setVisibleCalcul(false))
  }

  const saveCalc = () => {
    props.saveCalcBtn(displayValue)
  }

  useEffect(() => {
  }, [calcInp])

  const footer = (onSaveBtn, onHideBtn) => {
    return (
      <div className='flex justify-content-end gap-2'>
        <ButtonComponent severity='danger' label='Annuler' onClick={onHideBtn} />
        <ButtonComponent severity='success' label='OK' onClick={onSaveBtn} />
      </div>
    )
  }

  useEffect(() => {
    dispatch(fetchParameters())
    dispatch(fetchMatrices())
    dispatch(fetchTarifs())
  }, [])


  return (
    <div className='w-full '>
      <div className='flex h-3rem justify-content-between'>
        {/* <p className="h-full w-9 text-xl font-normal border-gray-300 border-1 p-1" id="calculator-input" > {displayValue} </p> */}
        <InputText
          className='h-full w-9 text-xl font-bold border-gray-300 text-black-alpha-90 border-1 p-1" id="calculator-input'
          value={displayValue}
          disabled={true}
          placeholder={props.placeholder}
        />
        <ButtonComponent
          label='CE'
          className='mr-3 bg-gray-600 border-none'
          onClick={handleClearLast}
        />
        <ButtonComponent
          label='C'
          className='mr-3 bg-gray-600 border-none'
          onClick={handleClearAll}
        />
      </div>
      <div className='flex w-full mt-3  border-gray-300 border-1'>
        <div className='left-div flex m-2 flex-column w-4 '>
          <ButtonComponent
            label='Valeur'
            icon='bi bi-123'
            className='w-full bg-gray-600 mt-2'
            onClick={() => setVisibleValue(true)}
          />
          <DialogComponent
            header='Entrer une valeur'
            visible={visibleValue}
            onHide={onHide}
            className='md:w-22rem right-0'
            footer={() => footer(handleSaveValue, onHide)}
          >
            <div className='flex justify-content-center'>
              <InputNumber
                inputId='valeurTarif'
                value={value}
                onValueChange={(e) => setValue(e.value)}
                className='w-9 h-3rem'
              />
            </div>
          </DialogComponent>

          <ButtonComponent
            label='Parametre'
            icon='bi bi-paragraph'
            className='w-full mt-2 bg-gray-600 border-none'
            onClick={() => setVisibleParametre(true)}
          />
          <div>
            <DialogComponent
              header='Select Parameter'
              visible={visibleParametre}
              footer={() => footer(saveSelctedParam, () => setVisibleParametre(false))}
              onHide={() => setVisibleParametre(false)}
              className='md:w-7 right-0'
              position='right-20'
            >
              <DialogContent
                tableId='parametre tarif'
                columns={ColumnsParameters}
                dataTb={ParamatersList}
                dataKey='FieldName'
                onChangeSelection={handleSelectionParametre}
                selectionMode='single'
                selectedRow={parametreChange}
                isDataSelectable={true}
                selectionRowsProps={true}
                addBtn={false}
                // onAddButtonClick={saveSelctedParam}
              />
            </DialogComponent>
          </div>
          <ButtonComponent
            label='Matrice'
            icon='bi bi-table'
            className='w-full mt-2 bg-gray-600 border-none'
            onClick={() => setVisibleMatrice(true)}
          />
          <div>
            <DialogComponent
              header='Select Matrice'
              visible={visibleMatrice}
              footer={() => footer(saveSelctedMatrice, () => setVisibleMatrice(false))}
              onHide={() => setVisibleMatrice(false)}
              className='md:w-7 right-0'
              position='right-20'
            >
              <DialogContent
                tableId='matrice-tari'
                columns={columnsMatrice}
                dataTb={MatriceList}
                onChangeSelection={handleSelectionMatrice}
                // onAddButtonClick={saveSelctedMatrice}
                selectedRow={matriceChange}
                isDataSelectable={true}
                selectionRowsProps={true}
                addBtn={false}
              />
            </DialogComponent>
          </div>
          <ButtonComponent
            label='Tarif'
            icon='bi bi-receipt'
            className='w-full mt-2 bg-gray-600 border-none'
            onClick={() => setVisibleTarif(true)}
          />
          <div>
            <DialogComponent
              header='Select Tarif'
              visible={visibleTarif}
              footer={() => footer(saveSelctedTarif, () => setVisibleTarif(false))}
              onHide={() => setVisibleTarif(false)}
              className='md:w-7'
              position='bottom'
            >
              <DialogContent
                columns={columnsTarif}
                dataTb={TarifList}
                onChangeSelection={(e) => setTarifChange(e)}
                // onAddButtonClick={saveSelctedTarif}
                selectionRowsProps={true}
                selectedRow={tarifChange}
                dataKey='id_tarif'
                addBtn={false}
                // onlyBtnExport={true}
              />
            </DialogComponent>
          </div>
          <div className='flex mt-2 justify-content-between'>
            <ButtonComponent
              label='AND'
              className='mr-3 bg-gray-600 border-none'
              onClick={() => handleButtonClick('AND')}
            />
            <ButtonComponent
              label='OR'
              className='mr-3 bg-gray-600 border-none'
              onClick={() => handleButtonClick('OR')}
            />
          </div>
        </div>
        <div className='mid-div m-2 w-6  align-items-center border-gray-300 border-1  flex flex-column '>
          <div className='flex mt-2'>
            <ButtonComponent
              label='('
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('(')}
            />
            <ButtonComponent
              label=')'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick(')')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='<'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('<')}
            />
            <ButtonComponent
              label='>'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('>')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='<='
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('<=')}
            />
            <ButtonComponent
              label='>='
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('>=')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='<>'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('<>')}
            />
            <ButtonComponent
              label='='
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('=')}
            />
          </div>
        </div>
        <div className='mid-div m-2 w-6  align-items-center border-gray-300 border-1   flex flex-column '>
          <div className='flex mt-2'>
            <ButtonComponent
              label='+'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('+')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='-'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('-')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='*'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('*')}
            />
          </div>
          <div className='flex mt-2'>
            <ButtonComponent
              label='/'
              className='mr-3 bg-gray-600 border-none w-4rem'
              onClick={() => handleButtonClick('/')}
            />
          </div>
        </div>
      </div>
      <div className='application card border-300 border-1 w-full p-3 mt-3'>
        <div className='flex justify-content-end'>
          {/* <i
            className='pi pi-save cursor-pointer'
            onClick={props.type === 'condition' ? saveFormuleCondition : saveFormuleCalcul}
          ></i> */}
          <ButtonComponent
            icon='pi pi-check'
            severity='success'
            // onClick={props.type === 'condition' ? saveFormuleCondition : saveFormuleCalcul}
            onClick={saveCalc}
            loading={props.loadingSave}
            disabled={props.loadingSave}
          />
        </div>
      </div>
    </div>
  )
}

export default CalculatorPopup
