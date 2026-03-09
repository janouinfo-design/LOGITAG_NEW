import {Image} from 'primereact/image'

const Message = (props) => {
  const msgStr = typeof props.message === 'string' ? props.message : ''
  // Detect audio: common audio extensions OR uploaded chat audio naming
  const isAudio = !!msgStr && (/(\.(mp3|wav|ogg)$)/i.test(msgStr) || /chat_audio_/i.test(msgStr))
  // Detect video: mp4/webm/ogg but avoid conflicting with audio detection
  const isVideo = !!msgStr && !isAudio && /(\.(mp4|webm|ogg)$)/i.test(msgStr)

  return (
    <div
      key={props.id}
      style={{alignItems: props.in ? 'flex-end' : 'flex-start'}}
      className='flex flex-column my-2'
    >
      <div
        style={{minWidth: '50px', maxWidth: '90%'}}
        className={`inline-block p-3 border-round-xl ${
          props.in ? 'bg-purple-400' : 'bg-indigo-400'
        }`}
        //'#D64B70' : '#523F8D'
      >
        {props.imageMs && (
          <Image src={props.imageMs} alt='Image' className='w-full h-full object-cover' preview />
        )}
        {isAudio ? (
          <audio controls src={props.message} style={{maxWidth: '100%'}}>
            Your browser does not support the audio element.
          </audio>
        ) : isVideo ? (
          <video controls src={props.message} style={{maxWidth: '100%'}}>
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className='text-white text-xl'>{props.message}</div>
        )}
      </div>
      <div style={{alignSelf: props.in ? 'flex-end' : 'flex-start'}} className='flex flex-row p-1'>
        <div className='mr-2'>{props.from}</div>
        <div>{props.datecom}</div>
      </div>
    </div>
  )
}

export default Message
