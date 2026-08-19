import { notificationPageController } from './controller.js'

/**
 * Sets up the routes used in the /notification-page page.
 * These routes are registered in src/server/router.js.
 */
export const notificationPage = {
  plugin: {
    name: 'notification-page',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/notification-page',
          ...notificationPageController
        }
      ])
    }
  }
}
