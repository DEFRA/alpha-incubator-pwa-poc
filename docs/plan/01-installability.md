# Stage 01 — Installability (Web App Manifest, icons, meta tags)

## Goal

Make the site installable as a PWA from Safari: a Home Screen icon on iOS/iPadOS, a Dock
entry on macOS, opening in its own standalone window rather than a Safari tab.

## Background

- A site becomes installable when it serves a Web App Manifest (`display` set to
  `standalone` or `fullscreen`) linked from the page `<head>`.
- Safari on iOS/iPadOS additionally wants Apple-specific meta tags
  (`apple-mobile-web-app-capable`, `apple-mobile-web-app-title`) and an
  `apple-touch-icon` link — the manifest alone is not always enough on older Safari
  versions, so both should be present for broadest compatibility.
- The Web App Manifest `id` field is used by iOS/iPadOS 16.4+ to identify the app (for
  Focus mode syncing, etc.) — include a stable `id` (e.g. `/`).

## Steps

1. **Add a manifest file**, e.g. `src/client/manifest.webmanifest`, containing at least:
   - `name`, `short_name`
   - `start_url` (e.g. `/`)
   - `display: "standalone"`
   - `background_color`, `theme_color` (match GOV.UK blue, `#1d70b8`, per existing
     `mask-icon` colour in `src/client/assets.html`)
   - `id` (e.g. `/`)
   - `icons` array — reuse govuk-frontend's bundled icons
     (`govuk-icon-192.png` etc. from `node_modules/govuk-frontend/dist/govuk/assets/images/`)
     for any sizes it already ships; only add a bespoke icon (e.g. a simple 512x512
     placeholder) if a required size is missing.
2. **Serve the manifest** through the existing static-serving plugin
   (`src/server/plugins/serve-static-files.js`) or by copying it into the built assets
   directory during `build:frontend`, following how `src/client/assets.html` already
   references `node_modules/govuk-frontend` assets.
3. **Link the manifest and add meta tags** in
   `src/server/common/templates/layouts/page.njk`:
   - `<link rel="manifest" href="...">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-title" content="...">`
   - `<meta name="theme-color" content="#1d70b8">`
   - `<link rel="apple-touch-icon" href="...">` (reusing the existing govuk-frontend
     icon reference already present in `assets.html`, or the manifest's own icon path)
4. Confirm content type/headers: the manifest must be served with
   `application/manifest+json` (or `application/json`) — check the static file handler
   sets this correctly, adjusting if needed.

## Manual verification

- **macOS Safari:** open `localhost:3000`, use Safari's File → "Add to Dock" (or the
  Share menu's "Add to Dock" depending on Safari version) and confirm the app opens
  standalone (no address bar) from the Dock icon.
- **iOS/iPadOS Safari** (after deploying to `dev`): Share → "Add to Home Screen", confirm
  the icon, name, and standalone launch look correct.

## Risks / caveats

- Safari's exact "Add to Home Screen"/"Add to Dock" UI and manifest requirements have
  shifted across versions — if installability doesn't trigger, double check the manifest
  is reachable and valid JSON, and that `display` is `standalone`/`fullscreen`.
- Vite's asset pipeline may need explicit configuration to avoid mangling/hashing the
  manifest filename, since its path must be stable and predictable.
