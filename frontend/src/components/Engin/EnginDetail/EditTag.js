import {memo, useEffect, useState} from 'react'
import {getEditTagEngin, getSelectedEngine, setEditTagEngin} from '../slice/engin.slice'
import {
  addTagToEngin,
  fetchTags,
  fetchTagsFree,
  fetchTagsWithEngin,
  getTags,
  getTagsFree,
  removeEnginTag,
  setSelectedTagToEngin,
} from '../../Tag/slice/tag.slice'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {Dropdown} from 'primereact/dropdown'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

function TagEditor() {
  const visible = useAppSelector(getEditTagEngin)
  const selectedEngin = useAppSelector(getSelectedEngine)

  const dispatch = useAppDispatch()

  const tags = useAppSelector(getTagsFree)

  const [tagOptions, setTagOptions] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  const onHide = () => {
    dispatch(setEditTagEngin(false))
  }

  const save = () => {
    dispatch(addTagToEngin(selectedTag)).then((res) => {
      if (res.payload) {
        dispatch(setEditTagEngin(false))
        dispatch(fetchTagsWithEngin(selectedEngin?.id))
      }
    })
  }

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={save} />
    </div>
  )

  useEffect(() => {
    // const tagFilter = tags?.filter((dis) => dis.status === 'Disponible')
    setTagOptions([
      {label: 'selectionner', value: 0},
      ...tags?.map((tg) => ({
        label: tg.name,
        value: tg.id,
      })),
    ])
  }, [tags])

  // useEffect(() => {
  //   dispatch(setSelectedTagToEngin(selectedEngin?.id))
  // }, [selectedTag])

  useEffect(() => {
    dispatch(fetchTagsFree())
  }, [])

  return (
    <div>
      <DialogComponent visible={visible} footer={footer} header='Select Tag' onHide={onHide}>
        <div className='my-3'>
          <label className='my-2'>
            <OlangItem olang='Tag.Disponible' />
          </label>
          <Dropdown
            filter
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
