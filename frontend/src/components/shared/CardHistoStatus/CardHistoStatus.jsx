import {Tag} from 'primereact/tag'

const CardHistoStatus = ({
  status,
  date,
  statusIcon,
  stat,
  user,
  address,
  statusColor,
  locationColor,
  locationIcon,
  onClick,
  checked,
}) => {
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: checked ? hexToRgba(statusColor, 0.3) : 'white',
        borderColor: checked ? statusColor : '#adb5bd',
        borderStyle: 'solid',
        borderWidth: checked ? '2px' : '1px',
        color: checked ? 'white' : 'black',
      }}
      className='p-4 border-round-md w-full hover:bg-blue-100 cursor-pointer'
    >
      <div className='flex flex-row align-items-center gap-4'>
        <div className='flex flex-row gap-2 align-items-center'>
          <i style={{color: statusColor}} className={`fas ${statusIcon}  text-lg`}></i>
          <div className='text-lg text-800 font-semibold'>{status}</div>
        </div>
        {/* <Tag className='mr-2' icon='pi pi-tag' value='BC572902238F'></Tag> */}
      </div>
      <div className='flex flex-row gap-4 align-items-center mt-3'>
        <div className='flex flex-row gap-2 align-items-center'>
          <i class='fa-duotone fa-solid fa-user text-xl'></i>
          <div className='text-lg text-800 font-semibold'>{user}</div>
        </div>
        <div className='flex flex-row gap-2 align-items-center'>
          <i class='fa-duotone fa-solid fa-calendar-week text-xl text-yellow-500'></i>
          <div className='text-lg text-800 font-semibold'>{date}</div>
        </div>
        <div className='flex flex-row gap-2 align-items-center'>
          <i style={{color: locationColor}} className={`fas ${locationIcon}  text-lg`}></i>
          <div className='text-lg text-800 font-semibold'>{stat}</div>
        </div>
        <div className='flex flex-row gap-2 align-items-center'>
          <i class='fa-duotone fa-solid fa-location-dot text-xl text-blue-500'></i>
          <div className='text-lg text-800 font-semibold '>{address}</div>
        </div>
      </div>
    </div>
  )
}

export default CardHistoStatus
