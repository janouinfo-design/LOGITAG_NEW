import {Dropdown} from 'primereact/dropdown'
import {InputText} from 'primereact/inputtext'
import React, {useEffect, useState} from 'react'
import ButtonComponent from '../../shared/ButtonComponent'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {DialogComponent} from '../../shared/DialogComponent'
import DialogContent from './DialogContent'
import {columnsTarif, columnsMatrice} from './columns'
import NewTarif from './NewTarif'
import NewMatrice from './NewMatrice'
import _ from 'lodash'

import {
  getMatrices,
  fetchMatrices,
  getVisibleNew,
  setVisibleNew,
  setMatriceDetail,
  getMatriceDetail,
  setIsNewDetail,
  setSelectedMatrix,
  getIsNewDetail,
  setSelectedPrestation,
  setSelectedEtat,
  setSelectedSrcData,
  setFormuleCondition,
  setFormuleCalcul,
  fetchTarifs,
  getTarifs,
  getEditMatrice,
  setEditMatrice,
  removeMatrice,
  setLoadingTar,
  setLoadingMatr,
  setSelectedTarif,
  removeTarif,
} from '../slice/facturation.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import MatrixDetail from './MatrixDetail'
import ClientAfacturer from './Clients/ClientAfacturer'
import EditMatrice from './Edit/EditMatrice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {setAlertParams} from '../../../store/slices/alert.slice'

const Facturation = () => {
  const typeTarif = ['List des tarifs', 'List des matrices']
  const [selectedType, setSelectedType] = useState(null)
  const [client, setClient] = useState(null)
  const [visible, setIsVisible] = useState(false)

  // const [visibleTest , setVisible] = useState(false)
  const dispatch = useAppDispatch()
  const isNewDetail = useAppSelector(getIsNewDetail)
  let visibleNew = useAppSelector(getVisibleNew)
  let visibleEdit = useAppSelector(getEditMatrice)
  let matriceDetail = useAppSelector(getMatriceDetail)

  let actionsMatrice = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(setIsNewDetail(false))
        dispatch(setSelectedMatrix(e.item.data))
        dispatch(setMatriceDetail(true))
      },
    },
    {
      label: 'Edit',
      icon: 'pi pi-cog text-blue-500',
      command: (e) => {
        dispatch(setVisibleNew(true))
        dispatch(setSelectedMatrix(e.item.data))
      },
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(removeMatrice(e.item.data))
      },
    },
  ]

  let actionsTarif = [
    {
      label: 'Edit',
      icon: 'pi pi-cog text-blue-500',
      command: (e) => {
        dispatch(setVisibleNew(true))
        dispatch(setSelectedTarif(e.item.data))
      },
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimerce tarif?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeTarif(e.item?.data?.id_tarif))
            },
          })
        )
      },
    },
  ]

  useEffect(() => {
    dispatch(fetchMatrices())
    dispatch(fetchTarifs())
  }, [])

  let matrices = useAppSelector(getMatrices)
  let tarifs = useAppSelector(getTarifs)

  const handleChange = (e) => {
    setSelectedType(e.value)
    setIsVisible(true)
  }

  const onHide = () => {
    setIsVisible(false)
    setSelectedType(null)
    dispatch(setLoadingTar(false))
    dispatch(setLoadingMatr(false))
  }

  const onHideAdd = () => {
    // setVisibleNew(false)
    dispatch(setVisibleNew(false))
    dispatch(setSelectedMatrix(null))
    if (selectedType === 'List des tarifs') {
      dispatch(setSelectedPrestation(null))
      dispatch(setSelectedEtat(null))
      dispatch(setSelectedSrcData(null))
      dispatch(setFormuleCondition(null))
      dispatch(setFormuleCalcul(null))
    }
  }

  const onAddButtonClick = () => {
    // setVisibleNew(true)
    dispatch(setVisibleNew(true))
    dispatch(setIsNewDetail(true))
    dispatch(setSelectedMatrix(null))
    dispatch(setSelectedTarif(null))
  }
  const footer = (
    <div className='flex flex-row justify-content-end'>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Add' icon='pi pi-plus-circle' onClick={onAddButtonClick} />
    </div>
  )

  const columns = [
    {
      header: 'N Dossier',
      olang: 'N Dossier',
      field: 'nDossier',
    },
    {
      header: 'Date de Livraison',
      field: 'dateLivraison',
      olang: 'Date.de.Livraison',
    },
    {
      header: 'Date de Cloture',
      field: 'dateCloture',
      olang: 'Date.de.Cloture',
    },
    {
      header: 'Client',
      field: 'client',
      olang: 'Client',
    },
    {
      header: 'NP',
      field: 'np',
      olang: 'NP',
    },
    {
      header: 'Ville',
      field: 'ville',
      olang: 'Ville',
    },
    {
      header: 'Code Magasin',
      field: 'codeMagasin',
      olang: 'Code.Magasin',
    },
    {
      header: 'Prix',
      field: 'prix',
      olang: 'Prix',
    },
    {
      header: 'Etat',
      field: 'etat',
      olang: 'Etat',
    },
    {
      header: 'Prestation',
      field: 'prestation',
      olang: 'Prestation',
    },
    {
      header: 'Ref Client',
      field: 'refClient',
      olang: 'Ref.Client',
    },
    {
      header: 'Volume',
      field: 'volume',
      olang: 'Volume',
    },
    {
      header: 'Adresse',
      field: 'adress',
      olang: 'Adresse',
    },
    {
      header: 'Agence',
      field: 'agence',
      olang: 'Agence',
    },
  ]


  return (
    <div>
      <EditMatrice visible={visibleEdit} />
      <div className='mt-4 w-full'>
        <div className='element-facturable'>
          <ClientAfacturer />
        </div>
        <DialogComponent
          header={
            selectedType === 'List des tarifs' ? (
              <OlangItem olang='ListTarif' />
            ) : (
              <OlangItem olang='ListMatrice' />
            )
          }
          visible={visible}
          footer={footer}
          onHide={onHide}
          className='md:w-9 right-0'
          position='bottom-right'
        >
          <DialogContent
            tableId='Ttest'
            columns={selectedType === 'List des tarifs' ? columnsTarif : columnsMatrice}
            data={selectedType === 'List des matrices' ? matrices : tarifs}
            onAddButtonClick={onAddButtonClick}
            addBtn={false}
            rowActions={selectedType === 'List des matrices' ? actionsMatrice : actionsTarif}
          />
        </DialogComponent>
        <DialogComponent
          header={selectedType === 'List des tarifs' ? 'Nouveau tarif' : 'Nouvelle matrice'}
          visible={visibleNew}
          onHide={onHideAdd}
          className='md:w-9 right-0 h-auto'
          position='right'
        >
          {selectedType === 'List des tarifs' ? <NewTarif /> : <NewMatrice />}
        </DialogComponent>
      </div>
      <MatrixDetail />
    </div>
  )
}

export default Facturation
