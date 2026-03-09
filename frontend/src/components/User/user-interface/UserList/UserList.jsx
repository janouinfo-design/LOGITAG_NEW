import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setToastParams } from '../../../../store/slices/ui.slice'
import { fetchUsers, getUsers, removeUser, setSelectedUser, setUserView } from '../../slice/user.slice'
import { useNavigate } from 'react-router-dom'
import ImageViewerComponent from '../../../../components/Shared/ImageViewerComponent/ImageViewerComponent'
import { InputSwitch } from 'primereact/inputswitch'
import { setAlertParams } from '../../../../store/slices/alert.slice'
import { DataTableComponent } from '@dodjidev/reactcomponents'
export const UserList = ({root}) => {
  const data = useSelector(getUsers)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleUsrActive = (id , value)=>{
    return
    // let usrs = data.map( u => ({...u , active: u.id == id ? value : u.active}));
    // dispatch(setUsers(usrs))

    dispatch(setAlertParams({ 
      // type: "message", 
      // action: "error", 
      title: 'ATTENTION',
      message: `Voulez vous vraiment ${value ? 'activer' : 'desactiver'}  cet utilisateur ?`, 
      visible: true 
    }))
  }

  let actions = [
    {
      label: "Supprimer",
      icon: "pi pi-trash text-red-500",
      command: (e) => {
        dispatch(removeUser({ id: e.item.data.id })).then(res => {
          if (!res.payload.success)
            dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
          else
            dispatch(setToastParams({ show: true, severity: 'success', detail: "Supprimé avec succès !!!" }))
        })

      }
    },
    {
      label: "Modifier",
      icon: "pi pi-bookmark-fill text-blue-500",
      command: (e) => {
        // toast.current.show({severity: 'success', summary: "success", detail: "Supprimer avec success!!!"})
        dispatch(setSelectedUser(e.item.data))
        navigate(root+'/edit')
      }
    }

  ]


  const colors = [
    "blue",
    "indigo",
    "cyan",
    "purple",
    "gray",
    "pink",
    "teal",
  ]

  const getRandomColor = () => {
    let random = Math.floor(Math.random() * 6);
    return colors[random]
  }

  const profileTemplate = (rowData) => {
    const color = getRandomColor()
    const photo = rowData.photo  || rowData.image
    return <div className="flex gap-3 align-items-center">
      {
         photo  ?
          <ImageViewerComponent
            src={photo} style={{ width: '70px', height: '70px' }} /> :
          <div className={`
                            flex text-lg align-items-center 
                            justify-content-center font-semibold 
                            bg-${color}-100  text-${color}-600
                            border-round-sm`}
            style={{ width: '70px', height: '70px' }}>
            {(rowData.pseudo)}
          </div>
      }
      {/* <ImgContainer src={rowData.photo || UserIcon} circle style={{ width: '50px', height: '50px' }} />
      */}
      <div>
        <strong className="block">{rowData.fname} {rowData.sname} </strong>
        <span className="text-sm text-gray-500">{rowData.login}</span>
      </div>
    </div>
  }

  const rolesTemplate = (rowData) => {
    return <div className='flex gap-2 flex-wrap' style={{ maxWidth: '500px' }}>
      {(rowData.Roles || []).map((_i, index) => (
        <span key={index} className={`p-1 border-round-sm bg-purple-100 text-purple-600 m-2`}>{_i.label}</span>
      ))}
    </div>
  }

  const emailTemplate = (rowData)=>(
    <div className='gap-2 flex align-items-center'>
       <span className='pi pi-envelope text-blue-300'></span>
       <span>{rowData?.email}</span>
    </div>
  )

  const roleTemplate = (rowData)=>(
    <div className='gap-2 flex align-items-center'>
       <span className={`pi pi-${rowData?.role == 'admin' ? 'user-plus' : 'user'} text-blue-300`}></span>
       <span>{rowData?.role}</span>
    </div>
  )

  const activeTemplate = (rowData)=>(
    <div className='gap-2 flex align-items-center'>
      <InputSwitch 
          checked={rowData?.active == 1}
          onChange={ e => toggleUsrActive(rowData.id , !(rowData?.active == 1))}
          pt={{
            slider: ({props})=>({
              className: props.checked ? 'bg-green-300' : 'bg-gray-300'
            })
          }}/>
    </div>
  )

  const columns = [
    { field: 'fname', 'header': 'Profile', body: profileTemplate, filter: true },
    { field: 'email', 'header': 'Email', body: emailTemplate ,filter: true },
    { field: 'role', 'header': 'Roles', body: roleTemplate, filter: true },
    { field: 'active', 'header': 'Actif', body: activeTemplate, filter: true },
  ]

  useEffect(() => {
    dispatch(fetchUsers())
  }, [])

  return (
    <div>
      <DataTableComponent 
        tableId='users-list' 
        data={data} 
        columns={columns} 
        onNew={()=> {
          dispatch(setSelectedUser(null))
          dispatch(setUserView('editor'))
          navigate(root+'/edit')
        }}
        rowActions={actions}/>
    </div>
  )
}
