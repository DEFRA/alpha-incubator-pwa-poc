/**
 * Registers the root-scoped service worker (see src/client/sw.js) so the
 * app can receive push events after being installed to the Home Screen/Dock.
 */
export const registerServiceWorker = (nav = navigator) => {
  if ('serviceWorker' in nav) {
    nav.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('Service worker registration failed', err))
  }
}
