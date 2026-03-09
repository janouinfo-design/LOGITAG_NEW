import React from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {formateDate} from '../../../cors/utils/formateDate'
import { Badge } from 'primereact/badge'

const iconsMaping = {
  "mobile": "fa-duotone fa-duotone fa-solid fa-user",
  "gateway": "fa fa-signal-stream",
  "gps": "fa-duotone fa-location-crosshairs",
}
function CardHistory({
  seen,
  duration,
  state,
  iconStat,
  address,
  etatIcon,
  bgEtat,
  selected,
  site,
  dateFin,
  onDisplayGeo,
  item,
  enginState,
  herderDisplay,
}) {
  function truncateText(text) {
    const maxLength = 86
    if (text?.length > maxLength) {
      return text?.substring(0, maxLength) + '...'
    }
    return text
  }

  const dateEntree = (
    <div className='text-lg mt-2'>
      <OlangItem olang={'date.enter'} />:{' '}
      <strong>
        {enginState === 'exit' ? formateDate(item?.PeriodEnd) : formateDate(item?.PeriodStart)}
      </strong>
      <i
        className={`fas fa-duotone fa-solid fa-arrow-down-to-bracket font-bold text-xl text-green-500 ml-2`}
      ></i>
    </div>
  )

  const lastSeen = (
    <div className='text-lg mt-2'>
      <OlangItem olang='last.seen' />: <strong>{item?.lastSeenAt}</strong>
      <i className={`pi pi-eye text-xl text-blue-500 ml-2`}></i>
    </div>
  )

  const deviceNameTemplate = () => {
    
    if(item?.deviceName){
      return (
        <div className='text-lg mt-2 flex align-items-center gap-2'>
          <i className={`${iconsMaping[item.satMode] || 'pi-mobile'} text-xl text-gray-500`}></i>
          <div  className='text-sm text-gray-600 flex gap-1 align-items-center'>
            <span>{item.deviceName}</span>
            {item.rssi && <Badge  title="force du signal" value={item.rssi} severity="warning"></Badge>}
          </div>
        </div>
      )
    }
    return null
  }

  const dateExit = (
    <div className='text-lg mt-2'>
      <OlangItem olang='date.exit' />:{' '}
      <strong>
        {enginState === 'exit' ? formateDate(herderDisplay !== 'Positions' ? item?.PeriodStart : item?.PeriodStartIso) : formateDate(herderDisplay !== 'Positions' ? item?.PeriodEnd : item?.PeriodEndIso)}
      </strong>
      <i
        className={`fas fa-duotone fa-solid fa-arrow-up-from-bracket text-xl text-red-500 ml-2`}
      ></i>
    </div>
  )

  const datePos = (
    <div className='text-lg mt-2'>
      <OlangItem olang='date' />: <strong>{formateDate(herderDisplay !== 'Positions' ? item?.PeriodStart : item?.PeriodStartIso)}</strong>
      {/* <i className={`pi pi-eye text-xl text-blue-500 ml-2`}></i> */}
    </div>
  )

  return (
    <div
      style={{
        minHeight: '150px',
        width: '100%',
        backgroundColor: selected ? 'rgba(15, 163, 177, 0.5)' : 'white',
      }}
      className='cursor-pointer my-1 hover:bg-blue-200 hover:shadow-4 border-round-lg relative shadow-1 p-2 flex flex-row justify-content-between'
    >
      <div className='flex flex-1 w-11'>
        <div className='flex flex-1 flex-column justify-content-center'>
          <div
            style={{
              display: 'flex',
              flexDirection: enginState === 'exit' ? 'column-reverse' : 'column',
            }}
          >
            {herderDisplay !== 'Positions' ? (
              <>
                {enginState === 'exit' && dateFin == 0 ? dateExit : dateFin == 1 ? dateExit : null}
                {enginState === 'reception' && dateFin == 0
                  ? dateEntree
                  : dateFin == 1
                  ? dateEntree
                  : null}
              </>
            ) : (
              datePos
            )}
          </div>
          <div className='text-lg mt-2'>
            <OlangItem olang='Duration' />: <strong>{item?.DurationFormatted || duration}</strong>
          </div>
          {enginState !== 'exit' && (
            <div className='text-lg flex flex-row align-items-center mt-2 z-5 hover:pl-5'>
              <OlangItem olang='Site' />:
              <strong className='ml-2'>{item?.locationName || item?.worksiteLabel}</strong>
              <i class='fas fa-duotone fa-map-location-dot text-xl text-blue-500 ml-2'></i>
            </div>
          )}
          {item?.address ||
            (item?.enginAddress && (
              <div className='mt-2 flex items-center'>
                <i className='fas fa-location-dot text-green-500 text-2xl mr-2'></i>
                <span
                  className='flex-grow text-lg font-semibold text-gray-700 truncate'
                  style={{
                    maxWidth: '250px',
                  }}
                >
                  <strong>
                    {truncateText(item?.address || item?.enginAddress) || 'No address found'}
                  </strong>
                </span>
              </div>
            ))}

            <div>
              {deviceNameTemplate()}
            </div>
        </div>
      </div>
      <div
        style={{
          width: '50px',
          height: '50px',
          right: '10px',
          top: '10px',
          backgroundColor: '#edf6f9',
        }}
        className='border-circle border-1 border-green-500 absolute flex justify-content-center align-items-center'
      >
        <i
          style={{color: dateFin == 0 ? 'gray' : bgEtat}}
          className={`fas fa-duotone fa-solid ${etatIcon} ${
            dateFin == 0 ? 'fa-beat' : ''
          } text-3xl`}
        ></i>
      </div>
      {enginState !== 'exit' && (
        <div
          style={{
            width: '50px',
            height: '50px',
            right: '10px',
            top: '40%',
            zIndex: 10,
            backgroundColor: '#edf6f9',
          }}
          onClick={onDisplayGeo}
          className='border-circle hover:shadow-4 hover-scale border-1 border-green-500 absolute flex justify-content-center align-items-center'
        >
          <i className='fas fa-duotone fa-map-location-dot text-3xl text-blue-500'></i>
        </div>
      )}

      
    </div>
  )
}

export default CardHistory
