import {Checkbox} from 'primereact/checkbox'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useState} from 'react'
import {InputText} from 'primereact/inputtext'
import {Divider} from 'primereact/divider'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getListRapport,
  getListSelected,
  getLoadingRpt,
  getSelectedRapport,
  setListRapport,
  setListSelected,
} from '../../slice/rapports.slice'
import {ProgressSpinner} from 'primereact/progressspinner'
import {ScrollPanel} from 'primereact/scrollpanel'

const ListEngRpt = ({style}) => {
  const [checked, setChecked] = useState(false)
  const [value, setValue] = useState('')
  const [engin, setEngin] = useState([])

  const selectedRapport = useAppSelector(getSelectedRapport)
  const list = useAppSelector(getListRapport)
  const loadingRpt = useAppSelector(getLoadingRpt)
  const listSelected = useAppSelector(getListSelected)

  const dispatch = useAppDispatch()

  const onIngredientsChange = (e) => {
    if (selectedRapport?.decs === 'engin') {
      let _ingredients = [...listSelected]

      let obj = {uid: e.value}
      let index = _ingredients.findIndex((item) => item.uid === e.value)

      if (e.checked && index === -1) {
        _ingredients.push(obj)
      } else if (!e.checked && index !== -1) {
        _ingredients.splice(index, 1)
      }
      dispatch(setListSelected(_ingredients))
    } else {
      let _ingredients = [...listSelected]
      let obj = {uid: e.value}
      let index = _ingredients.findIndex((item) => item.uid === e.value)
      if (e.checked && index === -1) {
        _ingredients.push(obj)
      } else if (!e.checked && index !== -1) {
        _ingredients.splice(index, 1)
      }

      dispatch(setListSelected(_ingredients))
    }
  }

  const clearList = () => {
    setEngin([])
    dispatch(setListSelected([]))
    setValue('')
  }

  const choseAll = (e) => {
    setChecked(e.checked)
    let _ingredients = [...engin]
    if (e.checked) {
      if (selectedRapport?.decs === 'engin') {
        list?.forEach((i) => _ingredients.push({uid: i?.uid}))
      } else {
        list?.forEach((i) => _ingredients.push({uid: i?.name}))
      }
    } else _ingredients = []
    dispatch(setListSelected(_ingredients))
  }

  return (
    <div className='w-20rem lg:w-25rem xl:w-30rem md:w-25rem' style={style}>
      <div
        style={{backgroundColor: 'rgba(82, 63, 141, 0.7)'}}
        className='flex flex-row  align-items-center w-full h-3rem text-lg'
      >
        <div className='text-xl font-semibold text-white pl-2'>
          <OlangItem olang={selectedRapport?.title} />
        </div>
        <i className='fas fa-duotone fa-arrow-pointer text-3xl text-white pl-3'></i>
      </div>
      <div className='p-2 bg-white border-bottom-2 border-gray-300'>
        <InputText
          className='w-full'
          placeholder='Search...'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className='flex flex-row bg-white p-2'>
        <Checkbox onChange={(e) => choseAll(e)} checked={checked}></Checkbox>
        <div className='text-lg pl-2'>
          <OlangItem olang='slctAll' />
        </div>
      </div>
      <Divider align='left'>
        <div className='inline-flex align-items-center '>
          <i className={`fas fa-duotone ${selectedRapport?.icon} mr-2 text-xl text-blue-300`}></i>
          <b>{selectedRapport?.decs || null}</b>
        </div>
      </Divider>
      <ScrollPanel className='bg-white' style={{height: '65%'}}>
        <div>
          {!loadingRpt && list?.length > 0 ? (
            list
              ?.filter((item) =>
                (item?.reference || item?.label)?.toLowerCase().includes(value?.toLowerCase())
              )
              ?.map((item) => (
                <div className='flex flex-row bg-white p-2 border-bottom-2 border-gray-200'>
                  <Checkbox
                    value={item?.uid || item?.name}
                    name={item?.reference || item?.name}
                    onChange={(e) => onIngredientsChange(e)}
                    checked={listSelected?.some(
                      (ingredient) =>
                        (ingredient?.uid || ingredient?.name) === (item?.uid || item?.name)
                    )}
                  />
                  <div className='text-lg pl-2'>{item?.reference || item?.label}</div>
                </div>
              ))
          ) : (
            <div className='flex bg-white w-full justify-content-center align-items-center'>
              <ProgressSpinner
                style={{width: '50px', height: '50px'}}
                strokeWidth='4'
                fill='var(--surface-ground)'
                animationDuration='1s'
              />
            </div>
          )}
        </div>
      </ScrollPanel>
    </div>
  )
}

export default ListEngRpt
