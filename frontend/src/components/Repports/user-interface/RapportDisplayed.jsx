import NewRapportUser from './NewRapport/NewRapportUser'
import NewRepportComponent from './NewRepportComponent'

const RapportDisplayed = () => {
  return process.env.REACT_APP_API_URL === 'https://app.logitag.ch:8443/logitag_node_alm/' ? (
    <NewRepportComponent />
  ) : (
    <NewRapportUser />
  )
}

export default RapportDisplayed
