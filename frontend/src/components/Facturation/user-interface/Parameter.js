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
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

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

const Parameter = () => {
    const [activeTab, setActiveTab] = useState('tarifs')
    // const typeTarif = ['List des tarifs', 'List des matrices']
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



    const actionBodyTemplate = (rowData) => {
        const actions = activeTab === 'tarifs' ? actionsTarif : actionsMatrice;
        return (
            <div className="flex space-x-2">
                {actions.map(action => (
                    <ButtonComponent
                        key={action.label}
                        icon={action.icon} // On garde seulement l'icône
                        className={`p-button-text ${action.command === actionsTarif[0].command ? 'text-blue-500' : 'text-red-500'}`}
                        onClick={() => action.command({ item: { data: rowData } })}
                        label={null} // Suppression du label pour afficher uniquement l'icône
                    />
                ))}
            </div>
        );
    };



    return (
        <div className='max-w-8xl mx-auto p-4'>
            <h1 className='text-3xl font-bold mb-4'>Paramètres de facturation</h1>
            <div className='flex justify-center mb-4'>
                <button className={`transition duration-300 ease-in-out transform py-2 px-6 mx-2 ${activeTab === 'tarifs' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg hover:scale-105`} onClick={() => setActiveTab('tarifs')}>Liste des Tarifs</button>
                <button className={`transition duration-300 ease-in-out transform py-2 px-6 mx-2 ${activeTab === 'matrices' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg hover:scale-105`} onClick={() => setActiveTab('matrices')}>Liste des Matrices</button>
            </div>


            <DataTable value={activeTab === 'tarifs' ? tarifs : matrices} className="border border-black">
                {(activeTab === 'tarifs' ? columnsTarif : columnsMatrice).map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        body={col.body}
                        className="border border-black" // Ajoutez cette ligne pour chaque colonne
                    />
                ))}
                <Column body={actionBodyTemplate} header="Actions" className="text-center border border-black" />
            </DataTable>

            <div className='flex justify-end mt-5'>
                <ButtonComponent
                    label='Ajouter'
                    icon='pi pi-plus-circle'
                    onClick={onAddButtonClick}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition"
                />
            </div>

            {/* Add New Tarif/Matrice */}
            <DialogComponent
                header={activeTab === 'tarifs' ? 'Nouveau tarif' : 'Nouvelle matrice'}
                visible={visibleNew}
                onHide={onHideAdd}
                className='md:w-9 right-0 h-auto'
                position='right'
            >
                {activeTab === 'tarifs' ? <NewTarif /> : <NewMatrice />}
            </DialogComponent>
            <MatrixDetail />
        </div>
    )
}

export default Parameter
