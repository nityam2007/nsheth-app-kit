# Admin and account rebuild

## Follow-up verification (0.9.1)

The [2026-09-09 audit](AUDIT_2026-09-09.md) supersedes the build/permission blockers recorded below. Node production workflows and the Cloudflare build now pass. The client log identified mismatched optimized React versions; development assets now use `no-store` and dependency prebundling covers shared/lazy routes. `npm run test:hydration` checks the served application modules in Node VM/jsdom. It does not run a browser, render pixels, or test HMR transport.

The owner-requested UX pass uses the supplied Atelier source for task hierarchy and warmer admin surfaces. It adds page/task search, clear workflow help, compact lists, permission-aware creation, status-filtered attention links, real room counts and setup guidance. The final production page sweep covers 81 routes/screens and the completed Node VM client crawl covers 63 pages; database reset and restart behavior are documented in LOCAL_DEVELOPMENT.md. A subsequently detected VS Code development session remains under the owner’s control; no dev server was launched by the audit after the stop instruction.

## Intent

Rebuild the existing kit as an operator workspace with recognizable objects, useful overview screens and complete account entry points. Keep the existing domain modules; do not start the deferred templates. The owner has authorized replacing development data where migrations or fixtures require it. Production data is outside that authorization.

## Workspace structure

- Overview: permission-scoped counts, work awaiting action, recent activity and shortcuts to creation.
- Sell: Products and Orders. Products own identity, media, specifications, options, inventory and publication. Orders own customer/delivery details, line items, payment, fulfilment and history.
- Schedule: Services and Appointments. Services own duration, location, timezone, policy and availability. Appointments own customer, time, status, rescheduling and notes.
- Host: Properties and Reservations. Properties own location/policy/amenities and room inventory. Reservations own guest, dates, quote, cancellation and history.
- Publish: Posts. An article has author, metadata, content, publication and revision history.
- Inbox: Enquiries and Privacy requests. A case has contact, linked object, owner, status, notes and follow-up.
- People: Directory and Team access. Profiles show identity and role; access changes remain admin-only and revoke sessions.
- Account: Profile, activity and security. Sign-in, registration, verification and password recovery are explicit destinations, with a useful development path when delivery credentials are absent.

## Screen contract

Every collection has a title and description, count, primary creation action where meaningful, search, status filters, an empty state and links to individual objects. Collections use object previews with context instead of exposing raw database columns. Every detail has a breadcrumb, name/reference, status, summary, grouped sections, related data, actions and history where the module records it. Edits retain values after failure and acknowledge success. Tables are reserved for comparable line items or compact ledgers.

The shell has a persistent grouped desktop sidebar, current-page context, a mobile navigation dialog, overview link, view-site link and account/sign-out access. Shared components supply object headers, status badges, metric summaries, section panels, collection filtering and pagination, identity previews and activity lists. Use existing Untitled UI primitives and semantic tokens, consistent content widths, 44px controls, focus indicators and reduced motion.

## Identity and database

Registration creates a customer, never an administrator. Passwords are salted and derived with a bounded password KDF. Verification/reset tokens are random, stored only as hashes, expire and can be consumed once. Email-based activity stays inaccessible until ownership is verified. Reset revokes sessions. Login and recovery are throttled and do not reveal whether an email exists. Public registration must not take over an existing OAuth account. GitHub remains optional.

Development verification/recovery can show a local link explicitly labelled as development-only. Production requires configured email delivery and must never return verification/reset tokens. Account profile updates are limited to the signed-in user. Existing roles and server-side permission checks remain authoritative.

## Delivery and acceptance

1. Reproduce and repair the shared client failure with a non-browser regression, preserving SSR and API checks. Resolve or report the IPv4 listener conflict separately; confirm WSL database queries.
2. Deliver the shell, overview and shared object components; organize existing modules around them.
3. Replace operational collection forms with object summaries and dedicated detail screens; preserve lifecycle, stock/capacity and authorization rules.
4. Deliver registration/login/verification/recovery, profile and account security screens with migrations and deterministic development fixtures.
5. Check module-disabled, empty, invalid, unauthenticated, forbidden, missing-record, stale-update and unavailable-database states. Run formatting, lint, types, unit, HTTP and production integration checks. Explicitly report checks blocked by host permissions; never imply browser verification.

