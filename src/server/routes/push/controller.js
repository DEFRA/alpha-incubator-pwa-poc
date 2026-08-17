import { statusCodes } from '#/server/common/constants/status-codes.js'
import { saveSubscription } from '#/server/common/helpers/push/subscription-store.js'
import { sendTestNotification } from '#/server/common/helpers/push/push-service.js'

const notificationDelayMs = 30_000

/**
 * Validates the shape of an incoming PushSubscription payload
 * (endpoint + keys.p256dh + keys.auth), per the Push API spec.
 */
function isValidSubscription(payload) {
  return Boolean(
    payload &&
    typeof payload.endpoint === 'string' &&
    payload.endpoint.length > 0 &&
    payload.keys &&
    typeof payload.keys.p256dh === 'string' &&
    payload.keys.p256dh.length > 0 &&
    typeof payload.keys.auth === 'string' &&
    payload.keys.auth.length > 0
  )
}

export const pushSubscribeController = {
  handler(request, h) {
    const subscription = request.payload

    if (!isValidSubscription(subscription)) {
      return h.response().code(statusCodes.badRequest)
    }

    saveSubscription(subscription)

    setTimeout(() => {
      sendTestNotification(subscription).catch((err) =>
        request.logger.error(err)
      )
    }, notificationDelayMs)

    return h.response().code(statusCodes.accepted)
  }
}
