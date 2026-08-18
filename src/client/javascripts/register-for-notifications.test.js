describe('#registerForNotifications', () => {
  const loadRegisterForNotifications = async () =>
    (await import('./register-for-notifications.js')).registerForNotifications

  afterEach(() => {
    vi.resetModules()
  })

  test('Should not throw and should not call fetch when Notification API is unsupported', async () => {
    const registerForNotifications = await loadRegisterForNotifications()
    const fetchFn = vi.fn()

    await expect(
      registerForNotifications({ notification: undefined, fetchFn })
    ).resolves.not.toThrow()
    expect(fetchFn).not.toHaveBeenCalled()
  })

  test('Should not subscribe or call fetch when permission is not granted', async () => {
    const registerForNotifications = await loadRegisterForNotifications()
    const fetchFn = vi.fn()
    const subscribe = vi.fn()
    const notification = { requestPermission: vi.fn(() => 'denied') }
    const nav = {
      serviceWorker: {
        ready: Promise.resolve({ pushManager: { subscribe } })
      }
    }

    await registerForNotifications({ notification, nav, fetchFn })

    expect(subscribe).not.toHaveBeenCalled()
    expect(fetchFn).not.toHaveBeenCalled()
  })

  test('Should subscribe with the applicationServerKey and POST the subscription when permission is granted', async () => {
    const registerForNotifications = await loadRegisterForNotifications()
    const fetchFn = vi.fn(() => Promise.resolve({ ok: true }))
    const subscription = {
      endpoint: 'https://push.example.com/subscription/123',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' }
    }
    const subscribe = vi.fn(() => Promise.resolve(subscription))
    const notification = { requestPermission: vi.fn(() => 'granted') }
    const nav = {
      serviceWorker: {
        ready: Promise.resolve({ pushManager: { subscribe } })
      }
    }
    const applicationServerKey = 'test-vapid-public-key'

    await registerForNotifications({
      notification,
      nav,
      fetchFn,
      applicationServerKey
    })

    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey
    })
    expect(fetchFn).toHaveBeenCalledWith('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })
  })
})
