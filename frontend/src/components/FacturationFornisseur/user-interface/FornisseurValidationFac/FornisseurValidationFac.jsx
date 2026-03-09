import React, {useEffect, useRef, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {InputTextarea} from 'primereact/inputtextarea'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchFactureValidationFr,
  fetchListFr,
  fetchStatusFacture,
  getListFr,
  getListStatusFac,
  getSelectedFrGlobal,
  getValidationListFr,
  saveStatusFac,
  setDetailVisibleValidFr,
  setSelectedFrGlobal,
} from '../../slice/factureFornisseur.slice'
import {Chip} from 'primereact/chip'
import {Dropdown} from 'primereact/dropdown'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getOptionsConfirmation} from '../../../Facturation/slice/facture.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Calendar} from 'primereact/calendar'
import moment from 'moment'
import {fetchDetailFacture} from '../../../FacturesList/slice/factureListSlice'
import {Button} from 'primereact/button'
import {useFormik} from 'formik'

const FornisseurValidationFac = () => {
  const [visible, setVisible] = useState(false)
  const [textDialogStatus, setTextDialogStatus] = useState('')
  const [visibleValidation, setVisibleValidation] = useState(false)
  const [visibleComment, setVisibleComment] = useState(false)
  const [comment, setComment] = useState('')
  const [filterDate, setFilterDate] = useState(null)
  const [selectedFr, setSelectedFr] = useState(null)
  const [loadingSearchFr, setLoadingSearchFr] = useState(false)

  const statusSelectedRef = useRef(null)
  const rowFacSelectedRef = useRef(null)
  const calenderCreaRef = useRef(null)
  const calendarOrderRef = useRef(null)

  const dispatch = useAppDispatch()

  let optionsConfirmation = useAppSelector(getOptionsConfirmation)
  const listValidation = useAppSelector(getValidationListFr)
  const statusList = useAppSelector(getListStatusFac)
  const listFr = useAppSelector(getListFr)
  const selectedFrGlobal = useAppSelector(getSelectedFrGlobal)

  const optionNonAutorise = [
    {
      id: 3,
      name: 'Action Non Autorisé',
      value: false,
    },
  ]

  const formik = useFormik({
    initialValues: {
      creaDate: '',
      OrderDate: '',
    },
    onSubmit: (values) => {
      let data = {
        ID: selectedFrGlobal,
        orderDateFrom: moment(values?.OrderDate[0]).format('YYYY-MM-DD'),
        orderDateTo: moment(values?.OrderDate[1]).format('YYYY-MM-DD'),
        creaDateFrom: moment(values?.creaDate[0]).format('YYYY-MM-DD'),
        creaDateTo: moment(values?.creaDate[1]).format('YYYY-MM-DD'),
      }
      setLoadingSearchFr(true)
      dispatch(fetchFactureValidationFr(data)).then(() => {
        setLoadingSearchFr(false)
      })
    },
  })

  const footer = (onHideBtn, saveConfirmation) => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHideBtn} />
        <ButtonComponent label='Enregistrer' onClick={saveConfirmation} />
      </div>
    )
  }

  const clearFilters = () => {
    formik.resetForm()
    searchByFr()
  }

  const addresseeTemplate = (date) => {
    return (
      <>
        <Chip label={date} icon='pi pi-calendar' />
      </>
    )
  }

  const onSaveStatus = (e, rowData) => {
    setVisible(true)
    statusSelectedRef.current = e.value
    rowFacSelectedRef.current = rowData
    if (e.value === 'confirmed') {
      setTextDialogStatus('Vous voulez confirmer cette facture ?')
    } else {
      setTextDialogStatus('Vous voulez annuler cette facture ?')
    }
  }

  const actionValidate = (rowData) => {
    return (
      <div>
        {rowData.codeStatus === 'Cree' ? (
          <Dropdown
            value={rowData.isValid}
            options={statusList}
            optionLabel='label'
            optionValue='name'
            placeholder='pas de status'
            className='w-full md:w-10.3rem'
            onChange={(e) => onSaveStatus(e, rowData)}
          />
        ) : rowData.isValid == true ? (
          <Chip
            label='valide'
            icon='pi pi-check'
            className='bg-green-500'
            style={{color: `${rowData.color}`}}
            // onClick={() => dispatch(setSelectedFacture(rowData))}
          />
        ) : rowData.isValid == false ? (
          <div>
            <Chip
              label='non valide'
              icon='pi pi-file-edit'
              className='bg-red-500'
              style={{color: `${rowData.color}`}}
              //   onClick={isClient ? () => addComment(rowData) : null}
            />{' '}
            <p>
              <Chip
                label={rowData.comment.substring(0, 15)}
                className='w-7rem m-1 flex justify-content-center align-items-center'
              />
            </p>
          </div>
        ) : (
          <Chip
            label={rowData?.status}
            icon='pi pi-times'
            className='bg-red-500'
            style={{color: `${rowData.color}`}}
            // onClick={() => dispatch(setSelectedFacture(rowData))}
          />
        )}
      </div>
    )
  }

  const searchByFr = () => {
    setLoadingSearchFr(true)
    let obj = {
      IDProvider: selectedFrGlobal,
    }
    dispatch(fetchFactureValidationFr(obj)).then(() => {
      setLoadingSearchFr(false)
    })
  }

  const searchCalendar = () => {
    formik.submitForm()
  }

  const clearDate = (name) => {
    formik.setFieldValue(name, '')
    searchByFr()
  }

  const footerCalendar = (calendarInstance) => {
    return (
      <div className='flex justify-content-between'>
        <Button
          label='Clear'
          severity='danger'
          onClick={() => {
            calendarInstance.hide()
            clearDate(calendarInstance.props.name)
          }}
        />
        <Button
          label='OK'
          severity='success'
          onClick={() => {
            calendarInstance.hide()
            searchCalendar()
          }}
        />
      </div>
    )
  }

  const dateFilterCrea = (options) => {
    return (
      <Calendar
        name={options.field}
        ref={calenderCreaRef}
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        placeholder='mm/dd/yyyy'
        dateFormat='mm/dd/yy'
        selectionMode='range'
        mask='99/99/9999'
        showIcon
        footerTemplate={() => footerCalendar(calenderCreaRef.current)}
      />
    )
  }

  const dateFilterOrder = (options) => {
    return (
      <Calendar
        name={options.field}
        ref={calendarOrderRef}
        value={formik.values[options.field]}
        onChange={formik.handleChange}
        placeholder='mm/dd/yyyy'
        dateFormat='mm/dd/yy'
        selectionMode='range'
        mask='99/99/9999'
        showIcon
        footerTemplate={() => footerCalendar(calendarOrderRef.current)}
      />
    )
  }

  const columns = [
    {
      header: 'reference',
      olang: 'reference',
      field: 'reference',
      // body: addresseeTemplate,
      filter: true,
    },
    {
      header: 'description',
      field: 'description',
      olang: 'description',
    },
    {
      header: 'creaDate',
      field: 'creaDate',
      olang: 'creaDate',
      body: (rowData) => addresseeTemplate(rowData?.creaDate),
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterCrea,
    },
    {
      header: 'OrderDate',
      field: 'OrderDate',
      olang: 'OrderDate',
      body: (rowData) => addresseeTemplate(rowData?.OrderDate),
      filter: true,
      showFilterMenu: false,
      filterElement: dateFilterOrder,
    },
    {
      header: 'status',
      field: 'status',
      olang: 'status',
      body: actionValidate,
    },
  ]

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchDetailFacture(e.item.data.id)).then(({payload}) => {
          if (payload) {
            dispatch(setDetailVisibleValidFr(true))
          }
        })
      },
    },
  ]

  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.code} />,
  }

  const onHideSave = () => {
    setVisible(false)
  }

  const onSaveFacNonConfirmed = () => {
    let obj = {
      src: 'Fournisseurs',
      id: rowFacSelectedRef.current.id,
      status: statusSelectedRef.current,
      description: comment,
    }
    dispatch(saveStatusFac(obj)).then(({payload}) => {
      if (payload) {
        setVisibleComment(false)
      }
    })
  }

  const onSaveFac = () => {
    let obj = {
      src: 'Fournisseurs',
      id: rowFacSelectedRef.current.id,
      status: statusSelectedRef.current,
    }
    if (obj.status === 'confirmed') {
      dispatch(saveStatusFac(obj)).then(({payload}) => {
        if (payload) {
          setVisible(false)
        }
      })
    } else {
      setVisible(false)
      setVisibleComment(true)
    }
  }

  useEffect(() => {
    dispatch(fetchStatusFacture())
    dispatch(fetchListFr())
    // dispatch(fetchFactureValidationFr())
  }, [])

  useEffect(() => {
    if (!selectedFrGlobal) return
    searchByFr()
  }, [selectedFrGlobal])

  return (
    <div>
      <DialogComponent
        onHide={onHideSave}
        visible={visible}
        footer={() => footer(onHideSave, onSaveFac)}
      >
        <div className='text-xl text-gray-800'>
          {textDialogStatus}
          {/* <OlangItem olang='Voulez Vraiment Enregistrer?' /> */}
        </div>
      </DialogComponent>
      <DialogComponent
        visible={visibleComment}
        footer={() => footer(onHideSave, onSaveFacNonConfirmed)}
      >
        <div>
          <h5>Ajouter une Remarque</h5>
          <InputTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            cols={80}
            className='w-8 mt-4'
          />
        </div>
      </DialogComponent>

      <div className='title'>
        <p className='text-4xl'>
          <OlangItem olang='Validation' />
        </p>
      </div>
      <div className='flex pl-3 pb-3'>
        <Dropdown
          placeholder='Selectionner fornisseur'
          className=' h-3rem w-3'
          value={selectedFrGlobal}
          filter
          optionValue='id'
          optionLabel='name'
          options={listFr}
          onChange={(e) => dispatch(setSelectedFrGlobal(e.value))}
        />
        <ButtonComponent
          onClick={searchByFr}
          icon='pi pi-search'
          className='ml-3 h-3rem'
          loading={loadingSearchFr}
          disabled={!selectedFrGlobal || loadingSearchFr}
        />
      </div>
      <DatatableComponent
        tableId='validation-table-fornisseur'
        data={listValidation}
        columns={columns}
        rowGroupTemplates={rowGroupTemplates}
        contextMenuModel={actions}
        rowActions={actions}
        filterFunc={clearFilters}
        //onSelections={}
        onlyBtnExport={true}
      />
    </div>
  )
}

export default FornisseurValidationFac
