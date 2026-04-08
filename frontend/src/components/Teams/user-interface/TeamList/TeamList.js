import {memo, useEffect} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import {Image} from 'primereact/image'

import {Chip} from 'primereact/chip'
import {
  fetchStaffTag,
  fetchTeams,
  getTeams,
  removeTeam,
  setEditTeam,
  setSelectedTeam,
  setSelectedTeamV,
  setSelectedUser,
  setShow,
} from '../../slice/team.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {SplitButton} from 'primereact/splitbutton'
import {useState} from 'react'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import UserEdit from './UserEdit'
import {Panel} from 'primereact/panel'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {fetchValidator} from '../../../Inventory/slice/inventory.slice'
import { Button } from 'primereact/button'

const TeamList = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [showTag, setShowTag] = useState([])

  const teams = useAppSelector(getTeams)

  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        // toast.current.show({severity: 'success', summary: "success", detail: "Supprimer avec success!!!"})
        dispatch(fetchStaffTag({id: e.item.data.id})).then(() => {
          dispatch(fetchValidator('staff'))
          dispatch(setSelectedTeamV(e.item.data))
          dispatch(setShow(false))
        })
      },
    },
    {
      label: `Utilisateur`,
      icon: 'pi pi-user text-blue-500',
      command: (e) => {
        dispatch(setSelectedTeamV(e.item.data))
        setDialogVisible(true)
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedTeamV(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimercet équipe?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeTeam(e.item.data))
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

  const imageTemplate = (rowData) => (
    <img
      src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
      alt='EngineImage'
      className='image-preview rounded'
      style={{width: '60px', height: '60px', objectFit: 'cover'}}
    />
  )
  const actionTemplate = (rowData) => {
    actions = actions.map((_i) => ({..._i, data: rowData}))
    return (
      <div>
        <SplitButton
          model={actions}
          className='p-button-help p-button-raised  p-button-outlined p-button-sm bg-white'
        />
      </div>
    )
  }

  const showTagById = (rowData) => {
    if (showTag?.includes(rowData?.id)) {
      let update = showTag?.filter((x) => x != rowData?.id)
      setShowTag(update)
      return
    }
    setShowTag([...showTag, rowData?.id])
  }

  const familleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.tagFamille}
        title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        icon={rowData.tagFamilleIcon}
        style={{background: rowData.tagFamilleBgColor, color: 'white'}}
        className='cursor-pointer'
        onClick={() => showTagById(rowData)}
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
        {showTag.includes(rowData?.id) ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Chip
              label={
                rowData?.tagName === null ||
                rowData?.tagName === '' ||
                rowData?.tagName == undefined
                  ? rowData?.tagName
                  : rowData?.tagName
              }
              className='m-2'
              style={{background: rowData?.familleTagIconBgcolor || '#D64B70', color: 'white'}}
            />
          </div>
        ) : null}
      </div>
    )
  }

  const chiftTemplate = (rowData) => {
    return (
      <div className='flex flex-row gap-2 items-center'>
        <div className='flex flex-row justify-content-between'>
          <p className='text-sm'>
            <span className='font-bold'>From: </span> 
            <strong className='text-base'>07:00</strong>
          </p>
          <p className='text-sm'>
            <span className='font-bold'>To: </span> 
            <strong className='text-base'>16:00</strong>
          </p>
        </div>
        <div className='flex justify-content-end'>
          <Button
            size='small'
            label='Edit'
            icon='pi pi-pencil'
            className='p-button-rounded p-button-secondary p-button-sm'
            // onClick={() => editTime(rowData)}
          />
        </div>
      </div>
    )
  }

  const editTime = (rowData) => {
  }
  
  // const emptyColumn = (rowData) =>
  // rowData?.exitday == null ? <p className='pi pi-minus ml-4'></p> : rowData?.exitday
  const columns = [
    {
      header: 'Photo',
      field: 'image',
      olang: 'Photo',
      body: imageTemplate,
      width: '10rem'
    },
    {
      header: 'Nom employé',
      field: 'lastname',
      olang: 'Nom.employe',
      filter: true,
      width: '10rem'
    },
    {
      header: 'Login',
      field: 'login',
      olang: 'Login',
      filter: true,
      width: '10rem'
    },
    // {
    //   header: 'Prénom',
    //   field: 'firstname',
    //   olang: 'Prenom',
    //   filter: true,
    // },
    {
      header: 'Tag',
      field: 'tagName',
      olang: 'Tag',
      body: tagTemplate,
      width: '10rem'
    },
    // {
    //   header: 'shifts',
    //   field: 'shifts',
    //   olang: 'shifts',
    //   body: chiftTemplate,
    //   width: '20rem'
    // },
    
    {
      header: 'Function',
      field: 'famille',
      olang: 'Function',
      filter: true,
      width: '10rem'
    },
    {
      header: 'hireday',
      olang: 'hireday',
      field: 'hireday',
      filter: true,
      width: '10rem'
    },
    {
      header: 'exitday',
      olang: 'exitday',
      field: 'exitday',
      filter: true,
      width: '10rem'
    },
    {
      header: 'Status',
      olang: 'status',
      field: 'active',
      body: activeTemplate,
      width: '10rem'
    },
  ]

  const exportFields = [
    {label: 'Nom employé', column: 'lastname'},
    // {label: 'Prénom', column: 'firstname'},
    {label: 'Function', column: 'famille'},
    {label: 'hireday', column: 'hireday'},
    {label: 'exitday', column: 'exitday'},
  ]

  const allowedGroupFields = ['famille']

  const rowGroupTemplates = {
    famille: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.famille} />
    ),
  }

  let create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('staff'))
      .then(() => {
        dispatch(setEditTeam(true))
        dispatch(setSelectedTeamV(null))
      })
      .finally(() => setIsLoadingButton(false))
  }

  useEffect(() => {
    dispatch(fetchTeams())
  }, [])

  return (
    <div className="lt-page" data-testid="users-page">
      <div className="lt-page-header" data-testid="users-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #6366F1, #4F46E5)'}}>
            <i className="pi pi-users"></i>
          </div>
          <div>
            <h1 className="lt-page-title"><OlangItem olang={'staff.list'} /></h1>
            <p className="lt-page-subtitle">Gestion du personnel et des accès</p>
          </div>
        </div>
        <div className="lt-page-header-right">
          {teams?.length > 0 && (
            <div className="lt-count-badge" data-testid="users-count">
              <i className="pi pi-users" style={{fontSize: '0.75rem'}}></i>
              <strong>{teams.length}</strong> utilisateurs
            </div>
          )}
        </div>
      </div>
      <DatatableComponent
        tableId='team-table'
        data={teams}
        columns={columns}
        exportFields={exportFields}
        onNew={create}
        rowGroupTemplates={rowGroupTemplates}
        allowedGroupFields={allowedGroupFields}
        contextMenuModel={actions}
        rowActions={actions}
        isLoading={isLoadingButton}
      />
      <UserEdit
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
      />
    </div>
  )
}

export default TeamList
