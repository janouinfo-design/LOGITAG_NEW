import {Route, Routes, Navigate, useLocation} from 'react-router-dom'
import PremiumLayout from '../../components/premium/PremiumLayout'
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
    setTimeout(() => {}, 1000)
  }, [menus])

  return (
    <Routes>
      <Route element={<PremiumLayout />}>
        {links.map((o) => (
          <Route path={o.link} element={o.component ? <o.component /> : null} />
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
        <Route path='*' element={<Navigate to={configs.defaultRoot} />} />
      </Route>
    </Routes>
  )
}

export {PrivateRoutes}
