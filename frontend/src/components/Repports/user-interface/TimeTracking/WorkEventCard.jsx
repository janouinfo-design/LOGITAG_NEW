import {cn} from '../../../../lib/utils'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

const getEventIcon = (status) => {
  switch (status) {
    case 'work':
      return <i className='fas fa-clock text-green-500 text-2xl' />
    case 'pause':
      return <i className='fas fa-pause-circle text-yellow-500 text-2xl' />
    case 'end':
      return <i className='fa-solid fa-stop text-red-500 text-2xl' />
    default:
      return null
  }
}

const WorkEventCard = ({event, onClick, selected, duration}) => {
  return (
    <div
      className={cn(
        ' rounded-lg shadow-md p-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors',
        selected ? 'bg-blue-100' : 'bg-white'
      )}
      onClick={() => onClick(event)}
    >
      <div className='flex items-center justify-between '>
        <div className='flex items-center gap-4'>
          <i style={{color: event.backgroundColor}} className={`text-xl ${event.icon}`} />
          <div className='w-full gap-2'>
            {event.worksiteLabel && (
              <div className='flex flex-row items-center gap-2'>
                <i className='fas fa-solid fa-map-location-dot text-lg text-blue-500 mr-2'></i>
                <div className='font-medium text-gray-800'>{event.worksiteLabel.toUpperCase()}</div>
              </div>
            )}
            <div className='flex flex-row items-center gap-2'>
              <i className='fas fa-solid fa-calendar-days text-lg text-blue-500 mr-2'></i>
              <div className='text-xl text-gray-800 font-semibold'>
                {new Date(event.posDate).toLocaleTimeString()}
              </div>
            </div>
            {duration && (
              <div className='flex flex-row items-center gap-2'>
                <i className='fas fa-solid fa-clock text-lg text-blue-500 mr-2'></i>
                <div className='text-xl text-gray-800 font-semibold'>{duration}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {event?.enginAddress && (
        <div className=' text-lg font-semibold text-gray-600 w-full '>
          <i className='fas fa-solid fa-map-location-dot text-lg text-blue-500 mr-2'></i>
          {event.enginAddress}
        </div>
      )}
    </div>
  )
}

export default WorkEventCard
