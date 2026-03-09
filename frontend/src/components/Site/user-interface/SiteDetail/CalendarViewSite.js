import FullCalendar from '@fullcalendar/react'
import timelineGridPlugin from '@fullcalendar/resource-timeline'
import {RadioButton} from 'primereact/radiobutton'
import frLocal from '@fullcalendar/core/locales/fr'
import React, {Fragment, useEffect, useRef, useState} from 'react'
import {Chip} from 'primereact/chip'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {fetchEngines, getEngines} from '../../../Engin/slice/engin.slice'
import {getSelectedSite} from '../../slice/site.slice'
import {fetchEngineEvents, getEngineEvents} from '../../../Planning/slice/planing.slice'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {useLocalStorage} from 'primereact/hooks'
import {SplitButton} from 'primereact/splitbutton'
import {Button} from 'primereact/button'

function CalendarViewSite() {
  const [daysDisplay, setDaysDisplay] = useLocalStorage(2, 'daysDisplaySite')
  const IMAGE_BASE_URL = API_BASE_URL_IMAGE
  const calendarRef = useRef(null)

  let enginesData = useAppSelector(getEngines)
  let selectedSite = useAppSelector(getSelectedSite)
  const dispatch = useAppDispatch()
  let engineEventsData = useAppSelector(getEngineEvents)
  const [loading, setLoading] = useState(false)

  const iconTemplate = (info) => {
    let icon = ''
    let color = ''
    if (info === 'exit') {
      icon = 'fa-solid fa-up-from-bracket'
      color = '#D64B70'
    } else if (info === 'reception') {
      icon = 'fa-solid fa-down-to-bracket'
      color = 'green'
    } else if (info === 'nonactive') {
      icon = 'fa-solid fa-octagon-exclamation'
      color = 'red'
    }
    return (
      <div>
        <i style={{color}} className={`${icon} text-2xl rounded p-2`}></i>
      </div>
    )
  }

  const tagTemplate = (info) => {
    let image =
      info?.status == 'Disponible'
        ? require('../../../Engin/assets/LOGITAGCMYK.png')
        : require('../../../Engin/assets/LOGITAGBLACK.png')

    return (
      <div className='flex flex-column'>
        <div className='flex justify-content-center'>
          <img
            src={image}
            alt={info.status}
            style={{width: '30px', height: '20%', objectFit: 'cover'}}
          />
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Chip
            label={info.status}
            className='m-2'
            style={{background: info.statusbgColor, color: 'white'}}
          />
        </div>
      </div>
    )
  }

  const eventContent = (eventInfo) => {
    const {event} = eventInfo

    return (
      <>
        <div className='flex flex-row '>
          <div className='image-content mx-3'>
            <img
              src={`${IMAGE_BASE_URL}${event.extendedProps.image}`}
              alt={event.title}
              className='image-preview rounded'
              style={{width: '60px', height: '60px', objectFit: 'cover'}}
            />
          </div>
          <div className='event-details '>
            <div className='event-title h5 font-medium'>{event.title}</div>
            <div className='font-normal'>
              {event.extendedProps.tagId != 0 ? event.extendedProps.tagId : 'No Tag'}
            </div>
            <div className='font-normal'>{event.extendedProps.label}</div>
            <div className='flex'>
              <div className='font-normal'>{event.extendedProps.vin}</div>
              <div className='icon-content'>{iconTemplate(event.extendedProps.etatenginname)}</div>
            </div>
          </div>
          <div className='tag-content'>{tagTemplate(event.extendedProps)}</div>
        </div>
      </>
    )
  }

  const worksitelistMap = () => {
    if (!Array.isArray(enginesData)) return {}
    return enginesData.reduce((acc, worksite) => {
      acc[worksite.id.toString()] = worksite
      return acc
    }, {})
  }

  const handlePrevClick = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.prev()
  }

  // Custom handler for the "next" button
  const handleNextClick = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.next()
  }

  const updatedWorksiteListEvents = engineEventsData.map((event) => ({
    ...event,
    image: worksitelistMap[event.resourceId]?.image,
    cost: worksitelistMap[event.resourceId]?.cost,
    tagId: worksitelistMap[event.resourceId]?.tagId,
    status: worksitelistMap[event.resourceId]?.statuslabel,
    statusColor: worksitelistMap[event.resourceId]?.statusColor,
    statusbgColor: worksitelistMap[event.resourceId]?.statusbgColor,
    currency: worksitelistMap[event.resourceId]?.currency,
    etatenginname: worksitelistMap[event.resourceId]?.etatenginname,
    label: worksitelistMap[event.resourceId]?.label,
    vin: worksitelistMap[event.resourceId]?.vin,
  }))

  const renderRessources = [
    {
      field: 'title',
      headerContent: 'Nom du chantier',
      cellContent: (r) => {
        return <strong>{r.fieldValue}</strong>
      },
    },
  ]

  useEffect(() => {
    setLoading(true)
    dispatch(fetchEngines({LocationObject: 'worksiteEvents', LocationID: selectedSite.id}))
    dispatch(fetchEngineEvents({LocationObject: 'worksite', LocationID: selectedSite.id})).then(
      ({payload}) => {
        if (payload) {
          setLoading(false)
        }
      }
    )
  }, [])

  return (
    <>
      <div>
        <Button icon='pi pi-angle-left' onClick={handlePrevClick}></Button>
        <Button className='ml-2' icon='pi pi-angle-right' onClick={handleNextClick}></Button>
        <SplitButton
          icon='pi pi-calendar'
          className='ml-2'
          model={[
            {label: '1 jour', command: () => setDaysDisplay(1)},
            {label: '2 jours', command: () => setDaysDisplay(2)},
            {label: '5 jours', command: () => setDaysDisplay(5)},
            {label: '10 jours', command: () => setDaysDisplay(10)},
          ]}
          onClick={() => setDaysDisplay(1)}
        ></SplitButton>
      </div>
      {!loading ? (
        <FullCalendar
          ref={calendarRef}
          eventBackgroundColor='#67529D'
          eventBorderColor='#FFFFFF'
          plugins={[timelineGridPlugin]}
          height={'800px'}
          headerToolbar={{
            left: '',
            center: 'title',
            right: 'resourceTimelineTenDays',
          }}
          initialView={'resourceTimelineTenDays'}
          views={{
            resourceTimelineTenDays: {
              type: 'resourceTimeline',
              duration: {days: daysDisplay},
              buttonText: `${daysDisplay} days`,
              buttonClass: 'p-link',
              buttonDisabled: true,
            },
          }}
          resources={enginesData}
          resourceAreaWidth={'13.5%'}
          resourceAreaColumns={renderRessources}
          events={engineEventsData}
          eventContent={(r) => {
            return (
              <div
                style={{height: '30px'}}
                className='p-2 w-12 w-12 flex align-items-center justify-content-end  fc-event-title-container  shadow-2 bg-green-600 text-white text-end'
                title={r.event._def.title}
              >
                <span> {r.event._def.title}</span>
              </div>
            )
          }}
          stickyFooterScrollbar={true}
          locales={[frLocal]}
          locale='fr'
        />
      ) : (
        <div>loading...</div>
      )}
    </>
  )
}

export default CalendarViewSite
