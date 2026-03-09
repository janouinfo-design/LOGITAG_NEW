import {memo, useEffect, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import {Chip} from 'primereact/chip'
import {
  fetchObjectFamilles,
  getObjectFamilles,
  setSelectedStatus,
} from '../../../Status/slice/status.slice'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchFamilles,
  getFamilles,
  getSelectedObject,
  removeFamille,
  setEditFamille,
  setSelectedFamille,
  setSelectedObject,
  setShow,
} from '../../slice/statut.slice'
import { setAlertParams } from '../../../../store/slices/alert.slice'

const StatutList = ({titleShow, detailView, familles}) => {
  const [selectedValue, setSelectedValue] = useState({uid: 0, name: '', label: ''})
  let famillesData = useAppSelector(getFamilles)
  let objectFamillesData = useAppSelector(getObjectFamilles)
  const dispatch = useAppDispatch()
  const selectedObject = useAppSelector(getSelectedObject)
  let icon = detailView === 'Detail' ? 'pi-eye' : 'pi-sliders-v'
  useEffect(() => {
    dispatch(fetchObjectFamilles())
  }, [])



  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      confirm: 'test',
      command: (e) => {
        dispatch(setSelectedFamille(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer famille?', 
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeFamille({currentFamille:e.item.data, type: selectedObject?.name}))
            },
          })
        )
        
      },
    },
    {
      label: `${detailView}`,
      icon: `pi ${icon} text-blue-500`,
      command: (e) => {
       dispatch(setSelectedFamille(e.item.data))
        dispatch(setShow(false))
      },
    },
  ]
  const colorTemplate = (rowData) => (
    <div
      style={{
        backgroundColor: `${rowData?.bgColor}`,
        color: 'white',
      }}
      className='badge'
    >
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </div>
  )

  const iconTemplate = (rowData) => <i class={`${rowData?.icon} text-2xl`}></i>

  const columns = [
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
    },
    // {
    //   header: 'Type',
    //   olang: 'Type',
    //   field: 'typeLabel',
    // },
    {
      header: 'Color',
      olang: 'Color',
      field: null,
      body: colorTemplate,
    },
    {
      header: 'Icon',
      olang: 'Icon',
      field: 'icon',
      body: iconTemplate,
    },
  ]

  const exportFields = [
    {label: 'Label', column: 'label'},
    // {label: 'Type', column: 'typeLabel'},
    {label: 'Color', column: 'color'},
    {label: 'Icon', column: 'icon'},
  ]

  const dropdownOptions = objectFamillesData.map((o) => ({
    label: o.label,
    code: o.name,
    value: o.uid,
  }))

  const handleChange = (e) => {
    const selectedOption = dropdownOptions.find((option) => option.value === e.value)
    dispatch(setSelectedObject({uid: e.value, name: selectedOption.code}))
  }

  const handleFetchFamilles = (selected) => {
    dispatch(fetchFamilles(selected?.name))
  }

  let create = () => {
    dispatch(setEditFamille(true))
    dispatch(setSelectedFamille(null))
  }

  return (
    <>
      <div style={{backgroundColor: '#53408C'}} className='header p-5 rounded'>
        <h1 className='text-white'>
          <OlangItem olang={'status.list'} /> 
        </h1>
      </div>
      <div className='card bg-gray-100 mt-5'>
        <p className='text-xl pt-3 pl-3'>
          <OlangItem olang={'object'} />
        </p>

        <div className='flex pl-3 pb-3'>
          <Dropdown
            placeholder='Select an object'
            className=' h-3rem w-3'
            value={selectedObject?.uid}
            options={dropdownOptions}
            optionLabel='label'
            onChange={(e) => handleChange(e)}
          />

          <ButtonComponent
            icon='pi pi-search'
            className='ml-3 h-3rem'
            onClick={() => handleFetchFamilles(selectedObject)}
          />
        </div>
      </div>
      <DatatableComponent
        tableId='familles-table'
        data={famillesData}
        columns={columns}
        exportFields={exportFields}
        onNew={selectedObject ? create : []}
        rowActions={actions}
      />
    </>
  )
}

export default memo(StatutList)
