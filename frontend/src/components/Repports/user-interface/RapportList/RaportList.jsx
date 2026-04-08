import React, {useEffect} from 'react'
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
        <i className='pi pi-list' style={{fontSize: '1rem'}}></i>
        <span><OlangItem olang='rptList' /></span>
      </div>
      <button
        onClick={() => dispatch(setChoseRapport(true))}
        className='lt-rapport-create-btn'
        data-testid="rapport-create-btn"
      >
        <i className='pi pi-plus-circle' style={{fontSize: '1.1rem', color: 'var(--lt-accent)'}}></i>
        <span style={{color: 'var(--lt-accent)', fontWeight: 600, fontSize: '0.85rem'}}><OlangItem olang='createRpt' /></span>
      </button>
      <div style={{borderTop: '1px solid var(--lt-border)'}}>
        <ScrollPanel style={{width: '100%', height: 'calc(80vh - 120px)', marginTop: '4px'}}>
          {Array.isArray(list) &&
            list?.map((item, index) => (
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
      </div>
    </div>
  )
}

export default RapportList
