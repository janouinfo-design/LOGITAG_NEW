import React, {useEffect, useState} from 'react'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {TabPanel, TabView} from 'primereact/tabview'
import {FileUploadeComponent} from '../../../shared/FileUploaderComponent/FileUploadeComponent'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import SiteEditor from '../../../Site/user-interface/SiteEditor/SiteEditor'
import {Dropdown} from 'primereact/dropdown'

import SiteList from '../../../Site/user-interface/SiteList/SiteList'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {
  createOrUpdateTeam,
  fetchTeams,
  getEditTeam,
  getSelectedTeam,
  setShow,
  getShow,
  setSelectedTeam,
  fetchTypesStaff,
  getTypesStaff,
  setSelectedTeamV,
  setTagVisible,
  getTagStaff,
} from '../../slice/team.slice'
import _ from 'lodash'
import * as Yup from 'yup'

import {Image} from 'primereact/image'
import {useNavigate} from 'react-router-dom'
import {Button} from 'primereact/button'
import TeamList from '../TeamList/TeamList'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import TeamEditor from '../TeamEditor/TeamEditor'
import {Calendar} from 'primereact/calendar'
import {InputSwitch} from 'primereact/inputswitch'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {useFormik} from 'formik'
import moment from 'moment'
import TeamTag from './TeamTag'
import TagListDrop from './TagListDrop'
import {fetchTags, fetchTagsFree} from '../../../Tag/slice/tag.slice'

