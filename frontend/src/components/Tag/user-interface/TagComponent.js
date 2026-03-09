import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  createOrUpdateTag,
  fetchTags,
  getEditTag,
  getSelectedTag,
  getShow,
  getTags,
  setEditTag,
  setSelectedTag,
  setShow,
} from '../slice/tag.slice'
import TagDetail from './TagDetail/TagDetail'
import TagEditor from './TagEditor/TagEditor'
import TagList from './TagList/TagList'
import {useEffect} from 'react'
import TagMapLocation from './TagMapLocation/TagMapLocation'

function TagComponent() {
  let show = useAppSelector(getShow)
  let selectedTag = useAppSelector(getSelectedTag)
  let visible = useAppSelector(getEditTag)
  const tags = useAppSelector(getTags)

  const location = useLocation()
  const dispatch = useAppDispatch()

  const save = (e) => {
    dispatch(createOrUpdateTag(e)).then(({payload}) => {
      if (payload) {
        dispatch(fetchTags())
        dispatch(setEditTag(false))
        dispatch(setSelectedTag(null))
      }
    })
  }

  useEffect(() => {
    if (location.pathname !== '/tag/index') {
      dispatch(setShow(false))
    } else {
      dispatch(setShow(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <TagList titleShow={true} detailView='Detail' tags={tags} /> : <TagDetail />}
      <TagEditor
        engin={false}
        selectedTag={selectedTag}
        visible={visible}
        onHide={() => dispatch(setEditTag(false))}
        onSubmitHandler={(e) => save(e)}
      />
      <TagMapLocation />
    </div>
  )
}

export default TagComponent
