# Stage 05 — Notification page

## Goal

Add the `/notification-page` route that the push notification's `notificationclick`
handler (Stage 02) opens/focuses when tapped.

## Steps

1. **Add a new route folder** `src/server/routes/notification-page/` following the
   existing convention seen in `src/server/routes/about/`:
   - `index.js` — registers the route (`GET /notification-page`).
   - `controller.js` — handler returning the rendered view.
   - `index.njk` — GOV.UK page template with:
     - Page heading: **"Notification page"**
     - Body: standard lorem ipsum placeholder text, styled with GOV.UK typography
       classes (e.g. `govuk-body`).
   - `controller.test.js` — unit test asserting the route renders successfully and
     contains the expected heading (following the pattern in
     `src/server/routes/about/controller.test.js`).
2. **Register the route plugin** in `src/server/plugins/router.js` alongside the existing
   `about`/`home`/`health` routes.

## Manual verification

- Visiting `/notification-page` directly in a browser renders the GOV.UK-styled page with
  the expected heading and lorem ipsum text.
- Tapping the push notification (from Stage 02/04's end-to-end flow) opens/focuses this
  page in the installed PWA.

## Risks / caveats

- None significant — this is the simplest stage, a standard GOV.UK content page.
