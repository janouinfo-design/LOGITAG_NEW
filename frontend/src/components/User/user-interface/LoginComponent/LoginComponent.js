
import {useEffect, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {checkUser, forgetPassword, getCurrentUser, login} from '../../slice/user.slice'
import SplashScreen from '../../../SplashScreen/SplashScreen'
import {getIsMenuReady} from '../../../Layout/slice/layout.slice'
import {Dialog} from 'primereact/dialog'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .min(3, 'Minimum 3 caractères')
    .max(50, 'Maximum 50 caractères')
    .required("L'identifiant est requis"),
  password: Yup.string()
    .min(3, 'Minimum 3 caractères')
    .max(50, 'Maximum 50 caractères')
    .required('Le mot de passe est requis'),
})

const initialValues = {
  email: '',
  password: '',
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
)

const SpinnerIcon = () => (
  <svg className="lt-spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
)

export function LoginComponent() {
  const [user, setUser] = useState('')
  const [loadingForget, setLoadingForget] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visibleReset, setVisibleReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      {/* Forgot Password Modal */}
      <Dialog
        style={{width: '440px', borderRadius: '16px'}}
        header={
          <span style={{fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#0F172A'}}>
            Mot de passe oublié
          </span>
        }
        visible={visibleReset}
        onHide={onHide}
        data-testid="forgot-password-dialog"
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <p style={{fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#64748B', margin: 0}}>
            Entrez votre identifiant et nous vous enverrons un lien de réinitialisation.
          </p>
          <div style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}}>
              <UserIcon />
            </div>
            <input
              data-testid="forgot-password-input"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Identifiant"
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.925rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                backgroundColor: '#F8FAFC',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB'
                e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                e.target.style.backgroundColor = '#FFFFFF'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0'
                e.target.style.boxShadow = 'none'
                e.target.style.backgroundColor = '#F8FAFC'
              }}
            />
          </div>
          <button
            data-testid="forgot-password-submit"
            onClick={handleForgetPassword}
            disabled={loadingForget || !user}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loadingForget || !user ? '#94A3B8' : '#2563EB',
              color: '#FFFFFF',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loadingForget || !user ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loadingForget ? 'Envoi en cours...' : 'Réinitialiser'}
          </button>
        </div>
      </Dialog>

      {/* Main Login Page */}
      <div className="lt-login-container" data-testid="login-page">
        <style>{`
          @keyframes ltSpin { to { transform: rotate(360deg) } }
          @keyframes ltFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes ltFadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes ltPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
          .lt-spinner { animation: ltSpin 1s linear infinite; }
          .lt-login-container {
            min-height: 100vh;
            display: flex;
            font-family: 'Inter', sans-serif;
            background: #0F172A;
            overflow: hidden;
          }
          .lt-left-panel {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px;
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            overflow: hidden;
          }
          .lt-left-panel::before {
            content: '';
            position: absolute;
            top: -150px;
            right: -150px;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
            animation: ltPulse 4s ease-in-out infinite;
          }
          .lt-left-panel::after {
            content: '';
            position: absolute;
            bottom: -100px;
            left: -100px;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%);
            animation: ltPulse 5s ease-in-out infinite 1s;
          }
          .lt-grid-pattern {
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 60px 60px;
          }
          .lt-brand-content {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 420px;
          }
          .lt-brand-logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 72px;
            height: 72px;
            border-radius: 18px;
            background: rgba(37,99,235,0.1);
            border: 1px solid rgba(37,99,235,0.2);
            margin-bottom: 32px;
            animation: ltFloat 6s ease-in-out infinite;
          }
          .lt-brand-title {
            font-family: 'Manrope', sans-serif;
            font-size: 2.75rem;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.03em;
            margin: 0 0 12px 0;
            line-height: 1.1;
          }
          .lt-brand-title span {
            color: #2563EB;
          }
          .lt-brand-subtitle {
            font-size: 1.05rem;
            color: #94A3B8;
            line-height: 1.6;
            margin: 0 0 40px 0;
          }
          .lt-feature-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            text-align: left;
          }
          .lt-feature-item {
            display: flex;
            align-items: center;
            gap: 14px;
            color: #CBD5E1;
            font-size: 0.925rem;
          }
          .lt-feature-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563EB;
            flex-shrink: 0;
          }
          .lt-right-panel {
            width: 520px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FFFFFF;
            padding: 48px;
            position: relative;
          }
          .lt-form-wrapper {
            width: 100%;
            max-width: 380px;
            animation: ltFadeSlideUp 0.7s ease-out;
          }
          .lt-form-header {
            margin-bottom: 36px;
          }
          .lt-form-header h2 {
            font-family: 'Manrope', sans-serif;
            font-size: 1.75rem;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 8px 0;
            letter-spacing: -0.02em;
          }
          .lt-form-header p {
            font-size: 0.925rem;
            color: #64748B;
            margin: 0;
          }
          .lt-input-group {
            margin-bottom: 20px;
          }
          .lt-input-label {
            display: block;
            font-family: 'Manrope', sans-serif;
            font-size: 0.825rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
            letter-spacing: 0.01em;
          }
          .lt-input-wrapper {
            position: relative;
          }
          .lt-input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #94A3B8;
            pointer-events: none;
            transition: color 0.2s;
          }
          .lt-input {
            width: 100%;
            padding: 13px 14px 13px 44px;
            border-radius: 10px;
            border: 1.5px solid #E2E8F0;
            font-family: 'Inter', sans-serif;
            font-size: 0.925rem;
            color: #0F172A;
            outline: none;
            transition: all 0.2s;
            background: #F8FAFC;
            box-sizing: border-box;
          }
          .lt-input:focus {
            border-color: #2563EB;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
            background: #FFFFFF;
          }
          .lt-input:focus ~ .lt-input-icon {
            color: #2563EB;
          }
          .lt-input.lt-input-error {
            border-color: #EF4444;
            box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
          }
          .lt-input-password {
            padding-right: 48px;
          }
          .lt-toggle-password {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #94A3B8;
            padding: 4px;
            display: flex;
            align-items: center;
            transition: color 0.2s;
          }
          .lt-toggle-password:hover {
            color: #475569;
          }
          .lt-error-msg {
            font-size: 0.8rem;
            color: #EF4444;
            margin-top: 6px;
            font-weight: 500;
          }
          .lt-forgot-link {
            display: inline-block;
            font-size: 0.85rem;
            color: #2563EB;
            font-weight: 500;
            cursor: pointer;
            margin-top: 4px;
            text-decoration: none;
            transition: color 0.2s;
          }
          .lt-forgot-link:hover {
            color: #1D4ED8;
          }
          .lt-submit-btn {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            border: none;
            background: #2563EB;
            color: #FFFFFF;
            font-family: 'Manrope', sans-serif;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 28px;
            box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          }
          .lt-submit-btn:hover:not(:disabled) {
            background: #1D4ED8;
            box-shadow: 0 6px 20px rgba(37,99,235,0.4);
            transform: translateY(-1px);
          }
          .lt-submit-btn:active:not(:disabled) {
            transform: translateY(0);
          }
          .lt-submit-btn:disabled {
            background: #94A3B8;
            cursor: not-allowed;
            box-shadow: none;
          }
          .lt-divider {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 28px 0;
            color: #94A3B8;
            font-size: 0.8rem;
          }
          .lt-divider::before, .lt-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #E2E8F0;
          }
          .lt-footer {
            text-align: center;
            margin-top: 32px;
            font-size: 0.8rem;
            color: #94A3B8;
          }
          @media (max-width: 960px) {
            .lt-login-container { flex-direction: column; }
            .lt-left-panel { display: none; }
            .lt-right-panel {
              width: 100%;
              min-height: 100vh;
              padding: 32px 24px;
            }
          }
        `}</style>

        {/* Left Panel - Branding */}
        <div className="lt-left-panel">
          <div className="lt-grid-pattern" />
          <div className="lt-brand-content">
            <div className="lt-brand-logo">
              <LogoIcon />
            </div>
            <h1 className="lt-brand-title">
              Logi<span>TAG</span>
            </h1>
            <p className="lt-brand-subtitle">
              Plateforme intelligente de suivi logistique et de gestion d'actifs en temps réel
            </p>
            <div className="lt-feature-list">
              <div className="lt-feature-item">
                <div className="lt-feature-dot" />
                Suivi GPS et RFID en temps réel
              </div>
              <div className="lt-feature-item">
                <div className="lt-feature-dot" style={{background: '#F97316'}} />
                Gestion de flotte et géofencing
              </div>
              <div className="lt-feature-item">
                <div className="lt-feature-dot" />
                Tableaux de bord analytiques
              </div>
              <div className="lt-feature-item">
                <div className="lt-feature-dot" style={{background: '#10B981'}} />
                Facturation et reporting intégrés
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lt-right-panel">
          <div className="lt-form-wrapper">
            <div className="lt-form-header">
              <h2 data-testid="login-title">Connexion</h2>
              <p>Accédez à votre espace de gestion LogiTAG</p>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate data-testid="login-form">
              {/* User field */}
              <div className="lt-input-group">
                <label className="lt-input-label" htmlFor="login-email">
                  Identifiant
                </label>
                <div className="lt-input-wrapper">
                  <input
                    id="login-email"
                    data-testid="login-email-input"
                    name="email"
                    type="text"
                    placeholder="Entrez votre identifiant"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete="off"
                    className={`lt-input ${formik.touched.email && formik.errors.email ? 'lt-input-error' : ''}`}
                  />
                  <span className="lt-input-icon"><UserIcon /></span>
                </div>
                {formik.touched.email && formik.errors.email && (
                  <div className="lt-error-msg" data-testid="email-error">{formik.errors.email}</div>
                )}
              </div>

              {/* Password field */}
              <div className="lt-input-group">
                <label className="lt-input-label" htmlFor="login-password">
                  Mot de passe
                </label>
                <div className="lt-input-wrapper">
                  <input
                    id="login-password"
                    data-testid="login-password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete="off"
                    className={`lt-input lt-input-password ${formik.touched.password && formik.errors.password ? 'lt-input-error' : ''}`}
                  />
                  <span className="lt-input-icon"><LockIcon /></span>
                  <button
                    type="button"
                    className="lt-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="toggle-password-btn"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="lt-error-msg" data-testid="password-error">{formik.errors.password}</div>
                )}
                <span
                  className="lt-forgot-link"
                  onClick={() => setVisibleReset(true)}
                  data-testid="forgot-password-link"
                  role="button"
                  tabIndex={0}
                >
                  Mot de passe oublié ?
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="lt-submit-btn"
                disabled={formik.isSubmitting || !formik.isValid || loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>

            <div className="lt-divider">LogiTAG Platform</div>

            <div className="lt-footer">
              &copy; {new Date().getFullYear()} LogiTAG &mdash; Tous droits réservés
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
