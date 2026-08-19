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

const statusMessages = {
  unsupported: 'Push notifications are not supported on this device.',
  denied:
    'Notification permission was refused. Enable notifications for this app in your device settings, then try again.',
  subscribed: 'Registered. Your test notification will arrive in 10 seconds.'
}

document
  .getElementById('register-notifications')
  ?.addEventListener('click', (event) => {
    const status = document.getElementById('notification-status')
    const setStatus = (message) => {
      if (status) {
        status.textContent = message
      }
    }

    setStatus('Registering…')

    registerForNotifications({
      applicationServerKey: event.currentTarget.dataset.vapidPublicKey
    })
      .then((result) => {
        setStatus(statusMessages[result] ?? `Unexpected result: ${result}`)
      })
      .catch((err) => {
        console.error('Failed to register for notifications', err)
        setStatus(`Registration failed: ${err.message}`)
      })
  })
