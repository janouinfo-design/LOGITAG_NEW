import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setToastParams} from '../../../../store/slices/ui.slice'
import {
  fetchGateways,
  getGateways,
  removeGateway,
  setSelectedGateway,
  setGatewayView,
  fetchAllSites,
  deleteGateway,
} from '../../slice/gateway.slice'
import {useNavigate} from 'react-router-dom'

import {setAlertParams} from '../../../../store/slices/alert.slice'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Tag} from 'primereact/tag'
export const GatewayList = ({root}) => {
  const data = useSelector(getGateways)
  const dispatch = useDispatch()

  const toggleUsrActive = (id, value) => {
    return
    // let usrs = data.map( u => ({...u , active: u.id == id ? value : u.active}));
    // dispatch(setGateways(usrs))

    dispatch(
      setAlertParams({
        // type: "message",
        // action: "error",
        title: 'ATTENTION',
        message: `Voulez vous vraiment ${value ? 'activer' : 'desactiver'}  cet utilisateur ?`,
        visible: true,
      })
    )
  }


  let actions = [
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {
        dispatch(setSelectedGateway(e.item.data))
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimerce gateway?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(deleteGateway(+e.item.data?.id))
            },
          })
        )
      },
    },
  ]

  const typeBody = (data) => {
    return (
      <div className='flex align-items-center justify-cintent-center' style={{gap: 6}}>
        <span className='fa fa-signal-stream  text-lg text-blue-400'></span>
        <span>{data?.srcObject}</span>
      </div>
    )
  }

  const addressBody = (data) => {
    return (
      <div className='flex align-items-center justify-cintent-center' style={{gap: 6}}>
        <span className='fa fa-map-marker  text-xl text-gray-400'></span>
        <span className='text-blue-500'>{data?.address || 'Unknown'}</span>
      </div>
    )
  }
  const siteBody = (data) => {
    return (
      <div className='flex align-items-center justify-content-center' style={{gap: 6}}>
        {data?.locationLabel ? (
          <>
            <span className='fa fa-map text-xl text-blue-500'></span>
            <span className='text-800'>{data?.locationLabel}</span>
          </>
        ) : (
          <OlangItem olang={'No.site'} />
        )}
      </div>
    )
  }

  const statusBody = (data) => {
    return (
      <>
        {data?.idStatusGateway != null ? (
          <Tag
            style={{background: data?.statusBgColor, color: 'white'}}
            className='mr-2 text-base'
            icon={data?.statusIcon}
            value={data?.statusLabelGateway}
          ></Tag>
        ) : (
          <OlangItem olang={'No.status'} />
        )}
      </>
    )
  }

  const columns = [
    {field: 'code', header: 'Code', filter: true},
    {field: 'statusLabelGateway', header: 'Status', body: statusBody},
    {field: 'label', header: 'Identifiant', filter: true},
    {field: 'locationLabel', header: 'Site', body: siteBody, filter: true},
    {field: 'srcobject', header: 'Type', body: typeBody, filter: true},
    {field: 'address', header: 'Address', body: addressBody, filter: true},
  ]

  useEffect(() => {
    dispatch(fetchGateways())
    dispatch(fetchAllSites())
  }, [])

  return (
    <div>
      <DatatableComponent
        tableId='users-list'
        data={data}
        columns={columns}
        onNew={() => {
          dispatch(setSelectedGateway({}))
          // dispatch(setGatewayView('editor'))
          // navigate(root+'/edit')
        }}
        rowActions={actions}
      />
    </div>
  )
}
