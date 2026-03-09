import {Card} from 'primereact/card'

const HistoryList = ({history}) => {
  return (
    <div className='history-list'>
      <h3>Location History</h3>
      {history.map((location, index) => (
        <Card key={index} className='history-card'>
          <div>
            <strong>Latitude:</strong> {location.lat}
          </div>
          <div>
            <strong>Longitude:</strong> {location.lng}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default HistoryList