const TeamDetail = () => {
  const [isValid, setIsValid] = useState(false)
  const [imageChange, setImageChange] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [imageId, setImageId] = useState()
  const [statusOption, setStatusOption] = useState([])

  const selectedTeam = useAppSelector(getSelectedTeam)
  const editTeam = useAppSelector(getEditTeam)
  const status = useAppSelector(getTypesStaff)
  const validators = useAppSelector(getValidator)
  const tagStaff = useAppSelector(getTagStaff)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const generateYupSchema = (validationArray) => {
    if (!Array.isArray(validationArray)) return
    let schema = {}
    validationArray.forEach((rule) => {
      const {id, label, isRequired, messageError, max, min, regExp} = rule
      if (isRequired === 1 && rule.active) {
        let yupChain = Yup.string().required(messageError || `${label} is required`)
        if (max > 0) {
          yupChain = yupChain.max(max, `Maximum length exceeded (max: ${max})`)
        }
        if (min > 0) {
          yupChain = yupChain.min(min, `Minimum length not met (min: ${min})`)
        }
        if (regExp) {
          yupChain = yupChain.matches(new RegExp(regExp), 'Invalid format')
        }
        schema[id] = yupChain
      }
    })

    return Yup.object().shape(schema)
  }

  const validationSchema = generateYupSchema(validators)

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      typeName: '',
      birthday: '',
      hireday: '',
      exitday: '',
    },
    validationSchema: validationSchema,
    onSubmit: (data) => {
      const obj = {
        ...selectedTeam,
        exitday: data.exitday,
        birthday: data.birthday,
        hireday: data.hireday,
        firstname: data.firstname,
        lastname: data.lastname,
        typeId: data.typeName,
      }
      dispatch(setSelectedTeamV(obj))
      onSave()
    },
  })

  const onFinishedUpload = async (e) => {
    if (e.success) {
      const imageid = await e.data[0].id
      setImageId(imageid)
    }
  }

  const onSave = () => {
    dispatch(createOrUpdateTeam({imageId: imageId})).then((res) => {
      if (res.payload) {
        dispatch(fetchTeams())
        dispatch(setShow(true))
      }
    })
  }

  useEffect(() => {
    if (selectedTeam == null) {
      dispatch(setShow(true))
    }
    const oldSelected = {
      ...selectedTeam,
      hireday: selectedTeam?.hireday ? moment(selectedTeam?.hireday, 'DD/MM/YYYY').toDate() : null,
      exitday: selectedTeam?.exitday ? moment(selectedTeam?.exitday, 'DD/MM/YYYY').toDate() : null,
      birthday: selectedTeam?.birthday
        ? moment(selectedTeam?.birthday, 'DD/MM/YYYY').toDate()
        : null,
      typeName: selectedTeam?.typeId,
    }
    formik.setValues(oldSelected)
  }, [])

  const removeDateDp = () => {
    setDisabled(!disabled)
    formik.setFieldValue('exitday', null)
  }

  const onHide = () => {
    dispatch(setShow(true))
  }

  const createTag = () => {
    dispatch(setTagVisible(true))
  }

  const renderAsterisk = (validators, fieldId) => {
    const validator = validators.find((validator) => validator.id === fieldId)
    return validator && validator.isRequired === 1 ? (
      <span className='h3 text-danger'>*</span>
    ) : null
  }

  const footer = (
    <div className='flex justify-content-end'>
      <ButtonComponent className='p-button-danger' onClick={onHide}>
        <OlangItem olang='Annuler' />
      </ButtonComponent>
      <ButtonComponent onClick={formik.handleSubmit} className='ml-2'>
        <OlangItem olang='Enregistrer' />
      </ButtonComponent>
    </div>
  )
  const title = (
    <>
      <i className='pi pi-cog mr-1'></i>
      <span className='ml-1'>
        <OlangItem olang='Detail' /> {selectedTeam?.label}
      </span>
    </>
  )
  const header = <OlangItem olang='Info' />
  const headerTag = <OlangItem olang='tag' />

  useEffect(() => {
    setStatusOption([
      ...status?.map((st) => ({
        name: st.label,
        value: st.id,
      })),
    ])
  }, [status])

  useEffect(() => {
    if (selectedTeam?.exitday == null) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    dispatch(fetchTypesStaff())
    dispatch(fetchTagsFree())
  }, [])

  return (
    <>
      <TagListDrop />
      <div className='flex justify-content-between'>
        <div className=''>
          <ButtonComponent onClick={() => dispatch(setShow(true))}>
            <i class='fa-solid fa-share fa-flip-horizontal text-white'></i>
            <div className='ml-2 text-base font-semibold'>
              <OlangItem olang='btn.back' />
            </div>
          </ButtonComponent>
          <ButtonComponent
            onClick={createTag}
            className='ml-2 border-1'
            disabled={selectedTeam?.relationId != 0}
          >
            <i class='pi pi-plus text-white'></i>
            <div className='ml-2 text-white font-bold text-base'>
              <OlangItem olang='Add.Tag' />
            </div>
          </ButtonComponent>
        </div>
        <div className='w-2 flex align-items-center justify-content-center text-xl'>
          <strong className='p-3'>{selectedTeam?.firstname}</strong>
        </div>
      </div>
      <div className='w-full mt-2 flex align-items-center flex-column'>
        <TabView className='w-full'>
          <TabPanel header={header} leftIcon='pi pi-user mr-2'>
            <Card
              className='w-6'
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
              }}
              title={title}
              footer={footer}
            >
              <div className='flex flex-column justify-content-center'>
                {imageChange ? (
                  <div>
                    <i
                      className='pi pi-times cursor-pointer'
                      style={{marginLeft: '98%'}}
                      onClick={() => {
                        setImageChange(!imageChange)
                        setIsValid(false)
                      }}
                    ></i>
                    <FileUploadeComponent
                      accept={'image/*'}
                      onUploadFinished={onFinishedUpload}
                      uploadExtraInfo={{
                        src: 'staff',
                        srcID: selectedTeam?.id || 0,
                        id: selectedTeam?.imageid || 0,
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
                      src={`${API_BASE_URL_IMAGE}${selectedTeam?.image}`}
                      alt='Image'
                      width='80'
                      preview
                      imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                    />
                  </div>
                )}
                <div className='flex flex-column w-full my-3'>
                  <label>
                    <OlangItem olang='Nom' />
                    {renderAsterisk(validators, 'firstname')}
                  </label>
                  <InputText
                    name='firstname'
                    className={`w-11 font-semibold text-lg ${
                      formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''
                    }`}
                    onChange={formik.handleChange}
                    value={formik.values.firstname}
                  />
                  {formik.errors.firstname && formik.touched.firstname && (
                    <div className='p-error'>{formik.errors.firstname}</div>
                  )}
                </div>
                <div className='flex flex-column w-full my-3'>
                  <label>
                    <OlangItem olang='Prenom' />
                    {renderAsterisk(validators, 'lastname')}
                  </label>
                  <InputText
                    name='lastname'
                    className={`w-11 font-semibold text-lg ${
                      formik.errors.lastname && formik.touched.lastname ? 'p-invalid' : ''
                    }`}
                    onChange={formik.handleChange}
                    value={formik.values.lastname}
                  />
                  {formik.errors.lastname && formik.touched.lastname && (
                    <div className='p-error'>{formik.errors.lastname}</div>
                  )}
                </div>
                <div className='flex flex-column w-full my-3'>
                  <label>
                    <OlangItem olang='Function' />
                    {renderAsterisk(validators, 'typeName')}
                  </label>
                  <Dropdown
                    name='typeName'
                    options={statusOption}
                    optionLabel='name'
                    optionValue='value'
                    onChange={formik.handleChange}
                    placeholder={'Select status'}
                    className={`w-11 ${
                      formik.errors.typeName && formik.touched.typeName ? 'p-invalid' : ''
                    }`}
                    value={formik.values.typeName}
                  />
                  {formik.errors.typeName && formik.touched.typeName && (
                    <div className='p-error'>{formik.errors.typeName}</div>
                  )}
                </div>
                <div className='my-3 flex flex-column w-full'>
                  <label>
                    <OlangItem olang='Anniversaire' />
                    {renderAsterisk(validators, 'birthday')}
                  </label>
                  <Calendar
                    name='birthday'
                    showIcon
                    className={`w-11 ${
                      formik.errors.birthday && formik.touched.birthday ? 'p-invalid' : ''
                    }`}
                    dateFormat='dd/mm/yy'
                    onChange={formik.handleChange}
                    placeholder={'dd/mm/yy'}
                    value={formik.values.birthday}
                  />
                  {formik.errors.birthday && formik.touched.birthday && (
                    <div className='p-error'>{formik.errors.birthday}</div>
                  )}
                </div>
                <div className='my-3 flex flex-column w-full'>
                  <label>
                    <OlangItem olang='Create.debut' />
                    {renderAsterisk(validators, 'hireday')}
                  </label>
                  <Calendar
                    name='hireday'
                    showIcon
                    className={`w-11 ${
                      formik.errors.hireday && formik.touched.hireday ? 'p-invalid' : ''
                    }`}
                    dateFormat='dd/mm/yy'
                    onChange={formik.handleChange}
                    placeholder={'dd/mm/yy'}
                    value={formik.values.hireday}
                  />
                  {formik.errors.hireday && formik.touched.hireday && (
                    <div className='p-error'>{formik.errors.hireday}</div>
                  )}
                </div>
                <div className='my-3 flex flex-column w-full'>
                  <label>
                    <OlangItem olang='Date.depart' />
                    {renderAsterisk(validators, 'exitday')}
                  </label>
                  <div className='flex flex-row w-full justify-content-between'>
                    <Calendar
                      showIcon
                      disabled={disabled}
                      id='exitday'
                      name='exitday'
                      dateFormat='dd/mm/yy'
                      className={`w-11 ${
                        formik.errors.exitday && formik.touched.exitday ? 'p-invalid' : ''
                      }`}
                      onChange={formik.handleChange}
                      placeholder={'dd/mm/yy'}
                      value={formik.values.exitday}
                    />
                    <Button
                      icon={`${disabled ? 'pi pi-plus' : 'pi pi-times'}`}
                      aria-label={`${disabled ? 'Filter' : 'Cancel'}`}
                      severity={`${disabled ? 'success' : 'danger'}`}
                      onClick={removeDateDp}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabPanel>
          <TabPanel header={headerTag} leftIcon='fa-duotone fa-solid fa-tags text-xl mr-2'>
            <TeamTag tagStaff={tagStaff} selectedTeam={selectedTeam} />
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default TeamDetail
