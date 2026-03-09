import {Divider} from 'primereact/divider'
import {InputText} from 'primereact/inputtext'
import React, {useEffect, useState} from 'react'
import ButtonComponent from '../../../ButtonComponent/ButtonComponent'
import {InputTextarea} from 'primereact/inputtextarea'
import {Chips} from 'primereact/chips'
import {useAppSelector} from '../../../../../hooks'
import {getSelectedGeoEdit, getSelectedSite} from '../../../../Site/slice/site.slice'
import {OlangItem} from '../../../Olang/user-interface/OlangItem/OlangItem'

const GeofenceEditorComponent = ({onCancel, onSave, _inputs}) => {
  const selected = useAppSelector(getSelectedGeoEdit)
  const selectedSite = useAppSelector(getSelectedSite)
  const [inputs, setInputs] = useState(_inputs || {})
  const cancel = () => {
    if (typeof onCancel == 'function') onCancel()
  }
  const onChange = (e) => {
    setInputs((prev) => ({...prev, [e.target.name]: e.target.value}))
  }
  const save = () => {
    if (typeof onSave == 'function') onSave({...inputs})
  }

  useEffect(() => {
    let obj = {
      ...({
        ..._inputs,
        label: selectedSite?.label,
      } || {}),
    }

    if (!Array.isArray(obj.tags)) obj.tags = []
    obj.tags = obj.tags.map((o) => (typeof o == 'string' ? o : o.label))
    setInputs(obj)
  }, [_inputs])

  return (
    <div className='p-3 bg-white  shadow-2' style={{width: '300px'}}>
      <h4>
        <span className='pi pi-map mr-2'></span>
        <OlangItem olang='Geofence' />
      </h4>
      <Divider type='dashed' />
      {/* <div className='mb-2'>
        <strong>Zones</strong>
        <InputText disabled className='w-full' />
      </div> */}
      <div className='mb-3'>
        <OlangItem olang='Label' />
        <InputText
          disabled={true}
          value={selectedSite?.label}
          name='label'
          onChange={onChange}
          className='form-control'
        />
      </div>
      <div className='mb-3'>
        <OlangItem olang='Description' />
        <InputTextarea
          value={inputs.description}
          name='description'
          onChange={onChange}
          className='form-control'
        ></InputTextarea>
      </div>
      <div>
        <OlangItem olang='Tags' />
        <Chips
          name='tags'
          separator=','
          itemTemplate={(r) => <strong>{'#' + r}</strong>}
          value={inputs.tags}
          onChange={onChange}
          className='w-full'
        />
      </div>
      <Divider type='dashed' />

      <div className='flex justify-content-between'>
        <ButtonComponent onClick={cancel} outlined raised className='p-button-danger'>
          <OlangItem olang='Cancel' />
        </ButtonComponent>
        <ButtonComponent onClick={save} outlined raised className='p-button-danger'>
          <OlangItem olang='Save' />
        </ButtonComponent>
      </div>
    </div>
  )
}

export default GeofenceEditorComponent
