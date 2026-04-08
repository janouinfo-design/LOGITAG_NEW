/* eslint-disable jsx-a11y/anchor-is-valid */
import {useEffect} from 'react'
import {Outlet, Route, Routes} from 'react-router-dom'
import {LoginComponent} from '../LoginComponent/LoginComponent'
import { ForgotPassword } from './ForgotPassword'

const AuthLayout = () => {
  useEffect(() => {
    document.body.classList.add('bg-body')
    return () => {
      document.body.classList.remove('bg-body')
    }
  }, [])

  return <Outlet />
}

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path='login' element={<LoginComponent />} />
      <Route path='forgot-password' element={<ForgotPassword />} />
      <Route index element={<LoginComponent />} />
    </Route>
  </Routes>
)

export {AuthPage}
