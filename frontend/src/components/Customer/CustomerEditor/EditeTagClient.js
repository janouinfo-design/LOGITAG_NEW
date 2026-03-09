import {memo, useEffect, useState} from 'react'
import {
  addTagToClient,
  fetchCustomerTags,
  fetchCustomerTagsFree,
  getCustomerTagsFree,
  getDetailTagClient,
  getSelectedCustomer,
  setEditTagClient,
} from '../../../store/slices/customer.slice'
import {fetchTags, getTags} from '../../Tag/slice/tag.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {DialogComponent} from '../../shared/DialogComponent'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'

function TagEditor() {
  const visible = useAppSelector(getDetailTagClient)
  const selectedCustomer = useAppSelector(getSelectedCustomer)

  const dispatch = useAppDispatch()

  let tags = useAppSelector(getCustomerTagsFree)


  const [tagOptions, setTagOptions] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  const onHide = () => {
    dispatch(setEditTagClient(false))
  }

  const save = () => {
    dispatch(addTagToClient(selectedTag)).then((res) => {
      if (res.payload) {
        dispatch(setEditTagClient(false))
      }
    })
  }

  useEffect(() => {
    dispatch(fetchCustomerTagsFree(0))
  }, [])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={save} />
    </div>
  )

  useEffect(() => {
    setTagOptions([
      {label: 'selectionner', value: 0},
      ...tags?.map((tg) => ({
        label: tg.enginName !== '' ? tg.enginName : tg.code,
        value: tg.id,
      })),
    ])
  }, [tags])

  //   useEffect(() => {
  //     dispatch(setSelectedTagToEngin(selectedEngin?.id))
  //   }, [selectedTag])

  return (
    <div>
      <DialogComponent visible={visible} footer={footer} header='Select Tag' onHide={onHide}>
        <div className='my-3'>
          <label className='my-2'>Tag Disponible</label>
          <Dropdown
            name='tags'
            value={selectedTag}
            options={tagOptions}
            optionLabel='label'
            onChange={(e) => setSelectedTag(e.value)}
            placeholder='select Tag'
            className='w-full'
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(TagEditor)
