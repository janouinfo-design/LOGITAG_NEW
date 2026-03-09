import {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  activateEngin,
  activateObject,
  deleteEngin,
  fetchInactiveEngin,
  fetchObjectsNonActive,
  getInactiveEngin,
  getObjectsNoActive,
} from '../slice/engin.slice'
import {Chip} from 'primereact/chip'
import {Image} from 'primereact/image'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {setAlertParams} from '../../../store/slices/alert.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const EnginInactive = () => {
  const enginList = useAppSelector(getInactiveEngin)
  const objectNoActive = useAppSelector(getObjectsNoActive)

  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        try {
          dispatch(
            setAlertParams({
              title: 'Supprimer',
              message: 'Voulez-vous really supprimerce cette object?',
              acceptClassName: 'p-button-danger',
              visible: true,
              accept: () => {
                dispatch(deleteEngin({srcId: e.item.data.id, srcObject: e.item.data.tableName}))
              },
            })
          )
        } catch (error) {
        }
      },
    },
    {
      label: 'Activate',
      icon: 'pi pi-replay text-blue-500',
      command: (e) => {
        try {
          dispatch(
            setAlertParams({
              title: 'Activate',
              message: 'Voulez-vous really active cette object?',
              acceptClassName: 'p-button-success',
              visible: true,
              accept: () => {
                dispatch(activateObject({srcId: e.item.data.id, srcObject: e.item.data.tableName}))
              },
            })
          )
        } catch (error) {
        }
      },
    },
  ]

  const imageTemplate = (rowData) => (
    <>
      <Image
        src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
        alt='EngineImage'
        width='60'
        height='60'
        preview
        imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
      />
    </>
  )

  const addresseeTemplate = ({enginAddress}) => {
    return (
      <>
        {
          <div>
            {enginAddress ? (
              <Chip
                label={enginAddress}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }

  const statusTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.statuslabel}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.statuslabel}
        style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}}
        title={`${rowData?.statusDate}`}
      />
    )
  }
  const iconTemplate = (rowData) => {
    return (
      <div>
        <i
          style={{color: `${rowData.etatbgColor}`}}
          className={`fas ${rowData?.etatIconName} text-2xl rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin} ${rowData?.locationDate}`}
          alt={`${rowData?.etatengin} ${rowData?.locationDate}`}
        ></i>
      </div>
    )
  }
  const familleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.familleTag}
        title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        icon={rowData.familleIconTag}
        style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
        className='cursor-pointer'
      />
    )
  }
  const tagTemplate = (rowData) => {
    return (
      <div className='flex flex-column'>
        <div className='flex justify-content-center'>
          {rowData.tagId ? (
            familleTagTemplate(rowData)
          ) : (
            <Chip label='Untagged' className='cursor-pointer' />
          )}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Chip
            label={
              rowData?.labeltag === null ||
              rowData?.labeltag === '' ||
              rowData?.labeltag == undefined
                ? rowData?.tagname
                : rowData?.labeltag
            }
            className='m-2'
            style={{background: '#D64B70', color: 'white'}}
          />
        </div>
      </div>
    )
  }
  const BatteryStatus = ({batteries, locationDate}) => {
    let batteryIcon
    let textColor
    let alt
    if (batteries === '' || batteries === null || batteries === undefined) {
      batteryIcon = 'fas fa-battery-empty'
      textColor = 'text-700'
      alt = 'No data'
    } else {
      const batteryValue = parseInt(batteries, 10)
      alt = locationDate ?? 'No date'
      if (batteryValue >= 80) {
        batteryIcon = 'fas fa-battery-full'
        textColor = 'text-success'
      } else if (batteryValue >= 50) {
        batteryIcon = 'fas fa-battery-three-quarters'
        textColor = 'text-success'
      } else if (batteryValue >= 20) {
        batteryIcon = 'fas fa-battery-half'
        textColor = 'text-warning'
      } else if (batteryValue > 0) {
        batteryIcon = 'fas fa-battery-quarter'
        textColor = 'text-danger'
      } else {
        batteryIcon = 'fas fa-battery-empty'
        textColor = 'text-danger'
      }
    }

    return (
      <div className='flex items-center justify-center'>
        <div className='p-4 rounded-lg text-center'>
          <i title={alt} alt={alt} className={`text-4xl ${batteryIcon} ${textColor}`}></i>
          <span className={`block mt-2 font-bold text-lg ${textColor}`}>
            {batteries > 100 ? '100%' : batteries + '%'}
          </span>
        </div>
      </div>
    )
  }
  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <Chip
        label={famille}
        icon={familleIcon}
        style={{background: familleBgcolor, color: 'white'}}
      />
    )
  }

  const columns = [
    {
      header: 'Name',
      field: 'name',
      olang: 'Name',
      filter: true,
    },
    {
      header: 'Src',
      field: 'tableName',
      olang: 'Src',
    },
  ]

  useEffect(() => {
    dispatch(fetchObjectsNonActive())
    // dispatch(fetchInactiveEngin())
  }, [])

  return (
    <div>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'EnginInactive'} />
        </h1>
      </div>
      <DatatableComponent
        tableId='objectInactive-table'
        data={objectNoActive}
        columns={columns}
        // rowGroupTemplates={rowGroupTemplates}
        // allowedGroupFields={allowedGroupFields}
        rowActions={actions}
        sortField={'id'}
        sortOrder={-1}
        // isLoading={isLoadingButton}
      />
    </div>
  )
}

export default EnginInactive
