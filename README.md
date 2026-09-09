# NSheth App Kit

A modular TanStack Start foundation for building portfolio, content, booking, hospitality, catalogue, and commerce applications without rebuilding the same UI, identity, and admin infrastructure for every project.

**Current version:** `0.9.1`

> **Project status:** Existing modules now have deeper customer/operator workflows, concurrency checks and copy contracts. See [readiness and boundaries](docs/MODULE_READINESS.md). New modules and templates remain paused. Browser use is prohibited.

The [runtime and security audit](docs/AUDIT_2026-09-09.md) records the React cache fix, page hydration coverage, production workflow checks and remaining provider/visual verification limits.

![NSheth App Kit social preview](<./Social Preview.png>)

## Why This Exists

NSheth App Kit is a source-first monorepo for composing focused applications from shared foundations and optional domain modules. It favors direct code, server-enforced authorization, accessible native controls, and deployment-neutral boundaries over speculative framework layers.

The existing application includes:

- TanStack Start routing, SSR, Query integration, and development tooling
- Copied Untitled UI React controls, semantic Tailwind tokens, and responsive layouts
- PostgreSQL persistence through Prisma
- Provider-neutral users, sessions, roles, and permissions
- Opaque HTTP-only sessions with server-side role and permission checks
- A development-only RBAC proof requiring `admin` and `identity.read`
- A responsive admin shell with grouped permission-filtered modules, a persistent desktop sidebar, an accessible mobile drawer, and a protected identity resource
- Complete post list/new/detail/edit/delete management under `/admin/posts`
- A responsive public blog under `/blog` that never returns drafts
- Complete product list/new/detail/edit/guarded-delete management under `/admin/products`
- A public catalogue under `/catalogue` with product-specific RFQ submissions
- Task shortcuts, permission-aware page search, compact list/card collections, status-filtered queues and permission-scoped activity
- Dedicated service availability and room inventory screens, with sectioned product, post, service and property editors
- Service CRUD, dated availability, capacity-safe public appointment requests, and an operator confirmation/cancellation queue at `/admin/bookings`
- Multi-property hospitality at `/stays`, with room inventory, date-range availability, INR quotes, reservation requests, and operator controls
- Storefront at `/shop`, collections and search, persistent cart, server-priced offline checkout, stock control, and `/admin/orders`
- Verified email registration, password login/recovery, optional GitHub OAuth, account activity/profile/security, team roles, session revocation, enquiry inbox and privacy-request triage
- Optional Stripe card payments with signed webhook reconciliation; offline checkout works without provider credentials

## Quick Start

### Requirements

- Node.js 24
- npm
- Docker with Compose, or another PostgreSQL 17-compatible database, for database-backed demos

```bash
git clone https://github.com/nityam2007/nsheth-app-kit.git
cd nsheth-app-kit
npm ci
# Copy apps/playground/.env.example to apps/playground/.env.local
npm run setup
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Start dev once: source/CSS changes hot reload, and environment/package/startup-worker changes trigger a managed restart. `setup` starts the bundled local database, generates the client and applies checked-in migrations; it never resets data. `dev` checks the database and starts Vite, including managed Windows/WSL connectivity. Use `dev:bare` only with an already reachable database.

The development server also supports [https://dev3000.nsheth.in](https://dev3000.nsheth.in) through the configured Cloudflare Tunnel to `http://localhost:3000`. See [local development](docs/LOCAL_DEVELOPMENT.md) for the host/origin configuration.

## Database-Backed Demos

Run PostgreSQL through Compose, create `apps/playground/.env.local` from the included example, and apply the migrations. Node and npm continue to run directly on the host:

```bash
npm run setup
npm run doctor
npm run dev
```

Open `/admin`; on the sign-in page expand **Development access** and choose **Use development admin**. This creates a local operator session with access to the enabled modules. The server stores only a hash of the opaque token in the database and sends an HTTP-only cookie; protected functions independently enforce permissions.

The bootstrap endpoint is unavailable in production. Email accounts and optional GitHub OAuth are documented in [AUTH.md](docs/AUTH.md). Development email flows display local verification/recovery links; production requires configured delivery.

For a deliberately empty local database, stop dev and run `npm run db:reset:local -- --yes` (permanently deletes local development data and rebuilds sample records). Use `npm run seed:dev` for repeatable local sample records without resetting, `npm run test:auth` for account HTTP checks and `npm run test:frontend` for non-browser component checks. See the [admin rebuild plan and verification record](docs/ADMIN_REBUILD.md) for screen coverage and the restricted-session test commands.

With the development server running, `npm run test:hydration` executes its actual client modules in Node VM with jsdom and checks for duplicate content, hydration errors and mixed React instances. It follows local links to detail/edit screens without submitting their forms. This does not test visual layout or browser HMR. Development assets use `no-store`; after upgrading an already open session, reload once to discard older cached modules.

## Repository

| Path                             | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `apps/playground`                | Runnable integration showcase and server boundary         |
| `apps/playground/src/components` | Copied Untitled UI primitives used by current routes      |
| `packages/identity`              | Principal checks and opaque session-token mechanics       |
| `packages/admin`                 | Admin module registration and permission filtering        |
| `packages/content`               | Publication states and post validation                    |
| `packages/product`               | Product publication and RFQ enquiry validation            |
| `packages/*`                     | Reserved ownership boundaries for optional domain modules |
| `addons`                         | Future installable TanStack add-ons                       |
| `templates`                      | Future composed application templates                     |
| `deployments`                    | Cloudflare, Vercel, and Node/VPS targets                  |
| `docs`                           | Architecture, plan, UI, scaffold, and handoff context     |

