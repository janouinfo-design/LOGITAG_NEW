/* eslint-disable jsx-a11y/anchor-is-valid */
import {useEffect, useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'

import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {checkUser, forgetPassword, getCurrentUser, login} from '../../slice/user.slice'
import SplashScreen from '../../../SplashScreen/SplashScreen'

import logitagLogo from '../../../../assets/images/Logitag Color.png'
import {getIsMenuReady} from '../../../Layout/slice/layout.slice'
import {Dialog} from 'primereact/dialog'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import {Password} from 'primereact/password'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    // .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
})

const initialValues = {
  email: '',
  password: '',
}

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function LoginComponent() {
  const [user, setUser] = useState('')
  const [loadingForget, setLoadingForget] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visibleReset, setVisibleReset] = useState(false)
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(getCurrentUser)
  const [showSpash, setShowSpash] = useState(true)
  const isMenuReady = useAppSelector(getIsMenuReady)

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const obj = {user: values.email, password: values.password}
        dispatch(login(obj))
        setLoading(false)
      } catch (error) {
        console.error(error)
        setStatus('The login details are incorrect')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  const handleForgetPassword = () => {
    setLoadingForget(true)
    dispatch(forgetPassword({login: user})).then(({payload}) => {
      setLoadingForget(false)
      if (payload) {
        setVisibleReset(false)
      }
    })
  }

  const onHide = () => {
    setUser('')
    setVisibleReset(false)
  }

  useEffect(() => {
    if (currentUser || !localStorage.getItem('token')) {
      setShowSpash(false)
      return
    }

    if (!isMenuReady) return
    setTimeout(() => {
      dispatch(checkUser())
        .then(({payload}) => {
          setShowSpash(false)
        })
        .catch((err) => {
          console.log('error:', err)
          setShowSpash(false)
        })
    }, 500)
  }, [currentUser, isMenuReady])

  if (showSpash) return <SplashScreen />
  return (
    <>
      <Dialog
        style={{width: '440px'}}
        header='Mot de passe oublié'
        visible={visibleReset}
        onHide={onHide}
        className='lt-login-dialog'
      >
        <div className='w-full flex flex-column gap-3'>
          <p className='text-sm text-slate-500 m-0'>
            Entrez votre identifiant. Nous vous enverrons un lien de réinitialisation.
          </p>
          <label className='lt-login-label'>Identifiant</label>
          <InputText
            name='user'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder='Votre identifiant'
            className='lt-login-input'
          />
          <Button
            type='submit'
            className='lt-login-submit'
            loading={loadingForget}
            disabled={loadingForget}
            onClick={handleForgetPassword}
            data-testid='forgot-submit-btn'
          >
            Envoyer le lien
          </Button>
        </div>
      </Dialog>
      <div className='lt-login-root'>
        {/* Left: Brand / marketing panel */}
        <aside className='lt-login-brand' aria-hidden='true'>
          <div className='lt-login-brand-bg' />
          <div className='lt-login-brand-grid' />
          <div className='lt-login-brand-blob lt-login-brand-blob-1' />
          <div className='lt-login-brand-blob lt-login-brand-blob-2' />

          <div className='lt-login-brand-inner'>
            <div className='lt-login-brand-top'>
              <img src={logitagLogo} alt='Logitag' className='lt-login-brand-logo' />
              <span className='lt-login-brand-badge'>
                <i className='pi pi-circle-fill' /> Live Tracking
              </span>
            </div>

            <div className='lt-login-brand-hero'>
              <h1 className='lt-login-brand-title'>
                Fleet Intelligence<br/>Platform
              </h1>
              <p className='lt-login-brand-subtitle'>
                Pilotez, suivez et optimisez vos assets en temps réel avec la plateforme Logitag — conçue pour les équipes qui ne laissent rien au hasard.
              </p>
            </div>

            <ul className='lt-login-brand-features'>
              {[
                {icon: 'pi-map-marker', title: 'Suivi GPS temps réel', desc: 'Localisation au mètre près, 24/7.'},
                {icon: 'pi-bell', title: 'Alertes intelligentes', desc: 'Soyez prévenu avant tout incident.'},
                {icon: 'pi-chart-bar', title: 'Analytiques avancées', desc: 'Des décisions basées sur vos données.'},
                {icon: 'pi-building', title: 'Multi-sites', desc: 'Gérez tous vos sites depuis une seule vue.'},
              ].map((f, i) => (
                <li key={i} className='lt-login-brand-feat' style={{animationDelay: `${0.15 + i * 0.08}s`}}>
                  <span className='lt-login-brand-feat-ico'>
                    <i className={`pi ${f.icon}`} />
                  </span>
                  <div>
                    <div className='lt-login-brand-feat-title'>{f.title}</div>
                    <div className='lt-login-brand-feat-desc'>{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className='lt-login-brand-foot'>
              <span className='lt-login-brand-foot-dot' />
              <span>4 935 engins suivis · 99,9 % uptime</span>
            </div>
          </div>
        </aside>

        {/* Right: Form panel */}
        <section className='lt-login-form-wrap'>
          <div className='lt-login-form-inner'>
            <div className='lt-login-form-head'>
              <img src={logitagLogo} alt='Logitag' className='lt-login-form-logo' />
              <h2 className='lt-login-form-title'>Connexion</h2>
              <p className='lt-login-form-sub'>
                Accédez à votre espace de pilotage de flotte.
              </p>
            </div>

            <form
              className='lt-login-form'
              onSubmit={formik.handleSubmit}
              noValidate
              id='kt_login_signin_form'
            >
              <div className='lt-login-field'>
                <label className='lt-login-label' htmlFor='lt-login-email'>Identifiant</label>
                <InputText
                  id='lt-login-email'
                  name='email'
                  placeholder='Votre identifiant'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className={clsx(
                    'lt-login-input',
                    {'is-invalid': formik.touched.email && formik.errors.email},
                  )}
                  type='text'
                  autoComplete='username'
                  data-testid='login-email-input'
                />
                {formik.touched.email && formik.errors.email && (
                  <span className='lt-login-error' role='alert'>{formik.errors.email}</span>
                )}
              </div>

              <div className='lt-login-field'>
                <div className='lt-login-label-row'>
                  <label className='lt-login-label' htmlFor='lt-login-pwd'>Mot de passe</label>
                  <button
                    type='button'
                    onClick={() => setVisibleReset(true)}
                    className='lt-login-forgot'
                    data-testid='login-forgot-btn'
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <Password
                  inputId='lt-login-pwd'
                  name='password'
                  toggleMask
                  placeholder='••••••••'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  feedback={false}
                  tabIndex={1}
                  inputClassName='lt-login-input'
                  className='lt-login-password'
                  data-testid='login-password-input'
                />
                {formik.touched.password && formik.errors.password && (
                  <span className='lt-login-error' role='alert'>{formik.errors.password}</span>
                )}
              </div>

              <button
                type='submit'
                id='kt_sign_in_submit'
                className='lt-login-submit'
                disabled={formik.isSubmitting || !formik.isValid}
                data-testid='login-submit-btn'
              >
                {!loading && <span>Se connecter</span>}
                {loading && (
                  <span className='lt-login-submit-loading'>
                    <span className='spinner-border spinner-border-sm' />
                    Connexion…
                  </span>
                )}
              </button>

              <div className='lt-login-foot'>
                <span>Besoin d'aide ?</span>
                <a href='mailto:support@logitag.ch' className='lt-login-foot-link'>
                  support@logitag.ch
                </a>
              </div>
            </form>
          </div>

          <div className='lt-login-legal'>
            © {new Date().getFullYear()} Logitag · Fleet Intelligence Platform
          </div>
        </section>
      </div>
    </>
  )
}
