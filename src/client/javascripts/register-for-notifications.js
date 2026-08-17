/**
 * Requests notification permission and, if granted, creates a Push
 * subscription and sends it to the server for storage (see
 * docs/plan/03-subscription-flow.md). Must be invoked directly from a user
 * gesture (e.g. a click handler) — WebKit only allows
 * `Notification.requestPermission()` synchronously/near-synchronously after
 * user interaction.
 */
export async function registerForNotifications({
  notification = globalThis.Notification,
  nav = navigator,
  applicationServerKey,
  fetchFn = fetch
} = {}) {
  if (!notification) {
    return
  }

  const permission = await notification.requestPermission()
  if (permission !== 'granted') {
    return
  }

  const registration = await nav.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  })

  await fetchFn('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })
}
