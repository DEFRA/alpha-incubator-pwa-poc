import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Radios,
  SkipLink
} from 'govuk-frontend'

import { registerServiceWorker } from './register-service-worker.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Radios)
createAll(SkipLink)

registerServiceWorker()
