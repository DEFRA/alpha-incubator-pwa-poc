# Stage 07 (optional / stretch) — Geolocation-gated notifications

## Goal

Optionally extend the flow so the 30-second test notification is only sent if the
registering user is within a specific, configurable geographic area — e.g. only notify
users currently near a particular office or region. **This is a stretch goal and not
required for the core POC's definition of done** (see `docs/plan/00-overview.md`).

## Background

- The [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
  (`navigator.geolocation.getCurrentPosition`) works in Safari/iOS home-screen apps under
  the same secure-context rules as push (HTTPS, or `localhost` for local dev), and
  requires its own explicit user permission prompt, separate from the notification
  permission prompt.
- This adds a real privacy/consent surface (precise location data) — if this stage is
  implemented, it should get its own ADR
  (`adr/geofencing-push-notifications.adr.md`) covering what's captured, how long it's
  kept, and how consent is obtained, per `AGENTS.md`'s guidance on recording significant
  decisions.

## Steps (sketch — refine when this stage is picked up)

1. **Capture location on registration**, alongside the existing subscribe click handler
   from Stage 03:
   ```js
   navigator.geolocation.getCurrentPosition((position) => {
     // include position.coords.latitude/longitude in the POST body to /api/push/subscribe
   })
   ```
   - Request this permission as part of (or immediately after) the same user gesture used
     for notification permission, to avoid extra unrelated prompts feeling intrusive.
2. **Extend the subscription payload/storage** (Stage 03/04) to include a lat/long
   alongside the push subscription — still in-memory, per the existing storage decision,
   unless the ADR for this stage decides otherwise.
3. **Add a configurable target area** — e.g. a centre point + radius (in metres/km) read
   from convict config (`config.js`), so the area can be changed without a code change.
4. **Gate the send** in the push service (Stage 04): before calling
   `sendTestNotification`, compute the distance between the stored location and the
   configured centre point (e.g. a simple haversine formula) and only send if within the
   radius; otherwise log a "skipped — outside area" message.
5. **Write the ADR** (`adr/geofencing-push-notifications.adr.md`) documenting: what data
   is captured, whether it's persisted beyond the in-memory subscription's lifetime, how
   consent is obtained/revoked, and the trade-offs of this approach vs. alternatives
   (e.g. server-side IP geolocation, which would avoid the extra permission prompt but is
   far less accurate).

## Manual verification

- Registering from within the configured area results in the notification arriving as
  normal.
- Registering from outside the configured area results in no notification, with a log
  line confirming it was skipped and why.

## Risks / caveats

- Precise geolocation is sensitive data — do not log raw coordinates at a verbosity level
  that would persist them longer than necessary, and keep this stage's scope explicit in
  its ADR.
- Geolocation permission prompts can be denied independently of notification permission —
  decide (and document in the ADR) what happens if location is denied but notifications
  are granted (e.g. skip the geofencing check entirely, or refuse to register).
