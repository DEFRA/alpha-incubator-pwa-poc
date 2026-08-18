import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

describe('#swController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should respond to GET /sw.js with a 200 and application/javascript content type', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/sw.js'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toContain('application/javascript')
  })

  test('Should reject non-GET methods for /sw.js', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: '/sw.js'
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
