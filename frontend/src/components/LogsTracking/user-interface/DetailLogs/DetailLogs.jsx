import React from 'react'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchGeoLogById,
  getEnginTagLogs,
  getListDetail,
  getShowDetail,
  setGeoLogById,
  setShowDetail,
} from '../../slice/logs.slice'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {Chip} from 'primereact/chip'
import {Dialog} from 'primereact/dialog'
import MapDetail from '../MapDetail/MapDetail'
import {Image} from 'primereact/image'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {TabPanel, TabView} from 'primereact/tabview'
import TagListLog from '../TagLogList/TagListLog'

const DetailLogs = () => {
  const visible = useAppSelector(getShowDetail)
  const list = useAppSelector(getEnginTagLogs)
  const info = useAppSelector(getListDetail)

  const dispatch = useAppDispatch()

  const onHide = () => {
    dispatch(setShowDetail(false))
    dispatch(setGeoLogById(null))
  }


  const addresseeTemplate = () => {
    return (
      <>
        {
          <div>
            {info[0]?.address ? (
              <Chip
                label={info[0]?.address}
                className='w-11rem m-1 flex justify-content-center align-items-center cursor-pointer'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }

  const getGeo = (id) => {
    if (!id) return
    dispatch(fetchGeoLogById({worksiteID: id}))
  }

  const worksiteTemplate = (rowData) => {
    const label = rowData?.locationObjectname ? rowData?.locationObjectname : 'No worksite found.'
    return (
      <Chip
        icon='pi pi-map'
        label={label}
        onClick={() => getGeo(rowData?.locationID)}
        className='w-11rem m-1 font-semibold text-lg flex justify-content-center align-items-center cursor-pointer'
      />
    )
  }

  const imageTemplate = (rowData) => {
    return (
      <Image
        src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
        width='80'
        height='80'
        preview
        imageStyle={{objectFit: 'contain', borderRadius: '10px'}}
      />
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
      <i
        style={{color: `${rowData?.etatbgColor}`}}
        className={`${rowData?.etatIconName} text-2xl p-2`}
      ></i>
    )
  }

  const columns = [
    {
      header: 'Image',
      olang: 'Image',
      body: imageTemplate,
    },
    {
      header: 'reference',
      field: 'reference',
      olang: 'reference',
      filter: true,
    },
    {
      header: 'Etat',
      field: 'etatenginname',
      olang: 'Etat',
      body: iconTemplate,
    },
    {
      header: 'Status',
      olang: 'status',
      field: 'statuslabel',
      body: statusTemplate,
    },
    {
      header: 'Address',
      olang: 'Address',
      body: addresseeTemplate,
    },
    {
      header: 'Worksite',
      olang: 'Worksite',
      body: worksiteTemplate,
    },
  ]

  const lat = info[0]?.lat
  const lng = info[0]?.lng


  return (
    <Dialog
      header={'Detail Logs'}
      visible={visible}
      style={{
        width: '78vw',
        '@media screen and (max-width: 960px)': {width: '75vw'},
        '@media screen and (max-width: 641px)': {width: '100vw', padding: '50px'},
        '@media screen and (max-width: 320px)': {width: '100vw', padding: '50px'},
      }}
      onHide={onHide}
      position='right'
    >
      <div className='flex w-full flex-1 flex-row justify-content-between'>
        <div className='w-full'>
          <TabView>
            <TabPanel
              disabled={list?.length == 0}
              header='Engin Scan'
              leftIcon='fas fa-duotone fa-truck mr-2 text-lg'
            >
              <DatatableComponent
                tableId='Log-table'
                data={list}
                columns={columns}
              />
            </TabPanel>
            <TabPanel header='Tag Scan' leftIcon='fas fa-solid fa-tags mr-2 text-lg'>
              <TagListLog />
            </TabPanel>
          </TabView>
        </div>
        <MapDetail center={{lat: lat, lng: lng}} width='30%' height='70vh' />
      </div>
    </Dialog>
  )
}

export default DetailLogs
