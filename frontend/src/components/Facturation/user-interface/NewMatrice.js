import {Checkbox} from 'primereact/checkbox'
import {Dropdown} from 'primereact/dropdown'
import {InputText} from 'primereact/inputtext'
import {InputTextarea} from 'primereact/inputtextarea'
import React, {useEffect, useState} from 'react'
import ButtonComponent from '../../shared/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateMatrix,
  getIsNewDetail,
  getLoadingMatr,
  getMatriceDetail,
  getMatriceItems,
  getSelectedMatrix,
  getVisibleNew,
  setLoadingMatr,
  setMatriceDetail,
  setSelectedMatrix,
  setVisibleNew,
} from '../slice/facturation.slice'
import _ from 'lodash'
import DialogContent from './DialogContent'
import {DialogComponent} from '../../shared/DialogComponent'
import MatrixDetail from './MatrixDetail'
import {Button} from 'primereact/button'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useSelector} from 'react-redux'
const NewMatrice = () => {
  const [selectedDimensV, setSelectedDimensV] = useState(null)
  const [selectedDimensH, setSelectedDimensH] = useState(null)
  const [checkedDimension, setCheckedDimension] = useState(false)

  const [inputs, setInputs] = useState({})
  const dimensV = [
    'Volume prestation',
    'Poids prestation',
    'Prix du prestation',
    'Zone selon NP livraison',
  ]
  const selectedMatrix = useAppSelector(getSelectedMatrix)
  const dispatch = useAppDispatch()
  const visibleNew = useAppSelector(getVisibleNew)
  const isNewDetail = useAppSelector(getIsNewDetail)
  const loadingMatr = useSelector(getLoadingMatr)

  const handleSaveMatrix = () => {
    dispatch(setLoadingMatr(true))
    let data = {
      checkedDimension: checkedDimension,
      selectedDimensV: selectedDimensV,
      selectedDimensH: selectedDimensH,
    }
    dispatch(createOrUpdateMatrix(data)).then(({payload}) => {
      if (payload) {
        dispatch(setVisibleNew(false))
        dispatch(setLoadingMatr(false))
      }
    })
  }


  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedMatrix)
    old = {...old, [e.target.name]: e.target.value}
    setInputs(old)
    dispatch(setSelectedMatrix(old))
    // setIsValid(true)
  }

  useEffect(() => {
    if (selectedMatrix !== null) {
      setSelectedDimensV(selectedMatrix.XFieldName)
      selectedMatrix.Dimension === 2 ? setCheckedDimension(true) : setCheckedDimension(false)
      setSelectedDimensH(selectedMatrix.YFieldName)
    }
  }, [selectedMatrix])

  return (
    <div className='flex flex-column align-items-center w-full'>
      <div className='infos card  border-300 border-1 w-full p-3'>
        <p className='text-xl font-normal'>Identifiants</p>
        <div className='flex '>
          <div className='code-matrice'>
            <label className='w-4rem'>Code</label>
            <InputText
              name='Code'
              className='w-20rem h-2rem'
              onChange={onInputChange}
              value={selectedMatrix?.Code}
            />
          </div>
          <div className='flex description ml-6'>
            <label className='w-7rem'>Description</label>
            {/* <InputTextarea rows={3} cols={37} /> */}
            <InputText
              name='Description'
              className='w-30rem h-2rem'
              onChange={onInputChange}
              value={selectedMatrix?.Description}
            />
          </div>
        </div>
      </div>
      <div className='application card border-300 border-1 w-full p-3 mt-3'>
        <p className='text-xl mr-2 font-normal'>Dimension vertical</p>
        <div className='flex'>
          <div className='champs mt-2'>
            <label className='w-2rem'>X</label>
            <Dropdown
              options={dimensV}
              placeholder='selectionner'
              value={selectedDimensV}
              className='h-3rem w-13rem'
              onChange={(e) => setSelectedDimensV(e.value)}
            />
          </div>
        </div>
      </div>

      <div className='application card border-300 border-1 w-full p-3 mt-3'>
        <div className='flex'>
          <p className='text-xl mr-2 font-normal'>Dimension Horizontal</p>
          <Checkbox
            className='mt-1'
            onChange={(e) => setCheckedDimension(e.checked)}
            checked={checkedDimension}
          />
        </div>
        <div className='flex'>
          <div className='champs mt-2'>
            <label className='w-2rem'>Y</label>
            <Dropdown
              options={dimensV}
              placeholder='selectionner'
              value={selectedDimensH}
              disabled={!checkedDimension}
              className='h-3rem w-13rem'
              onChange={(e) => setSelectedDimensH(e.value)}
            />
          </div>
        </div>
      </div>
      <div className='application card border-300 border-1 w-full p-3 mt-3'>
        <div
          className={
            isNewDetail
              ? 'flex align-items-center justify-content-end'
              : 'flex align-items-center justify-content-between'
          }
        >
          {!isNewDetail ? (
            <ButtonComponent
              label='Remplir'
              icon='pi pi-file-edit'
              onClick={() => dispatch(setMatriceDetail(true))}
            />
          ) : (
            ''
          )}
          <Button
            label={<OlangItem olang='Save' />}
            icon='pi pi-check'
            iconPos='right'
            onClick={handleSaveMatrix}
            loading={loadingMatr}
            disabled={loadingMatr}
          />
          {/* <i className='pi pi-save cursor-pointer ' onClick={handleSaveMatrix}></i> */}
        </div>
      </div>
    </div>
  )
}

export default NewMatrice
