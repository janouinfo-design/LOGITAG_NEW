import React, {useEffect, useRef, useState} from 'react'
import {Card, CardContent, CardDescription, CardTitle} from '../../../ui/Card'
import {Button} from 'primereact/button'
import HeaderChoose from '../../../ui/HeaderChoose'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
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
import moment from 'moment'
import {ScrollPanel} from 'primereact/scrollpanel'
import {Divider} from 'primereact/divider'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {InputTextarea} from 'primereact/inputtextarea'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {InputText} from 'primereact/inputtext'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Calendar} from 'primereact/calendar'
import {Dropdown} from 'primereact/dropdown'
import {fetchDetailFacture} from '../../../FacturesList/slice/factureListSlice'

const FacValidFrNew = () => {
  const [loadingSearchFr, setLoadingSearchFr] = useState(false)
  const [visible, setVisible] = useState(false)
  const [textDialogStatus, setTextDialogStatus] = useState('')
  const [visibleComment, setVisibleComment] = useState(false)
  const [comment, setComment] = useState('')
  const [filterDate, setFilterDate] = useState(new Date())
  const [txtFilter, setTxtFilter] = useState('')
  const [listData, setListData] = useState([])
  const dispatch = useAppDispatch()

  const listValidation = useAppSelector(getValidationListFr)
  const statusList = useAppSelector(getListStatusFac)
  const listFr = useAppSelector(getListFr)
  const selectedFrGlobal = useAppSelector(getSelectedFrGlobal)

  const statusSelectedRef = useRef(null)
  const rowFacSelectedRef = useRef(null)

  const onChangeDropdown = (value) => {
    dispatch(setSelectedFrGlobal(value))
  }

  const footer = (onHideBtn, saveConfirmation) => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHideBtn} />
        <ButtonComponent label='Enregistrer' onClick={saveConfirmation} />
      </div>
    )
  }

  const onShowDetail = (rowData) => {
    dispatch(fetchDetailFacture(rowData.id)).then(({payload}) => {
      if (payload) {
        dispatch(setDetailVisibleValidFr(true))
      }
    })
  }

  const onHideSave = () => {
    setVisible(false)
    setVisibleComment(false)
    setComment('')
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
        searchByFr()
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
          searchByFr()
          setVisible(false)
        }
      })
    } else {
      setVisible(false)
      setVisibleComment(true)
    }
  }

  const onSaveStatus = (e, rowData) => {
    setVisible(true)
    statusSelectedRef.current = e
    rowFacSelectedRef.current = rowData
    if (e === 'confirmed') {
      setTextDialogStatus('Vous voulez confirmer cette facture ?')
    } else {
      setTextDialogStatus('Vous voulez annuler cette facture ?')
    }
  }

  const onChangeTxtFilter = (e) => {
    setTxtFilter(e.target.value)
    if (e.target.value && Array.isArray(listValidation)) {
      let txt = e.target.value.toLowerCase()
      const filtered = listValidation?.filter((item) =>
        item?.reference?.toLowerCase().includes(txt)
      )
      setListData(filtered)
    }
    if (!e.target.value) {
      setListData(listValidation)
    }
  }

  const searchByFr = () => {
    setLoadingSearchFr(true)
    let obj = {
      IDProvider: selectedFrGlobal,
      year: moment(filterDate).format('YYYY'),
    }
    dispatch(fetchFactureValidationFr(obj)).then(({payload}) => {
      setListData(payload)
      setLoadingSearchFr(false)
    })
  }
  useEffect(() => {
    dispatch(fetchStatusFacture())
    dispatch(fetchListFr())
    // dispatch(fetchFactureValidationFr())
  }, [])

  useEffect(() => {
    if (!selectedFrGlobal) return
    searchByFr()
  }, [])

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
        onHide={() => {
          setVisibleComment(false)
          setComment('')
        }}
      >
        <div>
          <h5>
            <OlangItem olang='comment' />
          </h5>
          <InputTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            cols={80}
            className='w-8 mt-4'
          />
        </div>
      </DialogComponent>
      <Card className='bg-gradient-to-br rounded-3xl p-2 border-2 border-gray-300 from-white to-gray-50 mt-2'>
        <div className='p-4 flex flex-col gap-2'>
          <CardTitle>
            <OlangItem olang='ArchivedClient' />
          </CardTitle>
          <CardDescription className='text-base text-gray-500'>
            <OlangItem olang='ArchivedClient.desc' />
          </CardDescription>
        </div>
        <CardContent className='p-2'>
          <div className='flex flex-row gap-6 items-end justify-between'>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='annee' />
              </label>
              <Calendar
                value={filterDate}
                // showIcon
                // showButtonBar
                dateFormat='yy'
                view='year'
                selectionMode='single'
                yearNavigator
                yearRange='1900:2050'
                inputClassName='h-[3] text-lg font-semibold'
                onChange={(e) => setFilterDate(e.value)}
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='Client' />
              </label>
              <Dropdown
                value={selectedFrGlobal}
                filter
                optionValue='id'
                optionLabel='name'
                options={listFr}
                onChange={(e) => onChangeDropdown(e.value)}
                placeholder='Selectionner un fournisseur'
                className='text-lg font-semibold h-[3]'
                onKeyDown={(e) => e.code === 'Enter' && searchByFr()}
              />
            </div>
            <div className='flex flex-col flex-1'>
              <label className='text-xl mb-2 font-semibold text-gray-800'>
                <OlangItem olang='N.Facture' />
              </label>
              <InputText onChange={onChangeTxtFilter} placeholder='ex: 123456' className='h-[3]' />
            </div>
            <div className='flex flex-col flex-[1/2]'>
              <ButtonComponent
                className='h-16 flex rounded-3xl flex-row gap-2 items-center justify-center'
                icon='pi pi-search'
                onClick={searchByFr}
                loading={loadingSearchFr}
                disabled={!selectedFrGlobal || loadingSearchFr}
              >
                <OlangItem olang='Search' />
              </ButtonComponent>
            </div>
          </div>
        </CardContent>
      </Card>
      <Divider className='my-4' />
      <ScrollPanel style={{height: '50vh'}}>
        <div className='flex flex-col gap-4 items-center '>
          {Array.isArray(listData) && listData.length > 0 ? (
            listData?.map((item) => (
              <Card
                key={item?.id}
                className='shadow-sm p-2 border-gray-300 border-2 rounded-xl flex items-center justify-center w-full'
              >
                <CardContent className='w-full flex items-center justify-items-center'>
                  <div className='w-full'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h3 className='text-xl font-semibold'>{item?.reference}</h3>
                        <p className='text-sm text-muted-foreground'>Client</p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          className='flex flex-row text-lg font-semibold gap-2 hover:text-red-500 hover:bg-red-200 bg-slate-50 text-gray-600 border-0'
                          icon='fas fa-regular fa-circle-xmark'
                          size='sm'
                          text
                          rounded
                          onClick={(e) => onSaveStatus('NotConfirmed', item)}
                        >
                          {/* <XCircle className="w-4 h-4 mr-1" /> */}
                          <OlangItem olang='Rejeter' />
                        </Button>
                        <Button
                          className='flex flex-row gap-2 bg-slate-100 hover:text-green-500 text-gray-600 hover:bg-green-200 border-0 text-lg font-semibold'
                          icon='fas fa-regular fa-memo-circle-check'
                          size='sm'
                          text
                          rounded
                          onClick={(e) => onSaveStatus('confirmed', item)}
                        >
                          {/* <CheckCircle className="w-4 h-4 mr-1" /> */}
                          <OlangItem olang='Valider' />
                        </Button>
                      </div>
                    </div>
                    <div className='mt-4 flex flex-row justify-between items-center'>
                      <div>
                        <p className='text-muted-foreground text-base text-gray-500 font-semibold'>
                          <OlangItem olang='Total' />
                        </p>
                        <p className='font-semibold text-lg '>{item?.Tottal || 0} CHF</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground  text-base text-gray-500 font-semibold'>
                          <OlangItem olang='DateCreation' />
                        </p>
                        <p className='font-semibold text-lg '>{item?.creaDate}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground  text-base text-gray-500 font-semibold'>
                          <OlangItem olang='DateCommande' />
                        </p>
                        <p className='font-semibold text-lg'>{item?.OrderDate}</p>
                      </div>
                      <div>
                        <Button
                          icon='fas fa-solid fa-eye text-2xl'
                          className='bg-transparent text-gray-800 hover:bg-gray-300'
                          size='small'
                          text
                          onClick={(e) => onShowDetail(item)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className='flex flex-row gap-4 items-center mt-4'>
              <i className='pi pi-info-circle text-5xl text-gray-500' />
              <h3 className='text-2xl font-semibold text-gray-800'>
                <OlangItem olang='NoData' />
              </h3>
            </div>
          )}
        </div>
      </ScrollPanel>
    </div>
  )
}

export default FacValidFrNew
