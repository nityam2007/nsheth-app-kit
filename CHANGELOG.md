# Changelog

Newest entries go directly below this note.

## 2026-09-03 - Admin shell reference

- Assessed `satnaing/shadcn-admin` and added it to the admin plan as an MIT-licensed interaction reference, with explicit boundaries against importing its incompatible stack or speculative features.

## 2026-09-03 - Public repository documentation

- Reworked the README for external users with project goals, current capabilities, quick start, identity setup, package structure, commands, architecture principles, roadmap, and project status.

## 2026-09-03 - Identity and RBAC foundation

- Added the minimum Prisma user, session, role, permission, user-role, and role-permission model with its initial PostgreSQL migration.
- Added provider-neutral `@nsheth/identity` access checks and opaque session-token helpers with a runnable Node test.
- Added request-time session loading and server-enforced role plus permission policy to the playground.
- Added a development-only identity demo that bootstraps an admin session and proves `identity.read` access from the foundation showcase.
- Kept database initialization request-scoped for edge environments and verified formatting, ESLint, TypeScript, Prisma generation, tests, and clean Vite startup without a production build.

## 2026-09-02 - UI foundation

- Added the source-first `@nsheth/ui` workspace with brand tokens, local fonts, layout utilities, and accessible button, field, and container primitives.
- Replaced the blank route with a responsive NSheth foundation showcase and complete metadata, keyboard focus, native validation, popover, and reduced-motion behavior.
- Bundled five font files inside the playground so the project is independent of the sibling NSheth site.
- Added `docs/CONTEXT.md` for concise new-chat handoff and moved the plan to identity/RBAC.
- Added React deduplication for linked workspace packages and verified formatting, ESLint, TypeScript, and clean Vite startup without a production build.

## 2026-09-02 - Foundation setup

- Added project rules, plan, architecture, and condensed NSheth brand context.
- Reserved module, template, add-on, deployment, and upstream-reference directories.
- Scaffolded the TanStack Start playground with Query, DB, Table, Form, Store, Hotkeys, Pacer, Prisma/PostgreSQL, Intent, and ESLint.
- Added the root npm workspace, safe env example, local TanStack CLI source, and exact scaffold record.
- Removed generated demo data and kept the domain schema empty for the next task.
- Verified route and Prisma generation, formatting, ESLint, TypeScript, Intent discovery, and Vite startup without a production build.
