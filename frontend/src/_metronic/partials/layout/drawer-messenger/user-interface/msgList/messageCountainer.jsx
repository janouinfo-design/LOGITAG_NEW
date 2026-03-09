import {Avatar} from 'primereact/avatar'
import {API_BASE_URL_IMAGE} from '../../../../../../api/config'
import {useEffect} from 'react'
import {setDetailMessage} from '../../slice/Chat.slice'
import {useAppDispatch} from '../../../../../../hooks'

const MessageCountainer = (props) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setDetailMessage([]))
  }, [])

  return (
    <>
      <div
        key={props.id}
        onClick={props.onClick}
        className='bg-gray-200 border-round-lg p-2 mb-2 cursor-pointer flex flex-row justify-content-between align-items-center'
      >
        <div className='flex flex-row'>
          <Avatar
            image={API_BASE_URL_IMAGE + props.image}
            className='flex align-items-center justify-content-center mr-2'
            size='xlarge'
            shape='circle'
          />

          {/* <img
            src={API_BASE_URL_IMAGE + props.image}
            alt='Image'
            width='70'
            height='70'
            style={{objectFit: 'cover', borderRadius: '50%'}}
          /> */}
          <div className='flex flex-column ml-3'>
            <div className='text-xl font-semibold'>{props.Object}</div>
            <div>{props?.message}</div>
          </div>
        </div>
        <div className='flex flex-column  justify-content-between'>
          <div className='flex w-full justify-content-end'>
            {props.Read == 1 ? (
              <div className='flex bg-green-500 text-white p-2 border-circle w-2rem h-2rem justify-content-center align-items-center'>
                1
              </div>
            ) : null}
          </div>
          <div className='text-xl mt-2 font-semibold text-gray-400'>{props.datecom}</div>
        </div>
      </div>
    </>
  )
}

export default MessageCountainer
