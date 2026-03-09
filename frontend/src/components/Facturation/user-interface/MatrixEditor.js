import React, {useEffect, useState} from 'react'
import {InputNumber} from 'primereact/inputnumber'
import ButtonComponent from '../../shared/ButtonComponent'
import {
  UpdatePrixMatrice,
  fetchMatriceItems,
  getMatriceItems,
  getSelectedDetailMatrix,
  getSelectedMatrix,
  setSelectedDetailMatrix,
} from '../slice/facturation.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'

const MatrixEditor = ({currentMatrice, setCurrentMatrice}) => {
  const dispatch = useAppDispatch()
  const selectedMatrix = useAppSelector(getSelectedMatrix)
  const selectedDetailMatrix = useAppSelector(getSelectedDetailMatrix)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLast, setIsLast] = useState(true)

  useEffect(() => {
    dispatch(fetchMatriceItems(selectedMatrix?.id))
  }, [selectedMatrix])

  let matriceItems = useAppSelector(getMatriceItems)

  const matriceDetailColumns = []

  for (const key in matriceItems[0]) {
    matriceDetailColumns.push({
      header: key,
      field: key,
    })
  }
  const headers = matriceDetailColumns.slice(0, currentMatrice).map((entry) => entry.header)
  // const headers = matriceDetailColumns.map((entry) => entry.header)


  const hasMultiplePairs = headers.length > 1

  const onInputChange = (header, e) => {
    const [xf, xto] = header.split('-').map(Number)

    let data = {
      ...selectedDetailMatrix,
      xf: xf,
      xt: xto,
      prix: e.value,
      id: selectedMatrix?.id,
    }
    dispatch(setSelectedDetailMatrix(data))
  }
  const onButtonClicked = () => {
    dispatch(UpdatePrixMatrice()).then((res) => {
      if (res.payload) {
        setCurrentMatrice((prev) => prev + 1)
        dispatch(fetchMatriceItems(selectedMatrix?.id))
        if (hasMultiplePairs && currentIndex < headers.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          setIsLast(false)
        }
      }
    })
  }


  return (
    <div className='w-max'>
      {headers.map((header, index) => (
        <div className='flex w-max mt-3' key={header}>
          <label className='w-15rem'>{header}</label>
          <InputNumber
            name={header}
            className='h-3rem w-20rem'
            onChange={(e) => onInputChange(header, e)}
            value={matriceItems?.[0]?.[header]}
            disabled={index !== currentIndex || !isLast}
          />
          <ButtonComponent
            icon='pi pi-check'
            className='ml-3'
            name={header}
            disabled={index !== currentIndex || !isLast}
            onClick={onButtonClicked}
          />
        </div>
      ))}
    </div>
  )
}

export default MatrixEditor
