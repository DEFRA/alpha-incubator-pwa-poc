# Stage 04 — Sending notifications (web-push, VAPID, 30s scheduled send)

## Goal

Add the server-side capability to actually send a push message to a stored subscription,
and wire it to fire ~30 seconds after a successful registration.

## Steps

1. **Add the `web-push` npm dependency**:
   ```bash
   npm install web-push
   ```
2. **Generate VAPID keys once**, e.g.:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Store the resulting public/private key pair as environment variables (not committed) —
   see `adr/managing-vapid-keys-via-environment-variables.adr.md` for the rationale, and
   add them to local `.env` / `compose/aws.env` equivalents used by this template.
3. **Wire config** in `src/config/config.js` (convict), e.g.:
   ```js
   vapidPublicKey: { doc: 'VAPID public key for web push', format: String, default: '', env: 'VAPID_PUBLIC_KEY' },
   vapidPrivateKey: { doc: 'VAPID private key for web push', format: String, default: '', env: 'VAPID_PRIVATE_KEY', sensitive: true },
   vapidSubject: { doc: 'VAPID subject (mailto: or URL)', format: String, default: 'mailto:example@defra.gov.uk', env: 'VAPID_SUBJECT' }
   ```
4. **Create a push-sending service**, e.g. `src/server/common/helpers/push/push-service.js`:
   ```js
   import webPush from 'web-push'
   import { config } from '#/config/config.js'

   webPush.setVapidDetails(
     config.get('vapidSubject'),
     config.get('vapidPublicKey'),
     config.get('vapidPrivateKey')
   )

   export function sendTestNotification(subscription) {
     const payload = JSON.stringify({
       title: 'test notification',
       body: 'This is a test push notification.',
       url: '/notification-page'
     })
     return webPush.sendNotification(subscription, payload)
   }
   ```
5. **Schedule the send** from the `/api/push/subscribe` handler added in Stage 03:
   ```js
   setTimeout(() => {
     sendTestNotification(storedSubscription).catch((err) => request.logger.error(err))
   }, 30_000)
   ```
   - Keep this simple (`setTimeout`) — no job queue/scheduler needed for a POC.
   - Log failures (e.g. expired subscription → `410 Gone` from the push service) rather
     than throwing unhandled rejections.
6. Expose the VAPID **public** key to the client for Stage 03's `pushManager.subscribe()`
   call — e.g. render it into the home page via nunjucks context, sourced from
   `config.get('vapidPublicKey')`. Never expose the private key to the client.

## Manual verification

- After registering, wait ~30 seconds and confirm the notification appears.
- Check server logs show a successful send (or a clear error if the subscription is stale).

## Risks / caveats

- `web-push`'s `sendNotification` throws on invalid/expired subscriptions (HTTP 404/410
  from the push service) — this is expected if you unregister/reinstall the app during
  testing; just re-register to get a fresh subscription.
- Because storage is in-memory and single-instance (Stage 03's decision), a server
  restart between "register" and "the 30s elapsing" will lose the pending send — fine for
  this POC, but worth calling out during a demo.
