import React, {useEffect, useState} from 'react'
import {
  deleteRapport,
  fetchListRpt,
  fetchListRptById,
  getListRpt,
  setChoseRapport,
} from '../../slice/rapports.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {ScrollPanel} from 'primereact/scrollpanel'
import CardList from './CardList'
import {setAlertParams} from '../../../../store/slices/alert.slice'

function RapportList() {
  const dispatch = useAppDispatch()
  const list = useAppSelector(getListRpt)
  const [viewMode, setViewMode] = useState('grid')

  function handlePdf(path) {
    window.open(path, '_blank')
  }

  const handleCard = (id) => {
    dispatch(fetchListRptById(id))
  }

  const onDeleteClick = (id) => {
    dispatch(
      setAlertParams({
        title: 'Supprimer',
        message: 'Voulez-vous vraiment supprimerce rapport?',
        acceptClassName: 'p-button-danger',
        visible: true,
        accept: () => {
          dispatch(deleteRapport(id))
        },
      })
    )
  }

  useEffect(() => {
    dispatch(fetchListRpt())
  }, [])

  return (
    <div className='lt-rapport-list-wrap' data-testid="rapport-list-sidebar">
      <div className='lt-rapport-list-header'>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <i className='pi pi-list' style={{fontSize: '1rem'}}></i>
          <span><OlangItem olang='rptList' /></span>
        </div>
        <div className="lt-view-toggle" style={{borderRadius: 8}} data-testid="rapport-view-toggle">
          <button className={`lt-view-btn ${viewMode === 'grid' ? 'lt-view-btn--active' : ''}`} onClick={() => setViewMode('grid')} style={{width: 30, height: 28}} data-testid="rapport-grid-btn">
            <i className="pi pi-th-large" style={{fontSize: '0.75rem'}}></i>
          </button>
          <button className={`lt-view-btn ${viewMode === 'list' ? 'lt-view-btn--active' : ''}`} onClick={() => setViewMode('list')} style={{width: 30, height: 28}} data-testid="rapport-list-btn">
            <i className="pi pi-bars" style={{fontSize: '0.75rem'}}></i>
          </button>
        </div>
      </div>
      <button
        onClick={() => dispatch(setChoseRapport(true))}
        className='lt-rapport-create-btn'
        data-testid="rapport-create-btn"
      >
        <i className='pi pi-plus-circle' style={{fontSize: '1.1rem', color: 'var(--lt-accent)'}}></i>
        <span style={{color: 'var(--lt-accent)', fontWeight: 600, fontSize: '0.85rem'}}><OlangItem olang='createRpt' /></span>
      </button>
      <div style={{borderTop: '1px solid var(--lt-border)', flex: 1, overflow: 'hidden'}}>
        {viewMode === 'grid' ? (
          <div className='lt-rapport-grid' data-testid="rapport-grid-view">
            {Array.isArray(list) && list.map((item, index) => (
              <div key={index} className='lt-rapport-vcard' onClick={() => handleCard(item.id)} data-testid="rapport-vcard">
                <div className='lt-rapport-vcard-icon'>
                  <i className='pi pi-file-edit'></i>
                </div>
                <div className='lt-rapport-vcard-title'>{item.title}</div>
                <div className='lt-rapport-vcard-date'>
                  <i className='pi pi-calendar' style={{fontSize: '0.65rem'}}></i>
                  {item.creaDate}
                </div>
                <div className='lt-rapport-vcard-actions'>
                  <button className='lt-rapport-vcard-btn lt-rapport-vcard-btn--pdf' onClick={(e) => { e.stopPropagation(); handlePdf(item.filePath) }} data-testid="rapport-pdf-btn">
                    <i className='pi pi-file-pdf'></i>
                  </button>
                  <button className='lt-rapport-vcard-btn lt-rapport-vcard-btn--del' onClick={(e) => { e.stopPropagation(); onDeleteClick(item.id) }} data-testid="rapport-delete-btn">
                    <i className='pi pi-trash'></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollPanel style={{width: '100%', height: 'calc(80vh - 140px)', marginTop: '4px'}}>
            {Array.isArray(list) && list.map((item, index) => (
              <div key={index} style={{borderBottom: '1px solid var(--lt-border)'}}>
                <CardList
                  title={item.title}
                  date={item.creaDate}
                  onPdfClick={() => handlePdf(item.filePath)}
                  onCardClick={() => handleCard(item.id)}
                  onDeleteClick={() => onDeleteClick(item.id)}
                />
              </div>
            ))}
          </ScrollPanel>
        )}
      </div>
    </div>
  )
}

export default RapportList
