# Stage 06 — Testing and docs

## Goal

Bring the new code up to the template's existing quality bar (unit tests, lint,
formatting) and document how to demo/test the flow end to end.

## Steps

### Unit tests

- `src/server/routes/push/controller.test.js` — test the `POST /api/push/subscribe`
  handler: valid subscription body is accepted (`202`) and stored; invalid/missing body
  is rejected with a clear error.
- `src/server/common/helpers/push/push-service.test.js` — test `sendTestNotification`,
  mocking `web-push`'s `sendNotification` (vitest `vi.mock('web-push')`) to assert it's
  called with the expected payload shape and VAPID details, without making real network
  calls.
- `src/server/routes/notification-page/controller.test.js` — as described in Stage 05.
- Consider a lightweight test (or manual check) that `sw.js` and the manifest are served
  with the correct content types, if a reasonable test harness exists for that in this
  template (e.g. via `server.inject()`).

### Lint & format

- Run `npm run lint` and `npm run format:check` (or `npm run format` to auto-fix) across
  all new files — new client JS follows the existing `neostandard` ESLint config, new
  Sass (if any) follows the `gds` Stylelint config.

### Manual test script

**Local (macOS Safari, `localhost`):**

1. `docker compose up` (or `npm run dev`).
2. Open `http://localhost:3000` in Safari.
3. Add to Dock (installability check from Stage 01).
4. Click "Register for notifications", accept the permission prompt.
5. Wait ~30 seconds — confirm the "test notification" appears.
6. Click it — confirm `/notification-page` opens showing "Notification page" + lorem ipsum.

**Device (iPhone/iPad Safari, after deploying to CDP `dev`):**

1. Deploy the branch/PR to the `dev` environment.
2. Open the `dev` URL in Safari on the device.
3. Share → "Add to Home Screen".
4. Open the app from the Home Screen icon (standalone launch).
5. Repeat steps 4–6 from the local script above.

### Docs

- Update `README.md` with a short section linking to `docs/plan/00-overview.md` and
  summarising the manual test script above.
- Keep `AGENTS.md` in sync if any convention changes during implementation (e.g. final
  file/route names differing from what's sketched in the stage docs).

## Definition of done for this stage

- `npm test`, `npm run lint`, and `npm run format:check` all pass.
- The manual test script has been run at least once locally, and once on a real device
  after a `dev` deploy, with results noted (e.g. in the PR description).
