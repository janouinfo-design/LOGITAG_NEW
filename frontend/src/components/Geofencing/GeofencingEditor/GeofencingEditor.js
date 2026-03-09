import React, { useEffect, useState } from 'react'
import { MultiSelect , Button  , InputText ,InputTextarea , Chips} from 'primereact'
import { setEditionInfos } from '../../../store/slices/geofencing.slice'
import { useAppDispatch } from '../../../hooks'
function GeofencingEditor(props) {
  const [inputs , setInputs] = useState(props.inputs || {})
  const dispatch = useAppDispatch()
  const onChange = (e)=> {
     setInputs(prev => ({...prev , [e.target.name]: e.target.value}))
  }

  const save = ()=> {
      if(typeof props.onSave == 'function') {
         let obj = {...inputs}
         if(!Array.isArray(obj.tags)) obj.tags = [];
         
         if(Array.isArray(obj.tags)) obj.tags = obj.tags.map( o => typeof o == 'string' ? o : o.label)
         props.onSave(obj) 
      }

      setInputs({})

        
  }
  const cancel = ()=> {
    if(typeof props.onSave == 'function') 
        props.onCancel(inputs) 

    setInputs({})
  }
  useEffect(()=> {
    let obj = {...(inputs || {})}
    if(!Array.isArray(obj.tags)) obj.tags = [];
    
    if(Array.isArray(obj.tags)) obj.tags = obj.tags.map( o => typeof o == 'string' ? o : o.label)
    dispatch(setEditionInfos(obj))
  }, [inputs])
  return (
    <div className=''>
        <div className='form-group'>
          <label className='form-label'>Label</label>
          <InputText value={inputs.label} name="label" onChange={onChange}  className='form-control' />
        </div>
        <div className='form-group my-2'>
          <label className='form-label'>Description</label>
          <InputTextarea value={inputs.description} name="description" onChange={onChange}  className='form-control'></InputTextarea>
        </div>
        <div>
          <label>Tags</label>
          <Chips name="tags" separator=',' itemTemplate={(r)=> <strong>{'#'+r}</strong>} value={inputs.tags} onChange={onChange} className="w-full"/>
          {/* <MultiSelect display="chip" value={inputs.tags} onChange={onChange} name="tags" 
          options={[{label: "livraison"}, {label: 'interdit'} , {label: 'entrepot'}]}  
          multiple className="w-full" /> */}
        </div>
        <div className='flex gap-2 mt-3'>
          <Button onClick={save} label="Enregistrer"   />
          <Button onClick={cancel} label="Annuler" severity="danger"  />
        </div>
    </div>
  )
}

export default GeofencingEditor
