import { vi } from 'vitest'

const sendNotification = vi.fn(() => Promise.resolve())
const setVapidDetails = vi.fn()

vi.mock('web-push', () => ({
  default: { sendNotification, setVapidDetails }
}))

describe('#pushService', () => {
  const subscription = {
    endpoint: 'https://push.example.com/subscription/123',
    keys: { p256dh: 'p256dh-key', auth: 'auth-key' }
  }

  test('Should propagate a rejection when web-push sendNotification fails (e.g. expired subscription)', async () => {
    sendNotification.mockRejectedValueOnce(
      Object.assign(new Error('Gone'), { statusCode: 410 })
    )
    const { sendTestNotification } = await import('./push-service.js')

    await expect(sendTestNotification(subscription)).rejects.toThrow('Gone')
  })

  test('Should call sendNotification with the subscription and a JSON payload containing title, body and url', async () => {
    const { sendTestNotification } = await import('./push-service.js')

    await sendTestNotification(subscription)

    expect(sendNotification).toHaveBeenCalledWith(
      subscription,
      JSON.stringify({
        title: 'test notification',
        body: 'This is a test push notification.',
        url: '/notification-page'
      })
    )
  })
})
