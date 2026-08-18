import { statusCodes } from '#/server/common/constants/status-codes.js'
import { saveSubscription } from '#/server/common/helpers/push/subscription-store.js'
import { sendTestNotification } from '#/server/common/helpers/push/push-service.js'

const notificationDelayMs = 30_000

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.length > 0

/**
 * Validates the shape of an incoming PushSubscription payload
 * (endpoint + keys.p256dh + keys.auth), per the Push API spec.
 */
function isValidSubscription(payload) {
  return Boolean(
    payload &&
    isNonEmptyString(payload.endpoint) &&
    payload.keys &&
    isNonEmptyString(payload.keys.p256dh) &&
    isNonEmptyString(payload.keys.auth)
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
