# NSheth App Kit

A modular TanStack Start foundation for building portfolio, content, booking, hospitality, catalogue, and commerce applications without rebuilding the same UI, identity, and admin infrastructure for every project.

> **Project status:** Active, early-stage development. The application foundation, UI system, identity model, and RBAC vertical slice are working. The permission-aware admin shell is next.

## Why This Exists

NSheth App Kit is a source-first monorepo for composing focused applications from shared foundations and optional domain modules. It favors direct code, server-enforced authorization, accessible native controls, and deployment-neutral boundaries over speculative framework layers.

The playground currently demonstrates:

- TanStack Start routing, SSR, Query integration, and development tooling
- NSheth design tokens, locally bundled fonts, responsive layout, and accessible controls
- PostgreSQL persistence through Prisma
- Provider-neutral users, sessions, roles, and permissions
- Opaque HTTP-only sessions with server-side role and permission checks
- A development-only RBAC proof requiring `admin` and `identity.read`

## Quick Start

### Requirements

- Node.js 22 or newer
- npm
- PostgreSQL only when using the identity demo

```bash
git clone https://github.com/nityam2007/nsheth-app-kit.git
cd nsheth-app-kit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI showcase runs without a database.

## Identity Demo

Create the local environment file from `apps/playground/.env.example`, set `DATABASE_URL` to a PostgreSQL database, and apply the included migration:

```bash
npm run db:migrate --workspace playground
npm run dev
```

Use **Run identity check** in the playground. In development, it creates a demo admin, stores only a hash of the opaque session token, sets an HTTP-only cookie, and calls a protected server function. The server function independently verifies both the role and permission before returning identity data.

The bootstrap endpoint is unavailable in production. A real OAuth or password provider is intentionally not selected until an application requires one.

## Repository

| Path | Purpose |
| --- | --- |
| `apps/playground` | Runnable integration showcase and server boundary |
| `packages/ui` | Source-first tokens, CSS, and React primitives |
| `packages/identity` | Principal checks and opaque session-token mechanics |
| `packages/*` | Reserved ownership boundaries for optional domain modules |
| `addons` | Future installable TanStack add-ons |
| `templates` | Future composed application templates |
| `deployments` | Cloudflare, Vercel, and Node/VPS targets |
| `docs` | Architecture, plan, brand, scaffold, and handoff context |

Reserved directories are not prebuilt modules. Functionality is added only when a working vertical slice needs it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the playground on port 3000 |
| `npm run check` | Check formatting across workspaces |
| `npm run lint` | Run ESLint across workspaces |
| `npm run typecheck` | Run TypeScript across workspaces |
| `npm test --workspace @nsheth/identity` | Test identity access and token helpers |
| `npm run db:generate --workspace playground` | Regenerate the Prisma client |
| `npm run db:migrate --workspace playground` | Apply a local development migration |
| `npm run build` | Create a production build when release verification requires it |

## Stack

- React 19 and TypeScript
- TanStack Start and Router
- TanStack Query, DB, Table, Form, Store, Hotkeys, and Pacer
- Prisma and PostgreSQL
- npm workspaces
- ESLint and Prettier

Hotkeys, Pacer, and optional domain packages remain unused until a real feature needs them.

## Architecture Principles

- Apps and templates compose domain modules; domain modules depend only on shared foundations.
- Routes and server functions own product policy and user-facing authorization decisions.
- Shared packages own repeated, provider-neutral mechanics.
- Private data is protected at the server boundary. Route guards are navigation UX, not API security.
- Domain code does not assume a persistent filesystem or long-lived server process.
- Accessibility includes semantic HTML, keyboard operation, visible focus, practical touch targets, and reduced-motion support.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for dependency direction and [`docs/PLAN.md`](docs/PLAN.md) for current progress.

## Roadmap

1. Permission-aware admin shell and one registered resource route
2. CMS core and blog
3. Product core and catalogue/RFQ
4. Booking core, service booking, and hospitality
5. Commerce, payments, and integrations
6. Cloudflare, Vercel, and Node/VPS adapters
7. Reusable add-ons and seven composed templates

The project ships one working vertical slice per phase rather than scaffolding unused abstractions.

## Project Notes

- [`CHANGELOG.md`](CHANGELOG.md) records completed work.
- [`RULES.md`](RULES.md) defines contribution and verification expectations.
- [`docs/CONTEXT.md`](docs/CONTEXT.md) is the concise handoff for continuing development with an AI coding agent.
- No license has been declared yet.
