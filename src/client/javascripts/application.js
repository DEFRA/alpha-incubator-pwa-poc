import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Radios,
  SkipLink
} from 'govuk-frontend'

import { registerServiceWorker } from './register-service-worker.js'

for (const component of [Button, Checkboxes, ErrorSummary, Radios, SkipLink]) {
  createAll(component)
}

registerServiceWorker()
