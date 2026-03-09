import {useEffect, useRef} from 'react'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  changeStatusGat,
  fetchGateways,
  getGatStatus,
  getSelectedGateway,
  setGatewayView,
  setGatStatus,
  setSelectedGateway,
} from '../../slice/gateway.slice'
import {Divider} from 'primereact/divider'
import {TabPanel, TabView} from 'primereact/tabview'
import GatewayEditor from './GatewayEditor/GatewayEditor'
import ButtonComponent from '../../../shared/ButtonComponent'
import GatewayGeofence from '../GatewayGeofence/GatewayGeofence'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {SplitButton} from 'primereact/splitbutton'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import CardStatus from './CardStatus'
import {useAppSelector} from '../../../../hooks'
import {fetchStatus, getStatus} from '../../../Status/slice/status.slice'
import _ from 'lodash'

const GatewayDetailComponent = (props) => {
  const [inputs, setInputs] = useState({})
  const [selectedStatus, setSelectedStatus] = useState(null)

  const toast = useRef(null)

  const selectedGateway = useSelector(getSelectedGateway)
  const statusList = useAppSelector(getStatus)
  const gatStatus = useAppSelector(getGatStatus)
  const dispatch = useDispatch()

  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setSelectedGateway(null))
  }

  const onShowSt = () => {
    setSelectedStatus(selectedGateway?.idStatusGateway)
    dispatch(setGatStatus(true))
  }

  const onOk = () => {
    let obj = {
      gatewayId: selectedGateway?.id,
      status: selectedStatus,
    }
    dispatch(changeStatusGat(obj)).then((res) => {
      if (res.payload) {
        let newSelected = _.cloneDeep(selectedGateway)
        let findSt = statusList.find((s) => s.id == selectedStatus)
        let newObj = {
          ...newSelected,
          idStatusGateway: selectedStatus,
          statusIcon: findSt?.icon,
          statusBgColor: findSt?.backgroundColor,
          statusLabelGateway: findSt?.label,
        }
        dispatch(setSelectedGateway(newObj))
        dispatch(fetchGateways())
        dispatch(setGatStatus(false))
      }
    })
  }
  const onStatusClick = (item) => {
    setSelectedStatus(item.id)
  }

  const onHideSt = () => {
    dispatch(setGatStatus(false))
  }

  const footerSt = () => {
    return (
      <div>
        <ButtonComponent rounded onClick={onHideSt}>
          <OlangItem olang='btn.close' />
        </ButtonComponent>
        <ButtonComponent className='border-none' rounded onClick={onOk}>
          <OlangItem olang='btn.save' />
        </ButtonComponent>
      </div>
    )
  }

  useEffect(() => {
    setInputs(selectedGateway || {})
  }, [selectedGateway])

  useEffect(() => {
    let obj = {
      uid: 193,
      name: 'engin',
    }
    dispatch(fetchStatus(obj)).then(() => {
      setSelectedStatus(selectedGateway?.idStatusGateway)
    })
  }, [])

  return (
    <>
      <DialogComponent
        visible={gatStatus}
        footer={footerSt}
        header={<OlangItem olang='st.Gat' />}
        onHide={onHideSt}
      >
        <div className='w-full flex mt-2 justify-content-center flex-wrap flex-row gap-3 align-items-center'>
          {Array.isArray(statusList) &&
            statusList.length > 0 &&
            statusList.map((status) => (
              <CardStatus
                key={status?.id}
                icon={status?.icon}
                title={status?.label}
                bgColor={status?.backgroundColor}
                checked={selectedStatus == status?.id}
                onClick={() => onStatusClick(status)}
              />
            ))}
        </div>
      </DialogComponent>
      <div className='bg-white p-2'>
        <div className='my-2 justify-content-between flex align-items-center'>
          <div className='flex gap-3 align-items-center'>
            <ButtonComponent rounded onClick={onHide}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
            <ButtonComponent
              style={{backgroundColor: selectedGateway?.statusBgColor || 'green'}}
              className='border-none'
              rounded
              onClick={onShowSt}
            >
              <i className={`fas ${selectedGateway?.statusIcon} text-white`}></i>
              <div className='ml-2'>
                <strong>
                  {selectedGateway?.statusLabelGateway || <OlangItem olang='sel.st' />}
                </strong>
              </div>
            </ButtonComponent>
            {!inputs?.label ? (
              <strong>
                <OlangItem olang='new.Gat' />
              </strong>
            ) : (
              <strong className='text-lg'>{inputs.label}</strong>
            )}
          </div>
        </div>
        <Divider type='dashed' />
        <TabView>
          <TabPanel header='Général'>
            <GatewayEditor root={props.root} />
          </TabPanel>
          {/* <TabPanel header='Site'>
          <GatewayGeofence root={props.root} />
        </TabPanel> */}
        </TabView>
      </div>
    </>
  )
}

export default GatewayDetailComponent
