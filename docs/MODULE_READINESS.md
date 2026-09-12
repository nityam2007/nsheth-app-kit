# Existing-module readiness

> **Historical record:** Active development and maintenance stopped on 12 September 2026. This document is not an active backlog. See [the freeze decision](PLAN.md).

The 0.8.0 release demonstrated integrations and basic workflows. It did not establish product readiness. A reusable block must cover customer and operator journeys, realistic data, lifecycle rules, failure states, authorization, and integration instructions. The owner's 75% target means reducing common project work; it is not a promise of a universal completion percentage.

## Delivery order

1. Runtime repair: repeatable local data setup, diagnostics, safe errors, useful retry/loading/not-found screens, HTTP route verification.
2. Product/catalogue and commerce: product identities and classification, media/specifications, options, publication/copy/retirement, inventory history, shopping and operator order workflows.
3. Booking and hospitality: timezone/location and quote boundaries, booking windows and cancellation policies, duplicate request protection, operational queues, property/room details, stay constraints and quote verification.
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

## Verified baseline after hardening

- 0.8.1: reliable development startup path, diagnostics, safe errors and HTTP checks.
- 0.8.2: product options/media/specifications, lifecycle, inventory ledger, checkout recovery and payment-aware order operations.
- 0.8.3: booking policies, retries, moves and cancellation; property/room policies, stay quotes and operator history.
- 0.8.4: publishing metadata/scheduling/revisions, operational responsibility/follow-up and session/access safeguards.
- 0.8.5: module configuration and source export, direct-call gates, request size/cache safeguards and patched/pinned dependencies.

Unit tests, production HTTP/database integration, full development HTTP checks and an independently exported project build verify this baseline. No browser or visual interaction testing has been performed. Lists intentionally bound public results to 200 and most operator queues to 500; large catalogues need server pagination/search. Source exports retain all models and source. Module-specific exclusions remain in docs/modules; new modules are still paused.

The final Node and Cloudflare builds pass. A simulated unavailable database returns safe HTTP 503 without raw database errors. The exported Content/Shop project independently installed and built, rendered configured branding, and rejected disabled public routes/direct functions without database access. npm audit reports zero vulnerabilities with the checked-in lockfile. Live host/provider deployments and visual interaction checks were not performed.
