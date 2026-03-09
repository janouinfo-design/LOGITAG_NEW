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
import {InputText} from 'primereact/inputtext'
import {Divider} from 'primereact/divider'
import {ScrollPanel} from 'primereact/scrollpanel'
import CardList from './CardList'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {Button} from 'primereact/button'

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
    <div
      className='w-full lg:w-3 xl:w-3 bg-gray-100 flex border-round-md flex-column'
      style={{
        height: '80vh',
        boxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
        WebkitBoxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
        MozBoxShadow: '3px 5px 13px 0px rgba(0, 0, 0, 0.61)',
      }}
    >
      <div>
        <div className='bg-gray-400 text-white px-2 py-3'>
          <div className='flex flex-row align-items-center text-xl font-semibold'>
            <i className='fa-solid fa-list-timeline text-2xl text-white pr-2'></i>
            <OlangItem olang='rptList' />
          </div>
        </div>
        <div className='bg-white w-full'>
          <Button
            onClick={() => {
              dispatch(setChoseRapport(true))
            }}
            style={{width: '100%'}}
            className='flex border-none cursor-pointer bg-white hover:bg-gray-300 flex-row justify-content-center align-items-center h-4rem text-3xl'
          >
            <i class='fas fa-light fa-square-plus text-4xl text-blue-200'></i>
            <div className='pl-3 text-blue-200 text-xl font-semibold'>
              <OlangItem olang='createRpt' />
            </div>
          </Button>
          {/* <Divider /> */}
        </div>
        <div className='w-full bg-white'>
          {/* <InputText
            className='w-full'
            placeholder='Search...'
          />
          // <Divider /> */}
          <Divider className='m-0' />
          <ScrollPanel style={{width: '100%', height: '70vh', marginTop: '10px'}}>
            {Array.isArray(list) &&
              list?.map((item, index) => {
                return (
                  <div className='w-full'>
                    <CardList
                      key={index}
                      title={item.title}
                      date={item.creaDate}
                      onPdfClick={() => handlePdf(item.filePath)}
                      onCardClick={() => handleCard(item.id)}
                      onDeleteClick={() => onDeleteClick(item.id)}
                    />
                    <Divider className='m-0' />
                  </div>
                )
              })}
          </ScrollPanel>
        </div>
      </div>
    </div>
  )
}

export default RapportList
