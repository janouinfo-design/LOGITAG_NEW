import {Button} from 'primereact/button'
import Lottie from 'lottie-react'
import {QRCodeSVG} from 'qrcode.react'
import {Steps} from 'primereact/steps'
import {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchVersion, getAndroidVersion} from '../../Company/slice/company.slice'
import phoneScanAnimation from '../../Animations/phoneScan/Qr Code Scan.json'
const QrCodeApk = () => {
  const [apk, setApk] = useState('')
  const [selectedApp, setSelectedApp] = useState('admin')
  const [activeStep, setActiveStep] = useState(0)

  const objRef = useRef(null)

  const dispatch = useAppDispatch()

  const versionApk = useAppSelector(getAndroidVersion)

  const getNameApp = (selected) => {
    if (selected === 'admin') {
      const url = 'https://app.logitag.ch:8443/dl/apk/global.apk'
      setApk(url)
    } else if (selected === 'env') {
      setApk(objRef.current?.adminApp || '')
    }
  }

  useEffect(() => {
    dispatch(fetchVersion('version'))
    dispatch(fetchVersion('appName')).then(({payload}) => {
      const parsedValue = JSON.parse(payload?.[0]?.Value || '{}')
      objRef.current = parsedValue
      getNameApp(selectedApp)
    })
  }, [])

  const stepDetails = [
    {
      stepperLabel: '1. Lire les étapes',
      badgeText: 'Les étapes',
      badgeClass: 'text-blue-500',
      icon: 'pi pi-qrcode',
      title: "Étape 1 · Installer l'application ",
      intro:
        'Bienvenue dans LOGITAG ! Pour commencer, suivez les instructions ci-dessous pour installer et préparer l’application LOGITAG .',
      bullets: [
        'Scannez le QR code ci-dessus avec votre smartphone afin de télécharger et installer l’application LOGITAG .',
        'Une fois l’application installée, ouvrez-la et rendez-vous sur l’écran de connexion.',
        'Sur la page de login, appuyez sur le bouton ‘Scanner l’environnement’.',
        'Pointez votre téléphone vers le QR code.',
        'LOGITAG va alors configurer automatiquement vos paramètres.',
        'Une fois l’environnement chargé, connectez-vous avec vos identifiants habituels.',
      ],
      closing: 'C’est simple, rapide et sécurisé.',

      appKey: 'admin',
    },
    {
      stepperLabel: "2. Telecharger l'application",
      badgeText: 'Installation',
      badgeClass: 'text-purple-500',
      icon: 'pi pi-mobile',
      title: "2. Scanner QR code Pour telecharger l'application",
      description:
        "Ouvre la camera de votre téléphone et scannez le QR code ci-dessus. pour telecharger l'application LOGITAG .",
      helper:
        'Astuce : si vous devez réinstaller, scannez à nouveau le QR code de l’étape précédente pour relancer le téléchargement.',
      appKey: 'admin',
    },
    {
      stepperLabel: '3. Configurer l’environnement',
      badgeText: 'Configuration',
      badgeClass: 'text-green-500',
      icon: 'pi pi-wifi',
      title: 'Étape 3 · Scanner QR code pour configurer l’environnement',
      description:
        'Depuis le scanner LOGITAG, lisez ce QR code pour appliquer automatiquement les paramètres de votre environnement et finaliser l’onboarding.',
      helper:
        "Scannez ce QR code depuis l'application pour lier votre appareil à votre instance LOGITAG , Si l’application n’ouvre pas automatiquement la caméra pour scanner le QR code, vous pouvez cliquer sur l’icône en haut à droite (icône QR code) pour scanner cet environnement.",
      appKey: 'env',
    },
  ]

  const goToStep = (index, appKey) => {
    setActiveStep(index)
    setSelectedApp(appKey)
    getNameApp(appKey)
  }

  const steps = stepDetails.map((step, index) => ({
    label: step.stepperLabel,
    command: () => goToStep(index, step.appKey),
  }))

  const handleNext = () => {
    if (activeStep < stepDetails.length - 1) {
      const nextIndex = activeStep + 1
      goToStep(nextIndex, stepDetails[nextIndex].appKey)
    }
  }

  const handlePrev = () => {
    if (activeStep > 0) {
      const prevIndex = activeStep - 1
      goToStep(prevIndex, stepDetails[prevIndex].appKey)
    }
  }

  const currentStep = stepDetails[activeStep]
  const qrValue = apk || 'https://logitag.ch'

  useEffect(() => {
    if (activeStep === 0) {
      const timer = setTimeout(() => {
        goToStep(1, stepDetails[1].appKey)
      }, 20000)
      return () => clearTimeout(timer)
    }
  }, [activeStep])

  const renderVisual = () => {
    if (activeStep === 0) {
      return (
        <div
          className='w-full bg-indigo-50 border-round-3xl flex justify-content-center align-items-center p-4'
          style={{height: '280px'}}
        >
          <Lottie
            animationData={phoneScanAnimation}
            loop
            autoplay
            style={{height: '260px'}}
            className='w-full'
          />
        </div>
      )
    }

    return null
  }

  const renderContent = () => {
    if (activeStep === 0) {
      return (
        <div className='flex flex-column gap-3 w-full text-left text-gray-700'>
          <span className='text-xs uppercase tracking-widest font-semibold text-blue-500'>
            {currentStep.badgeText}
          </span>
          <h2 className='text-2xl md:text-3xl font-semibold text-gray-900'>{currentStep.title}</h2>
          <p className='text-base line-height-3 m-0'>{currentStep.intro}</p>
          <ul className='m-0 pl-3 flex flex-column gap-2 text-sm md:text-base'>
            {currentStep.bullets.map((item, index) => (
              <li key={item} className='text-gray-700'>
                <span className='font-semibold text-indigo-500 mr-2'>{index + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
          <p className='text-base font-medium text-gray-800 m-0'>{currentStep.closing}</p>
          <small className='text-sm text-gray-500 italic'>{currentStep.helper}</small>
        </div>
      )
    }

    return (
      <div className='flex flex-column gap-3 w-full text-left'>
        <span
          className={`text-xs uppercase tracking-widest font-semibold ${currentStep.badgeClass}`}
        >
          {currentStep.badgeText}
        </span>
        <h2 className='text-2xl md:text-3xl font-semibold text-gray-900'>{currentStep.title}</h2>
        <p className='text-gray-600 line-height-3'>{currentStep.description}</p>
        {currentStep.helper && (
          <small className='text-gray-500 text-sm'>{currentStep.helper}</small>
        )}
      </div>
    )
  }

  return (
    <div className='surface-ground flex flex-column justify-content-between gap-4 py-6 px-3'>
      <section className='w-full flex justify-content-center'>
        <div
          className='surface-card border-round-4xl shadow-4 w-full max-w-6xl flex flex-column gap-4 p-4 md:p-6'
          style={{minHeight: '560px'}}
        >
          {renderVisual()}
          <div className='flex flex-column gap-4'>{renderContent()}</div>
          {activeStep !== 0 && (
            <>
              <div className='border-2 border-dashed border-200 border-round-3xl p-4 flex flex-column align-items-center gap-3 bg-gray-50'>
                <QRCodeSVG
                  value={qrValue}
                  title={'QR LOGITAG'}
                  size={260}
                  bgColor={'#ffffff'}
                  fgColor={'#000000'}
                  level={'H'}
                  imageSettings={{
                    src: require('../../../assets/icons/LOGITAGCMYK.png'),
                    height: 60,
                    width: 45,
                    opacity: 1,
                    excavate: true,
                  }}
                />
                <small className='text-gray-500 text-sm text-center'>
                  Pointez la caméra de votre appareil sur ce QR code.
                </small>
              </div>
              <div className='flex flex-column align-items-start md:flex-row md:align-items-center justify-content-between gap-2 text-sm text-gray-500 w-full'>
                <strong>
                  Version :{' '}
                  <span className='font-semibold'>{versionApk?.[0]?.Value || '1.0.0'}</span>
                </strong>
                <span>Compatible Android uniquement · Support 24/7</span>
                <span className='text-blue-500 text-lg'>support@logitag.ch</span>
              </div>
            </>
          )}

          <div className='flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 bg-gray-50 border-round-3xl p-3 w-full'>
            <Steps
              model={steps}
              activeIndex={activeStep}
              readOnly
              className='flex-1 w-full md:mr-3'
            />
            <div className='flex justify-content-end gap-3 flex-wrap'>
              <Button
                label='Étape précédente'
                icon='pi pi-arrow-left'
                severity='secondary'
                outlined
                disabled={activeStep === 0}
                onClick={handlePrev}
              />
              <Button
                label={
                  activeStep === stepDetails.length - 1 ? 'Allez, c’est parti !' : 'Étape suivante'
                }
                icon={activeStep === stepDetails.length - 1 ? 'pi pi-check' : 'pi pi-arrow-right'}
                iconPos='right'
                onClick={handleNext}
                disabled={activeStep === stepDetails.length - 1}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default QrCodeApk
