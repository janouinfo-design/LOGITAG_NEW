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
      <div className='mt-3 flex align-items-center justify-content-between'>
        <div className='flex'>
          <div>
            <ButtonComponent onClick={() => dispatch(setShow(true))}>
              <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
              <div className='ml-2 text-base font-semibold'>
                <OlangItem olang='btn.back' />
              </div>
            </ButtonComponent>
          </div>
          <div>
            <ButtonComponent
              onClick={create}
              className='ml-2 border-1'
              disabled={selectedEngin?.relationId != 0}
            >
              <i class='pi pi-plus text-white'></i>
              <div className='ml-2 text-white font-bold text-base'>
                <OlangItem olang='Add.Tag' />
              </div>
            </ButtonComponent>
          </div>
          <div>
            <ButtonComponent onClick={displayChatDetail} className='ml-2 border-1 bg-green-500'>
              <i class='pi pi-comments text-white'></i>
              <div className='ml-2 text-white font-bold text-base'>
                <OlangItem olang='comunication' />
              </div>
            </ButtonComponent>
          </div>
        </div>
        <div className=' w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>{selectedEngin?.reference}</strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Info.Engin' />} leftIcon='pi pi-wrench mr-2'>
            <div className='row'>
              <div className='col-lg-6 col-md-12 col-sm-12 col-xs-12'>
                <Card
                  className='w-full p-2 h-full m-2'
                  title={title}
                  footer={footer}
                  style={{
                    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                    borderRadius: '15px',
                  }}
                >
                  <div className='flex flex-column justify-content-center'>
                    {imageChange ? (
                      <div>
                        <i
                          className='pi pi-times cursor-pointer'
                          style={{marginLeft: '96%'}}
                          onClick={() => setImageChange(!imageChange)}
                        ></i>
                        <FileUploadeComponent
                          accept={'image/*'}
                          onUploadFinished={onFinishedUpload}
                          uploadExtraInfo={{
                            src: 'engin',
                            srcID: selectedEngin?.id || 0,
                            id: selectedEngin?.imageid || 0,
                            desc: 'profile',
                          }}
                        />
                      </div>
                    ) : (
                      <div className='w-5'>
                        <div>
                          <Button
                            icon='pi pi-pencil'
                            className='ml-8 h-2rem w-2rem '
                            rounded
                            severity='secondary'
                            aria-label='User'
                            onClick={() => setImageChange(!imageChange)}
                          />
                        </div>
                        <Image
                          src={`${API_BASE_URL_IMAGE}${selectedEngin?.image}`}
                          alt='Image'
                          width='80'
                          preview
                          imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                        />
                      </div>
                    )}
                    <div className='my-4 mt-5'>
                      <label htmlFor='reference'>
                        <OlangItem olang='Reference' />
                        {_referenceValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        name='reference'
                        id='reference'
                        value={selectedEngin?.reference}
                        onChange={onInputChange}
                        className={`w-full font-semibold text-lg ${
                          alreadyExist ? 'p-invalid' : null
                        } ${inputValidity['reference'] === false ? 'p-invalid' : ''}
                        }`}
                      />
                      {_referenceValidator?.isRequired == 1 && (
                        <small className='p-error'>{_referenceValidator?.messageError}</small>
                      )}
                    </div>
                    <div className='my-4 mt-5'>
                      <Dropdown
                        className='w-full'
                        placeholder='Select Status'
                        name='sysStatus'
                        optionLabel='label'
                        optionValue='status'
                        value={+selectedEngin?.sysStatus}
                        options={statusList}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className='my-4 mt-5'>
                      <label>
                        <OlangItem olang='Brand' />
                        {_brandValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        name='brand'
                        id='brand'
                        value={selectedEngin?.brand}
                        onChange={onInputChange}
                        className={`w-full font-semibold text-lg ${
                          inputValidity['brand'] === false ? 'p-invalid' : ''
                        }`}
                      />
                    </div>
                    <div className='my-4'>
                      <label>
                        <OlangItem olang='Model' />
                        {_modelValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        id='model'
                        value={selectedEngin?.model}
                        onChange={onInputChange}
                        name='model'
                        className={`w-full font-semibold text-lg ${
                          inputValidity['model'] === false ? 'p-invalid' : ''
                        }`}
                      />
                    </div>

                    <div className='my-4'>
                      <label htmlFor='immatriculation'>
                        <OlangItem olang='Immatriculation' />
                        {_immatriculationValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        id='immatriculation'
                        value={selectedEngin?.immatriculation}
                        onChange={onInputChange}
                        name='immatriculation'
                        className={`w-full font-semibold text-lg ${
                          inputValidity['immatriculation'] === false ? 'p-invalid' : ''
                        }`}
                      />
                    </div>
                    <div className='my-4'>
                      <label htmlFor='vin'>
                        <OlangItem olang='Engine.Vin' />
                        {_vinValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        id='vin'
                        value={selectedEngin?.vin}
                        onChange={onInputChange}
                        name='vin'
                        className={`w-full font-semibold text-lg ${
                          inputValidity['vin'] === false ? 'p-invalid' : ''
                        }`}
                      />
                    </div>
                    <div className='my-4'>
                      <label htmlFor='infosAdditionnelles'>
                        <OlangItem olang='Informations.additionnelles' />
                        {_infosAdditionnellesValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <InputText
                        id='infosAdditionnelles'
                        value={selectedEngin?.infosAdditionnelles}
                        onChange={onInputChange}
                        name='infosAdditionnelles'
                        className={`w-full font-semibold text-lg ${
                          inputValidity['infosAdditionnelles'] === false ? 'p-invalid' : ''
                        }`}
                      />
                    </div>
                    <div className='my-4'>
                      <label htmlFor='famille'>
                        <OlangItem olang='famille.list' />
                        {_familleValidator?.isRequired == 1 && (
                          <span className='h3 text-danger'>*</span>
                        )}
                      </label>
                      <Dropdown
                        id='familleId'
                        name='familleId'
                        options={familles}
                        onChange={onInputChange}
                        placeholder='select famille'
                        value={selectedEngin?.familleId}
                        className={`w-full  ${
                          inputValidity['famille'] === false ? 'p-invalid' : ''
                        }`}
                        optionLabel='label'
                        optionValue='id'
                      />
                    </div>
                  </div>
                </Card>
              </div>
              <div className='col-lg-6 col-md-12 col-sm-12 col-xs-12'>
                {selectedEngin?.last_lat != 0 && selectedEngin?.last_lng != 0 && (
                  <Card
                    // header={HeaderMap}
                    className='w-full p-2 h-full m-2'
                    style={{
                      boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                      borderRadius: '15px',
                    }}
                  >
                    <MapComponent
                      position={{
                        last_lat: selectedEngin?.last_lat,
                        last_lng: selectedEngin?.last_lng,
                      }}
                      icon={customIcon}
                      popupTitle={
                        selectedEngin?.labeltag === null ||
                        selectedEngin?.labeltag === '' ||
                        selectedEngin?.labeltag == undefined
                          ? selectedEngin?.tagname
                          : selectedEngin?.labeltag
                      }
                      locationHistory={enginesHistory}
                    />
                  </Card>
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel header={<OlangItem olang='Engin.Tags' />}>
            {selectedEngin?.relationId != 0 ? (
              <EnginTagged
                tableId={`tag-engin-${selectedEngin?.id}`}
                data={enginTags}
                actions={actions}
              />
            ) : (
              <p className='text-2xl text-center'>
                <OlangItem olang="The.Engin.don't.have.a.Tag" />
              </p>
            )}
          </TabPanel>
          <TabPanel header={<OlangItem olang='Engin.Timeline' />}>
            <CalendarViewEngin />
          </TabPanel>
        </TabView>
      </div>
      <EditTag />
    </>
  )
}

export default memo(EnginDetail)
