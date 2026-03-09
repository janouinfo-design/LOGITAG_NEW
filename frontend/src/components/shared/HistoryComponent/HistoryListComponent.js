import {Chip, Checkbox, Button} from 'primereact'

import {useEffect, useState, memo, useRef} from 'react'

import {InputText} from 'primereact/inputtext'

import {ProgressSpinner} from 'primereact/progressspinner'
import {Ripple} from 'primereact/ripple'
import {ConfirmDialog} from 'primereact/confirmdialog'
import {Toast} from 'primereact/toast'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem'
import SateliteDataCard from '../SateliteDataCard/SateliteDataCard'
import CardHistory from '../../Engin/EnginDetail/CardHistory'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getGeoByIdGeo,
  getGeoByIdSite,
  getParamCardHis,
  getSelectedEngine,
  getSelectedHistory,
  setGeoByIdSite,
  setParamCadHis,
} from '../../Engin/slice/engin.slice'
import {Divider} from 'primereact/divider'

const HistoryListComponent = (props) => {
  const toast = useRef(null)

  const [filterText, setFilterText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedHisto = useAppSelector(getSelectedHistory)
  const paramList = useAppSelector(getParamCardHis)
  const selectedEng = useAppSelector(getSelectedEngine)

  const dispatch = useAppDispatch()

  const filter = (val) => {
    setFilterText(val)
  }

  const hidList = () => {
    dispatch(setParamCadHis({showList: false}))
  }

  const showList = () => {
    dispatch(setParamCadHis({showList: true}))
  }

  const getGeo = (item) => {
    // if (item?.locationGeometry) {
    //   dispatch(setGeoByIdSite(item?.locationGeometry))
    // }
    if (item?.geofenceID) {
      dispatch(getGeoByIdGeo({id: item?.geofenceID}))
      return
    }
    dispatch(getGeoByIdSite(item?.worksiteId))
  }



  return (
    <>
      {paramList?.showList ? (
        <div
          style={{height: '65vh'}}
          className='bg-gray-50 p-2 border-round-md border-1 border-gray-300  w-full scalein animation-duration-1000'
        >
          <div className='w-full flex p-2 flex-row justify-content-between align-items-center'>
            <div className='text-xl font-semibold text-gray-500'>{paramList.title}</div>
            <i
              onClick={hidList}
              className='fas bg-white border-circle p-2 border-1 border-red-400 cursor-pointer hover:bg-red-100 fa-regular fa-arrow-down-left-and-arrow-up-right-to-center text-red-400 text-lg'
            ></i>
          </div>

          <Divider style={{width: '100%', marginBottom: '10px', marginTop: '10px'}} />
          {isLoading ? (
            <ProgressSpinner
              style={{width: '50px', height: '50px', margin: 'auto', display: 'block'}}
            />
          ) : props.allGeo?.length === 0 ? (
            <strong className='text-muted'>
              <OlangItem olang='No.Data' />
            </strong>
          ) : (
            <div>
              <Toast ref={toast} />
              <ConfirmDialog />
              {!props.history && props?.allGeo?.length > 1 && (
                <div className='p-input-icon-left p-input-icon-right w-full'>
                  <i className='pi pi-search' />
                  <InputText
                    className=' w-full'
                    placeholder='Locations...'
                    value={filterText}
                    onChange={(e) => filter(e.target.value)}
                  />
                  <i className='pi pi-times-circle' onClick={() => setFilterText('')} />
                </div>
              )}

              <div
                className='flex flex-column align-items-center'
                style={{maxHeight: '55vh', overflow: 'auto'}}
              >
                {props.allGeo?.length > 0 &&
                  props.allGeo?.map((o, index) => (
                    <div
                      className='w-full px-2'
                      onClick={() => {
                        props.handleOnClickLayer(o, index)
                      }}
                      key={o.id}
                    >
                      <CardHistory
                        item={o}
                        state={o.etatLabel}
                        address={o.enginAddress}
                        seen={o.PeriodEnd}
                        duration={o.DurationFormatted || '---'}
                        etatIcon={o.iconName}
                        bgEtat={o.bgColor}
                        iconStat={o.etatIconName}
                        site={o.worksiteLabel}
                        selected={selectedHisto === index}
                        dateFin={o.dateFin}
                        onDisplayGeo={() => getGeo(o)}
                        enginState={o?.etatenginname}
                        herderDisplay={paramList?.title}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='w-full flex flex-row justify-content-end align-items-center'>
          <i
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#D64B70',
            }}
            onClick={showList}
            className='pi pi-align-right flex align-items-center justify-content-center border-2 text-center border-white border-circle cursor-pointer text-white text-xl'
          />
        </div>
      )}
    </>
  )
}

export default memo(HistoryListComponent)
