import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

describe('#homeController', () => {
  let server
  const getHome = () =>
    server.inject({
      method: 'GET',
      url: '/'
    })

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await getHome()

    expect(result).toEqual(expect.stringContaining('Home |'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should provide PWA installability meta tags and manifest link', async () => {
    const { result } = await getHome()

    expect(result).toEqual(
      expect.stringContaining(
        '<link rel="manifest" href="/manifest.webmanifest">'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        '<meta name="apple-mobile-web-app-capable" content="yes">'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('<meta name="apple-mobile-web-app-title"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '<meta name="theme-color" content="#1d70b8">'
      )
    )
  })
})
