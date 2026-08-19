// Activate an updated service worker straight away rather than leaving it
// waiting until every window closes. An installed PWA is usually backgrounded
// rather than fully closed, so without this an old worker keeps control and
// updates appear not to take effect.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'test notification', {
      body: data.body || '',
      data: { url: data.url || '/notification-page' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/notification-page'
  const resolvedTargetUrl = new URL(targetUrl, self.location.origin).toString()

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((client) => client.url.includes(targetUrl))

      if (existing) {
        return Promise.all([
          existing.navigate(resolvedTargetUrl),
          existing.focus()
        ])
      }

      return self.clients.openWindow(resolvedTargetUrl)
    })
  )
})
