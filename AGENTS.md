# AGENTS.md

Guidance for AI agents (and humans) developing this service.

## What this service is

`alpha-incubator-pwa-poc` is a **proof of concept**, not a production service. Its sole
purpose is to prototype and demonstrate the steps involved in turning a GOV.UK-styled web
app into an installable Progressive Web App (PWA) that can send native push notifications
to a user's device via Safari (macOS and iOS/iPadOS).

The target end-to-end flow being prototyped:

1. A user visits the site in Safari and installs it to their Home Screen (macOS Dock /
   iOS Home Screen) as a PWA.
2. On a page, the user clicks a **"Register for notifications"** button.
3. ~30 seconds later, the device shows a native push notification: _"test notification"_.
4. Tapping the notification opens the installed app to a **`/notification-page`** showing
   a simple confirmation page.

Because this is a POC:

- Keep implementations minimal and readable over robust/production-hardened. Favour
  clarity for demoing the _steps involved_, not completeness.
- Don't add offline support, caching strategies (Workbox, etc.), multi-user auth, or
  horizontal-scaling concerns unless a task explicitly asks for it — see `adr/` for the
  scope decisions already made and why.
- It is fine (and expected, per `adr/storing-push-subscriptions-in-memory.adr.md`) that
  state resets on restart and only a single instance is supported.

## Where to look first

- **`docs/plan/`** — the staged build plan for this POC. Read `docs/plan/00-overview.md`
  first, then the stage relevant to your task. Each stage file lists its goal, concrete
  steps/files touched, and manual verification steps.
- **`adr/`** — Architecture Decision Records explaining _why_ key choices were made
  (e.g. why standard Web Push instead of a vendor SDK, why in-memory storage). Check
  here before revisiting or contradicting a prior decision; if you must contradict one,
  follow the ADR convention below (new ADR + mark the old one `Superseded`).

## Tech stack & conventions (this is the CDP Node.js Frontend Template)

- **Runtime:** Node.js (see `.nvmrc` for exact version; `package.json` requires `>=24`).
- **Framework:** Hapi.js (`@hapi/hapi`) with `nunjucks` templating and `govuk-frontend`
  for all UI. Always build pages using GOV.UK Design System components/macros, not
  hand-rolled HTML/CSS.
- **Docker-first:** the canonical way to run this service locally is Docker Compose
  (`compose.yml`, `Dockerfile`). `npm run docker:compose` builds and brings up this
  service plus its Redis dependency, using the `start:watch` script inside the
  container so code changes reload automatically. Non-Docker `npm run dev` is a
  supported fallback for fast iteration.
- **Config:** all runtime configuration goes through `convict` in `src/config/config.js`.
  Add new env-driven settings there rather than reading `process.env` directly elsewhere.
- **Routes:** follow the existing folder shape per route:
  `src/server/routes/<name>/{index.js, controller.js, index.njk, controller.test.js}`.
  Register new route plugins in `src/server/plugins/router.js`.
- **Client-side assets:** `src/client/javascripts/application.js` (JS) and
  `src/client/stylesheets/` (Sass, GDS stylelint config) are built via Vite
  (`npm run build:frontend`); anything served as a static asset (manifest, icons, service
  worker) should go through the existing static-serving setup
  (`src/server/plugins/serve-static-files.js`) or `src/client/assets.html` pattern used
  for GOV.UK favicon/icon assets — reuse govuk-frontend's bundled icons where sizes match
  before creating new ones.
- **PWA-specific files**, once introduced per the staged plan:
  - Web App Manifest (e.g. `site.webmanifest`) and a root-scoped service worker
    (`sw.js`) must be served from the site root so the service worker's scope covers the
    whole app.
  - Any push-related server config (VAPID keys, etc.) is wired through `convict`/env
    vars, never hard-coded or committed — see
    `adr/managing-vapid-keys-via-environment-variables.adr.md`.
- **Linting/formatting:** ESLint (`neostandard` config) for JS, Stylelint (`gds` config)
  for Sass, Prettier for formatting. Run `npm run lint` / `npm run format:check`.
- **Testing:** Vitest. Co-locate `*.test.js` files next to the code they test (see
  existing `controller.test.js` files for the pattern). Run `npm test` (includes
  coverage). New server logic (routes, push-sending service, etc.) added for this POC
  must include unit tests — see `docs/plan/06-testing-and-docs.md`.
- **Pre-commit hook** (Husky, `npm run git:pre-commit-hook`): runs a security audit,
  `format:check`, `lint`, and `test`. Keep changes passing all four before committing.

## Recording new decisions

If you make a significant, hard-to-reverse choice (architecture, data model, dependency,
security boundary, error-handling strategy) while extending this POC, add an ADR to
`adr/` following the existing template/convention (`Title` / `Status` / `Context` /
`Decision` / `Consequences`, filename `<verb-phrase>.adr.md`). Check `adr/` first so you
don't duplicate or silently contradict an existing decision.
