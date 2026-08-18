describe('#subscriptionStore', () => {
  const loadStore = async () => import('./subscription-store.js')

  beforeEach(() => {
    vi.resetModules()
  })

  test('Should return null when no subscription has been saved', async () => {
    const { getSubscription } = await loadStore()

    expect(getSubscription()).toBeNull()
  })

  test('Should return the saved subscription after saveSubscription is called', async () => {
    const { saveSubscription, getSubscription } = await loadStore()
    const subscription = {
      endpoint: 'https://push.example.com/subscription/123',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' }
    }

    saveSubscription(subscription)

    expect(getSubscription()).toEqual(subscription)
  })

  test('Should overwrite a previously saved subscription (last registered wins)', async () => {
    const { saveSubscription, getSubscription } = await loadStore()
    const first = {
      endpoint: 'https://push.example.com/subscription/first',
      keys: { p256dh: 'first-p256dh', auth: 'first-auth' }
    }
    const second = {
      endpoint: 'https://push.example.com/subscription/second',
      keys: { p256dh: 'second-p256dh', auth: 'second-auth' }
    }

    saveSubscription(first)
    saveSubscription(second)

    expect(getSubscription()).toEqual(second)
  })
})
