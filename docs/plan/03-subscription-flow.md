# Stage 03 — Subscription flow ("Register for notifications" button)

## Goal

Add a button on the home page that, when clicked, requests notification permission,
creates a Push subscription, and sends it to the server for storage.

## Steps

1. **Add the button** to `src/server/routes/home/index.njk` using a GOV.UK Frontend
   button component/macro:
   ```njk
   {{ govukButton({ text: "Register for notifications", attributes: { id: "register-notifications" } }) }}
   ```
2. **Client-side handler** in `src/client/javascripts/application.js` (or a new module
   imported from there):

   ```js
   document
     .getElementById('register-notifications')
     ?.addEventListener('click', async () => {
       const permission = await Notification.requestPermission()
       if (permission !== 'granted') return

       const registration = await navigator.serviceWorker.ready
       const subscription = await registration.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey: VAPID_PUBLIC_KEY // injected server-side, see below
       })

       await fetch('/api/push/subscribe', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(subscription)
       })
     })
   ```
   - `VAPID_PUBLIC_KEY` needs to reach the client — simplest approach: render it into the
     page via nunjucks (e.g. a `data-` attribute on the button, or a small inline script
     tag) from server-side config, rather than hard-coding it in the bundled JS.
   - **Must be triggered by direct user interaction** (the click handler itself) per
     WebKit's requirement — don't call `requestPermission()`/`subscribe()` on page load.

3. **Add a new route** `src/server/routes/push/index.js` +
   `src/server/routes/push/controller.js` handling `POST /api/push/subscribe`:
   - Validate the request body (a `PushSubscription` JSON object: `endpoint`, `keys.p256dh`,
     `keys.auth`).
   - Store it in-memory (a simple module-level variable/array is enough for this POC —
     see `adr/storing-push-subscriptions-in-memory.adr.md`).
   - Kick off the 30-second scheduled send from Stage 04 once stored.
   - Return `202 Accepted`.
4. Register the new route plugin in `src/server/plugins/router.js`.

## Manual verification

- Click "Register for notifications", accept the browser permission prompt, confirm a
  `POST /api/push/subscribe` request succeeds (Network tab).
- Confirm the server logs (or a temporary console.log) show the subscription was stored.

## Risks / caveats

- iOS Safari only allows `Notification.requestPermission()` when called synchronously (or
  within a very short async chain) from a user gesture — keep the click handler simple
  and avoid awaiting unrelated work before calling it.
- `pushManager.subscribe()` requires the service worker to be active first
  (`navigator.serviceWorker.ready`) — Stage 02 must be working before this stage can be
  tested end to end.
