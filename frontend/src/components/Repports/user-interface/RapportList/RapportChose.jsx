import React from 'react'
import {
  fetchListRapport,
  setChoseRapport,
  setLoadingRpt,
  setSelectedRapport,
  setShowSettingRapport,
} from '../../slice/rapports.slice'
import {useDispatch} from 'react-redux'
import {useAppDispatch} from '../../../../hooks'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Divider} from 'primereact/divider'

const RapportChose = ({}) => {
  const dispatch = useAppDispatch()

  const selectReport = (value) => {
    dispatch(setLoadingRpt(true))
    dispatch(setSelectedRapport({title: value.title, icon: value.icon, decs: value.decs}))
    dispatch(fetchListRapport(value.decs)).then(() => dispatch(setShowSettingRapport(true)))
  }

  return (
    <div
      className='bg-gray-100 w-15rem lg:w-20rem xl:w-25rem md:w-20rem xs:w-full flex border-round-md relative flex-column'
      style={{
        // width: '20%',
        height: '80vh',
        boxShadow: '-8px 18px 21px -9px rgba(0,0,0,0.61)',
        WebkitBoxShadow: '-8px 18px 21px -9px rgba(0,0,0,0.61)',
        MozBoxShadow: '-8px 18px 21px -9px rgba(0,0,0,0.61)',
      }}
    >
      <div
        style={{backgroundColor: 'rgba(82, 63, 141, 0.7)'}}
        className='flex flex-row  align-items-center	 w-full h-4rem text-3xl'
      >
        <div
          onClick={() => {
            dispatch(setChoseRapport(false))
            dispatch(setShowSettingRapport(false))
          }}
          className='absolute cursor-pointer  px-3 py-2'
          style={{left: '2%'}}
        >
          <i class='fas fa-solid fa-caret-left hover:text-red-400 text-4xl text-white'></i>
        </div>
        <div className='w-full text-center'>
          <div className='pl-3 text-white text-xl font-semibold '>Rapports</div>
        </div>
      </div>
      <div className='flex flex-column w-full '>
        <div className='bg-gray-300 p-2 '>
          <div className='text-xl font-semibold'>
            <OlangItem olang='sltRapport' />
          </div>
        </div>
        <Divider />
        <div
          onClick={() => selectReport({title: 'engList', icon: 'fa-tractor', decs: 'engin'})}
          className='flex flex-row justify-content-between align-items-center bg-white hover:bg-gray-300 p-2 border-bottom-2 border-gray-300 cursor-pointer'
        >
          <div>
            <div className='text-xl font-semibold'>Engin</div>
            <div>
              <OlangItem olang='crtEng' />
            </div>
          </div>
          <i class='fas fa-light fa-square-plus text-4xl text-white'></i>
        </div>
        <div
          onClick={() => selectReport({title: 'siteList', icon: 'fa-map', decs: 'worksite'})}
          className='flex flex-row justify-content-between align-items-center bg-white hover:bg-gray-300 p-2 border-bottom-2 border-gray-300 cursor-pointer'
        >
          <div>
            <div className='text-xl font-semibold'>Worksite</div>
            <div>
              <OlangItem olang='crtSite' />
            </div>
          </div>
          <i class='fas fa-light fa-square-plus text-4xl text-white'></i>
        </div>
      </div>
    </div>
  )
}

export default RapportChose
