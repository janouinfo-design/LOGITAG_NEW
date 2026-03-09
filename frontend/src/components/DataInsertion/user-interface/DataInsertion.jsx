import {Button} from 'primereact/button'
import {Calendar} from 'primereact/calendar'
import {InputTextarea} from 'primereact/inputtextarea'
import {MultiSelect} from 'primereact/multiselect'
import React, {useEffect, useState} from 'react'
import {useAppDispatch} from '../../../hooks'
import {fetchEnginesMap} from '../../Engin/slice/engin.slice'
import {useFormik} from 'formik'
import moment from 'moment'
import {Divider} from 'primereact/divider'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {generatePresence} from '../slice/dataInsertion.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

const DataInsertion = () => {
  const [engines, setEngines] = useState([])
  const [enginesDisplay, setEnginesDisplay] = useState([])
  const [generateLoading, setGenerateLoading] = useState(false)

  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues: {
      selectedEngines: [],
      date: new Date(),
      comment: '',
    },
    onSubmit: (values) => {
      setGenerateLoading(true)
      let refs = []
      if (values.selectedEngines.length > 0) {
        values.selectedEngines.map((ref) => {
          refs.push({
            id: ref,
          })
        })
      }
      let obj = {
        title: 'Rapport de présence des bouteilles',
        ref: refs,
        enginDate: moment(values.date).format('YYYY-MM-DD'),
        comment: values.comment,
      }
      dispatch(generatePresence(obj)).then(({payload}) => {
        setEnginesDisplay(payload)
        setGenerateLoading(false)
        formik.resetForm()
      })
    },
  })

  useEffect(() => {
    dispatch(fetchEnginesMap({page: 1, PageSize: 15, filterPosition: 1, displayMap: 1})).then(
      ({payload}) => {
        setEngines(payload)
      }
    )
  }, [])

  useEffect(() => {
    if (formik.values.selectedEngines.length > 0) {
      const getData = engines.filter((engine) => formik.values.selectedEngines.includes(engine.id))
      setEnginesDisplay(getData)
    }
  }, [formik.values.selectedEngines])

  return (
    <div style={{height: '80vh'}} className='w-full flex align-items-center justify-content-center'>
      <div
        style={{width: '40%', height: '70%'}}
        className='flex flex-column bg-gray-100 shadow-2 shadow-gray-500 border-round-xl p-6'
      >
        <div className='w-full'>
          <strong className='text-2xl'>
            <OlangItem olang='Rpt.presence' />
          </strong>
        </div>
        <div className='w-full flex flex-column gap-2 mt-4'>
          <label className='text-xl'>
            <OlangItem olang='slt.btl' />
          </label>
          <MultiSelect
            name='selectedEngines'
            className='bg-white h-4rem'
            placeholder='Select Engines'
            style={{width: '100%'}}
            options={engines}
            optionLabel='reference'
            filter
            optionValue='id'
            value={formik.values.selectedEngines}
            onChange={formik.handleChange}
            display='chip'
          />
        </div>
        <div className='w-full flex flex-column gap-2 mt-4'>
          <label className='text-xl'>
            <OlangItem olang='slt.date' />
          </label>
          <Calendar
            name='date'
            className='bg-white'
            value={formik.values.date}
            onChange={formik.handleChange}
            placeholder='Select date'
            style={{width: '100%'}}
            showIcon
            inputClassName='bg-white'
            dateFormat='dd/mm/yy'
          />
        </div>
        <div className='w-full flex flex-column gap-2 mt-4'>
          <label className='text-xl'>
            <OlangItem olang='Comment' />
          </label>
          <InputTextarea
            name='comment'
            style={{width: '100%'}}
            className='bg-white'
            value={formik.values.comment}
            onChange={formik.handleChange}
            placeholder='Enter comment'
            rows={5}
            cols={30}
          />
        </div>
        <div className='w-full flex flex-row justify-content-end gap-2 mt-6'>
          <Button label='Cancel' className='p-button-danger p-button-sm' />
          <Button
            label='Submit'
            className='p-button-success p-button-sm'
            onClick={formik.handleSubmit}
            loading={generateLoading}
            disabled={generateLoading}
          />
        </div>
      </div>
      <Divider layout='vertical' style={{height: '70%'}} />
      <div style={{width: '55%', height: '70%'}} className='flex flex-column gap-2'>
        <div
          style={{width: '50%'}}
          className='flex flex-column border-2 gap-2 border-gray-400 p-3 border-round-xl'
        >
          <div className='flex flex-row align-items-center gap-2'>
            <div>Titre:</div>
            <strong className='text-xl'>Rapport de présence des bouteilles</strong>
          </div>
          <div className='flex flex-row align-items-center gap-2'>
            <div>Date:</div>
            <strong className='text-xl'>{moment(formik.values.date).format('DD/MM/YYYY')}</strong>
          </div>
          <div className='flex flex-row align-items-center gap-2'>
            <div>Comment:</div>
            <strong className='text-xl'>les engines qui ont été présents</strong>
          </div>
        </div>
        <Divider />
        <div>
          <DataTable
            value={enginesDisplay}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 15]}
            showGridlines
            tableStyle={{minWidth: '50rem'}}
          >
            <Column style={{width: '20%'}} field='reference' header='Reference'></Column>
            <Column style={{width: '20%'}} field='tagDate' header='Tag Date'></Column>
          </DataTable>
        </div>
      </div>
    </div>
  )
}

export default DataInsertion
