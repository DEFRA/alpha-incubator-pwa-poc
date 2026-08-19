import webPush from 'web-push'

import { config } from '#/config/config.js'

const vapidPublicKey = config.get('vapidPublicKey')
const vapidPrivateKey = config.get('vapidPrivateKey')

// Only configure VAPID details when both keys are present — this lets the
// server start (e.g. locally/in tests) before VAPID keys have been
// generated/configured, per adr/managing-vapid-keys-via-environment-variables.adr.md.
if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    config.get('vapidSubject'),
    vapidPublicKey,
    vapidPrivateKey
  )
}

/**
 * Sends a fixed "test notification" push message to the given subscription
 * (see docs/plan/04-sending-notifications.md). Callers are responsible for
 * handling rejections (e.g. an expired subscription returning 404/410).
 */
export function sendTestNotification(subscription) {
  const payload = JSON.stringify({
    title: 'test notification',
    body: 'This is a test push notification.',
    url: '/notification-page'
  })

  return webPush.sendNotification(subscription, payload)
}
