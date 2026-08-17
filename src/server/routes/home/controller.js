/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
import { config } from '#/config/config.js'

export const homeController = {
  handler(_request, h) {
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      vapidPublicKey: config.get('vapidPublicKey')
    })
  }
}
