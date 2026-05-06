/* eslint-disable no-restricted-globals */
/**
 * Logitag — Service Worker for reservation notifications
 *
 * Runs in the background (independent of any tab) and pushes a system
 * notification 1 hour before each upcoming reservation start_date.
 *
 * Architecture:
 *   - The main app posts {type:'SCHEDULE_RESERVATIONS', reservations:[...]} to
 *     this SW periodically (every 5 min via ReservationNotifier.jsx).
 *   - The SW stores them in IndexedDB-less in-memory map (reset on SW restart),
 *     and uses setTimeout chains to fire notifications.
 *   - On notification click, opens /reservations/index.
 */

const NOTIF_TAG_PREFIX = 'lt-reservation-'
const SCHEDULED = new Map() // reservationId -> timeoutHandle

/* ────── Lifecycle ────── */
self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

/* ────── Message handler ────── */
self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type === 'SCHEDULE_RESERVATIONS') {
    scheduleAll(data.reservations || [])
  } else if (data.type === 'CLEAR_RESERVATIONS') {
    clearAll()
  }
})

function clearAll() {
  SCHEDULED.forEach((handle) => clearTimeout(handle))
  SCHEDULED.clear()
}

function scheduleAll(list) {
  // Clear stale timers — caller is responsible for sending fresh data each tick
  clearAll()
  const now = Date.now()
  list.forEach((r) => {
    if (!r || !r.id || !r.start_date) return
    const startMs = new Date(r.start_date).getTime()
    if (isNaN(startMs)) return
    const fireAtMs = startMs - 60 * 60 * 1000 // 1h before
    const delay = fireAtMs - now
    if (delay <= 0) return // already past
    if (delay > 24 * 60 * 60 * 1000) return // farther than 24h, ignore (re-scheduled next tick)
    const handle = setTimeout(() => fireNotification(r), delay)
    SCHEDULED.set(r.id, handle)
  })
}

function fireNotification(r) {
  const title = '🔔 Réservation à venir dans 1h'
  const engin = r.asset_name || r.engin_reference || `Engin ${r.asset_id}`
  const startTime = new Date(r.start_date).toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'})
  const body = `${engin} · démarre à ${startTime}${r.user_name ? ' · ' + r.user_name : ''}`
  self.registration.showNotification(title, {
    body,
    tag: NOTIF_TAG_PREFIX + r.id,
    badge: '/favicon.ico',
    icon: '/favicon.ico',
    requireInteraction: false,
    data: {url: '/reservations/index', reservationId: r.id},
  })
}

/* ────── Notification click → open app ────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/reservations/index'
  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((all) => {
      // Focus existing tab if open
      for (const c of all) {
        if (c.url.includes(url) && 'focus' in c) return c.focus()
      }
      // Else open new tab
      return self.clients.openWindow(url)
    })
  )
})
