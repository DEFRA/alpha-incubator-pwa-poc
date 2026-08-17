# Managing VAPID keys via environment variables

## Status

Accepted

## Context

The `web-push` protocol requires a VAPID key pair (a public key shared with the browser
during subscription, and a private key used server-side to sign push messages) to
authenticate this service as the sender. These keys need to be:

- Generated once (they don't need to rotate for this POC).
- Available to the running server process (both keys) and to client-side JavaScript
  (public key only, for `pushManager.subscribe()`).
- Never committed to source control, since the private key is a credential.

Options considered:

- Generate the key pair once (e.g. via `npx web-push generate-vapid-keys`) and inject via
  environment variables, following this template's existing `convict`-based config
  pattern (`src/config/config.js`) and its existing use of env files (local `.env`).
- Generate keys automatically at server startup if not already configured.
- Have the client generate/manage keys.

Generating fresh keys at every server startup would invalidate every existing browser
subscription each time the server restarts (subscriptions are tied to the public key used
when they were created), which is a poor fit even for a POC that's meant to be
demonstrable repeatedly without re-registering constantly whenever the process restarts
for reasons other than a deliberate key rotation.

## Decision

We will generate the VAPID key pair once (locally, via the `web-push` CLI) and inject both
keys into the running service via environment variables, wired through this template's
existing `convict` config module. The private key is never logged or exposed to the
client; only the public key is rendered to client-side code.

## Consequences

- **Positive:** Consistent with this template's existing configuration and secrets
  patterns (env vars + convict); no new configuration mechanism introduced.
- **Positive:** Subscriptions remain valid across ordinary server restarts, since the
  public key used to create them doesn't change.
- **Negative:** Key rotation is a manual process (regenerate + update env vars +
  redeploy) — acceptable for a POC, but would need a proper process before any production use.
- **Neutral:** As with any env-var-based secret, whoever manages the deployment
  environment (e.g. CDP `dev`) is responsible for setting these securely and not
  committing them to the repository.
