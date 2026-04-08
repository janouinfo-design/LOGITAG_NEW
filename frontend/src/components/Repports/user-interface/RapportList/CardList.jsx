const CardList = ({title, date, key, onPdfClick, onCardClick, onDeleteClick}) => {
  return (
    <div
      key={key}
      onClick={onCardClick}
      className='lt-cardlist-item'
      data-testid="rapport-card-list-item"
    >
      <div style={{flex: 1, minWidth: 0}}>
        <div className='lt-cardlist-title'>{title}</div>
        <div className='lt-cardlist-date'>
          <i className='pi pi-calendar' style={{fontSize: '0.65rem'}}></i>
          {date}
        </div>
      </div>
      <div style={{display: 'flex', gap: 6}}>
        <button onClick={(e) => { e.stopPropagation(); onPdfClick(); }} className='lt-rapport-vcard-btn lt-rapport-vcard-btn--pdf' data-testid="card-pdf-btn">
          <i className='pi pi-file-pdf'></i>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(); }} className='lt-rapport-vcard-btn lt-rapport-vcard-btn--del' data-testid="card-delete-btn">
          <i className='pi pi-trash'></i>
        </button>
      </div>
    </div>
  )
}

export default CardList
