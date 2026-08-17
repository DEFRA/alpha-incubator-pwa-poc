import { manifestController } from './controller.js'

export const manifest = {
  plugin: {
    name: 'manifest',
    register(server) {
      server.route({
        method: 'GET',
        path: '/manifest.webmanifest',
        ...manifestController
      })
    }
  }
}
