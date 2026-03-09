import {getCurrentLang, getEditLang, getLangs, setLangEditParams} from '../../slice/olang.slice'
import {useDispatch} from 'react-redux'
import {useAppSelector} from '../../../../../hooks'
import './style/style.css'
import {useEffect, useState} from 'react'

export function OlangItem(props) {
  const langs = useAppSelector(getLangs)
  const currentLang = useAppSelector(getCurrentLang)
  const [text, setText] = useState('')
  const [olang, setOlang] = useState('')
  useEffect(() => {
    const txt =
      typeof langs?.[currentLang]?.[olang.toLowerCase()] === 'string'
        ? langs?.[currentLang]?.[olang.toLowerCase()]
        : olang
    setText(txt)
  }, [langs, olang, currentLang])

  useEffect(() => {
    setOlang(typeof props.olang !== 'string' ? '' : props.olang)
  }, [props.olang])

  const edit = useAppSelector(getEditLang)

  const dispatch = useDispatch()
  const editLang = () => {
    dispatch(
      setLangEditParams({
        show: true,
        code: props.olang,
        text: text,
      })
    )
  }
  return (
    <div
      className='olang-item'
      style={{display: 'inline-block', position: 'relative', ...(props.style || {})}}
    >
      <span className='flex align-items-center relative'>
        {text}
        {edit ? (
          <span
            onClick={editLang}
            icon=''
            className='realtive cursor-pointer hover:bg-blue-600  p-round-button p-2  p-button-sm bg-blue-500 text-white pi pi-pencil olang-item-editor-icon'
            style={{marginTop: '-10px', borderRadius: '50px'}}
          ></span>
        ) : null}
      </span>
    </div>
  )
}
// export default memo(Olang)
