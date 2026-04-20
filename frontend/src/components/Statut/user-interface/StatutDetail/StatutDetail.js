import {InputText} from 'primereact/inputtext'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {
  createOrUpdateFamille,
  fetchIcons,
  getEditFamille,
  getExistItem,
  getIcons,
  getSelectedFamille,
  setEditFamille,
  setExistItem,
  setShow,
} from '../../slice/statut.slice'
import {useDispatch} from 'react-redux'
import _ from 'lodash'
import {useEffect, useState} from 'react'
import {useAppSelector} from '../../../../hooks'
import {setSelectedFamille} from '../../slice/statut.slice'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {ColorPicker} from 'primereact/colorpicker'
import IconDropdown from '../../../shared/IconDropdown/IconDropdown'
import {Message} from 'primereact/message'
import PrimaryActionButton from '../../../shared/PrimaryActionButton/PrimaryActionButton'

const StatutDetail = () => {
  const dispatch = useDispatch()
  const [isValid, setIsValid] = useState(true)
  const selectedFamille = useAppSelector(getSelectedFamille)
  const _validators = useSelector(getValidator)
  const validators = [
    {id: 'label', label: 'label', isRequired: 1, active: 1, isEdit: 1, min: 0, max: 100, regExp: '^(?!\\s*$).+', messageError: 'required'},
  ]
  const [color, setColor] = useState(selectedFamille?.bgColor)
  const icons = useAppSelector(getIcons)
  const [selectedIcon, setSelectedIcon] = useState(selectedFamille?.icon)
  const existItem = useAppSelector(getExistItem)

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedFamille)
    old = {...old, color, bgColor: color, [e.target.name]: e.target.value}
    dispatch(setSelectedFamille(old))
    const allFilled = validators.filter((v) => v.isRequired).every((v) => !!old[v.id])
    setIsValid(!allFilled)
  }

  useEffect(() => {
    if (existItem) setTimeout(() => dispatch(setExistItem(false)), 3000)
  }, [existItem])

  const onHide = () => dispatch(setShow(true))

  const save = () => {
    const obj = {...selectedFamille, color, bgColor: color, icon: selectedIcon}
    dispatch(createOrUpdateFamille(obj)).then((res) => {
      if (res.payload) {
        dispatch(setShow(true))
        dispatch(setEditFamille(false))
      }
    })
  }

  const checkValidators = () => {
    const allFilled = validators.filter((v) => v.isRequired).every((v) => !!selectedFamille[v.id])
    setIsValid(!allFilled)
  }

  const _labelValidator = validators?.find((f) => f.id === 'label')

  useEffect(() => { dispatch(fetchIcons()) }, [])

  const effectiveColor = color || selectedFamille?.bgColor || ''
  const bg = effectiveColor ? (effectiveColor.startsWith('#') ? effectiveColor : `#${effectiveColor}`) : '#E0E7FF'
  const effectiveIcon = selectedIcon || selectedFamille?.icon

  return (
    <div className='lt-page' data-testid="statut-detail-page">
      {/* ── Premium Header ── */}
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <button className='lt-back-btn' onClick={onHide}><i className='pi pi-arrow-left'></i><span style={{fontSize: '0.78rem', fontWeight: 600, color: '#475569'}}>Retour</span></button>
          <div className='lt-detail-avatar'>
            <div className='lt-detail-avatar-ph' style={{background: bg, color: '#fff'}}>
              <i className={effectiveIcon || 'pi pi-circle'}></i>
            </div>
          </div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>{selectedFamille?.label || 'Statut'}</h2>
            <div className='lt-detail-meta'>
              <span className='lt-badge lt-badge-info'><i className='pi pi-circle' style={{fontSize: '0.5rem'}}></i>Statut engin</span>
              {bg && <span className='lt-badge lt-badge-neutral'><span className='lt-badge-dot' style={{background: bg}}></span>{bg.toUpperCase()}</span>}
            </div>
          </div>
        </div>
        <div className='lt-detail-actions-group'>
          <PrimaryActionButton type="edit" onClick={save} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className='lt-detail-tabs'>
        <TabView className='lt-tabview'>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-info-circle'></i><OlangItem olang='Famille.Info' /></span>}>
            {existItem && <div style={{marginBottom: 12}}><Message severity='error' text='Exist' /></div>}
            <div className='lt-detail-grid' style={{display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '24px', alignItems: 'start'}}>
              <div className='lt-detail-form'>
                <div className='lt-form-section'>
                  <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Identité</h4>
                  <div className='lt-form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className='lt-form-field lt-form-field--full'>
                      <label className='lt-form-label' htmlFor='label'>
                        <OlangItem olang='famille.label' /> {_labelValidator?.isRequired == 1 && <span className='lt-required'>*</span>}
                      </label>
                      <InputText
                        name='label'
                        id='label'
                        onChange={onInputChange}
                        value={selectedFamille?.label || ''}
                        className='lt-form-input'
                      />
                    </div>
                    <div className='lt-form-field lt-form-field--full'>
                      <label className='lt-form-label'>Icône</label>
                      <IconDropdown
                        filter={true}
                        filterBy={'name'}
                        data={icons}
                        selectedIcon={selectedIcon != '' ? selectedIcon : selectedFamille?.icon}
                        setSelectedIcon={(e) => {
                          setSelectedIcon(e)
                          checkValidators()
                        }}
                      />
                    </div>
                    <div className='lt-form-field lt-form-field--full'>
                      <label className='lt-form-label' htmlFor='color'><OlangItem olang='famille.color' /></label>
                      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <ColorPicker
                          value={(selectedFamille?.bgColor || '').replace('#', '')}
                          onChange={(e) => {
                            setColor(e.value)
                            checkValidators()
                          }}
                        />
                        <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#64748B'}}>{bg.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Sidebar */}
              <div className='lt-detail-side'>
                <div className='lt-sidebar-card' style={{background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}}>
                  <div className='lt-sidebar-card-head' style={{padding: '12px 16px', fontFamily: 'Manrope, sans-serif', fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>Aperçu</div>
                  <div className='lt-sidebar-card-body' style={{padding: '8px 16px 12px 16px', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0'}}>
                      <div style={{width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem'}}>
                        <i className={effectiveIcon || 'pi pi-circle'}></i>
                      </div>
                      <div>
                        <div style={{fontWeight: 700, color: '#0F172A'}}>{selectedFamille?.label || '—'}</div>
                        <div style={{fontSize: '0.75rem', color: '#64748B'}}>Statut engin</div>
                      </div>
                    </div>
                    <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Couleur</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{bg.toUpperCase()}</span></div>
                    <div className='lt-sidebar-row' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', fontSize: '0.8rem', borderBottom: '1px solid #F8FAFC', gap: 12}}><span className='lt-sidebar-row-label' style={{color: '#64748B', fontWeight: 500, fontSize: '0.76rem'}}>Icône</span><span className='lt-sidebar-row-val' style={{color: '#0F172A', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right'}}>{effectiveIcon || '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  )
}

export default StatutDetail
