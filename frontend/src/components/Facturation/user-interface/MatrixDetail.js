import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createMatrixDimension,
  createOrUpdateMatrixDetails,
  fetchMatriceItems,
  getIsNewDetail,
  getMatriceDetail,
  getMatriceItems,
  getSelectedDetailMatrix,
  getSelectedMatrix,
  setMatriceDetail,
  setSelectedDetailMatrix,
  setSelectedMatrix,
} from '../slice/facturation.slice'
import DialogContent from './DialogContent'
import {DialogComponent} from '../../shared/DialogComponent'
import ButtonComponent from '../../shared/ButtonComponent'
import {InputNumber} from 'primereact/inputnumber'
import MatrixEditor from './MatrixEditor'

const MatrixDetail = () => {
  const [visibleValueMax, setVisibleValueMax] = useState(false)
  const [valueMax, setValueMax] = useState()
  const [editDetailMatrix, setEditDetailMatrix] = useState(false)
  const [addRow, setAddRow] = useState(false)
  const [skipLast, setSkipLast] = useState(true)
  const [currentMatrice, setCurrentMatrice] = useState(2)

  let matriceDetail = useAppSelector(getMatriceDetail)
  const dispatch = useAppDispatch()
  const isNewDetail = useAppSelector(getIsNewDetail)
  const selectedMatrix = useAppSelector(getSelectedMatrix)
  let selectedDetailMatrix = useAppSelector(getSelectedDetailMatrix)

  useEffect(() => {
    dispatch(fetchMatriceItems(selectedMatrix?.id))
  }, [selectedMatrix])
  let matriceItems = useAppSelector(getMatriceItems)

  let matriceDetailData = []
  if (matriceItems && matriceItems.length > 0) {
    for (let i = 0; i < matriceItems.length; i++) {
      matriceDetailData.push(matriceItems[i])
    }
    if (matriceDetailData.length > 1) {
      matriceDetailData = matriceDetailData.slice(0, -1)
    }
  }

  const matriceDetailColumns = []

  for (const key in matriceItems[0]) {
    matriceDetailColumns.push({
      header: key,
      field: key,
    })
  }

  const columnsArray = matriceDetailColumns.map((item) => ({
    header: item.header,
    field: item.field,
    olang: item.header,
  }))

  const columnnsDeatilNew = [
    {
      header: 'Prestation',
      olang: 'Prestation',
    },
    {
      header: '0-Et Plus',
      olang: '0-Et Plus',
    },
  ]

  let actions = [
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {
        setEditDetailMatrix(true)
        const data = e.item.data
        const values = Object.values(data)
        const YfromYto = values[0]
        if (YfromYto !== '--') {
          let [yFrom, yTo] = YfromYto.split('-').map(Number)
          if (isNaN(yTo)) {
            yTo = null
          }
          let obj = {
            yf: yFrom,
            yt: yTo,
          }
          dispatch(setSelectedDetailMatrix(obj))
        }
      },
    },
  ]

  const onHideValueMax = () => {
    setVisibleValueMax(false)
  }

  const onHideDetail = () => {
    dispatch(setMatriceDetail(false))
    dispatch(setSelectedMatrix(null))
  }

  const addNewColonne = () => {
    let data = {
      id: selectedMatrix?.id,
      dim: 'X',
      max: valueMax,
    }
    dispatch(createMatrixDimension(data)).then((res) => {
      dispatch(fetchMatriceItems(selectedMatrix?.id))
      setVisibleValueMax(false)
      setValueMax(null)
    })
  }

  const addNewRow = () => {
    let data = {
      id: selectedMatrix?.id,
      dim: 'Y',
      max: valueMax,
    }
    dispatch(createMatrixDimension(data)).then((res) => {
      dispatch(fetchMatriceItems(selectedMatrix?.id))
      setVisibleValueMax(false)
      setValueMax(null)
    })

    setAddRow(false)
  }

  const handleAddRow = () => {
    setVisibleValueMax(true)
    setAddRow(true)
  }

  const handleCancel = () => {
    setVisibleValueMax(false)
    setAddRow(false)
  }

  const footer = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent
          className='border-none'
          label='OK'
          onClick={addRow ? addNewRow : addNewColonne}
        />
        <ButtonComponent className='border-none ml-2 ' label='Annuler' onClick={handleCancel} />
      </div>
    )
  }

  const saveEditMatrice = () => {
    setEditDetailMatrix(false)
    setCurrentMatrice(2)
  }

  const footerEditDetail = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent className='border-none' label='OK' onClick={saveEditMatrice} />
        <ButtonComponent
          className='p-button-danger'
          label='Annuler'
          onClick={() => {
            setCurrentMatrice(2)
            setEditDetailMatrix(false)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <DialogComponent
        header='Remplir la matrice'
        visible={matriceDetail}
        // footer={footer}
        onHide={onHideDetail}
        className='md:w-7 right-0'
        position='right-20'
      >
        <div>
          <ButtonComponent label='ajouter une colonne' onClick={() => setVisibleValueMax(true)} />
          <ButtonComponent
            label='ajouter une ligne'
            disabled={selectedMatrix?.Dimension !== 2}
            className='ml-3'
            onClick={handleAddRow}
          />
          <DialogContent
            tableId='detail matrice'
            columns={!matriceItems ? columnnsDeatilNew : columnsArray}
            data={matriceItems ? matriceDetailData : []}
            // onSelections={handleSelection}
            selectionMode='single'
            rowActions={actions}
            addBtn={false}
          />
        </div>
      </DialogComponent>

      <DialogComponent
        header='Valeur max'
        visible={visibleValueMax}
        onHide={onHideValueMax}
        className='md:w-22rem right-0'
        footer={footer}
      >
        <div className='flex justify-content-center'>
          <InputNumber
            inputId='valeurMax'
            value={valueMax}
            onValueChange={(e) => setValueMax(e.value)}
            className='w-9 h-3rem'
          />
        </div>
      </DialogComponent>

      {/* edit matrix detail  */}
      <div className='w-full'>
        <DialogComponent
          header='Edit detail'
          visible={editDetailMatrix}
          onHide={() => setEditDetailMatrix(false)}
          className='right-0'
          footer={footerEditDetail}
        >
          <MatrixEditor setCurrentMatrice={setCurrentMatrice} currentMatrice={currentMatrice} />
        </DialogComponent>
      </div>
    </div>
  )
}

export default MatrixDetail
