# Using the standard Web Push protocol (VAPID) instead of a vendor push SDK

## Status

Accepted

## Context

This POC needs to send push notifications to browsers/devices, primarily targeting
Safari on macOS and iOS/iPadOS, for a Home Screen-installed PWA. Several approaches were
available:

- A vendor push SDK/service (e.g. Firebase Cloud Messaging).
- The standards-based **W3C Web Push** protocol (Web App Manifest + Service Workers +
  Push API + Notifications API), using VAPID for server authentication.

WebKit's own documentation confirms that Safari 16.1+ (macOS Ventura) and iOS/iPadOS
16.4+ support push notifications for home-screen-installed web apps using this standard
Web Push stack, routed through Apple's push service, with **no Apple Developer account or
proprietary SDK required** — as long as the implementation uses standard, feature-detected
Web Push rather than browser-specific detection.
Source: <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipads/>

Using a vendor SDK (e.g. Firebase) would add an external dependency/account, an extra
service integration, and is not needed for Safari support, since Safari implements the
open standard directly.

## Decision

We will implement push notifications using the standard W3C Web Push protocol via the
`web-push` npm library and VAPID keys, rather than any vendor-specific push SDK or
notification service.

## Consequences

- **Positive:** No third-party account/service dependency (e.g. Firebase project) is
  needed; the same code path works across any standards-compliant browser (Safari,
  Chrome, Firefox, Edge), not just one vendor's ecosystem.
- **Positive:** Matches Apple's documented, supported approach for Safari/iOS push,
  minimising the risk of hitting undocumented vendor-SDK compatibility issues with Safari.
- **Negative:** We are responsible for our own VAPID key management (see
  `managing-vapid-keys-via-environment-variables.adr.md`) and for handling push service
  errors (e.g. expired subscriptions returning HTTP 410) ourselves, rather than relying on
  a vendor SDK's built-in retry/delivery-tracking tooling.
- **Neutral:** This decision only concerns notification _delivery_; it does not preclude
  adopting a vendor SDK later if the POC evolves into a production service with different
  needs (e.g. android/native app notification fan-out).
