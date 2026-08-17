import { config } from '#/config/config.js'
import { context } from '#/config/nunjucks/context/context.js'

const themeColor = '#1d70b8'

/**
 * Serves the Web App Manifest so the site is installable (Home Screen/Dock)
 * from Safari. Built dynamically so icon paths resolve correctly whether
 * running in dev or after a hashed Vite production build.
 */
export const manifestController = {
  handler(request, h) {
    const { getAssetPath } = context(request)
    const serviceName = config.get('serviceName')

    const manifest = {
      name: serviceName,
      short_name: serviceName,
      start_url: '/',
      id: '/',
      display: 'standalone',
      background_color: themeColor,
      theme_color: themeColor,
      icons: [
        {
          src: getAssetPath(
            'node_modules/govuk-frontend/dist/govuk/assets/images/govuk-icon-192.png'
          ),
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: getAssetPath(
            'node_modules/govuk-frontend/dist/govuk/assets/images/govuk-icon-512.png'
          ),
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }

    return h.response(manifest).type('application/manifest+json')
  }
}
