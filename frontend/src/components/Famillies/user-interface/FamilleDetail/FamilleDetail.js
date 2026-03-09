import {InputText} from 'primereact/inputtext'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Card} from 'primereact/card'
import {TabPanel, TabView} from 'primereact/tabview'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import FamilleEditor from '../FamilleEditor/FamilleEditor'
import {
  createOrUpdateFamille,
  fetchIcons,
  getEditFamille,
  getExistItem,
  getFamilles,
  getIcons,
  getSelectedFamille,
  setEditFamille,
  setExistItem,
  setShow,
} from '../../slice/famille.slice'
import {useDispatch} from 'react-redux'
import _ from 'lodash'
import {useEffect, useState} from 'react'
import {useAppSelector} from '../../../../hooks'
import {setSelectedFamille} from './../../slice/famille.slice'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {ColorPicker} from 'primereact/colorpicker'
import IconDropdown from '../../../shared/IconDropdown/IconDropdown'
import {Message} from 'primereact/message'
import {useFormik} from 'formik'
import {generateYupSchema} from '../../../Helpers/validationGene'

const FamilleDetail = () => {
  const dispatch = useDispatch()
  const [isValid, setIsValid] = useState(true)
  const [isNotValid, setIsNotValid] = useState(true)
  const [inputValidity, setInputValidity] = useState({})
  const selectedFamille = useAppSelector(getSelectedFamille)
  const editFamille = useAppSelector(getEditFamille)
  const _validators = useSelector(getValidator)
  const validators = [
    {
      id: 'label',
      label: 'label',
      isRequired: 1,
      active: 1,
      isEdit: 1,
      min: 0,
      max: 100,
      regExp: '^(?!\\s*$).+',
      messageError: 'required',
    },
  ]
  const [color, setColor] = useState(selectedFamille?.bgColor)
  const icons = useAppSelector(getIcons)
  const [selectedIcon, setSelectedIcon] = useState(selectedFamille?.icon)
  const existItem = useAppSelector(getExistItem)

  // const validationSchema = generateYupSchema(_validators)

  const formik = useFormik({
    initialValues: {
      label: '',
      icon: '',
      bgColor: '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      dispatch(createOrUpdateFamille(values)).then((res) => {
        if (res.payload) {
          dispatch(setShow(true))
          formik.resetForm()
        }
      })
    },
  })

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedFamille)
    old = {
      ...old,
      color: color,
      bgColor: color,
      [e.target.name]: e.target.value,
    }
    dispatch(setSelectedFamille(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])

    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  const onHide = () => {
    dispatch(setShow(true))
  }

  const save = () => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedFamille?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    let obj = {
      ...selectedFamille,
      color: color,
      bgColor: color,
      icon: selectedIcon,
    }
    dispatch(createOrUpdateFamille(obj)).then((res) => {
      if (res.payload) {
        dispatch(setShow(true))
        dispatch(setEditFamille(false))
      }
    })
  }

  const checkValidators = () => {
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!selectedFamille[validator.id])
    setIsValid(!areAllRequiredFieldsFilled)
  }

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={formik.handleSubmit} />
    </div>
  )
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>Famille {selectedFamille?.label}</span>
    </>
  )
  const _labelValidator = validators?.find((field) => field.id === 'label')

  const setValues = () => {
    if (!selectedFamille) return
    const {label, bgColor, icon} = selectedFamille
    formik.setValues({label, bgColor, icon})
  }

  useEffect(() => {
    dispatch(fetchIcons())
    setValues()
  }, [])

  return (
    <>
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
        </div>
        <div className=' w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>
            {selectedFamille?.label ?? <OlangItem olang='current.Famille' />}
          </strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={<OlangItem olang='Famille.Info' />} leftIcon='pi pi-user mr-2'>
            <Card
              className='w-full md:w-10 lg:w-full xl:w-6 mt-3 p-2 ml-4'
              title={title}
              footer={footer}
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
            >
              <div className='flex justify-content-center'>
                {existItem && (
                  <Message severity='error' text='The Family is Already Exist' className='w-6' />
                )}
              </div>
              <div className='flex flex-column justify-content-center'>
                <div className='my-4 mt-5'>
                  <label htmlFor='label'>
                    <OlangItem olang='famille.label' />{' '}
                    {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
                  </label>
                  <InputText
                    name='label'
                    id='label'
                    onChange={formik.handleChange}
                    className={`w-full font-semibold text-lg ${
                      formik.errors.label && formik.touched.label ? 'p-invalid' : ''
                    }`}
                    value={formik.values.label}
                  />
                  {formik.errors.label && formik.touched.label && (
                    <div className='p-error'>{formik.errors.label}</div>
                  )}
                </div>
              </div>
              <div className='flex flex-column justify-content-center'>
                <div className='my-4 mt-5'>
                  <IconDropdown
                    className={`w-full font-semibold text-lg ${
                      formik.errors.icon && formik.touched.icon ? 'p-invalid' : ''
                    }`}
                    name={'icon'}
                    filter={true}
                    optionValue='name'
                    filterBy={'name'}
                    data={icons}
                    onChange={formik.handleChange}
                    value={formik.values.icon}
                  />
                </div>
              </div>
              <div className='flex flex-column justify-content-center'>
                <div className='my-4 mt-5'>
                  <label htmlFor='color'>
                    <OlangItem olang='famille.color' />{' '}
                  </label>
                  <div>
                    <ColorPicker
                      name='bgColor'
                      value={formik.values.bgColor}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}
export default FamilleDetail
