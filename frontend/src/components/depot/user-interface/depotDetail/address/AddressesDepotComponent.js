import {Card} from 'primereact/card'
import {useAppDispatch} from '../../../../../hooks'
import {OlangItem} from '../../../../shared/Olang/user-interface/OlangItem/OlangItem'
import { setAddressDetail, setEditAddress, setSelectedAddress } from '../../../slice/addressDepot.slice'

const AddressesDepotComponent = (props) => {
  const dispatch = useAppDispatch()
  const handleClickDetail = (e) => {
      dispatch(setSelectedAddress(e))
      if (props.client) {
        dispatch(setAddressDetail(true))
      } else {
        dispatch(setEditAddress(true))
      }
    
  }
  return (
    <div className={props.className} key={props.id}>
      <div className='text-2xl ml-2 font-medium text-blue-500'>{props.type}</div>
      <Card
        className='mt-1 p-3 w-full lg:w-10 '
        style={{boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'}}
      >
        <div className='mb-2'>
          <i className='pi pi-map-marker mb-3 text-blue-500'></i>
          <span className='ml-3 text-2xl font-semibold'>{props.Address}</span>
        </div>
        <div className='flex mb-2'>
          <OlangItem olang='address.town' />
          <h4 className='ml-3 text-2xl'>{props.town}</h4>
        </div>
        <div className='flex mb-2'>
          <OlangItem olang='address.email' />
          <h4 className='ml-3 text-2xl'>{props.Email}</h4>
        </div>
        <div className='flex'>
          <OlangItem olang='address.phone' />
          <h4 className='ml-3 text-2xl'>{props.Phone}</h4>
        </div>
        <div className='flex justify-content-end mt-4'>
          <i
            className='pi pi-pencil text-primary cursor-pointer'
            style={{fontSize: '1.5rem'}}
            onClick={() => handleClickDetail(props)}
          ></i>
        </div>
      </Card>
    </div>
  )
}
export default AddressesDepotComponent
