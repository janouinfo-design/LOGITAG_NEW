import {useState} from 'react'
import {MapComponent} from '../../shared/Map/MapComponent'
import {InputText} from 'primereact/inputtext'

export const AddressEditor = () => {
  const [infos, setInfos] = useState({})
  const onAddress = (address) => {
    setInfos(address.address)
  }
  return (
    <div>
      <InputText />
      <InputText value={infos.City} />
      <MapComponent onAddress={onAddress} style={{width: '400px'}} />
    </div>
  )
}
