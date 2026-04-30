import {useEffect, useState, memo} from 'react'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {FileUploadeComponent} from '../../shared/FileUploaderComponent/FileUploadeComponent'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import {Dropdown} from 'primereact/dropdown'

import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateEngine,
  fetchEnginListHistory,
  fetchEngines,
  fetchStatusList,
  fetchTypesList,
  getEnginListHistory,
  getExistItem,
  getSelectedEngine,
  getSelectedTag,
  getStatusList,
  getTagEdit,
  seTagEdit,
  setEditTagEngin,
  setEditEngine,
  setSelectedEngine,
  setSelectedTag,
  setShow,
} from '../slice/engin.slice'
import _ from 'lodash'
import {Image} from 'primereact/image'
import {Button} from 'primereact/button'
import {
  createOrUpdateTag,
  fetchTags,
  fetchTagsWithEngin,
  getEnginTags,
  removeEnginTag,
  setSelectedTagToEngin,
} from '../../Tag/slice/tag.slice'
import {Chip} from 'primereact/chip'
import EditTag from './EditTag'
import {_removeEnginTag} from '../../Tag/api/api'
import CalendarViewEngin from './CalendarViewEngin'
import MapComponent from '../EnginDetail/MapComponent'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import L, {Icon} from 'leaflet'
import moment from 'moment'
import logoBlack from '../assets/LOGITAGBLACK.png'
import logoColor from '../assets/LOGITAGCMYK.png'
import {fetchFamilles, getFamilles} from '../../Famillies/slice/famille.slice'
import {EnginEditor} from '../EnginEditor/EnginEditor'
import {fetchValidator, getValidator} from '../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import EnginTagged from './EnginTagged'
import {setAlertParams} from '../../../store/slices/alert.slice'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {DrawerComponent} from '../../../_metronic/assets/ts/components'
import {
  fetchConversationList,
  setDetailChat,
} from '../../../_metronic/partials/layout/drawer-messenger/slice/Chat.slice'
import PrimaryActionButton from '../../shared/PrimaryActionButton/PrimaryActionButton'

const EnginDetail = () => {
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(true)
  const [disable, setDisable] = useState(false)
  const [tagsOption, setTagsOption] = useState([])
  const [imageChange, setImageChange] = useState(false)
  const [imageId, setImageId] = useState()
  const [selectFamille, setSelectFamille] = useState({})
  const [familleOptions, setfamilleOptions] = useState([])
  const [selectedFamilleEngin, setSelectedFamilleEngin] = useState(null)
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)

  const enginTags = useAppSelector(getEnginTags)
  const validators = useSelector(getValidator)
  const enginesHistory = useAppSelector(getEnginListHistory)
  const alreadyExist = useAppSelector(getExistItem)
  const selectedTag = useAppSelector(getSelectedTag)
  const editTag = useAppSelector(getTagEdit)
  const familles = useAppSelector(getFamilles)
  const selectedEngin = useAppSelector(getSelectedEngine)
  const statusList = useAppSelector(getStatusList)

  const dispatch = useAppDispatch()

  const customIcon = L.divIcon({
    className: 'lt-gps-pulse-marker',
    html: `
      <div class="lt-gps-pulse-ring"></div>
      <div class="lt-gps-pulse-ring lt-gps-pulse-ring--2"></div>
      <div class="lt-gps-pulse-dot">
        <i class="pi pi-map-marker"></i>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })

  const validateFields = (validators, old) => {
    let isValid = true
    validators.forEach((validator) => {
      const _regExp = new RegExp(validator.regExp.slice(1, -1))
      if (validator.isRequired && _regExp.test(old[validator.id]) === false) {
        isValid = false
      }
    })

    return isValid
  }

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedEngin)
    old = {
      ...old,
      imageid: imageId,
      [e.target.name]: e.target.value,
    }

    dispatch(setSelectedEngine(old))
    let isValid = validateFields(validators, old)
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])

    setIsNotValid(!areAllRequiredFieldsFilled || !isValid)
  }
  useEffect(() => {
    setInputs(selectedEngin || {})
  }, [selectedEngin])

  const onSave = async () => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedEngin?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
    dispatch(createOrUpdateEngine({imageId})).then((res) => {
      if (res.payload) {
        dispatch(fetchEngines({}))
        dispatch(setShow(true))
      }
    })
  }
  const onSaveTag = (e) => {
    let familleId = 0
    if (selectFamille) {
      familleId = selectedFamilleEngin.code
    } else {
      familleId = selectedEngin?.familleId
    }
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedEngin?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateTag(e)).then((res) => {
      if (res.payload) {
        dispatch(fetchTagsWithEngin(selectedEngin?.id))
        dispatch(seTagEdit(false))
      }
    })
  }

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      className={'text-white ' + (rowData?.active == 1 ? 'bg-green-500' : 'bg-red-500')}
    />
  )
  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedTagToEngin(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer ce tag?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeEnginTag({engintagged: e.item.data, id: selectedEngin?.id}))
            },
          })
        )
      },
    },
  ]

  const exportFields = [
    {label: 'ID Tag', column: 'code'},
    {label: 'Creation Date', column: 'dateCreation'},
    {label: 'Adresse', column: 'adresse'},
    {label: 'Satus', column: 'status'},
  ]

  const onFinishedUpload = (e) => {
    setIsValid(false)
    setImageId(e.data[0].id)
    setIsValid(true)
  }
  const onHide = () => {
    dispatch(setShow(true))
  }
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Engin' /> {selectedEngin?.reference}
      </span>
    </>
  )
  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={onSave} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )

  const addresseeTemplate = ({enginAddress}) => {
    return (
      <>
        {
          <div>
            {enginAddress ? (
              <Chip
                label={enginAddress}
                className='w-11rem m-1 flex justify-content-center align-items-center'
              />
            ) : (
              'No address found.'
            )}
          </div>
        }
      </>
    )
  }

  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID.Tag',
    },
    {
      header: 'Creation Date',
      field: null,
      olang: 'Creation.Date',
      body: addresseeTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]

  let create = () => {
    dispatch(setEditTagEngin(true))
  }

  const HeaderMap = <div className='flex bg-green-500 w-full'>test</div>

  const onHideEditTag = () => {
    dispatch(setSelectedTag(null))
    dispatch(seTagEdit(false))
  }

  const displayChatDetail = () => {
    let obj = {
      srcId: selectedEngin.id,
      srcObject: 'Engin',
    }
    dispatch(fetchConversationList(obj)).then((res) => {
      console.log('res fetchConversationList', res)
      dispatch(setDetailChat(true))
    })
    const drawer = DrawerComponent.getInstance('kt_drawer_chat')
    if (drawer) {
      drawer.show()
      return
    }

    // Fallback: trigger the DOM toggle (the one used in Navbar)
    const toggle = document.getElementById('kt_drawer_chat_toggle')
    if (toggle) {
      toggle.click()
    }
  }

  // useEffect(() => {
  //   enginTags?.length == 1 ? setDisable(false) : setDisable(true)
  // }, [enginTags])

  // useEffect(() => {
  //   if (selectedEngin && selectedEngin.familleId) {
  //     const parsedFamilleId = parseInt(selectedEngin.familleId)
  //     setSelectedFamilleEngin({code: parsedFamilleId, name: selectedEngin.famille})
  //   }
  // }, [selectedEngin.id])

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchTypesList())
      await dispatch(fetchTags())
      await dispatch(
        fetchFamilles({
          src: 'enginType',
        })
      )
    }

    fetchData()
  }, [dispatch, selectedEngin])

  useEffect(() => {
    dispatch(fetchValidator('engin'))
  }, [])

  const _referenceValidator = validators?.find((field) => field.id === 'reference')
  const _brandValidator = validators?.find((field) => field.id === 'brand')
  const _typeValidator = validators?.find((field) => field.id === 'type')
  const _modelValidator = validators?.find((field) => field.id === 'model')
  const _immatriculationValidator = validators?.find((field) => field.id === 'immatriculation')
  const _vinValidator = validators?.find((field) => field.id === 'vin')
  const _infosAdditionnellesValidator = validators?.find(
    (field) => field.id === 'infosAdditionnelles'
  )
  const _familleValidator = validators?.find((field) => field.id === 'famille')

  useEffect(() => {
    dispatch(fetchEnginListHistory({srcId: selectedEngin?.id, srcObject: 'engin', srcMovement: ''}))
  }, [selectedEngin?.id])

  return (
    <>
      <EnginEditor
        onHide={onHideEditTag}
        selectedTag={selectedTag}
        visible={editTag}
        engin={true}
        onSubmitHandler={(e) => onSaveTag(e)}
      />

      <div data-testid="engin-detail-page" className='lt-engin-page' style={{padding: '10px 14px', fontFamily: "'Inter', -apple-system, sans-serif"}}>
        {/* ── Header Hero ── */}
        <div data-testid="engin-detail-header" className='lt-engin-hero'>
          <div className='lt-engin-hero-bg' />
          <div className='lt-engin-hero-inner'>
            <button onClick={() => dispatch(setShow(true))} data-testid="engin-back-btn" className='lt-engin-back'>
              <i className='pi pi-arrow-left' />
            </button>
            <div className='lt-engin-avatar'>
              {selectedEngin?.image ? (
                <Image src={`${API_BASE_URL_IMAGE}${selectedEngin.image}`} alt='' width="72" height="72" preview imageStyle={{objectFit: 'cover', width: 72, height: 72, borderRadius: 16}} />
              ) : (
                <div className='lt-engin-avatar-ph'><i className='pi pi-box' /></div>
              )}
              <span className='lt-engin-avatar-dot' style={{background: selectedEngin?.etatenginname === 'exit' ? '#EF4444' : '#10B981'}} />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <h2 className='lt-engin-title'>{selectedEngin?.reference || '-'}</h2>
              <div className='lt-engin-badges'>
                {selectedEngin?.etatenginname && (
                  <span className='lt-engin-badge' style={{background: selectedEngin.etatenginname === 'exit' ? '#FEF2F2' : '#F0FDF4', color: selectedEngin.etatenginname === 'exit' ? '#DC2626' : '#16A34A'}}>
                    <span className='lt-engin-badge-dot' style={{background: selectedEngin.etatenginname === 'exit' ? '#DC2626' : '#16A34A'}} />
                    {selectedEngin.etatenginname === 'exit' ? 'Sortie' : 'Entrée'}
                  </span>
                )}
                {selectedEngin?.statuslabel && (
                  <span className='lt-engin-badge' style={{background: '#EFF6FF', color: '#1D4ED8'}}>{selectedEngin.statuslabel}</span>
                )}
                {selectedEngin?.famille && (
                  <span className='lt-engin-badge' style={{background: selectedEngin.familleBgcolor || '#64748B', color: '#FFF'}}>{selectedEngin.famille}</span>
                )}
                {selectedEngin?.tagname && (
                  <span className='lt-engin-badge lt-engin-badge--outline'>
                    <i className='pi pi-tag' style={{fontSize: '0.65rem'}} />
                    {selectedEngin.tagname}
                  </span>
                )}
              </div>
            </div>
            <div className='lt-engin-actions'>
              <PrimaryActionButton type="communicate" onClick={displayChatDetail} />
              <PrimaryActionButton type="more" onClick={create} disabled={selectedEngin?.relationId != 0} />
              <PrimaryActionButton type="edit" onClick={() => dispatch(setEditEngine(true))} />
            </div>
          </div>
          {/* Hero stats row */}
          <div className='lt-engin-hero-stats'>
            <div className='lt-engin-hero-stat'>
              <div className='lt-engin-hero-stat-ico' style={{background: '#EFF6FF', color: '#1D4ED8'}}><i className='pi pi-map-marker' /></div>
              <div>
                <div className='lt-engin-hero-stat-lbl'>Position</div>
                <div className='lt-engin-hero-stat-val'>{selectedEngin?.LocationObjectname || selectedEngin?.enginAddress || '—'}</div>
              </div>
            </div>
            <div className='lt-engin-hero-stat'>
              <div className='lt-engin-hero-stat-ico' style={{background: '#F0FDF4', color: '#16A34A'}}><i className='pi pi-bolt' /></div>
              <div>
                <div className='lt-engin-hero-stat-lbl'>Batterie</div>
                <div className='lt-engin-hero-stat-val'>{selectedEngin?.batteries != null ? `${Math.round(Number(selectedEngin.batteries))}%` : '—'}</div>
              </div>
            </div>
            <div className='lt-engin-hero-stat'>
              <div className='lt-engin-hero-stat-ico' style={{background: '#FEF3C7', color: '#D97706'}}><i className='pi pi-clock' /></div>
              <div>
                <div className='lt-engin-hero-stat-lbl'>Dernier signal</div>
                <div className='lt-engin-hero-stat-val'>{selectedEngin?.lastSeenAt ? moment.utc(selectedEngin.lastSeenAt).local().fromNow() : '—'}</div>
              </div>
            </div>
            <div className='lt-engin-hero-stat'>
              <div className='lt-engin-hero-stat-ico' style={{background: '#DBEAFE', color: '#1D4ED8'}}><i className='pi pi-tag' /></div>
              <div>
                <div className='lt-engin-hero-stat-lbl'>Tag associé</div>
                <div className='lt-engin-hero-stat-val' style={{fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem'}}>{selectedEngin?.tagname || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-engin-tabs-wrap'>
          <TabView>
            <TabPanel header={<span style={{display: 'flex', alignItems: 'center', gap: 6}}><i className='pi pi-cog' style={{fontSize: '0.82rem'}}></i>Général</span>}>
              <div style={{display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20, padding: 20}}>
                {/* LEFT: Form */}
                <div>
                  <div className='lt-engin-section'>
                    <div className='lt-engin-section-head'>
                      <span className='lt-engin-section-ico' style={{background: '#EFF6FF', color: '#1D4ED8'}}>
                        <i className='pi pi-id-card' />
                      </span>
                      <div>
                        <h4 className='lt-engin-section-title'>Identité</h4>
                        <span className='lt-engin-section-sub'>Informations principales de l'engin</span>
                      </div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14}}>
                      <div className='lt-form-field' style={{gridColumn: '1 / -1'}}>
                        {imageChange ? (
                          <div>
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}><button className='lt-close-sm' onClick={() => setImageChange(!imageChange)}><i className='pi pi-times'></i></button></div>
                            <FileUploadeComponent accept={'image/*'} onUploadFinished={onFinishedUpload} uploadExtraInfo={{src: 'engin', srcID: selectedEngin?.id || 0, id: selectedEngin?.imageid || 0, desc: 'profile'}} />
                          </div>
                        ) : (
                          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                            <Image src={`${API_BASE_URL_IMAGE}${selectedEngin?.image}`} alt='Image' width='56' preview imageStyle={{objectFit: 'cover', borderRadius: '10px'}} />
                            <button className='lt-form-upload-btn' onClick={() => setImageChange(!imageChange)}><i className='pi pi-pencil'></i>Changer</button>
                          </div>
                        )}
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Référence{_referenceValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='reference' value={selectedEngin?.reference} onChange={onInputChange} className={`lt-form-input ${alreadyExist || inputValidity['reference'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Statut</label>
                        <Dropdown className='lt-form-input' placeholder='Statut' name='sysStatus' optionLabel='label' optionValue='status' value={+selectedEngin?.sysStatus} options={statusList} onChange={onInputChange} />
                      </div>
                    </div>
                  </div>

                  <div className='lt-engin-section'>
                    <div className='lt-engin-section-head'>
                      <span className='lt-engin-section-ico' style={{background: '#F0FDF4', color: '#16A34A'}}>
                        <i className='pi pi-car' />
                      </span>
                      <div>
                        <h4 className='lt-engin-section-title'>Véhicule</h4>
                        <span className='lt-engin-section-sub'>Caractéristiques techniques</span>
                      </div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Marque{_brandValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <InputText name='brand' value={selectedEngin?.brand} onChange={onInputChange} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Modèle{_modelValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <InputText name='model' value={selectedEngin?.model} onChange={onInputChange} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Immatriculation{_immatriculationValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <InputText name='immatriculation' value={selectedEngin?.immatriculation} onChange={onInputChange} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>VIN{_vinValidator?.isRequired == 1 && <span style={{color: '#EF4444', marginLeft: 2}}>*</span>}</label>
                        <InputText name='vin' value={selectedEngin?.vin} onChange={onInputChange} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Infos additionnelles</label>
                        <InputText name='infosAdditionnelles' value={selectedEngin?.infosAdditionnelles} onChange={onInputChange} style={{borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', padding: '8px 12px'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        <label style={{fontSize: '0.78rem', fontWeight: 700, color: '#475569'}}>Famille</label>
                        <Dropdown name='familleId' options={familles} onChange={onInputChange} placeholder='Famille' value={selectedEngin?.familleId} optionLabel='label' optionValue='id' style={{borderRadius: 8}} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Sidebar */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                  {/* Résumé */}
                  <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden'}}>
                    <div style={{padding: '12px 16px', fontFamily: "'Manrope', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9'}}>Résumé</div>
                    <div style={{padding: '12px 16px'}}>
                      {[
                        {l: 'État', v: selectedEngin?.etatenginname === 'exit' ? 'Sortie' : selectedEngin?.etatenginname === 'reception' ? 'Entrée' : (selectedEngin?.etatenginname || '-'), c: selectedEngin?.etatenginname === 'exit' ? '#DC2626' : '#16A34A'},
                        {l: 'Batterie', v: selectedEngin?.batteries != null ? `${selectedEngin.batteries}%` : 'N/A', c: (parseInt(selectedEngin?.batteries) || 0) >= 50 ? '#22C55E' : '#EF4444'},
                        {l: 'Statut', v: selectedEngin?.statuslabel || '-'},
                        {l: 'Famille', v: selectedEngin?.famille || '-'},
                        {l: 'Tag', v: selectedEngin?.tagname || 'Non assigné', c: '#3B82F6'},
                        {l: 'Position', v: selectedEngin?.enginAddress || selectedEngin?.LocationObjectname || '-'},
                      ].map((r, i) => (
                        <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 5 ? '1px solid #F8FAFC' : 'none'}}>
                          <span style={{color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500}}>{r.l}</span>
                          <span style={{color: r.c || '#0F172A', fontSize: '0.82rem', fontWeight: 700, textAlign: 'right'}}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Map */}
                  {selectedEngin?.last_lat != 0 && selectedEngin?.last_lng != 0 && (
                    <div style={{background: '#FFF', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden'}}>
                      <div style={{padding: '10px 14px', borderBottom: '1px solid #F1F5F9', fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Manrope', sans-serif"}}><i className='pi pi-map' style={{color: '#10B981'}}></i>Position GPS</div>
                      <div style={{height: 280}}>
                        <MapComponent position={{last_lat: selectedEngin?.last_lat, last_lng: selectedEngin?.last_lng}} icon={customIcon} popupTitle={selectedEngin?.labeltag || selectedEngin?.tagname} locationHistory={enginesHistory} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>

            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-link'></i>Relations / Tags</span>}>
              {selectedEngin?.relationId != 0 ? (
                <EnginTagged tableId={`tag-engin-${selectedEngin?.id}`} data={enginTags} actions={actions} />
              ) : (
                <div className='lt-empty-state'>
                  <i className='pi pi-tag' style={{fontSize: '2rem', color: '#CBD5E1'}}></i>
                  <p><OlangItem olang="The.Engin.don't.have.a.Tag" /></p>
                </div>
              )}
            </TabPanel>

            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-clock'></i>Historique</span>}>
              <CalendarViewEngin />
            </TabPanel>
          </TabView>
        </div>
      </div>
      <EditTag />
    </>
  )
}

export default memo(EnginDetail)
