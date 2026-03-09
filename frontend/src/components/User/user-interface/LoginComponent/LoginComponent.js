
import {useEffect, useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'

import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {checkUser, forgetPassword, getCurrentUser, login} from '../../slice/user.slice'
import SplashScreen from '../../../SplashScreen/SplashScreen'

import {toAbsoluteUrl} from '../../../../_metronic/helpers'

import bgImage from '../../assets/images/network-bg.jpg'
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
      <Dialog style={{width: '500px'}} header='Login' visible={visibleReset} onHide={onHide}>
        <div className='w-full flex flex-column gap-2'>
          <label className='form-label fs-6 fw-bolder text-dark'>User</label>
          <InputText
            name='user'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder='User'
          />
          <Button
            type='submit'
            className='btn btn-primary'
            // disabled={formik.isSubmitting || !formik.isValid}
            loading={loadingForget}
            disabled={loadingForget}
            onClick={handleForgetPassword}
          >
            Submit
          </Button>
        </div>
      </Dialog>
      <div
        className='md:flex flex  justify-center items-center  flex-column-fluid flex-wrap bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed'
        style={{
          backgroundImage: `url(${toAbsoluteUrl('/media/illstrations/sketchy-1/14.png')})`,
        }}
      >
        <div
          className='w-12 md:w-5 bg-dark h-20rem md:h-full bgi-no-repeat bgi-size-cover hidden md:block'
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        ></div>
        {/* begin::Content */}
        <div className='flex d-flex   flex-center flex-column-fluid p-10 pb-lg-20'>
          {/* begin::Wrapper */}

          <div className='w-11 md:w-7 lg:w-6 bg-body rounded shadow-sm p-10 p-lg-15 mx-auto'>
            <form
              className='form w-100'
              onSubmit={formik.handleSubmit}
              noValidate
              id='kt_login_signin_form'
            >
              {/* begin::Form group */}
              <div className='fv-row mb-5'>
                <label className='form-label fs-6 fw-bolder text-dark'>User</label>
                {/* <input
                  placeholder='Email'
                  {...formik.getFieldProps('email')}
                  className={clsx(
                    'form-control bg-transparent',
                    {'is-invalid': formik.touched.email && formik.errors.email},
                    {
                      'is-valid': formik.touched.email && !formik.errors.email,
                    }
                  )}
                  type='email'
                  name='email'
                  autoComplete='off'
                /> */}
                <InputText
                  name='email'
                  placeholder='Email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className={clsx(
                    'form-control',
                    {'is-invalid': formik.touched.email && formik.errors.email},
                    {
                      'is-valid': formik.touched.email && !formik.errors.email,
                    }
                  )}
                  type='email'
                  autoComplete='off'
                />

                {formik.touched.email && formik.errors.email && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{formik.errors.email}</span>
                  </div>
                )}
              </div>
              {/* end::Form group */}

              {/* begin::Form group */}
              <div className='flex flex-col mb-3'>
                <label className='form-label fw-bolder text-dark fs-6 mb-0'>Password</label>
                {/* <input
                  type='password'
                  autoComplete='off'
                  {...formik.getFieldProps('password')}
                  className={clsx(
                    'form-control bg-transparent',
                    {
                      'is-invalid': formik.touched.password && formik.errors.password,
                    },
                    {
                      'is-valid': formik.touched.password && !formik.errors.password,
                    }
                  )}
                /> */}
                <Password
                  name='password'
                  toggleMask
                  // className={clsx(
                  //   'form-control bg-transparent',
                  //   {
                  //     'is-invalid': formik.touched.password && formik.errors.password,
                  //   },
                  //   {
                  //     'is-valid': formik.touched.password && !formik.errors.password,
                  //   }
                  // )}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  feedback={false}
                  tabIndex={1}
                  inputClassName='w-full'
                />

                {formik.touched.password && formik.errors.password && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.errors.password}</span>
                    </div>
                  </div>
                )}
                <div>
                  <div
                    onClick={() => setVisibleReset(true)}
                    className='link-primary cursor-pointer text-base'
                  >
                    Forgot Password ?
                  </div>
                </div>
              </div>
              {/* end::Form group */}

              {/* begin::Action */}
              <div className='d-grid mb-10 mt-6'>
                <button
                  type='submit'
                  id='kt_sign_in_submit'
                  className='btn btn-primary'
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  {!loading && <span className='indicator-label'>Continue</span>}
                  {loading && (
                    <span className='indicator-progress' style={{display: 'block'}}>
                      Please wait...
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  )}
                </button>
              </div>
              {/* end::Action */}
            </form>
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Content */}
      </div>
    </>
  )
}
