/* eslint-disable react/jsx-no-target-blank */
import React from 'react'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../helpers'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'
import sideBarLinks from '../../../../../configs/sideBarLink'
const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      {sideBarLinks.map((l) =>
        Array.isArray(l.children) && l.children.length > 0 ? (
          <SidebarMenuItemWithSub
            to={l.to}
            title={l.title}
            fontIcon={l.fontIcon}
            icon={l.icon}
            olang={l.olang}
          >
            {l.children.map((lc) => (
              <SidebarMenuItem
                to={l.to + '/' + (lc.to.startsWith('/') ? lc.to.slice(1) : lc.to)}
                icon={lc.icon || ''}
                title={lc.title}
                fontIcon={lc.fontIcon}
                hasBullet={lc.hasBullet}
                olang={lc.olang}
              />
            ))}
          </SidebarMenuItemWithSub>
        ) : (
          <SidebarMenuItem
            to={l.to}
            icon={l.icon}
            title={l.title}
            fontIcon={l.fontIcon}
            olang={l.olang}
          />
        )
      )}
    </>
  )
}

export {SidebarMenuMain}
