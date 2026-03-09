import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'

const CardStatus = ({height, backgroundColor, desc, icon, value, iconColor}) => {
  return (
    <div
      style={{
        height: height || '110px',
        backgroundColor: backgroundColor || '#c9f7f5',
        width: '20%',
      }}
      className=' rounded-2xl shadow-md flex items-center justify-center p-2'
    >
      <div
        className='flex flex-col justify-between items-start'
        style={{height: '80%', width: '80%'}}
      >
        <i className={`fas ${icon} text-3xl ${iconColor}`}></i>
        <h2 className='text-2xl font-bold mt-2'>{value}</h2>
        <p className='text-gray-400 text-base'>
          <OlangItem olang={desc} />
        </p>
      </div>
    </div>
  )
}

export default CardStatus
