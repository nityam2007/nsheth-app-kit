# Changelog

All notable changes are recorded here using pre-1.0 semantic versions.

## [0.1.1] - 2026-09-03

### Added

- Added the custom NSheth Personal Use License, paid commercial-use terms, and Untitled UI third-party notices.
- Added a private vulnerability reporting policy and repository social preview.
- Added an audited GDPR and India DPDP readiness guide and a production compliance gate.

### Changed

- Declared the custom license in each package manifest and aligned workspace versions at `0.1.1`.

### Fixed

- Kept shared request rejection and same-origin checks behind TanStack Start's server-only boundary so production builds cannot import server APIs into the client bundle.

## [0.1.0] - 2026-09-03

### Added

- Scaffolded the TanStack Start playground with React, Query, DB, Table, Form, Store, Hotkeys, Pacer, Prisma/PostgreSQL, Intent, ESLint, and npm workspaces.
- Added Docker Compose PostgreSQL with a persistent volume, health check, loopback-only port, migrations, and a matching environment example.
- Added provider-neutral identity primitives, opaque session-token hashing, Prisma-backed sessions, roles, permissions, and server-enforced authorization.
- Added a permission-filtered admin module package, responsive admin shell, protected users resource, and development-only RBAC proof.
- Added content publication states, post validation, protected post management, and a public blog that excludes drafts.
- Added copied Untitled UI Button, Input, TextArea, label, hint, container primitives, semantic Tailwind tokens, React Aria Components, and Untitled UI Icons.
- Added current ignored upstream source checkouts and a discoverable source-code-context skill with an OpenSrc fallback.
- Added architecture, plan, UI, scaffold, contribution, and continuation documentation.

### Changed

- Migrated the foundation, admin, and blog routes from the custom NSheth visual system to Untitled UI patterns.
- Replaced dated change headings with a versioned release history and aligned all workspace package versions at `0.1.0`.

### Removed

- Removed the obsolete `@nsheth/ui` workspace, custom NSheth CSS, and bundled brand fonts.
- Deferred unused domain modules, generic CRUD infrastructure, authentication providers, Turborepo, deployment adapters, and unused Untitled UI components until working features require them.

### Verified

- Route and Prisma generation, formatting, ESLint, TypeScript, package tests, database migrations, published-versus-draft behavior, and Vite/Tailwind startup.

### Known Issues

- `npm audit` reports four high-severity transitive advisories in the Prisma CLI toolchain. The automated fix requires a breaking Prisma downgrade and is intentionally not applied.
- TanStack Router route generation emits a non-fatal circular-dependency warning from the installed CLI package.
