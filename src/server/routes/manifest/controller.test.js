import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

describe('#manifestController', () => {
  let server
  const getManifest = () =>
    server.inject({
      method: 'GET',
      url: '/manifest.webmanifest'
    })

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should respond with the application/manifest+json content type', async () => {
    const { headers } = await getManifest()

    expect(headers['content-type']).toContain('application/manifest+json')
  })

  test('Should respond with valid JSON containing the required manifest fields', async () => {
    const { result, statusCode } = await getManifest()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        short_name: expect.any(String),
        start_url: expect.any(String),
        display: expect.any(String),
        background_color: expect.any(String),
        theme_color: expect.any(String),
        id: expect.any(String),
        icons: expect.any(Array)
      })
    )
  })
})
