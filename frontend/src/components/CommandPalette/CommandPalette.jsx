import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './CommandPalette.css'

/**
 * Cmd+K (or Ctrl+K) command palette — Linear/Stripe-style global navigation.
 * Frontend-only, opens via keyboard shortcut. No backend dependency.
 */

const COMMANDS = [
  // Pages
  {id: 'dashboard',     group: 'Navigation', label: 'Tableau de bord',           icon: 'pi-home',           to: '/tagdashboard/index', shortcut: 'G D'},
  {id: 'engins',        group: 'Navigation', label: 'Engins · Liste des assets', icon: 'pi-box',            to: '/view/engin/index',   shortcut: 'G E'},
  {id: 'map',           group: 'Navigation', label: 'Carte des assets (Map)',    icon: 'pi-map',            to: '/tour/index',         shortcut: 'G M'},
  {id: 'reservations',  group: 'Navigation', label: 'Réservations · Planning',   icon: 'pi-calendar',       to: '/reservations/index', shortcut: 'G R'},
  {id: 'tags',          group: 'Navigation', label: 'Tags',                      icon: 'pi-tag',            to: '/tag/index'},
  {id: 'rapports',      group: 'Navigation', label: 'Rapports & exports',        icon: 'pi-chart-bar',      to: '/rapports/index'},
  {id: 'idle-assets',   group: 'Navigation', label: 'Outils immobilisés',         icon: 'pi-clock',          to: '/idle-assets/index'},
  {id: 'depots',        group: 'Navigation', label: 'Dépôts',                    icon: 'pi-warehouse',      to: '/deposit/index'},
  {id: 'inventory',     group: 'Navigation', label: 'Inventaire',                icon: 'pi-list',           to: '/inventory/index'},
  {id: 'utilisateurs',  group: 'Navigation', label: 'Utilisateurs',              icon: 'pi-users',          to: '/view/staff/index'},
  {id: 'gateway',       group: 'Navigation', label: 'Gateways',                  icon: 'pi-server',         to: '/gateway/index'},
  {id: 'logs',          group: 'Navigation', label: 'Logs système',              icon: 'pi-list-check',     to: '/LOGS/index'},
  {id: 'entreprise',    group: 'Navigation', label: 'Entreprise · Intégrations', icon: 'pi-building',       to: '/Company/index'},
  // Actions
  {id: 'new-reservation', group: 'Actions', label: 'Nouvelle réservation',       icon: 'pi-plus',           to: '/reservations/index?new=1'},
  {id: 'export-csv',      group: 'Actions', label: 'Exporter les réservations CSV', icon: 'pi-download',    to: '/reservations/index?export=csv'},
]

const groupOrder = ['Navigation', 'Actions']

const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Reset on open
  useEffect(() => {
    if (open) {
      setQ('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const filtered = useMemo(() => {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const query = norm(q.trim())
    if (!query) return COMMANDS
    return COMMANDS.filter((c) => norm(c.label).includes(query) || norm(c.group).includes(query))
  }, [q])

  // Group filtered commands
  const grouped = useMemo(() => {
    const out = {}
    filtered.forEach((c) => {
      if (!out[c.group]) out[c.group] = []
      out[c.group].push(c)
    })
    return out
  }, [filtered])

  // Flat list (in display order) for keyboard nav
  const flatList = useMemo(() => {
    const out = []
    groupOrder.forEach((g) => { (grouped[g] || []).forEach((c) => out.push(c)) })
    Object.keys(grouped).forEach((g) => {
      if (!groupOrder.includes(g)) (grouped[g] || []).forEach((c) => out.push(c))
    })
    return out
  }, [grouped])

  const runCommand = (cmd) => {
    if (!cmd) return
    setOpen(false)
    if (cmd.to) navigate(cmd.to)
  }

  const onKeyDownInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(flatList.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(flatList[activeIdx])
    }
  }

  if (!open) return null

  let renderIdx = -1
  return (
    <div className='lt-cmdk-overlay' onClick={() => setOpen(false)} data-testid='cmdk-overlay'>
      <div className='lt-cmdk-panel' onClick={(e) => e.stopPropagation()} role='dialog' aria-label='Palette de commandes'>
        <div className='lt-cmdk-input-wrap'>
          <i className='pi pi-search lt-cmdk-input-ico' />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActiveIdx(0) }}
            onKeyDown={onKeyDownInput}
            placeholder='Tapez pour rechercher une page ou une action…'
            className='lt-cmdk-input'
            data-testid='cmdk-input'
          />
          <kbd className='lt-cmdk-kbd'>ESC</kbd>
        </div>

        <div className='lt-cmdk-list' data-testid='cmdk-list'>
          {flatList.length === 0 && (
            <div className='lt-cmdk-empty'>
              <i className='pi pi-inbox' />
              <span>Aucun résultat pour "{q}"</span>
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className='lt-cmdk-group'>
              <div className='lt-cmdk-group-title'>{group}</div>
              {items.map((cmd) => {
                renderIdx += 1
                const isActive = renderIdx === activeIdx
                return (
                  <button
                    key={cmd.id}
                    className={`lt-cmdk-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => runCommand(cmd)}
                    onMouseEnter={() => setActiveIdx(flatList.indexOf(cmd))}
                    data-testid={`cmdk-item-${cmd.id}`}
                  >
                    <span className='lt-cmdk-item-ico'><i className={`pi ${cmd.icon}`} /></span>
                    <span className='lt-cmdk-item-label'>{cmd.label}</span>
                    {cmd.shortcut && <kbd className='lt-cmdk-shortcut'>{cmd.shortcut}</kbd>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className='lt-cmdk-footer'>
          <span><kbd>↑</kbd><kbd>↓</kbd> Naviguer</span>
          <span><kbd>↵</kbd> Ouvrir</span>
          <span><kbd>ESC</kbd> Fermer</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
