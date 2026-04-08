import {Checkbox} from 'primereact/checkbox'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getListRapport,
  getListSelected,
  getLoadingRpt,
  getSelectedRapport,
  setListSelected,
} from '../../slice/rapports.slice'
import {ProgressSpinner} from 'primereact/progressspinner'

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

  const choseAll = (e) => {
    setChecked(e.checked)
    let _ingredients = []
    if (e.checked) {
      if (selectedRapport?.decs === 'engin') {
        list?.forEach((i) => _ingredients.push({uid: i?.uid}))
      } else {
        list?.forEach((i) => _ingredients.push({uid: i?.name}))
      }
    }
    dispatch(setListSelected(_ingredients))
  }

  const filteredList = list?.filter((item) =>
    (item?.reference || item?.label || item?.name)?.toLowerCase().includes(value?.toLowerCase())
  )

  return (
    <div className='lt-rpt-list-panel' data-testid="rapport-list-panel">
      <div className='lt-rpt-list-panel-header'>
        <i className={selectedRapport?.decs === 'engin' ? 'pi pi-box' : 'pi pi-building'} style={{fontSize: '0.9rem'}}></i>
        <span><OlangItem olang={selectedRapport?.title} /></span>
        <span className='lt-rpt-list-count'>{listSelected.length}/{list?.length || 0}</span>
      </div>

      {/* Search */}
      <div style={{padding: '10px 14px', borderBottom: '1px solid var(--lt-border)'}}>
        <div className='lt-timeline-search'>
          <i className='pi pi-search' style={{fontSize: '0.8rem', color: 'var(--lt-text-muted)'}}></i>
          <input
            type='text'
            placeholder='Rechercher...'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className='lt-timeline-search-input'
            data-testid="rapport-search"
          />
          {value && <i className='pi pi-times-circle' style={{cursor: 'pointer', color: 'var(--lt-text-muted)', fontSize: '0.8rem'}} onClick={() => setValue('')} />}
        </div>
      </div>

      {/* Select All */}
      <div className='lt-rpt-select-all' data-testid="rapport-select-all">
        <Checkbox onChange={(e) => choseAll(e)} checked={checked} />
        <span>Tout sélectionner</span>
      </div>

      {/* List */}
      <div className='lt-rpt-items-scroll'>
        {!loadingRpt && filteredList?.length > 0 ? (
          filteredList.map((item, idx) => (
            <div key={idx} className='lt-rpt-check-item' data-testid="rapport-check-item">
              <Checkbox
                value={item?.uid || item?.name}
                name={item?.reference || item?.name}
                onChange={(e) => onIngredientsChange(e)}
                checked={listSelected?.some(
                  (sel) => (sel?.uid || sel?.name) === (item?.uid || item?.name)
                )}
              />
              <span className='lt-rpt-check-label'>{item?.reference || item?.label || item?.name}</span>
            </div>
          ))
        ) : (
          <div style={{display: 'flex', justifyContent: 'center', padding: '40px 0'}}>
            {loadingRpt ? (
              <ProgressSpinner style={{width: '40px', height: '40px'}} />
            ) : (
              <span style={{color: 'var(--lt-text-muted)', fontSize: '0.82rem'}}>Aucun élément</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListEngRpt
