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

  const customIcon = new Icon({
    iconUrl: selectedEngin?.tagId != 0 ? logoColor : logoBlack,
    iconSize: [30, 40],
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

      <div className='lt-page' data-testid="engin-detail-page">
        {/* ── Premium Header Summary ── */}
        <div className='lt-detail-header' data-testid="engin-detail-header">
          <div className='lt-detail-header-left'>
            <button className='lt-back-btn' onClick={() => dispatch(setShow(true))} data-testid="engin-back-btn">
              <i className='pi pi-arrow-left'></i>
            </button>
            <div className='lt-detail-avatar'>
              {selectedEngin?.image ? (
                <Image src={`${API_BASE_URL_IMAGE}${selectedEngin.image}`} alt='' width="52" height="52" preview imageStyle={{objectFit: 'cover', width: 52, height: 52, borderRadius: 12}} />
              ) : (
                <div className='lt-detail-avatar-ph'><i className='pi pi-box'></i></div>
              )}
            </div>
            <div className='lt-detail-info'>
              <h2 className='lt-detail-name'>{selectedEngin?.reference || '-'}</h2>
              <div className='lt-detail-meta'>
                {selectedEngin?.etatenginname && (
                  <span className='lt-badge' style={{background: selectedEngin.etatenginname === 'exit' ? '#FEF2F2' : selectedEngin.etatenginname === 'reception' ? '#F0FDF4' : '#FFFBEB', color: selectedEngin.etatenginname === 'exit' ? '#DC2626' : selectedEngin.etatenginname === 'reception' ? '#16A34A' : '#D97706'}}>
                    <span className='lt-badge-dot' style={{background: selectedEngin.etatenginname === 'exit' ? '#DC2626' : selectedEngin.etatenginname === 'reception' ? '#16A34A' : '#D97706'}}></span>
                    {selectedEngin.etatenginname === 'exit' ? 'Sortie' : selectedEngin.etatenginname === 'reception' ? 'Entrée' : selectedEngin.etatenginname}
                  </span>
                )}
                {selectedEngin?.statuslabel && (
                  <span className='lt-badge lt-badge-info'><i className='pi pi-circle-fill' style={{fontSize: '0.4rem'}}></i>{selectedEngin.statuslabel}</span>
                )}
                {selectedEngin?.famille && (
                  <span className='lt-badge' style={{background: selectedEngin.familleBgcolor || '#64748B', color: '#FFF', fontSize: '0.68rem'}}>{selectedEngin.famille}</span>
                )}
              </div>
            </div>
          </div>
          <div className='lt-detail-header-right'>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Batterie</div>
              <div className='lt-detail-stat-val' style={{color: (parseInt(selectedEngin?.batteries) || 0) >= 50 ? '#22C55E' : (parseInt(selectedEngin?.batteries) || 0) >= 20 ? '#F59E0B' : '#EF4444'}}>
                {selectedEngin?.batteries != null ? `${selectedEngin.batteries}%` : 'N/A'}
              </div>
            </div>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Position</div>
              <div className='lt-detail-stat-val' style={{fontSize: '0.75rem', color: '#475569'}}>{selectedEngin?.enginAddress || selectedEngin?.LocationObjectname || '-'}</div>
            </div>
            <div className='lt-detail-stat'>
              <div className='lt-detail-stat-label'>Tag</div>
              <div className='lt-detail-stat-val' style={{fontSize: '0.8rem', color: '#3B82F6'}}>{selectedEngin?.tagname || 'Non assigné'}</div>
            </div>
            <div className='lt-detail-actions'>
              <button className='lt-detail-action-btn' onClick={displayChatDetail} title="Chat"><i className='pi pi-comments'></i></button>
              <button className='lt-detail-action-btn' onClick={create} disabled={selectedEngin?.relationId != 0} title="Ajouter Tag"><i className='pi pi-plus'></i></button>
              <button className='lt-detail-action-btn lt-detail-action-btn--save' onClick={onSave} title="Enregistrer"><i className='pi pi-check'></i></button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='lt-detail-tabs'>
          <TabView className='lt-tabview'>
            <TabPanel header={<span className='lt-tab-header'><i className='pi pi-cog'></i>Général</span>}>
              <div className='lt-detail-grid'>
                {/* LEFT: Form */}
                <div className='lt-detail-form'>
                  <div className='lt-form-section'>
                    <h4 className='lt-form-section-title'><i className='pi pi-id-card'></i>Identité</h4>
                    <div className='lt-form-grid'>
                      {/* Image upload */}
                      <div className='lt-form-field lt-form-field--full'>
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
                        <label className='lt-form-label'><OlangItem olang='Reference' />{_referenceValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='reference' value={selectedEngin?.reference} onChange={onInputChange} className={`lt-form-input ${alreadyExist || inputValidity['reference'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'>Statut</label>
                        <Dropdown className='lt-form-input' placeholder='Select Status' name='sysStatus' optionLabel='label' optionValue='status' value={+selectedEngin?.sysStatus} options={statusList} onChange={onInputChange} />
                      </div>
                    </div>
                  </div>

                  <div className='lt-form-section'>
                    <h4 className='lt-form-section-title'><i className='pi pi-car'></i>Véhicule</h4>
                    <div className='lt-form-grid'>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Brand' />{_brandValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='brand' value={selectedEngin?.brand} onChange={onInputChange} className={`lt-form-input ${inputValidity['brand'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Model' />{_modelValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='model' value={selectedEngin?.model} onChange={onInputChange} className={`lt-form-input ${inputValidity['model'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Immatriculation' />{_immatriculationValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='immatriculation' value={selectedEngin?.immatriculation} onChange={onInputChange} className={`lt-form-input ${inputValidity['immatriculation'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Engine.Vin' />{_vinValidator?.isRequired == 1 && <span className='lt-required'>*</span>}</label>
                        <InputText name='vin' value={selectedEngin?.vin} onChange={onInputChange} className={`lt-form-input ${inputValidity['vin'] === false ? 'p-invalid' : ''}`} />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='Informations.additionnelles' /></label>
                        <InputText name='infosAdditionnelles' value={selectedEngin?.infosAdditionnelles} onChange={onInputChange} className='lt-form-input' />
                      </div>
                      <div className='lt-form-field'>
                        <label className='lt-form-label'><OlangItem olang='famille.list' /></label>
                        <Dropdown name='familleId' options={familles} onChange={onInputChange} placeholder='Famille' value={selectedEngin?.familleId} className='lt-form-input' optionLabel='label' optionValue='id' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Map */}
                <div className='lt-detail-side'>
                  {selectedEngin?.last_lat != 0 && selectedEngin?.last_lng != 0 && (
                    <div className='lt-detail-map-card'>
                      <div className='lt-detail-map-head'><i className='pi pi-map' style={{color: '#10B981'}}></i>Position GPS</div>
                      <div className='lt-detail-map-body'>
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
