/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from 'react'
import {useIntl} from 'react-intl'
import { KTIcon } from '../../../../../_metronic/helpers'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'
import sideBarLinks from '../../../../../configs/sideBarLink'
import { fetchMenus, getMenus } from '../../../slice/layout.slice'
import { useAppDispatch, useAppSelector } from '../../../../../hooks'
import { EXTRA_MENU } from '../../../../../cors/config/config'
const MENU_GROUPS = {
  'TABLEAU DE BOARD': {group: 'dashboard', label: ''},
  'Engins': {group: 'gestion', label: 'Gestion'},
  'Tags': {group: 'gestion'},
  'Calendrier': {group: 'gestion'},
  'Map': {group: 'gestion'},
  'Places': {group: 'organisation', label: 'Organisation'},
  'Inventory': {group: 'organisation'},
  'Utilisateurs': {group: 'organisation'},
  'Facturation': {group: 'organisation'},
  'Paramètres': {group: 'config', label: 'Configuration'},
  'Rapports': {group: 'analyse', label: 'Analyse'},
  'LOGS': {group: 'config'},
  'Insertion des données': {group: 'config'},
  'Capteurs': {group: 'config'},
}

const SidebarMenuMain = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const [links , setLinks] = useState([])
  const menus = useAppSelector(getMenus)
  
 
 useEffect(()=> {
    // dispatch(fetchMenus())   
  }, []);

 
  useEffect(()=> {
        setLinks( !Array.isArray(menus) ? null : [...menus , ...EXTRA_MENU].map( m => {
          const obj = {
            title: m.Text,
            fontIcon: m.icon,
            icon: '',
            to: m.Link == '#' ? '' :m.Link,
            hasBullet: false,
            olang: m.Name,
            children: !Array.isArray(m.subMenu) ? null : m.subMenu.map( o => {
                return {
                  title: o.Text,
                  fontIcon: o.icon,
                  icon: '',
                  to: o.Link,
                  hasBullet: false,
                  olang: o.Name,
                }
            })
          };

          return obj

        }))
  }, [menus])

  /* Group links by section */
  const renderedGroups = new Set()

  return (
    <>
    <div style={{display: 'none'}}>
        <SidebarMenuItem
            
            to={'#'} icon={''} title={'TEST'} fontIcon={''}
          />
    </div>
  
    {
      links.map( (l, idx) => {
        const groupInfo = MENU_GROUPS[l.title] || MENU_GROUPS[l.olang] || {}
        const showGroupHeader = groupInfo.label && !renderedGroups.has(groupInfo.label)
        if (groupInfo.label) renderedGroups.add(groupInfo.label)

        return (
          <React.Fragment key={idx}>
            {showGroupHeader && (
              <div className="lt-sidebar-section" data-testid={`sidebar-group-${groupInfo.group}`}>
                <span className="lt-sidebar-section-label">{groupInfo.label}</span>
              </div>
            )}
            {Array.isArray(l.children) && l.children.length > 0 ? (
              <SidebarMenuItemWithSub
                to={l.to}
                title={l.title}
                fontIcon={l.fontIcon}
                icon={l.icon}
                olang={l.olang}
              >
                {
                   l.children.map( lc => (
                    <SidebarMenuItem
                       to={l.to+'/'+(lc.to.startsWith('/') ? lc.to.slice(1): lc.to)} icon={lc.icon || ''} title={lc.title} fontIcon={lc.fontIcon}
                       hasBullet={lc.hasBullet} olang={lc.olang}
                    />
                  ))
                }
              </SidebarMenuItemWithSub>
            ) : (
              <SidebarMenuItem
                to={l.to} icon={l.icon} title={l.title} fontIcon={l.fontIcon} olang={l.olang}
              />
            )}
          </React.Fragment>
        )
      })
    }
    </>
  )
}

export {SidebarMenuMain}
