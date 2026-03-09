
import Icon from '../../assets/icons/LOGITAGColorized.png'
import { ProgressSpinner } from 'primereact/progressspinner'
import './style.css'
const SplashScreen = () => {
  return (
    <div className='flex flex-column align-items-center justify-content-center' style={{height: '100vh'}}>
      <img src={Icon} className='zoom-animation'  alt="LOGITAG" style={{width: '300px' }} />
      {/* <img src={} class="light-logo" alt="LOGITAG" /> */}
      <ProgressSpinner animationDuration={1000} strokeWidth='3' />
    </div>
  )
}

export default SplashScreen