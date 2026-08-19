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
    const register = vi.fn(() => Promise.resolve())
    const nav = { serviceWorker: { register } }

    registerServiceWorker(nav)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  test('Should log a failed registration instead of raising an unhandled rejection', async () => {
    const registerServiceWorker = await loadRegisterServiceWorker()
    const error = new Error('registration failed')
    const nav = {
      serviceWorker: { register: vi.fn(() => Promise.reject(error)) }
    }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    registerServiceWorker(nav)
    await Promise.resolve()

    expect(errorSpy).toHaveBeenCalledWith(
      'Service worker registration failed',
      error
    )

    errorSpy.mockRestore()
  })
})
