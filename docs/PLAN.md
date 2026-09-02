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

1. Define the minimum module registration shape from a real admin navigation slice.
2. Build the responsive, permission-aware admin shell using existing UI tokens and primitives.
3. Add one registered resource route without prebuilding generic CRUD infrastructure.
4. Verify keyboard navigation, responsive behavior, and direct server authorization.

## Later Phases

1. CMS core and blog.
2. Product core and catalogue/RFQ.
3. Booking core, service booking, and hospitality.
4. Commerce, payments, and integrations.
5. Cloudflare, Vercel, and Node/VPS adapters.
6. Compile reusable add-ons and seven composed templates.

Implement one vertical slice per phase. Update this file as scope becomes concrete.
