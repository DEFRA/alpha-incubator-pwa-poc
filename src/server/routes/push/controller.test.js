import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { getSubscription } from '#/server/common/helpers/push/subscription-store.js'

describe('#pushSubscribeController', () => {
  let server

  const postSubscribe = (payload) =>
    server.inject({
      method: 'POST',
      url: '/api/push/subscribe',
      payload
    })

  const validSubscription = {
    endpoint: 'https://push.example.com/subscription/123',
    keys: {
      p256dh: 'p256dh-key',
      auth: 'auth-key'
    }
  }

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should respond with 400 when endpoint is missing', async () => {
    const { statusCode } = await postSubscribe({
      keys: validSubscription.keys
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })

  test('Should respond with 400 when keys.p256dh is missing', async () => {
    const { statusCode } = await postSubscribe({
      endpoint: validSubscription.endpoint,
      keys: { auth: validSubscription.keys.auth }
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })

  test('Should respond with 400 when keys.auth is missing', async () => {
    const { statusCode } = await postSubscribe({
      endpoint: validSubscription.endpoint,
      keys: { p256dh: validSubscription.keys.p256dh }
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })

  test('Should respond with 202 and store the subscription when the body is valid', async () => {
    const { statusCode } = await postSubscribe(validSubscription)

    expect(statusCode).toBe(statusCodes.accepted)
    expect(getSubscription()).toEqual(validSubscription)
  })
})
