# Storing push subscriptions in memory

## Status

Accepted

## Context

Sending a push notification later (e.g. the POC's 30-second delayed "test notification")
requires the server to persist each browser's `PushSubscription` (endpoint + keys) between
the register request and the scheduled send, and potentially across multiple registration
attempts.

Options considered:

- **In-memory** (a module-level variable/array in the running Node.js process).
- **Redis**, via this template's existing `catbox-redis` integration — would survive
  process restarts and support multiple instances.
- **Hapi `yar` session storage** — per-browser-session, already used elsewhere in this
  template for session state.

This is an explicit proof-of-concept scoped to demonstrating the _installation → register
→ notify → click-through_ flow, single-tester, single-instance, short-lived by nature
(the whole POC's lifecycle is measured in a demo session, not days). Redis/session-backed
storage would add durability and multi-instance support that this POC does not need, at
the cost of extra wiring for a decision that is trivial to revisit later.

## Decision

We will store push subscriptions in memory (a simple in-process store), scoped to a
single running instance, with no persistence across restarts.

## Consequences

- **Positive:** Simplest possible implementation — no serialization, no Redis
  connection/health dependency for this feature, fastest to build and demo.
- **Negative:** Subscriptions are lost on every server restart/redeploy — anyone testing
  the flow must re-register after a restart.
- **Negative:** Does not support running more than one instance of the service (a second
  instance would not see subscriptions registered against the first) — this must be
  revisited (e.g. move to Redis) before this feature could run in a horizontally-scaled or
  production environment.
- **Neutral:** Because storage is scoped to a single global "last registered wins"
  subscription for this POC (no multi-user support), the in-memory approach is
  sufficient for its intended single-tester demo use case.
