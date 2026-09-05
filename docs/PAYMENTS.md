# Payments

Offline checkout is the default. Operators record receipt of funds in `/admin/orders`. Paid orders cannot be cancelled through the simple restock action; refunds require reconciliation with the payment provider or offline ledger.

To enable optional card checkout, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and canonical HTTPS `PUBLIC_ORIGIN`. Register `/api/stripe` for `checkout.session.completed` and `checkout.session.expired` snapshot events. Match the webhook API version to the installed Stripe SDK. The receipt offers Stripe checkout only when both secrets are configured. The card flow uses the immutable order amount and INR currency.

Checkout creation uses one idempotency key and a stable expiry per order. Pending online payments block offline payment recording and cancellation. Signed webhook events validate amount, currency, order, and session identity, deduplicate event IDs, and update payment state transactionally. Return-page navigation is never proof of payment. Expired or interrupted sessions require operator reconciliation; do not mark them paid based on a browser screenshot. A session that expired cannot be reused for another payment attempt; place a new order after reconciling/cancelling the old one.

If the provider call fails after the order is marked pending, retry the same session request. If uncertainty persists, inspect the Stripe dashboard and reconcile before accepting offline payment. Refunds, disputes, taxes by jurisdiction, invoices, subscriptions, and alternative payment methods need application-specific policy; the default flat catalogue prices are final inclusive prices.

Verification includes local signed-event, tampering, and expiry tests. Real checkout and webhook delivery require your Stripe test account and a reachable callback. No live payment was made during development.

Source: installed Stripe 22.6.1 types and OpenSrc checkout `stripe/stripe-node/22.6.1`, particularly `src/Webhooks.ts` and Checkout Session resource definitions.
