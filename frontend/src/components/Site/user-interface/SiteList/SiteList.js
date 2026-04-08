import {memo, useEffect, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import {SplitButton} from 'primereact/splitbutton'
import {Image} from 'primereact/image'
import {Chip} from 'primereact/chip'

import {
  fetchGeoForSite,
  fetchSites,
  getSites,
  removeSite,
  setDetailSite,
  setEditSite,
  setSelectedSite,
} from '../../slice/site.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  getSelectedCustomer,
  getSelectedSiteClient,
  setDetailSiteClient,
  setSelectedCustomer,
  setSelectedSiteClient,
} from '../../../../store/slices/customer.slice'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {fetchAddresses} from '../../slice/addressSite.slice'
import {fetchValidator} from '../../../Inventory/slice/inventory.slice'

const SiteList = ({client, filter, showEdit, detailView = 'Detail'}) => {
  let sites = useAppSelector(getSites)
  const [sitesById, setSitesById] = useState()

  const selectedClientId = useAppSelector(getSelectedCustomer)

  const sitesClient = useAppSelector(getSelectedSiteClient)

  const dispatch = useAppDispatch()

  let actions = [
    {
      label: `${detailView}`,
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        if (detailView == 'Detail' || !detailView) {
          dispatch(fetchValidator('worksite'))
          if (client) {
            dispatch(fetchAddresses(e.item.data.id))
            dispatch(setSelectedSite(e.item.data))
            dispatch(setDetailSiteClient(true))
            dispatch(fetchGeoForSite(e.item.data.id))
          } else {
            dispatch(setDetailSite(false))
            dispatch(setSelectedSite(e.item.data))
          }
        } else if (detailView == 'Edit') {
          dispatch(setSelectedSite(e.item.data))
          dispatch(setEditSite(true))
        }
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedSite(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer ce chantier?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeSite(e.item.data))
            },
          })
        )
      },
    },
  ]

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      className={'text-white ' + (rowData?.active == 1 ? 'bg-green-500' : 'bg-red-500')}
    />
  )

  const columns = [
    // {
    //   header: 'Image',
    //   body: imageTemplate,
    // },
    {
      header: 'Name',
      field: 'name',
      olang: 'name',
      filter: true,
    },
    {
      header: 'Label',
      field: 'label',
      olang: 'label',
      filter: true,
    },

    {header: 'ACTIF', olang: 'actif', body: activeTemplate},
  ]

  const exportFields = [
    {label: 'Client', column: 'customerName'},
    {label: 'Name', column: 'name'},
    {label: 'Label', column: 'label'},
  ]

  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.code} />,
  }

  let create = () => {
    dispatch(setEditSite(true))
    dispatch(setSelectedSite(null))
  }
  useEffect(() => {
    dispatch(fetchSites(+selectedClientId?.id))
  }, [])

  const applyFilter = () => {
    if (!selectedClientId) {
      setSitesById(sites)
    } else if (selectedClientId != null) {
      const filterSite = sites?.filter((st) => +st?.customerID === +selectedClientId?.id)
      setSitesById(filterSite)
    }
  }

  useEffect(() => {
    if (filter) {
      applyFilter()
    } else {
      setSitesById(sites)
    }
  }, [selectedClientId, sites])

  return (
    <div className='lt-page' data-testid="places-page">
      <div className='lt-page-header'>
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #14B8A6, #0D9488)'}}>
            <i className='pi pi-building'></i>
          </div>
          <div>
            <h1 className='lt-page-title'>Sites / Places</h1>
            <p className='lt-page-subtitle'>Gestion des chantiers et emplacements</p>
          </div>
        </div>
        <div className='lt-page-header-right'>
          {sitesClient?.length > 0 && (
            <div className='lt-count-badge' data-testid="places-count">
              <i className='pi pi-building' style={{fontSize: '0.75rem'}}></i>
              <strong>{sitesClient.length}</strong> sites
            </div>
          )}
        </div>
      </div>
      {sitesClient?.length == 0 && client ? (
        <div className='lt-table-wrap' style={{padding: 40, textAlign: 'center'}}>
          <i className='pi pi-inbox' style={{fontSize: '2rem', color: 'var(--lt-text-muted)', marginBottom: 8}}></i>
          <div style={{fontWeight: 700, color: 'var(--lt-text-muted)', fontFamily: 'var(--lt-font)'}}>
            <OlangItem olang="This customer doesn't have a worksite." />
          </div>
        </div>
      ) : (
        <DatatableComponent
          tableId='site-table'
          data={sitesClient}
          columns={columns}
          exportFields={exportFields}
          rowGroupTemplates={rowGroupTemplates}
          rowActions={actions}
        />
      )}
    </div>
  )
}

export default memo(SiteList)
