/**
 * Converts a base64url-encoded VAPID public key string into the Uint8Array
 * form required by `PushManager.subscribe()`. Browsers reject a raw string
 * for `applicationServerKey` (it must be a BufferSource), so this
 * conversion is required or `subscribe()` throws.
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

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
    applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
  })

  await fetchFn('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })
}
