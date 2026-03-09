/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import {FC, useEffect} from 'react'
import {Routes, Route, BrowserRouter, Navigate, useLocation} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {AuthPage} from '../../components/User/user-interface/AuthPage/AuthPage'
import {App} from '../App'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {checkUser, getCurrentUser} from '../../components/User/slice/user.slice'
import {fetchLangs} from '../../components/shared/Olang/slice/olang.slice'
import {AttachmentComponent} from '../../components/User/user-interface/AttachmentComponent/AttachmentComponent'
import configs from '../../configs'
/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */

const AppRoutes = () => {
  const currentUser = useAppSelector(getCurrentUser)
  const dispatch = useAppDispatch()
  const location = useLocation()
  useEffect(() => {
    dispatch(fetchLangs())
  }, [])
  return (
    <Routes>
      <Route element={<App />}>
        <Route path='error/*' element={<ErrorsPage />} />
        {/* <Route path='logout' element={<Logout />} /> */}
        {currentUser ? (
          <>
            <Route path='/attachements' element={<AttachmentComponent />} />
            <Route path='/*' element={<PrivateRoutes />} />
            <Route
              index
              element={
                <Navigate
                  to={'/attachements'}
                  state={{
                    next:
                      location?.state?.location?.pathname == '/attachements'
                        ? configs.defaultRoot
                        : location?.state?.location?.pathname,
                  }}
                />
              }
            />
          </>
        ) : (
          <>
            <Route path='auth/*' element={<AuthPage />} />
            <Route path='*' element={<Navigate to='/auth' state={{location}} />} />
          </>
        )}
      </Route>
    </Routes>
  )
}

export {AppRoutes}
