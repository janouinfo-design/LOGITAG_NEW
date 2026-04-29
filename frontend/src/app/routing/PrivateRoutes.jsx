import {Route, Routes, Navigate, useLocation} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import {useAppSelector} from '../../hooks'
import {getMenus} from '../../components/Layout/slice/layout.slice'
import {useEffect, useState} from 'react'

import components from '../../components/components'
import CompanyList from '../../components/Company/user-interface/Comapnylist/CompanyList'
import configs from '../../configs'
import { EXTRA_MENU } from '../../cors/config/config'
const PrivateRoutes = () => {
  const location = useLocation()
  const [links, setLinks] = useState([])
  const [menusLoaded, setMenusLoaded] = useState(false)
  const menus = useAppSelector(getMenus)
  useEffect(() => {
    if (!Array.isArray(menus)) return
    let obj = []
    for (const l of [...menus , ...EXTRA_MENU]) {
      if (Array.isArray(l?.subMenu) && l.hasChildren)
        for (let ch of l?.subMenu) {
          obj.push({
            link: ch.Link,
            component: components[ch.Link] || null,
          })
        }
      else {
        obj.push({
          link: l.Link,
          component: components[l.Link] || null,
        })
      }
    }
    setLinks(obj)
    if (menus.length > 0) setMenusLoaded(true)
  }, [menus])

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {links.map((o) => (
          <Route key={o.link} path={o.link} element={o.component ? <o.component /> : null} />
        ))}
        {/* Redirect to Dashboard after success login/registartion */}
        <Route
          path='auth/*'
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
        <Route path='geofencing' element={<CompanyList />} />
        <Route
          path='next-page'
          element={<Navigate to={localStorage.getItem('next-page') == '/next-page' ? configs.defaultRoot : localStorage.getItem('next-page') || configs.defaultRoot} />}
        />
        {/*
          IMPORTANT: only register the wildcard fallback redirect AFTER the menus
          have been loaded from the server. On a hard reload, `links` is empty for
          the few hundred ms it takes for fetchMenus() to resolve — without this
          guard the '*' route would match immediately and redirect the user back
          to the dashboard regardless of the URL they refreshed on.
          While menus are loading we render `null` so the URL is preserved; once
          the routes are registered, the SPA renders the correct page.
        */}
        {menusLoaded && <Route path='*' element={<Navigate to={configs.defaultRoot} />} />}
      </Route>
    </Routes>
  )
}

export {PrivateRoutes}
