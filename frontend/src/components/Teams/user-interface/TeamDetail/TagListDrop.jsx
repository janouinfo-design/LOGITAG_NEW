import React, {useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Dropdown} from 'primereact/dropdown'
import ButtonComponent from '../../../shared/ButtonComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getTags, getTagsFree} from '../../../Tag/slice/tag.slice'
import {addTagTeam, getSelectedTeam, getTagVisible, setTagVisible} from '../../slice/team.slice'

const TagListDrop = () => {
  const [selectedTag, setSelectedTag] = useState(null)

  const tags = useAppSelector(getTagsFree)
  const visible = useAppSelector(getTagVisible)
  const selectedTeam = useAppSelector(getSelectedTeam)

  const dispatch = useAppDispatch()


  const onHide = () => {
    dispatch(setTagVisible(false))
  }

  const save = () => {
    if (selectedTag) {
      let obj = {
        childObject: 'tag',
        childID: selectedTag,
        parent: 'staff',
        parentID: selectedTeam.id,
      }
      dispatch(addTagTeam(obj)).then((res) => {
        if (res.payload) {
          dispatch(setTagVisible(false))
        }
      })
    }
  }

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' disabled={!selectedTag} onClick={save} />
    </div>
  )

  return (
    <DialogComponent visible={visible} footer={footer} header='Select Tag' onHide={onHide}>
      <div className='my-3'>
        <label className='my-2'>
          <OlangItem olang='Tag.Disponible' />
        </label>
        <Dropdown
          filter
          name='tags-dropdown'
          value={selectedTag}
          options={tags}
          optionLabel='label'
          optionValue='id'
          onChange={(e) => setSelectedTag(e.value)}
          placeholder='select Tag'
          className='w-full'
        />
      </div>
    </DialogComponent>
  )
}

export default TagListDrop
