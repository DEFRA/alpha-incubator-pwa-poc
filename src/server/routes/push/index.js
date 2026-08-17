import { pushSubscribeController } from './controller.js'

/**
 * Sets up the routes used for Web Push subscription management.
 * These routes are registered in src/server/plugins/router.js.
 */
export const push = {
  plugin: {
    name: 'push',
    register(server) {
      server.route([
        {
          method: 'POST',
          path: '/api/push/subscribe',
          ...pushSubscribeController
        }
      ])
    }
  }
}
