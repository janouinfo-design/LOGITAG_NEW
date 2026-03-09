import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { getSelectedAlert, saveAlert, setEditAlert, setSelectedAlert } from '../../slice/slice'
import { Dropdown } from 'primereact/dropdown'
import { InputTextarea } from 'primereact/inputtextarea'
import { MultiSelect } from 'primereact/multiselect'
import { fetchTags, getTags } from '../../../Tag/slice/tag.slice'
import { fetchStaffList, getStaffList } from '../../../LogsTracking/slice/logs.slice'
import { setIn } from 'formik'
import { Chip } from 'primereact/chip'
import { fetchSitesClient, getSelectedSiteClient } from '../../../../store/slices/customer.slice'

let types = [
  {label: 'Warning', value: 'warning'},
  {label: 'Information', value: 'info'},
  {label: 'Erreur', value: 'error'},
]

let operators = [
  {label: 'Et', value: '&&'},
  {label: 'Ou', value: '||'}
]

let entity_types = [
  {label: 'Tag', value: 'tag'},
  {label: 'zone', value: 'area'},
]

let sensor_types = [
  {label: 'Temperature', value: 'temperature'},
  {label: 'Humidité', value: 'humidity'},
  {label: 'Porte', value: 'dor'},
]


function AlertEditor() {
  const [inputs , setInputs] = useState({})
  const tags = useAppSelector(getTags)
  const staff = useAppSelector(getStaffList)
  const selected_alert = useAppSelector(getSelectedAlert)
  let dispatch = useAppDispatch()

  let [ conditionInputs , setConditionsInputs] = useState({})
  const [isConditionError , setIsConditionError] = useState(false)
  const worksites = useAppSelector(getSelectedSiteClient)
  
  let back = () => {
    dispatch(setSelectedAlert(null))
    dispatch(setEditAlert(false))
  }

  const onInputChanged = (e)=>{
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  }

  const onConditionChanged = (e)=>{
    const { name, value } = e.target;
    if(name == 'condition' && !/^(<|>|=|>=|<=)\d+$/.test(value)){
      setIsConditionError(true)
    }else{
      setIsConditionError(false)
    }
    setConditionsInputs(prev => ({ ...prev, [name]: value }));
  }

  const addCondition = ()=>{
    if(conditionInputs?.condition && conditionInputs?.sensor){
      let dt = {...conditionInputs , operator: conditionInputs.operator || '', id: (inputs?.conditions?.length || 0)+1}
      setInputs(prev => ({ ...prev, conditions: [...(prev?.conditions || []), dt] }))
      setConditionsInputs({})
    }
  }

  const save = ()=>{
    let dt = _.cloneDeep(inputs)
    if(Array.isArray(dt.users)){
      dt.users = dt.users.join(',')
    }
    if(Array.isArray(dt.emails)){
      dt.emails = dt.emails.join(',')
    }

    if(Array.isArray(dt.conditions)){
      dt.condition =  dt.conditions.reduce((acc, cur)=>{
        return acc + (cur.operator + cur.sensor + cur.condition)
      }, '')
    }else{
      return
    }
    console.log('alert to save', dt)
    
    dispatch(saveAlert(dt)).then(res=>{
      if(res?.payload?.success){
        back()
      }else{

      }
    })
  }

  useEffect(() => {
    if(selected_alert){
      let dt = _.cloneDeep(selected_alert)
      if(dt?.users){
        dt.users = dt.users.split(',').map(o=> +o.trim())
      }else{
        dt.users = []
      }
      // if(dt?.emails){
      //   dt.emails = dt.emails.split(',')
      // }else{
      //   dt.emails = []
      // }
      dt.message = dt.message || dt.Message
      dt.code = dt.code || dt.Code
      dt.id = dt.UID
      dt.srcId = dt.srcId || dt.srcID
      dt.emails = dt.emails || dt.Emails
      setInputs(dt)
    }else{
      setInputs({})
    }
  }, [selected_alert])
  useEffect(() => {
    dispatch(fetchTags({type_label: 'sensor'}))
    dispatch(fetchStaffList())
    dispatch(fetchSitesClient())
  }, [])

  useEffect(() => {
    console.log('inputs changed', inputs)
  }, [inputs])

  return (
    <div className="flex align-items-center  justify-content-center">
      <div className="w-8">
        <div>
            <Button onClick={back} icon="pi pi-arrow-left" className="p-button-text" />
        </div>
        <Divider />
        <div className='flex  flex-wrap'>
          <div className='w-4 p-2'>
              <span>Code</span>
              <InputText name="code" 
                         onChange={onInputChanged} 
                         className='w-full'
                         value={inputs.code}/>
          </div>
          <div className='w-4 p-2'>
              <span>Nom</span>
              <InputText name="label" 
                         onChange={onInputChanged}  
                         className='w-full'
                         value={inputs.label}/>
          </div>
          <div className='w-4 p-2'>
              <span>Catégorie</span>
              <Dropdown name="type" 
                        className='w-full'
                        options={types}
                        value={inputs.type}
                        onChange={onInputChanged} />
          </div>
          <div className='w-6 p-2'>
              <span>Type d'entité</span>
              <Dropdown name="srcObject" 
                        className='w-full'
                        options={entity_types}
                        value={inputs.srcObject}
                        onChange={onInputChanged}/>
          </div>
          <div className='w-6 p-2'>
              <span>Entité</span>
              <Dropdown name="srcId" className='w-full'
                        options={
                          inputs?.srcObject == '' ? [] :
                          inputs?.srcObject == 'tag' ? (tags || []).map(t=>({label:t.name, value:t.id})) :
                          (worksites || []).map(t=>({label:t.name, value:t.id}))
                        }
                        value={inputs.srcId}
                        onChange={onInputChanged}
                        filter/>
          </div>
          <div className='w-4 p-2 hidden'>
              <span>Type de capteur</span>
              <Dropdown name="sensorType" className='w-full'
                        options={sensor_types}
                        value={inputs.sensorType}
                        onChange={onInputChanged}
                        filter/>
          </div>
          <div className='w-12 p-2'>
              <span style={{marginRight: '1rem'}}>Conditions</span>
              <div className='flex gap-3 flex-wrap my-2'>
                {
                  Array.isArray(inputs?.conditions) && inputs?.conditions.map((c,i)=>(
                    <Chip label={c.sensor+' '+c.condition} />
                    ))
                  
                }
              </div>
              <div className='w-12 flex'>
                {inputs?.conditions?.length > 0 && (
                  <Dropdown name="operator"
                          style={{width: '7rem' , borderRadius: "5px 0 0 5px"}}
                          className=' border-gray-400'
                          placeholder='Operateur...'
                          options={operators}
                          value={conditionInputs.operator}
                          onChange={onConditionChanged}
                          filter/>
                )
                }
                <Dropdown name="sensor"
                        style={{
                          width: '12rem' , 
                          borderRadius:inputs?.conditions?.length > 0 ? "0" : "5px 0 0 5px"
                        }}
                        className=' border-gray-400'
                        options={sensor_types}
                        value={conditionInputs.sensor}
                        placeholder='Capteur...'
                        onChange={onConditionChanged}
                        filter/>
                <InputText name="condition" className='w-10 border-gray-400'
                          style={{ borderRadius: "0px 5px 5px 0px" , minHeight: '2.5rem'}}
                          placeholder='condition...'
                          label='condition'
                          value={conditionInputs.condition}
                          onChange={onConditionChanged}
                          filter/>
                <Button onClick={addCondition} outlined label='Ajouter' icon="pi pi-plus" className="p-button-sm ml-2" />
              </div>
              {isConditionError && (
                <span className='text-red-600'>Conditions incorrect doit commencer par {'<,>,=,<= ou >='} et se terminer par un chiffre</span>
              )}
          </div>
          <div className='w-12 p-2'>
              <span>Description</span>
              <InputTextarea name="description" 
                             className='w-full' 
                             value={inputs.description}
                             rows={5}
                             onChange={onInputChanged}/>
          </div>
          <div className='w-12 p-2'>
              <span>Message</span>
              <InputTextarea name="message" 
                             className='w-full' 
                             rows={5}
                             value={inputs.message}
                             onChange={onInputChanged}/>
          </div>
          <div className='w-12 p-2'>
              <span>Utilisateurs</span>
              <MultiSelect name="users" 
                           className='w-full'
                           options={(staff || []).map(s=>({label: s.firstname + ' ' +s.lastname, value: s.userID}))}
                           value={inputs.users}
                           onChange={onInputChanged}/>
          </div>
          <div className='w-12 p-2'>
              <span>Mails</span>
              <InputText className='w-full'
                         name="emails"
                         value={inputs.emails}
                         onChange={onInputChanged}/>
          </div>
        </div>
        <div className='flex justify-content-end gap-2 mt-4'>
          <Button onClick={back} severity='danger' label="Fermer" icon="pi pi-times" className="p-button-sm" />
          <Button onClick={save} label="Enregistrer" icon="pi pi-check" className="p-button-sm" />
        </div>
      </div>
    </div>
  )
}

export default AlertEditor