# Plan

## Completed: Foundation Scaffold

- [x] Read the original brief and NSheth brand source.
- [x] Verify current TanStack CLI add-on IDs.
- [x] Scaffold `apps/playground` with TanStack Start, React, npm, ESLint, Query, Prisma, Table, Form, Store, DB, and Intent.
- [x] Install dependencies and retain `.cta.json`.
- [x] Add a local TanStack CLI source reference.
- [x] Verify formatting, ESLint, TypeScript, and the Vite dev server without a production build.

## Completed: Initial UI Foundation

- [x] Convert brand guidance into CSS tokens, bundled fonts, layout utilities, and reduced-motion defaults.
- [x] Add source-first `Container`, `Button`, and `Field` primitives under `packages/ui`.
- [x] Replace the blank route with a responsive foundation showcase.
- [x] Verify workspace formatting, ESLint, TypeScript, and clean Vite startup.

## Completed: Untitled UI Migration

- [x] Replace the custom NSheth visual system with Tailwind CSS and semantic Untitled UI tokens.
- [x] Copy only the Button, Input, TextArea, label, and hint primitives required by current routes.
- [x] Migrate the foundation, admin, and blog interfaces and remove the obsolete `@nsheth/ui` workspace and bundled fonts.
- [x] Add discoverable source-context guidance and current upstream TanStack and Untitled UI checkouts.
- [x] Verify formatting, ESLint, TypeScript, route generation, tests, and clean Vite startup.

## Completed: Identity and RBAC

- [x] Use current Intent guidance and local source before selecting the auth integration.
- [x] Define the minimum user, session, role, permission, user-role, and role-permission model.
- [x] Keep authorization policy in server actions/middleware and repeated identity mechanics in the identity package.
- [x] Add one runnable vertical slice proving role and permission checks.
- [x] Document required environment variables and verify without a routine production build.

## Completed: Admin Shell and Module Registration

