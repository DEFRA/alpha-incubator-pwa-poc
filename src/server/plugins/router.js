import inert from '@hapi/inert'

import { home } from '../routes/home/index.js'
import { about } from '../routes/about/index.js'
import { notificationPage } from '../routes/notification-page/index.js'
import { health } from '../routes/health/index.js'
import { manifest } from '../routes/manifest/index.js'
import { sw } from '../routes/sw/index.js'
import { push } from '../routes/push/index.js'
import { serveStaticFiles } from './serve-static-files.js'
import { config } from '#/config/config.js'

const registerViteAssets = async (server) => {
  const createViteServer = (await import('vite')).createServer
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  await server.register({
    plugin: (await import('@defra/hapi-connect')).default,
    options: {
      path: '/public',
      middleware: [vite.middlewares]
    }
  })
}

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([home, about, notificationPage, manifest, sw, push])

      // Static assets
      if (!config.get('isProduction') && !config.get('isTest')) {
        await registerViteAssets(server)
      } else {
        server.register(serveStaticFiles)
      }
    }
  }
}
