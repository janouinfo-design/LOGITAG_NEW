import {ProgressBar} from 'primereact/progressbar'

const ProgressBarComponent = ({value}) => {
  return (
    <div className='text-center'>
      <ProgressBar
        value={value}
        displayValueTemplate={() => `${value}%`}
        style={{width: '50%', height: '50%'}}
        className='m-5'
      />
    </div>
  )
}

export default ProgressBarComponent
