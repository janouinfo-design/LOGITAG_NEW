import {memo, useEffect, useState} from 'react'
import {useAppSelector} from '../../../../hooks/index'
import {
  fetchVehicles,
  getHistoryTag,
  getNewTags,
  getSelectedVehicle,
  getVehicles,
} from '../../slice/vehicle.slice'
import {Carousel} from 'primereact/carousel'
import {
  fetchTags,
  fetchTagsFree,
  fetchTagsWithEngin,
  getEnginTags,
  getTags,
} from '../../../Tag/slice/tag.slice'
function VehicleInfoSlider({markerShow}) {
  const vhInfo = useAppSelector(getSelectedVehicle)
  let vehicles = useAppSelector(getTags)
  let selectedVehicle = useAppSelector(getSelectedVehicle)
  let historyTag = useAppSelector(getHistoryTag)

  const [vehicleInfo, setVehicleInfos] = useState([])
  const [vsh, setVsh] = useState([])
  const [show, setShow] = useState(true)

  useEffect(() => {
    fetchTagsFree()
  }, [])


  const template = (t) => {
    const descrip = () => {
      if (Array.isArray(t.description)) {
        return t.description.map((hst) => {
          return (
            <div className='flex justify-content-around'>
              <p>{hst.dateHistorique}</p>
              <span>{hst.timeHistorique}</span>
            </div>
          )
        })
      } else return <div>{t.description}</div>
    }
    return (
      <div
        className='p-3 pt-0 border-right-1 border-gray-400 cursor-pointer hover:bg-danger'
        style={{minHeight: '150px'}}
      >
        <div className='text-right'>
          <i className='pi pi-times-circle' onClick={() => removeFromList(t.id)}></i>
        </div>
        <h6 className='bg-blue-700 p-2 text-white'>{t.title}</h6>
        <div className='flex flex-column'>
          <div className='m-2 flex flex-column font-semibold text-lg'>{descrip()}</div>
        </div>
      </div>
    )
  }

  const responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 4,
    },
    {
      breakpoint: '760px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '580px',
      numVisible: 1,
      numScroll: 1,
    },
  ]


  const _setVehicleInfos = () => {
    const infoData = JSON.parse(selectedVehicle?.info)
    const historyInfo = JSON.parse(historyTag?.[0]?.historique)

    const updatedInfos = [
      {
        title: 'Last Seen',
        description: historyInfo,
      },
      ...infoData.map((info, index) => ({id: info.id, ...info})),
    ]
    setVehicleInfos(updatedInfos)
    setShow(true)
  }

  const removeFromList = (id) => setVehicleInfos((o) => o.filter((v) => v.id != id))

  useEffect(() => {
    if (vhInfo) {
      setTimeout(() => {
        _setVehicleInfos()
      }, 2)
    } else {
      setVehicleInfos([])
    }
  }, [historyTag])

  return vehicleInfo?.length && vhInfo ? (
    <div style={{background: 'transparent'}}>
      <span
        className='pi pi-info-circle text-yellow-600 text-4xl'
        onClick={() => setShow((old) => !old)}
      ></span>
      {show ? (
        <Carousel
          className='bg-white'
          numVisible={4}
          numScroll={4}
          value={vehicleInfo}
          itemTemplate={template}
          responsiveOptions={responsiveOptions}
        />
      ) : null}
    </div>
  ) : null
}

export default memo(VehicleInfoSlider)
