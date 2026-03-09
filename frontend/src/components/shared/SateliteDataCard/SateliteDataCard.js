import {Chip} from 'primereact/chip'
import GeocodingComponent from '../GeocodingComponent/GeocodingComponent'

const SateliteDataCard = ({data}) => {
  const _iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname === 'exit') {
      icon = 'fa-solid fa-up-from-bracket'
      color = '#D64B70'
    } else if (rowData?.etatenginname === 'reception') {
      icon = 'fa-solid fa-down-to-bracket'
      color = 'green'
    } else if (rowData?.etatenginname === 'nonactive') {
      icon = 'fa-solid fa-octagon-exclamation'
      color = 'red'
    } else {
      icon = 'fa-solid fa-up-from-bracket'
      color = '#D64B70'
    }
    return (
      <div>
        <i
          style={{color}}
          className={`${icon} text-2xl rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin}`}
          alt={`${rowData?.etatengin}`}
        ></i>
      </div>
    )
  }

  const iconTemplate = (rowData) => {
    return (
      <div>
        <i
          style={{color: rowData?.bgColor}}
          className={`${rowData?.iconName} text-2xl rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin}`}
          alt={`${rowData?.etatengin}`}
        ></i>
      </div>
    )
  }
  const addresseeTemplate = ({enginAddress}) => {
    return (
      <>
        {
          <div>
            {enginAddress ? (
              <Chip
                label={enginAddress}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }
  return (
    <div className='satellite-data-card'>
      <div className=' flex engine-status'>
        {iconTemplate(data)}
        <div className='address'>{addresseeTemplate(data)}</div>
      </div>
      <div className='location'>
        <strong>Location:</strong> {data.satlat}, {data.satlng}
      </div>
      <div className='datetime'>
        <strong>Date and Time:</strong> {data.DurationFormatted}
      </div>
      <div className='worksite'>
        <strong>Worksite:</strong> {data.worksiteLabel || data.worksiteName || ''}
      </div>
    </div>
  )
}

export default SateliteDataCard