Reserved directories are not prebuilt modules. Functionality is added only when a working vertical slice needs it.

## Commands

| Command                                      | Purpose                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                                | Start the playground on port 3000                               |
| `npm run check`                              | Check formatting across workspaces                              |
| `npm run lint`                               | Run ESLint across workspaces                                    |
| `npm run typecheck`                          | Run TypeScript across workspaces                                |
| `npm test`                                   | Run package tests across workspaces                             |
| `npm run db:generate --workspace playground` | Regenerate the Prisma client                                    |
| `npm run db:migrate --workspace playground`  | Apply a local development migration                             |
| `docker compose up -d --wait postgres`       | Start the local PostgreSQL service                              |
| `npm run build`                              | Create a production build when release verification requires it |

## Stack

- React 19 and TypeScript
- TanStack Start and Router
- TanStack Query, DB, Table, Form, Store, Hotkeys, and Pacer
- Untitled UI React patterns, React Aria Components, and Tailwind CSS
- Prisma and PostgreSQL
- npm workspaces
- ESLint and Prettier

Hotkeys and Pacer support workspace navigation and storefront search. Turborepo remains deferred until multiple apps or measured CI cost justify it.

## Architecture Principles

- Apps and templates compose domain modules; domain modules depend only on shared foundations.
- Routes and server functions own product policy and user-facing authorization decisions.
- Shared packages own repeated, provider-neutral mechanics.
- Private data is protected at the server boundary. Route guards are navigation UX, not API security.
- Domain code does not assume a persistent filesystem or long-lived server process.
- Accessibility includes semantic HTML, keyboard operation, visible focus, practical touch targets, and reduced-motion support.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for dependency direction, [`docs/PRIVACY.md`](docs/PRIVACY.md) for the GDPR and India DPDP readiness guide, and [`docs/PLAN.md`](docs/PLAN.md) for current progress.

## Roadmap

1. Booking core, service booking, and hospitality
2. Commerce, payments, and integrations
3. Cloudflare, Vercel, and Node/VPS adapters
4. Reusable add-ons and seven composed templates

The project ships one working vertical slice per phase rather than scaffolding unused abstractions.

## License

NSheth App Kit is source-available under the [NSheth Personal Use License](LICENSE):

- Personal projects, including personal educational and experimental work, are free when they are non-commercial.
- Company, agency, consultancy, client, internal-business, and revenue-generating use requires a separate paid commercial license.
- Commercial licensing enquiries: [hello@nsheth.in](mailto:hello@nsheth.in).

This is a custom source-available license, not an OSI-approved open-source license. See [`LICENSE`](LICENSE) for the complete terms. Copied Untitled UI portions retain their MIT license as documented in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): ownership and dependency direction
- [`docs/PLAN.md`](docs/PLAN.md): completed phases and next work
- [`docs/UI.md`](docs/UI.md): Untitled UI source and implementation rules
- [`docs/SCAFFOLD.md`](docs/SCAFFOLD.md): generated setup and known tooling caveats
- [`docs/PRIVACY.md`](docs/PRIVACY.md): GDPR and India DPDP implementation and deployment gate
- [`docs/CONTEXT.md`](docs/CONTEXT.md): concise continuation handoff
- [`RULES.md`](RULES.md): contribution and verification expectations
- [`CHANGELOG.md`](CHANGELOG.md): versioned release history
- [`SECURITY.md`](SECURITY.md): private vulnerability reporting policy
- [`LICENSE`](LICENSE): personal-use and commercial licensing terms
- [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md): licenses for adapted upstream source

Deployment instructions: [Node/VPS, Vercel, and Cloudflare](docs/DEPLOYMENT.md). Run production database checks with `ALLOW_INTEGRATION_TESTS=1 npm run test:integration` against a disposable database after building.

Use `npm run doctor` for database/migration diagnostics and `npm run dev:local` for managed local PostgreSQL connectivity, including Windows/WSL. See [local development](docs/LOCAL_DEVELOPMENT.md). Browser use is prohibited for this repository.

Product and commerce now include option SKUs, media/specifications, inventory history, checkout recovery and payment-aware fulfilment. See [scope and boundaries](docs/modules/PRODUCT_COMMERCE.md). Other existing modules remain under active hardening.

Booking and hospitality now include policy configuration, retry-safe requests, quote checks, appointment moves and customer cancellation. [Scope and acceptance](docs/modules/BOOKING_HOSPITALITY.md).

Publishing includes safe article blocks, metadata, scheduling and draft revision recovery. Operator cases include responsibility, notes and follow-up dates. Accounts include session controls. [Scope and acceptance](docs/modules/CONTENT_IDENTITY_OPERATIONS.md).

## Reuse the existing blocks

```sh
npm run compose -- --modules content,commerce --name "My project" --out ../my-project
```

See [the composition guide](docs/COMPOSITION.md) for configuration, file manifests, database boundaries and verification.

Development fixes preserve authentication redirects, safe error status and regenerated Prisma clients. Startup and doctor check both loopback listeners. Production build verification is pending because this Windows session denies Vite child-process creation. The requested versioned commits are also blocked because this session cannot write `.git/index.lock`; all rebuild changes remain uncommitted.
