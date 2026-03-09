import {Dialog} from 'primereact/dialog'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {InputText} from 'primereact/inputtext'
import {useAppSelector} from '../../../../hooks'
import {getEtatList} from '../../slice/facturation.slice'
import {Dropdown} from 'primereact/dropdown'
import {useFormik} from 'formik'
import {Calendar} from 'primereact/calendar'

const EditStatus = ({visible, onHide, onSave, loading}) => {
  const etatList = useAppSelector(getEtatList)

  const formik = useFormik({
    initialValues: {
      Etat: '',
      reasonText: '',
      reasonCode: '',
      date: new Date(),
    },
    onSubmit: (values) => {
      onSave(values)
    },
  })

  const onHideDialog = () => {
    formik.resetForm()
    onHide()
  }

  const footerDialog = () => {
    return (
      <div className='flex justify-content-end'>
        <ButtonComponent label='Annuler' severity='danger' onClick={onHideDialog} />
        <ButtonComponent
          label='OK'
          loading={loading}
          disabled={!formik.values.Etat}
          onClick={formik.handleSubmit}
        />
      </div>
    )
  }


  return (
    <Dialog
      header='Changer le status'
      visible={visible}
      onHide={onHide}
      position='center'
      style={{width: '30vw'}}
      footer={footerDialog}
    >
      <div className='w-full gap-2 flex flex-column'>
        <div>
          <label htmlFor='OTEtat' className='font-bold block mb-2'>
            OTEtat
          </label>
          <Dropdown
            name='Etat'
            filter
            className='w-9'
            optionValue='Etat'
            optionLabel='Description'
            options={etatList}
            onChange={formik.handleChange}
            value={formik.values.Etat}
            placeholder='Etat'
          />
        </div>
        <div>
          <label htmlFor='reasonCode' className='font-bold block mb-2'>
            Date
          </label>
          <Calendar
            name='date'
            className='w-9'
            placeholder='Date'
            showIcon
            value={formik.values.date}
            onChange={formik.handleChange}
            showTime
            hourFormat='24'
          />
        </div>
        <div>
          <label htmlFor='reasonCode' className='font-bold block mb-2'>
            Reason Code
          </label>
          <InputText
            name='reasonCode'
            value={formik.values.reasonCode}
            onChange={formik.handleChange}
            className='w-9'
            placeholder='reasonCode'
          />
        </div>
        <div>
          <label htmlFor='reasonText' className='font-bold block mb-2'>
            Reason Text
          </label>
          <InputText
            name='reasonText'
            value={formik.values.reasonText}
            onChange={formik.handleChange}
            className='w-9'
            placeholder='reasonText'
          />
        </div>
      </div>
    </Dialog>
  )
}

export default EditStatus
