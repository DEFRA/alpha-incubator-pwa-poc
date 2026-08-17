import { swController } from './controller.js'

export const sw = {
  plugin: {
    name: 'sw',
    register(server) {
      server.route({
        method: 'GET',
        path: '/sw.js',
        ...swController
      })
    }
  }
}
