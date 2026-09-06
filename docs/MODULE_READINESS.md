# Existing-module readiness

The 0.8.0 release demonstrated integrations and basic workflows. It did not establish product readiness. A reusable block must cover customer and operator journeys, realistic data, lifecycle rules, failure states, authorization, and integration instructions. The owner's 75% target means reducing common project work; it is not a promise of a universal completion percentage.

## Delivery order

1. Runtime repair: repeatable local data setup, diagnostics, safe errors, useful retry/loading/not-found screens, HTTP route verification.
2. Product/catalogue and commerce: product identities and classification, media/specifications, options, publication/copy/retirement, inventory history, shopping and operator order workflows.
3. Booking and hospitality: timezone/location/pricing, booking windows and cancellation policies, duplicate request protection, operational queues, property/room details, stay constraints and quote verification.
4. Content, identity and operations: editorial metadata, scheduled publishing and revisions; session/access administration and operational history.
5. Composition hardening: copy manifests, dependency/configuration contracts and representative module-selection checks. The seven new templates remain deferred.

Plan each module before extending it. Each release requires meaningful success/failure checks and a versioned commit/push. New modules remain paused. Preserve existing data and operator configuration.

## Common acceptance criteria

- Document users, jobs, data relationships, lifecycle transitions, permissions, validation, concurrency rules and exclusions.
- Private reads/writes authorize independently. Feature selection and navigation filtering never replace authorization or tenant isolation.
- Money uses integer minor units. Dates and availability have explicit server rules. Concurrent changes cannot silently overwrite inventory or another editor's work.
- Lists have discoverability and bounded output; forms retain failed submissions and explain conflicts. Destructive operations preserve dependent history.
- Expected errors are actionable; unexpected errors expose neither SQL nor contact details. Logs contain safe diagnostic codes/references.
- Reusable blocks document files, dependencies, database migrations, configuration, extension points and checks.
- Verification uses direct HTTP, database integration, unit tests and source inspection. No browser use or claims of visual/interaction verification.

## Research

Official guidance consulted through HTTP and local source: [OWASP error handling](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [Stripe fulfilment](https://docs.stripe.com/payments/checkout/fulfill-orders), installed TanStack Start middleware and Router error-boundary source. These support generic unexpected errors, authorization on every request, idempotent fulfilment and loader invalidation on retry.
