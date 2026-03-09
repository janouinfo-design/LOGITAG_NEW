import React, {useEffect, useMemo} from 'react'
import {InputText} from 'primereact'
import {useState} from 'react'
import {
  createOrUpdateGateway,
  fetchAllSites,
  fetchGatewayModes,
  fetchGatewayTypes,
  getAllSite,
  getGatewayModes,
  getGatewayTypes,
  getSelectedGateway,
  setSelectedGateway,
} from '../../../slice/gateway.slice'
import {setToastParams} from '../../../../../store/slices/ui.slice'
import {InputSwitch} from 'primereact/inputswitch'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../../../shared/ButtonComponent'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../../../hooks'
import _ from 'lodash'
import {centroid} from '@turf/turf'
import {Card} from 'primereact/card'
import {OlangItem} from '../../../../shared/Olang/user-interface/OlangItem/OlangItem'
import GatewayGeofence from '../../GatewayGeofence/GatewayGeofence'
const mandatories = ['label', 'worksite', 'mode']
const GatewayEditor = (props) => {
  const [inputs, setInputs] = useState({active: true})
  const [isValid, setIsValid] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [worksiteOptions, setWorksiteOptions] = useState([])
  const [exitMarkerPosition, setExitMarkerPosition] = useState([0, 0])
  const navigate = useNavigate()

  const selectedGateway = useAppSelector(getSelectedGateway)
  const worksites = useAppSelector(getAllSite)
  const gatewayTypes = useAppSelector(getGatewayTypes)
  const gatewayModes = useAppSelector(getGatewayModes)

  const [roles] = useState([
    {label: 'Administrateur', value: 'admin'},
    {label: 'Utilisateur', value: 'user'},
  ])
  const dispatch = useAppDispatch()
  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setSelectedGateway(null))
  }

  const onInputChange = (e) => {
    setIsValid(true)
    setInputs((prev) => ({...prev, [e.target.name]: e.target.value}))
    if (e.target.name === 'locationId' && e.target.value && Array.isArray(worksites)) {
      const findSite = worksites.find((site) => site.id == e.target.value)
      setSelectedSite(findSite)
    }
  }

  useEffect(() => {
    setInputs(selectedGateway?.label ? selectedGateway : {active: true, srcObject: 'GATEWAY'})
  }, [selectedGateway])

  useEffect(() => {
    if (inputs) {
      let valid = true

      if (!inputs?.id && inputs.pwd != inputs?.confPassword) valid = false
      else {
        for (const key of mandatories) {
          if (!inputs[key] || (Array.isArray(inputs[key]) && inputs[key].length == 0)) valid = false
        }
      }
      // setIsValid(valid)
    } else {
      // setIsValid(false)
    }
  }, [inputs])

  const save = async () => {
    let data = _.cloneDeep(inputs)
    
    if (data?.active === undefined) data.active = 1
    let res = (await dispatch(createOrUpdateGateway({data, exitLatLng: exitMarkerPosition})))
      .payload

    if (!res.success)
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERREUR',
          detail: 'Opération échoué. Veuillez réessayer !!!',
        })
      )
    else {
      // dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
      dispatch(setToastParams({show: true, severity: 'success'}))
      typeof props.onSave == 'function' && props.onSave()
      onHide()
    }
  }

  const onAddress = (address) => {
    if (address?.lat && address?.lng) {
      setInputs((prev) => ({
        ...prev,
        lat: address?.lat.toString(),
        lng: address?.lng.toString(),
        address: address?.formatted_address,
      }))
    }
  }

  useEffect(() => {
    if (inputs?.worksite) {
      let detail = worksites.find((o) => o.id == inputs?.worksite)
      let geom = detail?.geofence?.[0]?.geometry //?.geometry?.coordinates?.[0]?.[0]
      if (_.isPlainObject(geom) && geom?.geometry) {
        let _centroid = centroid(geom)?.geometry?.coordinates
        if (Array.isArray(_centroid) && _centroid.length == 2) {
          setInputs((prev) => ({...prev, lat: _centroid[1], lng: _centroid[0]}))
        }
      }
    }
  }, [inputs?.worksite, worksites])

  useEffect(() => {
    if (Array.isArray(worksites)) {
      setWorksiteOptions(
        worksites.map((o) => ({label: o.label, value: o.id, icon: o?.familleIcon}))
      )
    }
  }, [worksites])

  useEffect(() => {
    // dispatch(fetchAllSites())
    dispatch(fetchGatewayTypes())
    dispatch(fetchGatewayModes())

    // return () => {
    //   dispatch(setSelectedGateway(null))
    // }
  }, [])

  return (
    <div className='flex w-full flex-column gap-3 lg:flex-row xl:flex-row  justify-content-between bg-white p-2'>
      <Card className='p-2 w-full md:w-9 lg:w-9 xl:w-6 shadow-2 bg-white'>
        <div className='flex flex-column my-4'>
          <div className='mt-5'>
            <label htmlFor='title' className='w-3  text-right'>
              <OlangItem olang='code' />
            </label>
            <InputText
              name='code'
              required={true}
              value={inputs.code}
              onChange={onInputChange}
              className='w-9'
            />
          </div>
          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              IMEI
            </label>
            <InputText
              name='label'
              required={true}
              value={inputs.label}
              onChange={onInputChange}
              className='w-9'
            />
          </div>
          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              <OlangItem olang='type' />
            </label>
            <Dropdown
              name='srcObject'
              value={inputs.srcObject}
              className='w-9'
              filter
              onChange={onInputChange}
              optionValue='name'
              optionLabel='label'
              options={gatewayTypes}
            />
          </div>

          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              <OlangItem olang='mode' />
            </label>
            <Dropdown
              name='mode'
              value={inputs.mode}
              className='w-9'
              filter
              onChange={onInputChange}
              optionValue='name'
              optionLabel='label'
              options={gatewayModes}
            />
          </div>
         
          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              <OlangItem olang='site' />
            </label>
            <Dropdown
              name='locationId'
              value={inputs.locationId}
              className='w-9'
              // disabled={inputs?.id}
              filter
              // optionValue='value'
              // optionLabel='label'
              onChange={onInputChange}
              itemTemplate={(dt) => (
                <div className='flex align-items-center' style={{gap: 10}}>
                  <span
                    className={`fas fa-duotone ${dt?.icon} text-blue-300`}
                    style={{fontSize: '30px'}}
                  ></span>
                  <strong>{dt.label}</strong>
                </div>
              )}
              options={worksiteOptions}
            />
          </div>
          <div className='my-4  flex gap-2 align-items-center'>
            <label htmlFor='Roles' className='w-3  text-right'>
              <OlangItem olang='active' />
            </label>
            <InputSwitch
              name='active'
              checked={inputs.active == 1}
              onChange={(e) => setInputs((prev) => ({...prev, active: e.value ? 1 : 0}))}
            />
          </div>

        </div>
        <div className='flex gap-3 justify-content-end'>
          <ButtonComponent
            onClick={onHide}
            label={<OlangItem olang='cancel' />}
            className='p-button-danger'
            icon='pi pi-times'
          />
          <ButtonComponent
            label={<OlangItem olang='save' />}
            disabled={!isValid}
            onClick={save}
            icon='pi pi-check'
          />
        </div>
      </Card>
      <Card className='p-2 w-full md:w-9 lg:w-9 xl:w-6 shadow-2 bg-white'>
        <GatewayGeofence
          exitMarkerPosition={exitMarkerPosition}
          setExitMarkerPosition={setExitMarkerPosition}
          selectedSite={selectedSite}
          setIsValid={setIsValid}
        />
      </Card>
    </div>
  )
}

export default GatewayEditor
