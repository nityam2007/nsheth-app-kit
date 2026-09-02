# Plan

## Completed: Foundation Scaffold

- [x] Read the original brief and NSheth brand source.
- [x] Verify current TanStack CLI add-on IDs.
- [x] Scaffold `apps/playground` with TanStack Start, React, npm, ESLint, Query, Prisma, Table, Form, Store, DB, and Intent.
- [x] Install dependencies and retain `.cta.json`.
- [x] Add a local TanStack CLI source reference.
- [x] Verify formatting, ESLint, TypeScript, and the Vite dev server without a production build.

## Completed: UI Foundation

- [x] Convert brand guidance into CSS tokens, bundled fonts, layout utilities, and reduced-motion defaults.
- [x] Add source-first `Container`, `Button`, and `Field` primitives under `packages/ui`.
- [x] Replace the blank route with a responsive foundation showcase.
- [x] Verify workspace formatting, ESLint, TypeScript, and clean Vite startup.

## Completed: Identity and RBAC

- [x] Use current Intent guidance and local source before selecting the auth integration.
- [x] Define the minimum user, session, role, permission, user-role, and role-permission model.
- [x] Keep authorization policy in server actions/middleware and repeated identity mechanics in the identity package.
- [x] Add one runnable vertical slice proving role and permission checks.
- [x] Document required environment variables and verify without a routine production build.

## Next Task: Admin Shell and Module Registration

Reference [`satnaing/shadcn-admin`](https://github.com/satnaing/shadcn-admin) for its MIT-licensed responsive shell interactions, not as a dependency or visual template. Reimplement only useful patterns with NSheth tokens, TanStack Start server boundaries, the existing identity package, and the installed TanStack Table version.

1. Study only the relevant responsive sidebar, grouped navigation, user area, content inset, and skip-link source.
2. Define the minimum permission-filtered module registration shape from one real admin navigation slice.
3. Build the responsive, permission-aware admin shell using existing UI tokens and primitives.
4. Add one registered resource route without prebuilding generic CRUD infrastructure.
5. Verify keyboard navigation, mobile and desktop behavior, and direct server authorization.

Defer its command menu, theme/layout configurators, charts, mock dashboard pages, generic data-table machinery, Clerk integration, and Tailwind/shadcn component stack until a real feature requires an equivalent.

## Later Phases

1. CMS core and blog.
2. Product core and catalogue/RFQ.
3. Booking core, service booking, and hospitality.
4. Commerce, payments, and integrations.
5. Cloudflare, Vercel, and Node/VPS adapters.
6. Compile reusable add-ons and seven composed templates.

Implement one vertical slice per phase. Update this file as scope becomes concrete.
