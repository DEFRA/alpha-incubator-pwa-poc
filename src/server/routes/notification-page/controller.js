/**
 * Controller for the /notification-page route, shown when a user taps the
 * push notification's notificationclick handler.
 */
export const notificationPageController = {
  handler(_request, h) {
    return h.view('notification-page/index', {
      pageTitle: 'Notification page',
      heading: 'Notification page',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Notification page'
        }
      ]
    })
  }
}
