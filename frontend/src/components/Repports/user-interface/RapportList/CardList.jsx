const CardList = ({title, date, key, onPdfClick, onCardClick, onDeleteClick}) => {
  return (
    <div
      key={key}
      onClick={onCardClick}
      className='bg-white flex flex-row align-items-center cursor-pointer justify-content-between px-3 py-2 hover:bg-gray-100'
    >
      <div>
        <div className='text-xl font-semibold text-800'>{title}</div>
        <div>{date}</div>
      </div>
      <div className='flex flex-row w-3'>
        <div
          onClick={onPdfClick}
          className='flex align-items-center justify-content-center z-2 p-2 cursor-pointer border-circle border-1 border-red-400 hover:border-red-200'
        >
          <i class='fas fa-duotone fa-file-pdf text-2xl text-red-400'></i>
        </div>
        <div
          onClick={onDeleteClick}
          className='flex align-items-center justify-content-center ml-3 z-2 p-2 cursor-pointer border-circle border-1 border-red-400 hover:border-red-200'
        >
          <i class='fas fa-duotone fa-trash text-2xl text-red-400'></i>
        </div>
      </div>
    </div>
  )
}

export default CardList
