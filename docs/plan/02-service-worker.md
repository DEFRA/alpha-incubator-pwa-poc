# Stage 02 — Service worker (registration, push, notificationclick)

## Goal

Add a root-scoped service worker that can receive push events and show a notification,
and that routes a tap on that notification to `/notification-page`.

## Background

- A service worker's scope is limited to the directory it's served from (and below), so
  it must be served from the site root (e.g. `/sw.js`), not from a `/assets/` subpath.
- Push notifications require: (a) a registered service worker, (b) a `pushsubscriptionchange`-
  aware `push` event listener that calls `event.waitUntil(self.registration.showNotification(...))`,
  and (c) a `notificationclick` listener that closes the notification and focuses/opens a
  client window at the target URL.

## Steps

1. **Create `src/client/sw.js`** (or serve it from a location that resolves to `/sw.js` in
   production) implementing:
   ```js
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
         const existing = clients.find((c) => c.url.includes(targetUrl))
         if (existing) return existing.focus()
         return self.clients.openWindow(targetUrl)
       })
     )
   })
   ```
2. **Ensure `/sw.js` is served from the root** with `Content-Type: application/javascript`
   — extend `serve-static-files.js` (or add a dedicated route) rather than relying on the
   generic `{param*}` asset path if that would place it under a subpath.
3. **Register the service worker** in `src/client/javascripts/application.js`:
   ```js
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js')
   }
   ```
4. Confirm no existing CSP (`src/server/plugins/content-security-policy.js`, via
   `blankie`) blocks service worker registration or push — add `worker-src`/`connect-src`
   directives if needed.

## Manual verification

- DevTools → Application → Service Workers (macOS Safari's Web Inspector, or Chrome
  DevTools while iterating locally) shows the worker registered and activated at scope `/`.
- Manually trigger a test push (see Stage 04) and confirm a system notification appears,
  and tapping it opens `/notification-page`.

## Risks / caveats

- Safari's service worker DevTools support differs from Chrome's — use Safari's Web
  Inspector (Develop menu → your device/Simulator → Service Workers) for on-device debugging.
- CSP misconfiguration is a common silent failure point for service worker registration —
  check the browser console for CSP violation errors first if registration silently fails.
