import {memo, useEffect, useMemo, useState} from 'react'
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
} from '../../slice/famille.slice'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {fetchValidator} from '../../../Inventory/slice/inventory.slice'
import {Button} from 'primereact/button'

const FamilleList = ({titleShow, detailView, familles}) => {
  const [selectedValue, setSelectedValue] = useState({uid: 0, name: '', label: ''})
  const [loading, setLoading] = useState(false)
  const famillesData = useAppSelector(getFamilles)
  const objectFamillesData = useAppSelector(getObjectFamilles)
  const dispatch = useAppDispatch()
  const selectedObject = useAppSelector(getSelectedObject)
  let icon = detailView === 'Detail' ? 'pi-eye' : 'pi-sliders-v'
  let [isFetching, setIsFetching] = useState(false)


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
              dispatch(removeFamille({currentFamille: e.item.data, type: selectedObject?.name}))
            },
          })
        )
      },
    },
    {
      label: `${detailView}`,
      icon: `pi ${icon} text-blue-500`,
      command: (e) => {
        dispatch(fetchValidator('famille'))
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
    typesId: o.typesId,
    icon: o.icon,
  }))

  const handleChange = (e) => {
    const selectedOption = dropdownOptions.find((option) => option.value === e.value)
    let obj = {uid: e.value, name: selectedOption.code, typeId: selectedOption.typesId}
    dispatch(setSelectedObject(obj))
    handleFetchFamilles(obj)
  }

  const handleFetchFamilles = (selected) => {
    setLoading(true)
    let selectedObject = {
      uid: selected.value,
      name: selected.code,
      typeId: selected.typesId,
    }
    dispatch(setSelectedObject(selectedObject))
    dispatch(fetchFamilles({src: selected.code})).then((res) => {
      setLoading(false)
    })
  }

  let create = () => {
    dispatch(fetchValidator('famille')).then(() => {
      dispatch(setEditFamille(true))
      dispatch(setSelectedFamille(null))
    })
  }

    useEffect(() => {
    dispatch(fetchObjectFamilles())
  }, [])

  return (
    <>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'famille.list'} />
        </h1>
      </div>
      <div className='card shadow-2 bg-gray-50 mt-2 p-2 mb-3'>
        <p className='text-xl pt-3 pl-3'>
          <OlangItem olang={'object'} />
        </p>

        {/* <div className='flex pl-3 pb-3'>
          <Dropdown
            placeholder='Select an object'
            className='h-3rem xl:w-3 lg:w-3 md:w-3 sm:w-full'
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
        </div> */}

        <div className='flex gap-3 ml-3 w-full flex-row my-3'>
          {Array.isArray(dropdownOptions) &&
            dropdownOptions?.map((o) => (
              <Button
                key={o.value}
                outlined
                loading={o.value === selectedObject?.uid && loading}
                disabled={o.value === selectedObject?.uid || loading}
                icon={'fa fa-sharp-duotone fa-solid' + o.icon}
                severity={o.value === selectedObject?.uid ? 'success' : 'secondary'}
                className={`flex align-items-center w-10rem text-lg font-bold gap-2 `}
                onClick={() => handleFetchFamilles(o)}
              >
                {o.label}
              </Button>
            ))}
        </div>
      </div>
      <DatatableComponent
        tableId='familles-table'
        data={selectedObject ? famillesData : []}
        columns={columns}
        exportFields={exportFields}
        onNew={selectedObject ? create : []}
        rowActions={actions}
      />
    </>
  )
}

export default memo(FamilleList)