Reference [`satnaing/shadcn-admin`](https://github.com/satnaing/shadcn-admin) for its MIT-licensed responsive shell interactions, not as a dependency or visual template. Reimplement only useful patterns with TanStack Start server boundaries, the existing identity package, and the installed TanStack Table version.

- [x] Study only the relevant responsive sidebar, grouped navigation, user area, content inset, and skip-link source.
- [x] Define the minimum permission-filtered module registration shape from one real admin navigation slice.
- [x] Build the responsive, permission-aware admin shell using shared UI tokens and primitives.
- [x] Add one registered resource route without prebuilding generic CRUD infrastructure.
- [x] Verify keyboard navigation, mobile and desktop structure, and direct server authorization.

Defer its command menu, theme/layout configurators, charts, mock dashboard pages, generic data-table machinery, Clerk integration, and Tailwind/shadcn component stack until a real feature requires an equivalent.

## Completed: CMS Core and Blog

- [x] Define the minimum post and publication-state model without a generic page builder.
- [x] Add server-authorized list, create, detail, edit, and delete actions using canonical slug routes in the existing admin shell.
- [x] Add a public Notes index/detail vertical slice with useful metadata and links from published admin records.
- [x] Preserve first-publication dates through edits and remove public visibility when returned to draft.
- [x] Verify draft isolation, validation, accessibility, responsive behavior, and the complete record lifecycle.

Defer rich text, media, tags, authors, revisions, scheduling, and search until a composed application requires them.

## Privacy and Data Protection Compliance Gate

Target: GDPR and India DPDP readiness before any deployment processes real personal data. The current code is a privacy-aware technical baseline, not a compliance certification; see [`PRIVACY.md`](PRIVACY.md).

- [x] Inventory the personal data, cookie, storage, and authorization behavior in the current playground.
- [x] Document the GDPR scope and the phased DPDP Rules commencing 13 November 2025, 13 November 2026, and 13 May 2027.
- [ ] Record each deployment's operator roles, purposes, data categories, lawful bases or legitimate uses, recipients, transfers, and retention periods.
- [ ] Publish deployment-specific GDPR and DPDP notices and implement consent evidence and withdrawal where consent is used.
- [ ] Implement and test access, correction, erasure, objection/restriction/portability, grievance, and nomination workflows where applicable.
- [ ] Automate approved retention and erasure rules for users, sessions, content, products, enquiries, logs, and backups.
- [ ] Complete production authentication, security monitoring, vendor contracts, transfer safeguards, and tested breach procedures.
- [ ] Add child-data controls before child-directed processing and assess DPO, representative, DPIA, and Significant Data Fiduciary duties.
- [ ] Obtain deployment-specific legal review and retain verification evidence before marking the gate complete.

## Completed: Product Core and Catalogue/RFQ

- [x] Define the minimum product and enquiry models without inventory or checkout abstractions.
- [x] Add server-authorized product list, create, detail, edit, and guarded delete actions using canonical slug routes in the existing admin shell.
- [x] Add a public catalogue index/detail and one request-for-quote submission flow.
- [x] Show RFQ counts on product details and prevent product deletion while enquiries depend on it.
- [x] Verify validation, unpublished-product isolation, accessibility, responsive behavior, and the complete product lifecycle.

Defer categories, variants, media, attributes, search, inventory, pricing, and checkout until a catalogue or commerce composition requires them. Add an enquiry inbox when the first operator workflow defines ownership, status, and retention behavior.

## Admin Resource Convention

Working resource modules use `/admin/<resource>` for the list, `/new` for creation, `/<slug>` for record details, and `/<slug>/edit` for editing. Destructive actions live on the detail page, navigation remains active for descendant routes, and every private read or write independently enforces its permission at the server-function boundary.

- [x] Keep grouped module navigation persistent on desktop and provide an accessible, active-resource-labelled mobile drawer.
- [x] Provide responsive resource tables, search, publication-state filters, result counts, and direct edit actions.
- [x] Generate valid slugs from new record names while allowing deliberate overrides.
- [x] Warn before leaving dirty create/edit forms and move focus to server errors.
- [x] Match native RFQ quantity constraints to server validation.

## Completed: Booking Core and Service Booking

- [x] Service, dated availability, and booking-request models.
- [x] Authorized service CRUD and slot creation/removal in the admin shell.
- [x] Public service index/detail and booking-request flow with contact details and reference.
- [x] Database row locks prevent overbooking; pending requests reserve capacity; cancellation releases capacity.
- [x] Status transitions, validation, capacity tests, and unpublished-service isolation.

## Completed: Hospitality

- [x] Property CRUD, room types, inventory, rates, and publication controls.
- [x] Public property index/details, date-range availability and quoted reservation requests.
- [x] Per-night capacity checks, row locking, timezone-aware arrival validation, and confirmation/cancellation queue.

## Completed: Commerce with Offline Payment

- [x] Product price, stock, collections, external HTTPS images, and shop publication controls.
- [x] Shop index/product pages, search, sort, cart, address form, and server-calculated checkout.
- [x] Transactional stock deductions, idempotent checkout, price-change protection, and cancellation restocking.
- [x] Operator order queue and offline payment recording.

## Completed: Identity and Operator Workflows

- [x] GitHub OAuth with PKCE, verified emails, initial owners, and secure sessions.
- [x] Customer/staff/editor/admin roles, account activity/export, team access, and revocation.
- [x] Live enquiry inbox, privacy-request intake/triage, and persistent submission throttles.
- [x] Expired session/login/throttle maintenance command.
- [ ] Verify live OAuth with deployment credentials and callback.

## Completed: Optional Payment Integration

- [x] Stripe card sessions, idempotency, signed webhooks, event deduplication, and pending-payment safeguards.
- [x] Signature/tampering/expiry regression tests and deployment setup documentation.
- [ ] Verify real Stripe test checkout and callback delivery with deployment credentials.

## Next Task: Deployments and Templates

Complete deployment adapters and reusable compositions.

## Tooling Adoption Gate

Turborepo is reliable and incrementally adoptable, but it does not reduce maintenance for the current one-app, four-package workspace. Keep the existing npm command facade until a second runnable app exists or measured local/CI task time warrants dependency-aware scheduling and caching; then adopt Turbo around the existing package scripts rather than rewriting them.

## Later Phases

1. Hospitality composition on the booking core.
2. Commerce, payments, and integrations.
3. Cloudflare, Vercel, and Node/VPS adapters.
4. Compile reusable add-ons and seven composed templates.

Implement one vertical slice per phase. Update this file as scope becomes concrete.
