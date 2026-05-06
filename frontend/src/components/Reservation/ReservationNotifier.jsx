import {useEffect, useRef} from 'react'

/**
 * ReservationNotifier — Service-Worker-backed reminder system.
 *
 * Architecture:
 *   1. Registers /sw-reservations.js as a Service Worker (background script
 *      that survives tab close and pushes system notifications).
 *   2. Polls /api/reservations?status=confirmed every 5 minutes.
 *   3. Posts the upcoming reservations to the SW via postMessage; the SW
 *      schedules a 1h-before timer for each and fires a system notification
 *      (with click-to-open /reservations/index).
 *   4. Falls back to in-tab Notification API if SW registration fails.
 *
 * Permission for Notifications is requested lazily on first eligible
 * reservation (not on app boot — better UX).
 */

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
const REMIND_BEFORE_MS = 60 * 60 * 1000
const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`

const ensurePermission = async () => {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch { return false }
}

const ReservationNotifier = () => {
  const swRef = useRef(null)
  const fallbackTimers = useRef([])

  /* ── Register the service worker once on mount ── */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw-reservations.js')
      .then((reg) => {
        swRef.current = reg
        // eslint-disable-next-line no-console
        console.info('[Logitag] Service worker registered for reservation notifications')
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[Logitag] Service worker registration failed, falling back to in-tab timers', err)
      })
  }, [])

  /* ── Fetch + dispatch loop ── */
  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      let reservations = []
      try {
        const r = await fetch(`${API}/reservations?status=confirmed`)
        if (r.ok) reservations = await r.json()
      } catch { return }
      if (cancelled) return

      // Filter to upcoming (within next 24h, not yet started)
      const now = Date.now()
      const upcoming = (reservations || []).filter((res) => {
        if (!res?.start_date || !res?.id) return false
        const start = new Date(res.start_date).getTime()
        return !isNaN(start) && start > now && start - now <= 24 * 3600 * 1000
      })

      // Ask permission once we actually have something to notify
      if (upcoming.length > 0) await ensurePermission()

      const sw = swRef.current && (swRef.current.active || swRef.current.installing || swRef.current.waiting)
      if (sw && sw.postMessage) {
        try {
          sw.postMessage({type: 'SCHEDULE_RESERVATIONS', reservations: upcoming})
          return
        } catch {/* fallthrough to fallback */}
      }

      /* Fallback: in-tab setTimeout (works only while tab is alive) */
      fallbackTimers.current.forEach((t) => clearTimeout(t))
      fallbackTimers.current = []
      for (const res of upcoming) {
        const delay = new Date(res.start_date).getTime() - REMIND_BEFORE_MS - now
        if (delay <= 0) continue
        const t = setTimeout(() => {
          if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
          try {
            const n = new Notification('🔔 Réservation à venir dans 1h', {
              body: `${res.asset_name || 'Engin'} · démarre à ${new Date(res.start_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`,
              tag: `lt-reservation-${res.id}`,
              icon: '/favicon.ico',
            })
            n.onclick = () => { window.focus(); window.location.href = '/reservations/index'; n.close() }
          } catch {/* ignore */}
        }, delay)
        fallbackTimers.current.push(t)
      }
    }

    tick()
    const interval = setInterval(tick, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
      fallbackTimers.current.forEach((t) => clearTimeout(t))
      fallbackTimers.current = []
    }
  }, [])

  return null
}

export default ReservationNotifier
