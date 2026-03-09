import React from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './Card'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../shared/ButtonComponent/ButtonComponent'
import {Button} from 'primereact/button'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import CardStatus from './CardStatus'

const HeaderChoose = ({
  title,
  selectedValue,
  items,
  onSearch,
  loadingBtn,
  onChangeDropdown,
  optionValue,
  optionLabel,
  showDetail = false,
  description,
  children,
  openFacValue,
  cAffireValue,
  prestValue,
}) => {
  return (
    <div className='space-y-3'>
      <Card className=' border-gray-300 border-2 drop-shadow-none rounded-3xl'>
        <div className='mt-5 ml-5'>
          <h1 className='text-2xl font-semibold text-gray-800'>
            <OlangItem olang={title} />
          </h1>
        </div>
        <CardContent>
          <div className='flex gap-3'>
            <div className='flex flex-row gap-3 items-end w-full'>
              <div style={{width: children ? '40%' : '60%'}}>
                <Dropdown
                  placeholder='Selectionnez'
                  className='h-3rem flex-1 items-center w-full rounded-2xl'
                  value={selectedValue}
                  filter
                  optionValue={optionValue}
                  optionLabel={optionLabel}
                  options={items}
                  onChange={(e) => onChangeDropdown(e.value)}
                  onKeyDown={(event) => event.key === 'Enter' && onSearch()}
                />
              </div>
              {children && <div className='flex flex-row gap-3 items-center'>{children}</div>}
              <ButtonComponent
                onClick={onSearch}
                icon='pi pi-search text-xl text-gray-800'
                className='w-3rem'
                loading={loadingBtn}
                disabled={!selectedValue || loadingBtn}
                text
                rounded
              />
            </div>
            {showDetail && (
              <>
                <CardStatus
                  icon={'fa-solid fa-file-invoice'}
                  iconColor={'text-gray-400'}
                  desc={'Factures.overt'}
                  backgroundColor={'#fff4de'}
                  value={openFacValue}
                />
                <CardStatus
                  icon={'fa-solid fa-money-bill-trend-up'}
                  iconColor={'text-green-600'}
                  desc={'C.Affaire'}
                  backgroundColor={'#c9f7f5'}
                  value={cAffireValue}
                />
                <CardStatus
                  icon={'fa-light fa-receipt'}
                  iconColor={'text-blue-600'}
                  desc={'Prestations.overt'}
                  backgroundColor={'#f8f9fa'}
                  value={prestValue}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HeaderChoose
