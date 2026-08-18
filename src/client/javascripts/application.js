import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Radios,
  SkipLink
} from 'govuk-frontend'

import { registerServiceWorker } from './register-service-worker.js'
import { registerForNotifications } from './register-for-notifications.js'

for (const component of [Button, Checkboxes, ErrorSummary, Radios, SkipLink]) {
  createAll(component)
}

registerServiceWorker()

document
  .getElementById('register-notifications')
  ?.addEventListener('click', (event) => {
    registerForNotifications({
      applicationServerKey: event.currentTarget.dataset.vapidPublicKey
    })
  })
