import {useAppSelector } from '../../../../hooks'
import {getSelectedDepot} from '../../slice/depot.slice'
import DepotDetail from './DepotDetail'

const DepotAndGeo = () => {
  const selectedDepotClient = useAppSelector(getSelectedDepot)

  return (
    <>
      <DepotDetail
        selectedDepot={selectedDepotClient}
        client={true}
      />
    </>
  )
}

export default DepotAndGeo
