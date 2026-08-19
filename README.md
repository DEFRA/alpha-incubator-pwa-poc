# alpha-incubator-pwa-poc

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_alpha-incubator-pwa-poc&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_alpha-incubator-pwa-poc)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_alpha-incubator-pwa-poc&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_alpha-incubator-pwa-poc)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_alpha-incubator-pwa-poc&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_alpha-incubator-pwa-poc)

Core delivery platform Node.js Frontend Template.

## Progress update

This repository is a **proof of concept**, not a production service. It exists to
prototype turning a GOV.UK-styled Hapi.js web app into an installable Progressive Web
App (PWA) that sends native push notifications to a user's device via Safari (macOS and
iOS/iPadOS), using nothing but the standard W3C Web Push stack (Web App Manifest,
Service Worker, Push API, Notifications API) — no vendor SDK, no Apple Developer
account. See [`AGENTS.md`](./AGENTS.md) for full context and
[`docs/plan/`](./docs/plan/00-overview.md) for the staged build plan this POC followed.

### What it demonstrates end-to-end

1. A user visits the site in Safari and installs it to their Home Screen/Dock as a PWA.
2. They click **"Register for notifications"**, which requests notification permission
   and subscribes the browser to push via VAPID.
3. ~10 seconds later, the device shows a native push notification ("test notification").
4. Tapping the notification opens the installed app at **`/notification-page`**.

### Status

All core stages of the build plan are complete, tested, and merged:

- [`01-installability.md`](./docs/plan/01-installability.md) — Web App Manifest, icons, meta tags
- [`02-service-worker.md`](./docs/plan/02-service-worker.md) — root-scoped service worker
- [`03-subscription-flow.md`](./docs/plan/03-subscription-flow.md) — "Register for notifications" button and subscribe flow
- [`04-sending-notifications.md`](./docs/plan/04-sending-notifications.md) — `web-push`/VAPID, scheduled send of the test notification
- [`05-notification-page.md`](./docs/plan/05-notification-page.md) — `/notification-page` click target
- [`06-testing-and-docs.md`](./docs/plan/06-testing-and-docs.md) — unit tests, manual test scripts, docs

The optional stretch goal, [`07-stretch-geolocation.md`](./docs/plan/07-stretch-geolocation.md)
(gating the notification send on the user's location), was **not** picked up.

### Problems encountered along the way

- **VAPID public key format** — `pushManager.subscribe()` requires the VAPID public key
  as a `Uint8Array`, not the base64url string returned by `web-push`'s key generator;
  this needed an explicit conversion step on the client.
- **Service worker updates not taking effect** — an installed PWA is usually
  backgrounded rather than fully closed, so the browser's default "wait for all tabs to
  close" update behaviour meant a new service worker never took control. Fixed by calling
  `skipWaiting()`/`clients.claim()` on install/activate.
- **Notification click didn't navigate existing windows** — `clients.matchAll()` +
  `existing.focus()` only refocuses an already-open window at its current URL; it doesn't
  navigate it to the notification's target. Needed an explicit `existing.navigate(url)`
  alongside `focus()`, using an absolute (not relative) URL.
- **iOS/iPadOS testing requires HTTPS** — `localhost` is fine for macOS Safari during
  local development, but device testing on iOS/iPadOS needed a real HTTPS deployment
  (the CDP `dev` environment), since Safari doesn't treat a phone's connection to a
  laptop's `localhost` as a secure context.
- **Single-instance, in-memory subscription storage** — a deliberate POC-scoped decision
  (see [`adr/storing-push-subscriptions-in-memory.adr.md`](./adr/storing-push-subscriptions-in-memory.adr.md));
  subscriptions are lost on every restart and only one "last registered wins" subscriber
  is supported.
- **Local dev environment fragility** — this repo's `node_modules` can end up in a
  broken state (missing native `rolldown`/Vite bindings) depending on how/when
  `npm install` last ran on Apple Silicon; a clean reinstall
  (`rm -rf node_modules package-lock.json && npm install`) resolves it, but it's a
  recurring local-only nuisance unrelated to the application code.

See the [`adr/`](./adr) directory for the full rationale behind the key technical
decisions made in this POC:

- [`using-standard-web-push-protocol.adr.md`](./adr/using-standard-web-push-protocol.adr.md)
- [`managing-vapid-keys-via-environment-variables.adr.md`](./adr/managing-vapid-keys-via-environment-variables.adr.md)
- [`storing-push-subscriptions-in-memory.adr.md`](./adr/storing-push-subscriptions-in-memory.adr.md)

- [Progress update](#progress-update)
- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Server-side Caching](#server-side-caching)
- [Redis](#redis)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd alpha-incubator-pwa-poc
nvm use
```

## Server-side Caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and CatboxMemory for
local development.
You can override the default behaviour by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or
`memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each
instance of the service and it will not persist between restarts.

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar
to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that
matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

If your service does not require a session cache to be shared between instances or if you don't require Redis, you can
disable setting `SESSION_CACHE_ENGINE=false` or changing the default value in `src/config/index.js`.

## Proxy

We are using forward-proxy which is set up by default. To make use of this: `import { fetch } from 'undici'` then
because of the `setGlobalDispatcher(new ProxyAgent(proxyUrl))` calls will use the ProxyAgent Dispatcher

If you are not using Wreck, Axios or Undici or a similar http that uses `Request`. Then you may have to provide the
proxy dispatcher:

To add the dispatcher to your own client:

```javascript
import { ProxyAgent } from 'undici'

return await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})
```

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Git hooks

Install git hooks (optional)

```bash
npm run git:hooks
```

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Docker

### Development image

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to the `docker run` command to ensure
> compatibility fEx: `docker build --platform=linux/arm64 --no-cache --tag alpha-incubator-pwa-poc`

Build:

```bash
docker build --target development --no-cache --tag alpha-incubator-pwa-poc:development .
```

Run:

```bash
docker run -p 3000:3000 alpha-incubator-pwa-poc:development
```

### Production image

Build:

```bash
docker build --no-cache --tag alpha-incubator-pwa-poc .
```

Run:

```bash
docker run -p 3000:3000 alpha-incubator-pwa-poc
```

### Docker Compose

A local environment with:

- Floci (replacing Localstack) for AWS services (S3, SQS)
- Redis
- MongoDB
- This service.
- A commented out backend example.

```bash
docker compose up --build -d
```

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

Instructions for setting up SonarCloud can be found in [sonar-project.properties](./sonar-project.properties).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
