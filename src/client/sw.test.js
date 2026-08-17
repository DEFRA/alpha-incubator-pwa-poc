describe('sw.js', () => {
  let listeners
  let mockSelf
  const defaultNotificationUrl = '/notification-page'

  const loadServiceWorker = async () => {
    vi.resetModules()
    listeners = {}
    mockSelf = {
      addEventListener: vi.fn((type, handler) => {
        listeners[type] = handler
      }),
      registration: {
        showNotification: vi.fn()
      },
      clients: {
        matchAll: vi.fn(),
        openWindow: vi.fn()
      }
    }
    globalThis.self = mockSelf

    await import('./sw.js')
  }

  afterEach(() => {
    delete globalThis.self
  })

  describe('push event', () => {
    test('Should fall back to default title, body and url when no data is provided', async () => {
      await loadServiceWorker()
      const waitUntil = vi.fn()

      await listeners.push({ data: null, waitUntil })

      expect(mockSelf.registration.showNotification).toHaveBeenCalledWith(
        'test notification',
        { body: '', data: { url: defaultNotificationUrl } }
      )
      expect(waitUntil).toHaveBeenCalled()
    })

    test('Should show a notification using the title, body and url from the push payload', async () => {
      await loadServiceWorker()
      const waitUntil = vi.fn()
      const data = {
        json: () => ({
          title: 'New message',
          body: 'You have a new message',
          url: '/messages/1'
        })
      }

      await listeners.push({ data, waitUntil })

      expect(mockSelf.registration.showNotification).toHaveBeenCalledWith(
        'New message',
        {
          body: 'You have a new message',
          data: { url: '/messages/1' }
        }
      )
      expect(waitUntil).toHaveBeenCalled()
    })
  })

  describe('notificationclick event', () => {
    const buildEvent = (notification, waitUntil = vi.fn()) => ({
      notification,
      waitUntil
    })

    test('Should fall back to /notification-page when notification data is missing', async () => {
      await loadServiceWorker()
      mockSelf.clients.matchAll.mockResolvedValue([])
      const notification = { close: vi.fn(), data: undefined }
      const waitUntil = vi.fn()

      await listeners.notificationclick(buildEvent(notification, waitUntil))
      await waitUntil.mock.calls[0][0]

      expect(notification.close).toHaveBeenCalled()
      expect(mockSelf.clients.openWindow).toHaveBeenCalledWith(
        defaultNotificationUrl
      )
    })

    test('Should open a new window when no existing client matches the target url', async () => {
      await loadServiceWorker()
      mockSelf.clients.matchAll.mockResolvedValue([
        { url: 'https://example.com/other-page', focus: vi.fn() }
      ])
      const notification = {
        close: vi.fn(),
        data: { url: defaultNotificationUrl }
      }
      const waitUntil = vi.fn()

      await listeners.notificationclick(buildEvent(notification, waitUntil))
      await waitUntil.mock.calls[0][0]

      expect(mockSelf.clients.openWindow).toHaveBeenCalledWith(
        defaultNotificationUrl
      )
    })

    test('Should focus an existing client whose url already matches the target url', async () => {
      await loadServiceWorker()
      const existingClient = {
        url: 'https://example.com/notification-page',
        focus: vi.fn()
      }
      mockSelf.clients.matchAll.mockResolvedValue([existingClient])
      const notification = {
        close: vi.fn(),
        data: { url: defaultNotificationUrl }
      }
      const waitUntil = vi.fn()

      await listeners.notificationclick(buildEvent(notification, waitUntil))
      await waitUntil.mock.calls[0][0]

      expect(existingClient.focus).toHaveBeenCalled()
      expect(mockSelf.clients.openWindow).not.toHaveBeenCalled()
    })
  })
})
