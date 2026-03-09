import {useEffect, useRef, useState} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  closeFacture,
  fetchDetailFacture,
  fetchDetailService,
  fetchHistoryFormule,
  getDetailFacture,
  getFormulHistory,
  recalculateFormule,
  removeService,
  setDetailFacture,
  updateLineInvoice,
} from '../../slice/factureListSlice'
import {Divider} from 'primereact/divider'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {InputNumber} from 'primereact/inputnumber'
import {
  fetchDetailClient,
  fetchPrestation,
  getDetailClient,
  getPrestationList,
} from '../../../Facturation/slice/facturation.slice'
import {Dropdown} from 'primereact/dropdown'
import * as _ from 'lodash'
import {InputText} from 'primereact/inputtext'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {Button} from 'primereact/button'
import {
  getSelectedDetail,
  mergeInvoices,
  setSelectedDetail,
} from '../../../FacturationFornisseur/slice/factureFornisseur.slice'
import DetailServicePopup from './DetailServicePopup'
import CalculeDialog from './CalculeDialog'
import {Dialog} from 'primereact/dialog'
import moment from 'moment'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import HeaderInvoice from './HeaderInvoice'
import MergeForm from './MergeForm'
import {SplitButton} from 'primereact/splitbutton'

const DetailFacture = ({onHideDetail, idTable, selectedUser}) => {
  const [total, setTotal] = useState({})
  const [detailVisible, setDetailVisible] = useState(false)
  // const [selectedInvoices, setSelectedInvoices] = useState([])
  const [loadingMerge, setLoadingMerge] = useState(false)
  const [calcVisible, setCalcVisible] = useState(false)
  const [selectedService, setSelectedService] = useState({})
  const [loadingCalc, setLoadingCalc] = useState(false)
  const [histoFormuleVisible, setHistoFormuleVisible] = useState(false)
  const [loadingHisto, setLoadingHisto] = useState(false)
  const [visibleMerge, setVisibleMerge] = useState(false)

  const dispatch = useAppDispatch()
  const facDetail = useAppSelector(getDetailFacture)
  const listPrestation = useAppSelector(getPrestationList)
  const selectedInvoices = useAppSelector(getSelectedDetail)
  const historyFormule = useAppSelector(getFormulHistory)
  const detailClient = useAppSelector(getDetailClient)
  const selecttedLineFacture = {}

  const selectedRowRef = useRef(null)

  const displayPdf = (rowData) => {
    return (
      <div>
        <ButtonComponent
          label='PDF'
          icon='pi pi-file-pdf'
          className='p-button-danger p-button-sm'
          onClick={() => {} /*onClickPdfCrt(rowData)*/}
        />
      </div>
    )
  }
  const onHide = () => {
    onHideDetail()
    dispatch(setSelectedDetail([]))
  }

  const onCellEditComplete = (e) => {
    const {rowData, newValue, field} = e

    switch (field) {
      case 'Prix_HT': {
        if (!rowData || newValue === undefined) return

        const numericValue = parseFloat(newValue) || 0
        const tvaRate = parseFloat(rowData.TVA) || 0 // Get TVA from rowData
        const newPrix = numericValue * (1 + tvaRate / 100)

        if (numericValue === rowData.Prix_HT) return

        try {
          const updatedDetails = facDetail.detailInvoice.map((item) =>
            item.ID === rowData.ID
              ? {
                  ...item,
                  Prix_HT: numericValue,
                  prix: newPrix, // Update prix calculation
                }
              : item
          )

          const updatedFacDetail = {
            ...facDetail,
            detailInvoice: updatedDetails,
          }

          dispatch(setDetailFacture(updatedFacDetail))
          dispatch(
            updateLineInvoice({
              ...rowData,
              Prix_HT: numericValue,
              prix: newPrix, // Send calculated prix
            })
          )
        } catch (error) {
          console.error('Error updating Prix_HT:', error)
        }
        break
      }
      case 'produit': {
        const trimmedValue = (newValue || '').trim()
        if (!trimmedValue || trimmedValue === rowData.produit) return
        try {
          // Update product name immutably
          const updatedDetails = facDetail.detailInvoice.map((item) =>
            item.ID === rowData.ID ? {...item, produit: trimmedValue} : item
          )
          dispatch(
            setDetailFacture({
              ...facDetail,
              detailInvoice: updatedDetails,
            })
          )
          dispatch(
            updateLineInvoice({
              ...rowData,
              produit: trimmedValue,
            })
          )
        } catch (error) {
          console.error('Error updating produit:', error)
        }
        break
      }

      case 'TVA': {
        const regx = /^\d*\.?\d*$/
        if (!regx.test(newValue)) {
          alert('TVA doit être un nombre valide (ex: 10 ou 10.5)')
          return
        }
        const numericTVA = parseFloat(newValue) || 0
        const currentPrixHT = parseFloat(rowData.Prix_HT) || 0
        const newPrix = currentPrixHT * (1 + numericTVA / 100)

        const updatedDetails = facDetail.detailInvoice.map((item) =>
          item.ID === rowData.ID
            ? {
                ...item,
                TVA: numericTVA,
                prix: newPrix,
              }
            : item
        )

        dispatch(setDetailFacture({...facDetail, detailInvoice: updatedDetails}))
        dispatch(updateLineInvoice({...rowData, TVA: numericTVA}))
        break
      }

      default:
        return
    }
  }

  const onChangePrestation = (e, option) => {
    let data = _.cloneDeep(facDetail)
    data.detailInvoice[option.rowIndex].produit = e.value
    dispatch(setDetailFacture(data))
    const updatedData = {
      ID: option.rowData?.ID,
      TVA: option.rowData?.TVA,
      Prix_HT: option.rowData?.Prix_HT || 0,
      prix: option.rowData?.prix || 0,
      RefCmdClient: option.rowData?.RefCmdClient,
      description: option.rowData?.description,
      Produit: e.value,
    }
    dispatch(updateLineInvoice(updatedData))
  }

  const priceEditor = (options) => {
    return (
      <InputNumber
        // name={options.field}
        disabled={facDetail?.codeStatus === 'cloturer'}
        value={options?.value || 0}
        onValueChange={(e) => {
          options.editorCallback(e.value)
        }}
        mode='currency'
        currency='CHF'
        locale='fr-CH'
        className='p-inputtext-sm'
      />
    )
  }

  const fetchData = () => {
    dispatch(fetchDetailFacture(facDetail?.id))
  }

  const mergeInvoice = (desc) => {
    dispatch(setAlertParams({visible: false}))
    setLoadingMerge(true)
    if (!Array.isArray(selectedInvoices)) return
    const data = selectedInvoices?.map((item) => {
      return {
        ID: item.ID,
        OTID: item.OTID,
        produit: item.produit,
        RefCmdClient: item.RefCmdClient,
      }
    })
    let obj = {
      IDFacture: facDetail.id,
      desc: desc,
      rows: data,
    }
    dispatch(mergeInvoices(obj)).then(() => {
      setLoadingMerge(false)
      // onHideDetail()
      // dispatch(setSelectedDetail([]))
      fetchData()
      setVisibleMerge(false)
    })
  }

  const removeServiceFc = (rowData) => {
    const objId = [
      {
        id: rowData?.ID,
      },
    ]
    dispatch(removeService(objId)).then(() => {
      dispatch(fetchDetailFacture(facDetail?.id))
    })
  }

  const rejectConfirm = () => {
    dispatch(
      setAlertParams({
        visible: false,
      })
    )
  }

  const mergeConfirm = () => {
    dispatch(
      setAlertParams({
        visible: true,
        title: 'Confirmation',
        message: 'Etes-vous sur de vouloir fusionner ces factures',
        confirm: () => setVisibleMerge(true),
        reject: rejectConfirm,
      })
    )
  }

  const extraHeaderTemplate = (
    <div className='flex flex-row gap-2'>
      {facDetail?.codeStatus !== 'confirmed' && facDetail?.codeStatus !== 'cloturer' && (
        <Button
          icon='fas fa-solid fa-layer-plus text-2xl'
          onClick={mergeConfirm}
          disabled={
            selectedInvoices?.length === 0 || loadingMerge || facDetail?.codeStatus === 'cloturer'
          }
          loading={loadingMerge}
          className='border-none rounded-2xl bg-transparent text-gray-800 hover:bg-gray-200 hover:text-green-300'
        />
      )}
    </div>
  )
  const handleSelection = (selectedInv) => {
    dispatch(setSelectedDetail(selectedInv))
  }

  const prestationEditor = (options) => {
    return (
      <Dropdown
        name={options.field}
        filter
        value={options?.value}
        options={listPrestation}
        onChange={(e) => {
          onChangePrestation(e, options)
          options.editorCallback(e.value)
        }}
        optionLabel='Produit'
        optionValue='Produit'
        disabled={facDetail?.codeStatus === 'cloturer'}
      />
    )
  }

  const onChangeTva = (rowIndex, value) => {
    let data = _.cloneDeep(facDetail)
    const selected = facDetail?.detailInvoice[rowIndex]

    data.detailInvoice[rowIndex].TVA = value
    dispatch(setDetailFacture(data))
    const updatedData = {
      ID: selected?.ID,
      TVA: value,
      Prix_HT: selected?.Prix_HT || 0,
      prix: selected?.prix || 0,
      RefCmdClient: selected?.RefCmdClient,
      description: selected?.description,
      Produit: selected?.produit,
    }

    dispatch(updateLineInvoice(updatedData))
  }

  const onChangePrixHt = (rowIndex, value) => {
    let data = _.cloneDeep(facDetail)
    const selected = facDetail?.detailInvoice[rowIndex]
    data.detailInvoice[rowIndex].Prix_HT = value
    const updatedData = {
      ID: selected?.ID,
      TVA: selected?.TVA,
      Prix_HT: value,
      prix: selected?.prix || 0,
      RefCmdClient: selected?.RefCmdClient,
      description: selected?.description,
      Produit: selected?.produit,
    }
    dispatch(updateLineInvoice(updatedData))
  }

  const tvaEditor = (options) => {
    return (
      <InputText
        className='p-inputtext-sm'
        placeholder='TVA'
        name={options.field}
        value={options?.value}
        onChange={(e) => {
          options.editorCallback(e.target.value)
          // onChangeTva(options.rowIndex, e.target.value)
        }}
      />
    )
  }

  const calcTotals = () => {
    if (!facDetail?.detailInvoice) return

    let detail = _.cloneDeep(facDetail)
    let totalHt = 0
    let totalTva = 0
    let totalTtc = 0

    detail?.detailInvoice?.forEach((item) => {
      const prixHt = +item?.Prix_HT // Price excluding tax
      const tvaPercentage = +item?.TVA // TVA percentage (e.g., 10%)

      // Calculate the TVA amount in money
      const tvaAmount = (prixHt * tvaPercentage) / 100

      totalHt += prixHt // Add to total HT
      totalTva += tvaAmount // Add to total TVA
    })

    totalTtc = totalHt + totalTva // Calculate total TTC

    // Format the numbers as CHF currency
    const formatter = new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
    })

    let obj = {
      totalHt: formatter.format(totalHt),
      totalTva: formatter.format(totalTva),
      totalTtc: formatter.format(totalTtc),
    }

    setTotal(obj)
  }

  const getDetailService = (data) => {
    const obj = {
      ID: data?.ID,
    }

    dispatch(fetchDetailService(obj)).then(() => {
      setDetailVisible(true)
    })
  }

  const goLink = (id) => {
    let link = 'http://tricolis.duperrex.ch/tricolis/Ajout/AfficherOTPlus/' + id
    window.open(link, '_blank')
  }

  let actions = [
    {
      label: 'Detail',
      icon: 'fas fa-light fa-up-right-from-square text-blue-500',
      command: (e) => {
        goLink(e.item.data.OTID)
      },
    },

    {
      label: 'Remove',
      icon: 'fas fa-duotone fa-solid fa-arrow-up-from-bracket text-red-500',
      command: (e) => {
        removeServiceFc(e.item.data)
      },
    },
  ]

  const templateDetail = (rowData) => {
    let newActions = _.cloneDeep(actions)
    if (rowData?.serviceId == 0) {
      newActions.push({
        label: 'Services',
        icon: 'fas fa-solid fa-eye text-blue-500',
        command: (e) => {
          getDetailService(rowData)
        },
      })
    }
    if (facDetail?.codeStatus === 'cloturer' || facDetail?.codeStatus === 'confirmed') {
      newActions = newActions.filter((action) => action.label !== 'Remove')
    }

    return (
      <div className='flex flex-row gap-2'>
        <SplitButton
          icon='pi pi-cog'
          model={newActions.map((action) => ({...action, data: rowData}))}
          severity='secondary'
          menuButtonProps={{
            icon: 'pi pi-chevron-down',
            className:
              'border-0  border-circle bg-gray-100 hover:bg-gray-300 text-gray-600 hover:text-gray-800',
          }}
          rounded
          buttonClassName='hidden'
          // onClick={() => splitAction(rowData)}
        />
        {/* {rowData?.serviceId == 0 ? (
          <ButtonComponent
            size='small'
            icon='fas fa-solid fa-eye text-xl'
            rounded
            text
            // disabled={facDetail?.codeStatus !== 'confirmed'}
            className='bg-transparent text-gray-800 hover:bg-gray-300 p-button-sm'
            onClick={() => getDetailService(rowData)}
          />
        ) : null}
        <ButtonComponent
          size='small'
          icon='fas fa-duotone fa-solid fa-arrow-up-from-bracket text-xl'
          className='bg-transparent text-gray-800 hover:bg-red-200 hover:text-red-600 p-button-sm'
          rounded
          text
          disabled={facDetail?.codeStatus === 'confirmed'}
          onClick={() => removeServiceFc(rowData)}
        /> */}
      </div>
    )
  }

  const removeServiceTemplate = (rowData) => {
    return (
      <div>
        <ButtonComponent
          severity='warning'
          icon='fas fa-duotone fa-solid fa-arrow-up-from-bracket text-xl'
          className='p-button-sm'
          onClick={() => removeServiceFc(rowData)}
          disabled={facDetail?.codeStatus === 'cloturer'}
        />
      </div>
    )
  }

  const fetchFormuleHistoryFc = (rowData) => {
    setLoadingHisto(true)
    let obj = {
      ID: rowData?.ID,
      srcObject: 'OrderLine',
    }
    dispatch(fetchHistoryFormule(obj)).then(({payload}) => {
      if (payload) {
        setLoadingHisto(false)
        setHistoFormuleVisible(true)
      }
      dispatch(
        setToastParams({
          show: true,
          severity: 'info',
          summary: 'Info',
          detail: 'Historique non trouvée',
          position: 'top-right',
        })
      )
      setLoadingHisto(false)
    })
  }

  const templateFormule = (rowData) => {
    return (
      <div className='flex flex-column gap-2'>
        <div className='flex flex-row gap-2'>
          <ButtonComponent
            icon='fas fa-solid fa-calculator'
            className='bg-blue-500 p-button-sm'
            rounded
            text
            disabled={facDetail?.codeStatus === 'cloturer'}
            onClick={() => {
              setSelectedService(rowData)
              setCalcVisible(true)
            }}
          />
          <ButtonComponent
            icon='fas fa-solid fa-list-timeline'
            className='bg-blue-500 p-button-sm'
            rounded
            text
            disabled={loadingHisto}
            loading={loadingHisto}
            onClick={() => {
              fetchFormuleHistoryFc(rowData)
            }}
          />
        </div>
        <div
          style={{
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData?.formuleCalcule}
        </div>
      </div>
    )
  }

  const renderProduitBody = (rowData) => {
    if (facDetail?.codeStatus == 'cloturer' || rowData?.serviceId === 0) {
      return <strong>{rowData?.produit}</strong>
    }
    return <InputText className={'border-blue-500'} value={rowData?.produit} disabled />
  }

  const renderPrixHTBody = (rowData) => {
    if (facDetail?.codeStatus == 'cloturer' || rowData?.serviceId === 0) {
      return <strong>{rowData?.Prix_HT}</strong>
    }
    return (
      <InputNumber
        inputClassName={'border-blue-500'}
        value={rowData?.Prix_HT}
        disabled
        mode='currency'
        currency='CHF'
      />
    )
  }

  const renderTVABody = (rowData) => {
    const tvaValue = rowData?.TVA ? `${rowData?.TVA} %` : '0 %'
    if (rowData?.serviceId === 0 || facDetail?.codeStatus === 'cloturer') {
      return <strong>{tvaValue}</strong>
    }
    return <InputText className={'border-blue-500'} value={tvaValue} disabled />
  }

  const columns = [
    {field: 'Detail', header: 'Detail', olang: 'Detail', body: templateDetail},
    {field: 'OTNoBL', header: 'OTNoBL', olang: 'OTNoBL', filter: true},
    {
      field: 'produit',
      header: 'produit',
      olang: 'produit',
      filter: true,
      body: renderProduitBody,
      editor: (e) => {
        if (facDetail?.codeStatus !== 'cloturer' && e.rowData?.serviceId != 0) {
          return prestationEditor(e)
        }
        return
      },
      onCellEditComplete: (e) => {
        onCellEditComplete(e)
      },
    },
    {
      field: 'Prix_HT',
      header: 'Prix_HT',
      olang: 'Prix.HT',
      filter: true,
      body: renderPrixHTBody,
      editor: facDetail?.codeStatus !== 'cloturer' ? priceEditor : null,
      onCellEditComplete: (e) => {
        onCellEditComplete(e)
      },
    },
    {
      field: 'TVA',
      header: 'TVA',
      olang: 'TVA',
      filter: true,
      body: renderTVABody,
      editor: facDetail?.codeStatus !== 'cloturer' ? tvaEditor : null,
      onCellEditComplete: (props) => {
        onCellEditComplete(props)
      },
    },
    {
      field: 'prix',
      header: 'Prix.TTC',
      olang: 'Prix.TTC',
      filter: true,
    },
    {field: 'OTAdresse1', header: 'OTAdresse1', olang: 'OTAdresse1', filter: true},
    {field: 'OTDestinNom', header: 'OTDestinNom', olang: 'OTDestinNom', filter: true},
    {
      field: 'formuleCalcule',
      header: 'formuleCalcule',
      olang: 'formuleCalcule',
      body: (rowData) => (rowData?.serviceId === 0 ? '--' : templateFormule),
    },
    {field: 'np_livraison', header: 'np_livraison', olang: 'np_livraison', filter: true},
    {field: 'ville_livraison', header: 'ville_livraison', olang: 'ville_livraison', filter: true},
  ]

  const columnsHistory = [
    {
      field: 'Date',
      header: 'Date',
      olang: 'Date',
      body: (rowData) => moment(rowData?.Date).format('DD/MM/YYYY'),
    },
    {field: 'formule', header: 'formule', olang: 'formule'},
    {field: 'formuleCalcule', header: 'formuleCalcule', olang: 'formuleCalcule'},
    {field: 'Prix_HT', header: 'Prix_HT', olang: 'Remove'},
    {field: 'TVA', header: 'TVA', olang: 'TVA'},
  ]

  const onHideMerge = () => {
    setVisibleMerge(false)
  }

  const onHideCalc = () => {
    setCalcVisible(false)
  }

  const closeFac = () => {
    dispatch(
      setAlertParams({
        visible: true,
        message: 'Etes-vous sur de vouloir cloturer cette facture ?',
        confirm: () => {
          let obj = {
            id: facDetail?.id,
            client: selectedUser,
          }
          dispatch(closeFacture(obj)).then(({payload}) => {
            if (payload) {
              dispatch(setAlertParams({visible: false}))
            }
          })
        },
        reject: () => {
          dispatch(setAlertParams({visible: false}))
        },
      })
    )
  }

  const saveCalcFormule = (data) => {
    setLoadingCalc(true)
    let obj = {
      ...selectedService,
      serviceId: selectedService?.ID + '',
      OTID: selectedService?.OTID + '',
      formuleCalcule: data,
    }
    dispatch(recalculateFormule(obj)).then(({payload}) => {
      dispatch(fetchDetailFacture(facDetail?.id))
      onHideCalc()
      setLoadingCalc(false)
    })
  }

  // useEffect(() => {
  //   if (facDetail) {
  //     const total = facDetail.detailInvoice.reduce((acc, item) => {
  //       if (item?.prix) {
  //         return +acc + +item.prix
  //       }
  //       return 0
  //     }, 0)
  //     setTotal(total)
  //   }
  // }, [facDetail])
  useEffect(() => {
    if (facDetail) {
      calcTotals()
    }
  }, [facDetail])

  useEffect(() => {
    handleSelection([])
    dispatch(fetchPrestation())
  }, [])

  useEffect(() => {
    if (selectedUser) {
      let obj = {
        ID: selectedUser,
        src: 'Fournisseurs',
      }
      dispatch(fetchDetailClient(obj))
    }
  }, [selectedUser])

  return (
    <div>
      <MergeForm
        loading={loadingMerge}
        visible={visibleMerge}
        save={mergeInvoice}
        onHide={onHideMerge}
      />
      <CalculeDialog
        loadingSave={loadingCalc}
        saveCalcBtn={saveCalcFormule}
        onHide={onHideCalc}
        visible={calcVisible}
        placeholder={selectedService?.formuleCalcule}
      />
      <DetailServicePopup visible={detailVisible} onHide={() => setDetailVisible(false)} />
      <Dialog
        header='Historique formule'
        onHide={() => setHistoFormuleVisible(false)}
        visible={histoFormuleVisible}
        style={{width: '50vw'}}
        modal={true}
      >
        <DatatableComponent
          tableId={'hsito-formule'}
          data={historyFormule || []}
          columns={columnsHistory}
        />
      </Dialog>
      <div className='w-full flex flex-row justify-between items-center'>
        <ButtonComponent
          icon='fas fa-solid fa-share fa-flip-horizontal'
          onClick={onHide}
          text
          className='hover:text-red-500 rounded-2xl border-1 border-red-400 flex flex-row items-center gap-2 text-gray-800 text-xl'
        >
          <OlangItem olang='btn.back' />
        </ButtonComponent>
        {facDetail?.codeStatus !== 'cloturer' && (
          <ButtonComponent
            icon='fas fa-solid fa-check-double'
            onClick={closeFac}
            text
            className='hover:text-green-500 rounded-2xl border-1 border-green-400 flex flex-row items-center gap-2 text-gray-800 text-xl'
          >
            <OlangItem olang='Cloturer' />
          </ButtonComponent>
        )}
      </div>
      <HeaderInvoice
        img={process.env.REACT_APP_IMAGE_BASE_URL + '/logos/logo.png'}
        reference={facDetail?.reference}
        creaDate={facDetail?.creaDate}
        OrderDate={facDetail?.OrderDate}
        {...detailClient[0]}
      />
      <Divider />
      <DatatableComponent
        tableId={idTable}
        data={facDetail?.detailInvoice || []}
        columns={columns}
        extraHeader={extraHeaderTemplate}
        selectionRowsProps={true}
        selectedDataTb={selectedInvoices}
        onSelections={handleSelection}
        onlyBtnExport={true}
      />
      <div className='flex flex-row shadow- pb-2  rounded-2xl  mt-4 border-1 border-gray-500 items-center justify-end'>
        <div className=' flex flex-row   mt-4 justify-content-end border-0'>
          <tr>
            <td></td>
            <td className='pr-4'>
              <h2 className='font-normal text-gray-600'>
                <OlangItem olang='LangTotalHT' />:{' '}
              </h2>
            </td>
            <td className='pr-4 text-gray-800 font-bold text-4xl'>{total?.totalHt || 0}</td>
          </tr>
          <Divider align='center' type='solid' layout='vertical' />
          <tr>
            <td></td>
            <td className='pr-4'>
              <h2 className='font-normal text-gray-600'>
                <OlangItem olang='LangTotalTVA' />:{' '}
              </h2>
            </td>
            <td className='pr-4 text-gray-800 font-bold text-4xl'>{total?.totalTva || 0}</td>
          </tr>
          <Divider align='center' type='solid' layout='vertical' />
          <tr>
            <td></td>
            <td className='pr-4'>
              <h2 className='font-normal text-gray-600'>
                <OlangItem olang='LangTotalTTC' />:{' '}
              </h2>
            </td>
            <td className='pr-4 text-gray-800 font-bold text-4xl'>{total?.totalTtc || 0}</td>
          </tr>
        </div>
      </div>
    </div>
  )
}

export default DetailFacture
