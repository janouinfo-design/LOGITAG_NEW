import {useDispatch} from 'react-redux'
import {useAppSelector} from '../../hooks'
import ButtonComponent from '../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  createOrUpdateVehicule,
  fetchTypes,
  fetchVehicules,
  getEditVehicule,
  getSelectedVehicule,
  getTypes,
  setEditVehicule,
  setSelectedVehicule,
  setShow,
} from './slice/veh.slice'
import VehEditor from './vehEditor'
import {Card} from 'primereact/card'
import {Calendar} from 'primereact/calendar'
import {Dialog} from 'primereact/dialog'
import {useEffect, useMemo, useState} from 'react'
import {InputText} from 'primereact/inputtext'
import _ from 'lodash'
import {TabPanel, TabView} from 'primereact/tabview'
import {Dropdown} from 'primereact/dropdown'
import {fetchValidator, getValidator} from '../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {fetchTeams, getTeams} from '../Teams/slice/team.slice'
import {MapContainer, Marker, Polyline, Popup, useMap} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from '../shared/MapComponent/assets/icons/redMarker.png'
import {fetchVehiculePositionsHistory, getVehiculeHistoryRoute} from '../Engin/slice/engin.slice'
import BaseMapLayerComponent from '../shared/BaseMapLayerComponent/BaseMapLayerComponent'
import moment from 'moment'
import {Button} from 'primereact/button'

const routeMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

const FitRouteBounds = ({positions}) => {
  const map = useMap()

  useEffect(() => {
    if (!Array.isArray(positions) || positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 15)
      return
    }
    map.fitBounds(positions, {padding: [30, 30]})
  }, [map, positions])

  return null
}

