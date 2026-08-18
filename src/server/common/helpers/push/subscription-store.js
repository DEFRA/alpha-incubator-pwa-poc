/**
 * In-memory store for a single push subscription (see
 * adr/storing-push-subscriptions-in-memory.adr.md — this POC is scoped to a
 * single-tester, single-instance, "last registered wins" subscription).
 */
let subscription = null

export function saveSubscription(newSubscription) {
  subscription = newSubscription
}

export function getSubscription() {
  return subscription
}
