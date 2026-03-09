import {memo, useEffect, useState} from 'react'
import randomcolor from 'randomcolor'

import {InputText} from 'primereact/inputtext'
import {
  fetchHistoricalTag,
  getHistoryTag,
  getIsLoading,
  getNewTags,
  getVehicles,
  setIsLoading,
  setNewTags,
  setSelectedVehicle,
  setSelectedVehicleId,
} from '../../slice/vehicle.slice'
import {useAppSelector, useAppDispatch} from '../../../../hooks'
import {
  fetchTags,
  fetchTagsFree,
  fetchTagsWithEngin,
  getEnginTags,
  getTags,
  getTagsFree,
} from '../../../Tag/slice/tag.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchTrackerList,
  getHashs,
  getTrackerList,
  getUserAuth,
  setSelectedTracker,
} from '../../../Navigxy/slice/navixy.slice'
import {ProgressSpinner} from 'primereact/progressspinner'

function VehicleList() {
  const [filterText, setFilterText] = useState('')

  let listTracker = useAppSelector(getTrackerList)
  let newTags = useAppSelector(getNewTags)
  let hash = useAppSelector(getHashs)
  let tags = useAppSelector(getTagsFree)
  let tagEngine = useAppSelector(getEnginTags)
  let historyTag = useAppSelector(getHistoryTag)
  let isLoading = useAppSelector(getIsLoading)


  const minLat = 45.8177
  const maxLat = 47.8084
  const minLng = 5.9559
  const maxLng = 10.4921

  const getRandomLat = () => {
    return Math.random() * (maxLat - minLat) + minLat
  }

  const getRandomLng = () => {
    return Math.random() * (maxLng - minLng) + minLng
  }

  useEffect(() => {
    if (tags.length > 0) {
      const TagsWithLatLng = tags?.map((tag) => ({
        ...tag,
        lat: getRandomLat(),
        lng: getRandomLng(),
      }))
      dispatch(setNewTags(TagsWithLatLng))
    }
  }, [tags])

  const dispatch = useAppDispatch()

  const onLayerClicked = (id) => {
    dispatch(setSelectedVehicleId(id))
  }

  const handleSelected = (o) => {
    dispatch(setIsLoading(true))
    dispatch(setSelectedVehicle(o))
    // dispatch(fetchHistoricalTag(o?.id)).then((res) => {
    //   if (res?.meta?.requestStatus === 'fulfilled') {
    //     dispatch(setIsLoading(false))
    //     const jsonParse = JSON.parse(historyTag?.[0]?.historique)
    //   }
    // })
  }

  const filter = (val) => {
    setFilterText(val)
  }

  useEffect(() => {
    dispatch(fetchTagsFree())
    dispatch(fetchTagsWithEngin(0))
  }, [])

  return (
    <>
      {isLoading ? (
        <ProgressSpinner
          style={{width: '30px', height: '30px', margin: '0 auto'}}
          strokeWidth='2'
          fill='var(--surface-ground)'
          animationDuration='.5s'
        />
      ) : tags.length == 0 ? (
        <strong className='text-muted'>Aucun vehicule enregistré</strong>
      ) : (
        <div>
          {
            <div className='p-input-icon-left p-input-icon-right w-full'>
              <i className='pi pi-search' />
              <InputText
                className=' w-full'
                placeholder='Matricule...'
                value={filterText}
                onChange={(e) => filter(e.target.value)}
              />
              <i className='pi pi-times-circle' onClick={() => setFilterText('')} />
            </div>
          }
          <div className='' style={{maxHeight: '50vh', overflow: 'auto'}}>
            <div className='text-center p-2'>
              <OlangItem olang='Tag.unrelated' />
            </div>
            {tags
              ?.filter((o) => !filterText || new RegExp(`/${filterText}/gi`).test(o.label))
              .map((o) => (
                <div
                  key={o?.id}
                  className='border-bottom flex gap-2 p-2  justify-content-between hover:bg-gray-100 cursor-pointer'
                  style={{borderLeft: `3px solid`}}
                  onClick={() => dispatch(setSelectedTracker(o))}
                >
                  <div className=' flex gap-2' style={{maxWidth: '90%'}}>
                    <div style={{width: '100%'}}>
                      <h6>{o.name}</h6>
                    </div>
                  </div>
                  <div>
                    <i className='pi pi-info-circle' onClick={() => handleSelected(o)}></i>
                  </div>
                </div>
              ))}
            {tagEngine?.map((o) => (
              <div
                className='border-bottom flex gap-2 p-2  justify-content-between hover:bg-gray-100 cursor-pointer'
                style={{borderLeft: `3px ${o.statusColor} solid`}}
              >
                <div className=' flex gap-2' style={{maxWidth: '90%'}}>
                  <div style={{width: '100%'}}>
                    <h6>{o.enginName}</h6>
                  </div>
                </div>
                <div>
                  <i className='pi pi-info-circle' onClick={() => handleSelected(o)}></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
export default memo(VehicleList)

{
  /* .filter((o) => !filterText || new RegExp(`/${filterText}/gi`).test(o.label))
          .map((o) => (
            <div
              className='border-bottom flex gap-2 p-2  justify-content-between hover:bg-gray-100 cursor-pointer'
              style={{borderLeft: `3px ${o.color} solid`}}
            >
              <div className=' flex gap-2' style={{maxWidth: '90%'}}>
                <div style={{width: '100%'}}>
                  <h6>{o.label}</h6>
                  <p>{o.description}</p>
                </div>
              </div>
              <div>
                <i className='pi pi-info-circle' onClick={() => onLayerClicked(o.id)}></i>
              </div>
            </div>
          ))} */
}

//