const VehDetail = () => {
  const dispatch = useDispatch()
  const [isValid, setIsValid] = useState(true)

  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const [inputs, setInputs] = useState({})
  const [selectFuel, setSelectFuel] = useState('')
  const [typeOptions, setTypeOptions] = useState([])
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)

  const fuelTypes = useAppSelector(getTypes)
  const selectedVehicule = useAppSelector(getSelectedVehicule)
  const editVehicule = useAppSelector(getEditVehicule)
  const validators = useSelector(getValidator)
  const userList = useAppSelector(getTeams)
  const vehiculeHistoryRoute = useAppSelector(getVehiculeHistoryRoute)

  const onHideEditVehicule = () => {
    dispatch(setSelectedVehicule(null))
    dispatch(setEditVehicule(false))
  }
  const onSave = async (e) => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedVehicule?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateVehicule({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(fetchVehicules())
        dispatch(setShow(true))
      }
    })
  }
  const onSaveVehicule = (e) => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedVehicule?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateVehicule({fuelId: selectFuel?.code})).then((res) => {
      if (res.payload) {
        dispatch(setEditVehicule(false))
      }
    })
  }

  const onHide = () => {
    dispatch(setShow(true))
  }
  const onInputChange = (e) => {
    setIsValid(true)
    let old = _.cloneDeep(selectedVehicule)
    old = {
      ...old,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedVehicule(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Vehicule' /> {selectedVehicule?.label}
      </span>
    </>
  )
  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={onSave} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )

  const _nameValidator = validators?.find((field) => field.id === 'name')
  const _modelValidator = validators?.find((field) => field.id === 'model')
  const _platelicense = validators?.find((field) => field.id === 'platelicense')
  const _tankcapcityl = validators?.find((field) => field.id === 'tankcapcityl')
  const _speedmax = validators?.find((field) => field.id === 'speedmax')
  const _fuel = validators?.find((field) => field.id === 'fuel')

  const routeCoordinates = useMemo(() => {
    const possibleRouteSources = [vehiculeHistoryRoute]

    const normalizePoint = (point) => {
      if (!point || typeof point !== 'object') return null

      const lat = Number(point.lat ?? point.latitude ?? point.last_lat ?? point.satlat ?? point.y)
      const lng = Number(
        point.lng ?? point.long ?? point.longitude ?? point.last_lng ?? point.satlng ?? point.x
      )

      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
        return null
      }

      return [lat, lng]
    }

    const parseSource = (source) => {
      if (!source) return []

      if (typeof source === 'string') {
        try {
          return parseSource(JSON.parse(source))
        } catch (error) {
          return []
        }
      }

      if (Array.isArray(source)) {
        return source.map(normalizePoint).filter(Boolean)
      }

      if (Array.isArray(source?.points)) {
        return source.points.map(normalizePoint).filter(Boolean)
      }

      if (typeof source === 'object') {
        const point = normalizePoint(source)
        return point ? [point] : []
      }

      return []
    }

    for (const routeSource of possibleRouteSources) {
      const parsedPoints = parseSource(routeSource)
      if (parsedPoints.length > 0) {
        return parsedPoints
      }
    }

    return []
  }, [vehiculeHistoryRoute])

  const routeCenter = routeCoordinates.length
    ? routeCoordinates[routeCoordinates.length - 1]
    : [46.8182, 8.2275]

  const startRouteTime = useMemo(() => {
    const firstPoint = Array.isArray(vehiculeHistoryRoute)
      ? vehiculeHistoryRoute?.[0]
      : vehiculeHistoryRoute

    if (!firstPoint || typeof firstPoint !== 'object') {
      return selectedVehicule?.startDate || 'N/A'
    }

    const timestamp = firstPoint?.PeriodEndIso

    const dateFormatted = timestamp ? moment(timestamp).format('DD/MM/YYYY HH:mm') : 'N/A'
    return dateFormatted
  }, [vehiculeHistoryRoute, selectedVehicule?.startDate])

  const endRouteTime = useMemo(() => {
    const lastPoint = Array.isArray(vehiculeHistoryRoute)
      ? vehiculeHistoryRoute?.[vehiculeHistoryRoute.length - 1]
      : vehiculeHistoryRoute

    if (!lastPoint || typeof lastPoint !== 'object') {
      return 'N/A'
    }

    const timestamp = lastPoint?.PeriodEndIso

    if (timestamp) {
      return moment(timestamp).format('DD/MM/YYYY HH:mm')
    }

    return 'N/A'
  }, [vehiculeHistoryRoute])

  useEffect(() => {
    setTypeOptions([
      ...fuelTypes?.map((typ) => ({
        name: typ.label,
        code: typ.id,
      })),
    ])
  }, [fuelTypes])

  useEffect(() => {
    let obj = {
      type: 'CHAUFFEURS',
    }
    dispatch(fetchTeams(obj))
    dispatch(fetchTypes('vehiculeType'))
  }, [])

  const handleFilterRoute = () => {
    if (!selectedVehicule?.label) return
    setIsFetchingRoute(true)
    dispatch(
      fetchVehiculePositionsHistory({
        label: selectedVehicule.label,
        ...(dateFrom ? {from: dateFrom.toISOString()} : {}),
        ...(dateTo ? {to: dateTo.toISOString()} : {}),
      })
    ).finally(() => setIsFetchingRoute(false))
  }

  useEffect(() => {
    if (selectedVehicule?.label) {
      setIsFetchingRoute(true)
      dispatch(
        fetchVehiculePositionsHistory({
          label: selectedVehicule.label,
          from: dateFrom ? moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss') : undefined,
          to: dateTo ? moment(dateTo).format('YYYY-MM-DDTHH:mm:ss') : undefined,
        })
      ).finally(() => setIsFetchingRoute(false))
    }
  }, [dispatch, selectedVehicule?.label])

  useEffect(() => {
    setInputs(selectedVehicule || {})
  }, [selectedVehicule])

  return (
    <>
      <Dialog
        visible={isFetchingRoute}
        modal
        closable={false}
        header='Loading...'
        style={{width: '200px'}}
      >
        <p className='m-0 text-center'>Please wait...</p>
      </Dialog>
      <VehEditor
        onHide={onHideEditVehicule}
        selectedVehicule={selectedVehicule}
        visible={editVehicule}
        vehicule={true}
        onSubmitHandler={(e) => onSaveVehicule(e)}
      />
      <div className='mt-3 flex align-items-center justify-content-between'>
        <div className='flex'>
          <div>
            <ButtonComponent onClick={() => dispatch(setShow(true))}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2 text-base font-semibold'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
          </div>
        </div>
        <div className=' w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>
            {selectedVehicule?.name ?? <OlangItem olang='current.vehicule' />}
          </strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Customer.Info' />} leftIcon='pi pi-user mr-2'>
            <Card
              className='w-full md:w-10 lg:w-full xl:w-6 mt-3 p-2 ml-4'
              title={title}
              footer={footer}
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
            >
              <div className='flex flex-column justify-content-center'>
                <div className='my-4 mt-5'>
                  <label htmlFor='name'>
                    <OlangItem olang='vehicule.name' />
                    {_nameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='name'
                    id='name'
                    required={true}
                    value={selectedVehicule?.name}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['name'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4'>
                  <label htmlFor='user'>
                    <OlangItem olang='user.list' />
                  </label>
                  <Dropdown
                    name='userID'
                    id='userID'
                    options={userList}
                    onChange={(e) => {
                      onInputChange(e)
                    }}
                    placeholder='select user'
                    value={+selectedVehicule?.userID}
                    className={`w-full`}
                    optionLabel='firstname'
                    optionValue='userID'
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='model'>
                    <OlangItem olang='vehicule.modele' />
                    {_modelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='model'
                    id='model'
                    required={true}
                    value={selectedVehicule?.model}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['model'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='platelicense'>
                    <OlangItem olang='vehicule.platelicense' />
                    {_platelicense?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='platelicense'
                    id='platelicense'
                    required={true}
                    value={selectedVehicule?.platelicense}
                    onChange={onInputChange}
                    className={`w-full ${
                      inputValidity['platelicense'] === false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='capacity'>
                    <OlangItem olang='vehicule.capacity' />
                    {_tankcapcityl?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='tankcapcityl'
                    id='tankcapcityl'
                    required={true}
                    value={selectedVehicule?.tankcapcityl}
                    onChange={onInputChange}
                    className={`w-full ${
                      inputValidity['tankcapcityl'] === false ? 'p-invalid' : ''
                    }`}
                  />
                </div>
                <div className='my-4 mt-5'>
                  <label htmlFor='speedmax'>
                    <OlangItem olang='vehicule.allowedSpeed' />
                    {_speedmax?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='speedmax'
                    id='speedmax'
                    required={true}
                    value={selectedVehicule?.speedmax}
                    onChange={onInputChange}
                    className={`w-full ${inputValidity['speedmax'] === false ? 'p-invalid' : ''}`}
                  />
                </div>
                <div className='my-4'>
                  <label htmlFor='fuel'>
                    <OlangItem olang='fuel.list' />
                    {_fuel?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <Dropdown
                    id='fuel'
                    options={typeOptions}
                    onChange={(e) => {
                      setIsValid(true)
                      setSelectFuel(e.value)
                      onInputChange(e)
                    }}
                    placeholder='select fuel'
                    value={
                      selectFuel
                        ? selectFuel
                        : {code: selectedVehicule.fuelTypeId, name: selectedVehicule.fueltype}
                    }
                    className={`w-full ${inputValidity['fuel'] === false ? 'p-invalid' : ''}`}
                    optionLabel='name'
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
          <TabPanel header={<OlangItem olang='vehicule.route' />} leftIcon='pi pi-map-marker mr-2'>
            <Card
              className='w-full'
              title={<OlangItem olang='vehicule.route' />}
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
            >
              <div className='flex flex-wrap align-items-end gap-3 mb-3'>
                <div className='flex flex-column gap-1'>
                  <label className='text-sm font-medium'>From</label>
                  <Calendar
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.value)}
                    showTime
                    hourFormat='24'
                    placeholder='Start date'
                    showIcon
                    style={{width: '220px', height: '50px'}}
                  />
                </div>
                <div className='flex flex-column gap-1'>
                  <label className='text-sm font-medium'>To</label>
                  <Calendar
                    value={dateTo}
                    onChange={(e) => setDateTo(e.value)}
                    showTime
                    hourFormat='24'
                    placeholder='End date'
                    showIcon
                    style={{width: '220px', height: '50px'}}
                  />
                </div>
                {/* <button
                  onClick={handleFilterRoute}
                  className='p-button p-component'
                  style={{height: '42px', padding: '0 1.25rem'}}
                >
                  <i className='pi pi-filter mr-2' />
                  Filter
                </button> */}
                <Button onClick={handleFilterRoute} style={{height: '50px'}}>
                  <i className='pi pi-filter mr-2' />
                  Filter
                </Button>
              </div>
              {routeCoordinates.length > 0 ? (
                <MapContainer
                  center={routeCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{height: '65vh', width: '100%', borderRadius: '12px'}}
                >
                  <BaseMapLayerComponent top={60} right={15} />

                  <FitRouteBounds positions={routeCoordinates} />
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{color: '#D64B70', weight: 5}}
                  />

                  <Marker position={routeCoordinates[0]} icon={routeMarkerIcon}>
                    <Popup>
                      <div className='p-3' style={{minWidth: '200px'}}>
                        <div className='font-bold text-lg mb-2'>Start Route</div>
                        <div className='text-gray-600'>Point de départ</div>
                        {/* <div className='mt-2 flex align-items-center gap-2'>
                          <i className='pi pi-clock text-blue-500'></i>
                          <span>{startRouteTime}</span>
                        </div> */}
                      </div>
                    </Popup>
                  </Marker>

                  <Marker
                    position={routeCoordinates[routeCoordinates.length - 1]}
                    icon={routeMarkerIcon}
                  >
                    <Popup>
                      <div className='p-3' style={{minWidth: '200px'}}>
                        <div className='font-bold text-lg mb-2'>Dernière position</div>
                        <div className='text-gray-600'>Point d\'arrivée</div>
                        {/* <div className='mt-2 flex align-items-center gap-2'>
                          <i className='pi pi-clock text-blue-500'></i>
                          <span>{endRouteTime}</span>
                        </div> */}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className='text-600 py-4'>No route data available for this vehicle.</div>
              )}
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default VehDetail
