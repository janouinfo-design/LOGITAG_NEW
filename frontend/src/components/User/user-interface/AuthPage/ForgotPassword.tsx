import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import clsx from 'clsx'
import {Image} from 'primereact/image'
import {Password} from 'primereact/password'
import {Button} from 'primereact/button'
import {useSearchParams} from 'react-router-dom'
import {useAppDispatch} from '../../../../hooks'
import {saveNewPassword, setUserNewPassword} from '../../slice/user.slice'

const initialValues = {
  newPassword: '',
  confirmPassword: '',
}
interface PasswordResetArgs {
  id: string | null
  pass: string
}

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
})

export const ForgotPassword = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        // TODO: Implement your password reset API call here
        // const response = await api.resetPassword(values);
        const args: PasswordResetArgs = {
          id,
          pass: values.newPassword,
        }
        dispatch(setUserNewPassword(args))
        await dispatch(saveNewPassword())
        setHasErrors(false)
        setStatus('Password reset successful')
        navigate('/auth')
      } catch (error) {
        setHasErrors(true)
        setStatus('Password reset failed. Please try again.')
      } finally {
        setLoading(false)
        setSubmitting(false)
      }
    },
  })

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 sm:px-6 lg:px-8'>
      <div className='flex justify-center mb-2 mt-8'>
        <Image
          alt='EngineImage'
          width='300'
          height='300'
          imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
          src={require('../../../../assets/images/Logitag Color.png')}
        />
      </div>
      <div className='sm:mx-auto sm:w-full sm:max-w-md mt-4'>
        <h2 className='text-center text-3xl font-extrabold text-gray-900'>Reset Password</h2>
        <p className='mt-2 text-center text-sm text-gray-600'>Enter your new password below</p>
      </div>

      <div className='mt-4  sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form className='space-y-6' onSubmit={formik.handleSubmit} noValidate>
            {/* New Password Field */}
            <div>
              <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
                New Password
              </label>
              <div className='mt-1'>
                <Password
                  type='password'
                  {...formik.getFieldProps('newPassword')}
                  toggleMask
                  className={clsx('w-full', {
                    'p-invalid': formik.touched.newPassword && formik.errors.newPassword,
                  })}
                  inputClassName='w-full'
                  feedback={true}
                />
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className='mt-1 text-sm text-red-600'>{formik.errors.newPassword}</div>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                Confirm Password
              </label>
              <div className='mt-1'>
                <Password
                  type='password'
                  {...formik.getFieldProps('confirmPassword')}
                  toggleMask
                  className={clsx('w-full', {
                    'p-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword,
                  })}
                  inputClassName='w-full'
                  feedback={false}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className='mt-1 text-sm text-red-600'>{formik.errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type='submit'
                disabled={formik.isSubmitting || !formik.isValid}
                className={clsx(
                  'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
                  {
                    'bg-blue-600 hover:bg-blue-700': !loading,
                    'bg-blue-400 cursor-not-allowed': loading,
                  }
                )}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>

            {/* Status Message */}
            {formik.status && (
              <div
                className={clsx('mt-3 text-sm text-center', {
                  'text-green-600': !hasErrors,
                  'text-red-600': hasErrors,
                })}
              >
                {formik.status}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
