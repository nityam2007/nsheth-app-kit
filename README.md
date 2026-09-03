# NSheth App Kit

A modular TanStack Start foundation for building portfolio, content, booking, hospitality, catalogue, and commerce applications without rebuilding the same UI, identity, and admin infrastructure for every project.

**Current version:** `0.1.0`

> **Project status:** Active, early-stage development. The application, Untitled UI, identity, RBAC, admin, and CMS/blog foundations are working. Product/catalogue is next.

## Why This Exists

NSheth App Kit is a source-first monorepo for composing focused applications from shared foundations and optional domain modules. It favors direct code, server-enforced authorization, accessible native controls, and deployment-neutral boundaries over speculative framework layers.

The playground currently demonstrates:

- TanStack Start routing, SSR, Query integration, and development tooling
- Copied Untitled UI React controls, semantic Tailwind tokens, and responsive layouts
- PostgreSQL persistence through Prisma
- Provider-neutral users, sessions, roles, and permissions
- Opaque HTTP-only sessions with server-side role and permission checks
- A development-only RBAC proof requiring `admin` and `identity.read`
- A responsive admin shell with permission-filtered modules and a protected identity resource
- Validated post creation with draft and published states under `/admin/posts`
- A responsive public blog under `/blog` that never returns drafts

## Quick Start

### Requirements

- Node.js 22 or newer
- npm
- Docker with Compose, or another PostgreSQL 17-compatible database, for database-backed demos

```bash
git clone https://github.com/nityam2007/nsheth-app-kit.git
cd nsheth-app-kit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI showcase runs without a database.

## Database-Backed Demos

Run PostgreSQL through Compose, create `apps/playground/.env.local` from the included example, and apply the migrations. Node and npm continue to run directly on the host:

```bash
docker compose up -d --wait postgres
npm run db:migrate --workspace playground
npm run dev
```

Use **Run identity check** in the playground. In development, it creates a demo admin with identity and content permissions, stores only a hash of the opaque session token, sets an HTTP-only cookie, and calls a protected server function. The server function independently verifies both the role and permission before returning identity data. That session also grants access to `/admin/posts`.

The bootstrap endpoint is unavailable in production. A real OAuth or password provider is intentionally not selected until an application requires one.

## Repository

| Path                             | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `apps/playground`                | Runnable integration showcase and server boundary         |
| `apps/playground/src/components` | Copied Untitled UI primitives used by current routes      |
| `packages/identity`              | Principal checks and opaque session-token mechanics       |
| `packages/admin`                 | Admin module registration and permission filtering        |
| `packages/content`               | Publication states and post validation                    |
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

Hotkeys, Pacer, Turborepo, and optional domain packages remain unused until a real feature needs them. Turborepo becomes useful when a second runnable app or measured CI time justifies task orchestration and caching; npm workspaces are simpler today.

## Architecture Principles

- Apps and templates compose domain modules; domain modules depend only on shared foundations.
- Routes and server functions own product policy and user-facing authorization decisions.
- Shared packages own repeated, provider-neutral mechanics.
- Private data is protected at the server boundary. Route guards are navigation UX, not API security.
- Domain code does not assume a persistent filesystem or long-lived server process.
- Accessibility includes semantic HTML, keyboard operation, visible focus, practical touch targets, and reduced-motion support.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for dependency direction and [`docs/PLAN.md`](docs/PLAN.md) for current progress.

## Roadmap

1. Product core and catalogue/RFQ
2. Booking core, service booking, and hospitality
3. Commerce, payments, and integrations
4. Cloudflare, Vercel, and Node/VPS adapters
5. Reusable add-ons and seven composed templates

The project ships one working vertical slice per phase rather than scaffolding unused abstractions.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): ownership and dependency direction
- [`docs/PLAN.md`](docs/PLAN.md): completed phases and next work
- [`docs/UI.md`](docs/UI.md): Untitled UI source and implementation rules
- [`docs/SCAFFOLD.md`](docs/SCAFFOLD.md): generated setup and known tooling caveats
- [`docs/CONTEXT.md`](docs/CONTEXT.md): concise continuation handoff
- [`RULES.md`](RULES.md): contribution and verification expectations
- [`CHANGELOG.md`](CHANGELOG.md): versioned release history

No license has been declared yet.
