import {useEffect, useRef} from 'react'

/**
 * ReservationNotifier — Schedules native browser notifications 1 hour
 * before each upcoming reservation start_date.
 *
 * • No backend dependency: pulls the upcoming reservations once mounted
 *   and at a regular interval (5 min refresh).
 * • Tracks already-notified IDs in localStorage to avoid duplicates.
 * • Asks for Notification permission on first eligible reservation.
 */

const STORAGE_KEY = 'lt-reservation-notified'
const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const REMIND_BEFORE_MS = 60 * 60 * 1000   // 1 hour
const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`

const loadNotified = () => {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}
const saveNotified = (set) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set))) }
  catch {}
}

const ensurePermission = async () => {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch { return false }
}

const showNotification = (res) => {
  try {
    const body = `${res.asset_name || 'Engin'} • ${res.user_name || 'Utilisateur'}\nDémarrage à ${new Date(res.start_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`
    const n = new Notification('Réservation dans 1h', {
      body,
      tag: `reservation-${res.id}`,
      icon: '/favicon.ico',
      requireInteraction: false,
    })
    n.onclick = () => {
      window.focus()
      window.location.href = '/reservations/index'
      n.close()
    }
  } catch (e) {
    // ignore
  }
}

const ReservationNotifier = () => {
  const timersRef = useRef([])
  const notifiedRef = useRef(loadNotified())

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }

  const scheduleAll = async () => {
    clearAllTimers()
    let reservations = []
    try {
      const r = await fetch(`${API}/reservations?status=confirmed`)
      if (r.ok) reservations = await r.json()
    } catch { return }

    const now = Date.now()
    for (const res of reservations || []) {
      if (!res?.start_date || !res?.id) continue
      if (notifiedRef.current.has(res.id)) continue
      const start = new Date(res.start_date).getTime()
      if (isNaN(start)) continue
      const reminderTime = start - REMIND_BEFORE_MS
      const delay = reminderTime - now

      // If we're already inside the 1h window but before start, fire now
      if (delay < 0 && start > now) {
        const ok = await ensurePermission()
        if (ok) showNotification(res)
        notifiedRef.current.add(res.id)
        saveNotified(notifiedRef.current)
        continue
      }
      // Otherwise schedule (cap to 24h to avoid setTimeout overflow)
      if (delay > 0 && delay < 24 * 3600 * 1000) {
        const t = setTimeout(async () => {
          const ok = await ensurePermission()
          if (ok) showNotification(res)
          notifiedRef.current.add(res.id)
          saveNotified(notifiedRef.current)
        }, delay)
        timersRef.current.push(t)
      }
    }
  }

  useEffect(() => {
    scheduleAll()
    const interval = setInterval(scheduleAll, REFRESH_INTERVAL_MS)
    return () => {
      clearInterval(interval)
      clearAllTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Headless component
  return null
}

export default ReservationNotifier
