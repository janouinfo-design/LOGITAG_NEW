import {memo, useEffect, useMemo, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import {Chip} from 'primereact/chip'
import {
  fetchObject,
  fetchStatus,
  getObject,
  getSelectedObject,
  getStatus,
  setEditStatus,
  setSelectedObject,
  setSelectedStatus,
  setShow,
} from '../../slice/status.slice'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Button} from 'primereact/button'

const StatusList = ({titleShow, detailView, statuss}) => {
  const [selectedValue, setSelectedValue] = useState({uid: 0, name: '', label: ''})
  const [loading, setLoading] = useState(false)

  let statusData = useAppSelector(getStatus)
  let objectData = useAppSelector(getObject)
  const dispatch = useAppDispatch()
  const selectedObject = useAppSelector(getSelectedObject)
  let [isFetching, setIsFetching] = useState(false)

  let icon = detailView === 'Detail' ? 'pi-eye' : 'pi-sliders-v'

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      confirm: 'test',
      command: (e) => {
        dispatch(setSelectedStatus(e.item.data))
        //dispatch(removeTag(e.item.data))
      },
    },
    {
      label: `${detailView}`,
      icon: `pi ${icon} text-blue-500`,
      command: (e) => {
        if (detailView === 'Detail' || !detailView) {
          dispatch(setSelectedStatus(e.item.data))
          dispatch(setShow(false))
        } else if (detailView === 'Edit') {
          dispatch(setSelectedStatus(e.item.data))
          dispatch(setEditStatus(true))
        }
      },
    },
  ]
  const colorTemplate = (rowData) => (
    <div
      style={{
        backgroundColor: `${rowData?.backgroundColor}`,
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
    {label: 'Color', column: 'color'},
    {label: 'Icon', column: 'icon'},
  ]

  const dropdownOptions = objectData.map((o) => ({
    label: o.label,
    code: o.name,
    value: o.uid,
    icon: o.icon,
  }))

  const handleChange = (e) => {
    const selectedOption = dropdownOptions.find((option) => option.value === e.value)
    dispatch(setSelectedObject({uid: e.value, name: selectedOption.code}))
  }

  const handleFetchStatus = (selected) => {
    setLoading(true)
    let selectedObject = {
      uid: selected.value,
      name: selected.code,
    }
    dispatch(setSelectedObject(selectedObject))
    dispatch(fetchStatus(selectedObject)).then((res) => {
      setLoading(false)
    })
  }

  let create = () => {
    dispatch(setEditStatus(true))
    dispatch(setSelectedStatus(null))
  }

  useEffect(() => {
    dispatch(fetchStatus())
    dispatch(fetchObject())
  }, [])


  return (
    <>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'status.list'} />
        </h1>
      </div>
      <div className='card shadow-2 p-2 bg-gray-100 mt-2 mb-3'>
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
            onClick={() => handleFetchStatus(selectedObject)}
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
                className={`flex align-items-center w-8rem text-lg font-bold gap-2 `}
                onClick={() => handleFetchStatus(o)}
              >
                {o.label}
              </Button>
            ))}
        </div>
      </div>
      <DatatableComponent
        tableId='status-table'
        data={selectedObject ? statusData : []}
        rowActions={actions}
        columns={columns}
        exportFields={exportFields}
      />
    </>
  )
}

export default StatusList
