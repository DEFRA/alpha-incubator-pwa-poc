/**
 * Controller for the /notification-page route, shown when a user taps the
 * push notification's notificationclick handler.
 */
const pageTitle = 'Notification page'

export const notificationPageController = {
  handler(_request, h) {
    return h.view('notification-page/index', {
      pageTitle,
      heading: pageTitle,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: pageTitle
        }
      ]
    })
  }
}
