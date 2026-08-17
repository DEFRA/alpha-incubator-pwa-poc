describe('#registerServiceWorker', () => {
  const loadRegisterServiceWorker = async () =>
    (await import('./register-service-worker.js')).registerServiceWorker

  afterEach(() => {
    vi.resetModules()
  })

  test('Should not throw when serviceWorker is not supported by the navigator', async () => {
    const registerServiceWorker = await loadRegisterServiceWorker()

    expect(() => registerServiceWorker({})).not.toThrow()
  })

  test('Should register /sw.js when serviceWorker is supported by the navigator', async () => {
    const registerServiceWorker = await loadRegisterServiceWorker()
    const register = vi.fn()
    const nav = { serviceWorker: { register } }

    registerServiceWorker(nav)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })
})
