import { Dropdown } from "primereact/dropdown"
import { useAppDispatch, useAppSelector } from "../../../../hooks"
import { fetchUserPointAttachement, getUserAttachements, getUserCurrentAttachement, setCurrentAttachement } from "../../slice/user.slice"
import { useEffect, useState } from "react"
import ButtonComponent from "../../../shared/ButtonComponent/ButtonComponent"
import { useLocation, useNavigate } from "react-router-dom"
import { fetchProviders } from "../../../../store/slices/provider.slice"
import configs from "../../../../configs"

export const AttachmentComponent = ()=> {
   const list =  useAppSelector(getUserAttachements)
   const attachement = useAppSelector(getUserCurrentAttachement)
   const dispatch = useAppDispatch()
   const navigate = useNavigate()
   const location = useLocation()

   
   const onAttachementSelected = (e)=> {
      dispatch(setCurrentAttachement(e.value))
   }

   const next = ()=> {
      let nextPage = location.state?.next || configs.defaultRoot
      if(nextPage == '/next-page')  nextPage = configs.defaultRoot
      localStorage.setItem('next-page',nextPage)
      setTimeout(()=> navigate(nextPage) , 300)
   }

   useEffect(()=> {
     dispatch(fetchUserPointAttachement())
     dispatch(fetchProviders())
   }, [])

   useEffect(()=> {
      if(list?.length == 1) {
         dispatch(setCurrentAttachement(list[0]))
         setTimeout(()=> {
          next();
         }, 500)
      }else if(list?.length > 0 && localStorage.getItem('attachement')){
         dispatch(setCurrentAttachement(list?.find( r => r.id == localStorage.getItem('attachement'))))
      }
   }, [list])

   return (
    <div className="flex align-items-center justify-content-center" style={{width: '100vw', height: '100vh'}}>
        <div className="shadow-2 w-11 md:w-8 lg:w-3 px-4 py-8">
           <h3>Points de ratachement</h3>
           <Dropdown className="w-full" filter value={attachement?.length == 0 ? [{label: 'Ain sebaa' , id: '1'}] : attachement} options={list} onChange={onAttachementSelected}/>
           <div className="mt-3 text-right">
              <ButtonComponent onClick={next} disabled={!attachement} full label="Continuer" className="w-12" style={{width: '100%'}}/>
           </div>
        </div>
    </div>
   )
}