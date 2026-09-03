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

## Completed: Admin Shell and Module Registration

Reference [`satnaing/shadcn-admin`](https://github.com/satnaing/shadcn-admin) for its MIT-licensed responsive shell interactions, not as a dependency or visual template. Reimplement only useful patterns with NSheth tokens, TanStack Start server boundaries, the existing identity package, and the installed TanStack Table version.

- [x] Study only the relevant responsive sidebar, grouped navigation, user area, content inset, and skip-link source.
- [x] Define the minimum permission-filtered module registration shape from one real admin navigation slice.
- [x] Build the responsive, permission-aware admin shell using existing UI tokens and primitives.
- [x] Add one registered resource route without prebuilding generic CRUD infrastructure.
- [x] Verify keyboard navigation, mobile and desktop structure, and direct server authorization.

Defer its command menu, theme/layout configurators, charts, mock dashboard pages, generic data-table machinery, Clerk integration, and Tailwind/shadcn component stack until a real feature requires an equivalent.

## Completed: CMS Core and Blog

- [x] Define the minimum post and publication-state model without a generic page builder.
- [x] Add server-authorized create and list actions using the existing admin shell.
- [x] Add one public blog index/detail vertical slice with useful metadata.
- [x] Verify draft isolation, validation, accessibility, and responsive behavior.

## Next Task: Product Core and Catalogue/RFQ

1. Define the minimum product and enquiry models without inventory or checkout abstractions.
2. Add server-authorized product create and list actions through the existing admin shell.
3. Add a public catalogue index/detail and one request-for-quote submission flow.
4. Verify validation, unpublished-product isolation, accessibility, and responsive behavior.

## Tooling Adoption Gate

Turborepo is reliable and incrementally adoptable, but it does not reduce maintenance for the current one-app, three-package workspace. Keep the existing npm command facade until a second runnable app exists or measured local/CI task time warrants dependency-aware scheduling and caching; then adopt Turbo around the existing package scripts rather than rewriting them.

## Later Phases

1. Booking core, service booking, and hospitality.
2. Commerce, payments, and integrations.
3. Cloudflare, Vercel, and Node/VPS adapters.
4. Compile reusable add-ons and seven composed templates.

Implement one vertical slice per phase. Update this file as scope becomes concrete.
