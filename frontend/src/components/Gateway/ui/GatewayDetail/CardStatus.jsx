const CardStatus = ({title, value, bgColor, icon, checked, onClick}) => {
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return (
    <div
      onClick={onClick}
      style={{borderColor: bgColor, backgroundColor: checked ? hexToRgba(bgColor, 0.4) : 'white'}}
      className='flex cursor-pointer flex-row gap-2 align-items-center hover-scale justify-content-center border-round-lg w-12rem h-4rem border-2'
    >
      <i style={{color: bgColor}} className={`fas text-xl ${icon}`} />
      <strong style={{color: checked ? 'white' : 'black'}} className='text-lg font-semibold'>
        {title}
      </strong>
    </div>
  )
}

export default CardStatus
