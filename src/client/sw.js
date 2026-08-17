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

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((client) => client.url.includes(targetUrl))

      if (existing) {
        return existing.focus()
      }

      return self.clients.openWindow(targetUrl)
    })
  )
})