## Boundaries

Live GitHub/Stripe callbacks and production email delivery need operator credentials. Provider credentials are not fabricated. Every dashboard query is permission-scoped. Destructive development seeding must refuse non-local or production databases. Component appearance is reviewed from source and rendered markup because repository policy prohibits browser use.

## Implemented screen map

- Collections: /admin/products, /admin/posts, /admin/services, /admin/properties, /admin/orders, /admin/bookings, /admin/reservations, /admin/enquiries, /admin/privacy, /admin/users and /admin/access.
- Products/posts retain their canonical slug detail/edit paths. Services add /admin/services/:slug/availability; properties add /admin/properties/:slug/rooms. Their overview screens show policy, context and counts.
- Operational records and people use shareable ?record=UUID views. Collection and selected-record loader dependencies are separate; operational server queries fetch that exact ID, including older records outside the 500-record collection window. Missing records use the not-found state. The 500-record operational collection limit is explicit; filters/pagination apply to that window.
- Customer entry: /login, /register, /verify-email, /forgot-password and /reset-password. Account: /account (activity), /account/profile and /account/security.

Shared blocks live in components/admin/workspace.tsx; form controls remain the copied Untitled primitives. No new business modules were introduced.

## Verification / remaining release work

The local account migration was applied transactionally through PostgreSQL after checking all 12 preceding migration checksums; Prisma CLI execution was denied by Windows. The migration ledger contains its actual checksum and completion record. Prisma Client generation succeeded. The HMR cache now replaces clients after generation.

Live local registration, verification, password recovery, token expiry/reuse, customer role isolation, profile editing, account pages and reset session revocation passed. Public/private development HTTP checks passed at localhost and dev3000.nsheth.in. A direct HTTP crawl visited 61 linked admin/account screens without an error. Catalogue components render with both server and reactive client router stores; these are component tests, not browser hydration tests.

The full production build and production integration run still require a terminal that permits Vite's child processes. The current session fails with spawn EPERM while Vite resolves the configuration, followed by native-module load errors. Production release verification remains pending. The owner explicitly requested source commits and a push despite this limitation, but staging was denied because this session cannot create `.git/index.lock`. No commit or push was created. The planned sequence is 0.8.7 runtime fixes, 0.9.0 admin/account expansion and 0.9.1 regression coverage/development fixtures, with aligned workspace versions in each commit. The user's original broad frontend failure has not been verified in a browser (prohibited by repository policy); framework error transport and stale database-client defects are repaired with protocol/regression evidence.

Final checks: formatting, ESLint and workspace TypeScript pass. All 32 unit/component/socket tests pass using the Node-only in-process TypeScript loader (the default tsx worker launch is restricted in this session). Development-mode workflow integration additionally passes concurrent booking/stay capacity, checkout retries, payload binding, CSRF, stock/fulfilment, stale-edit and access checks. Production bootstrap, process-local module toggles and direct streamed-body checks remain in the production suite and were not claimed by the development run.

Reproduce the in-process unit run in PowerShell:

```powershell
$testPaths = @(rg --files apps/playground/src packages -g '*.test.ts')
node --import ./scripts/typescript-test-loader.mjs --test --test-isolation=none @testPaths scripts/local-server.test.mjs scripts/frontend-render.test.mjs
```

For development workflow integration, set ALLOW_INTEGRATION_TESTS=1, TEST_DEV_URL=http://localhost:3000 and the local DATABASE_URL, then run scripts/integration.mts. Omit TEST_DEV_URL for the full production suite after a successful build. This suite creates temporary records and cleans them up; it must target a disposable database.

Final connectivity: doctor confirms a PostgreSQL query with 13 applied migrations and Vite on IPv6 localhost. The PostgreSQL listener is the Windows WSL relay. No conflicting IPv4 port-3000 listener remains in the final check. Direct WSL distribution inspection is still denied to this session.
