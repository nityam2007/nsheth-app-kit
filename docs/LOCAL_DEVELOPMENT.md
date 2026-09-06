# Local development

Use Node 24, npm, and PostgreSQL 17. Copy `apps/playground/.env.example` to `.env.local` and configure the database. Do not commit secrets.

- `npm run doctor`: read-only connection and migration check with safe diagnostic output.
- `npm run setup`: starts bundled PostgreSQL, generates Prisma and applies checked-in migrations without resetting rows.
- `npm run dev` (also `dev:local`): starts the Compose PostgreSQL service if needed, checks migrations, then starts Vite.
- `npm run db:local -- deploy`: applies checked-in migrations through the same connection path; preserves existing rows.
- `npm run db:local -- generate`: regenerates the Prisma client.
- `npm run dev:bare`: plain Vite for an already reachable configured database.

On Windows the launcher first tries native Docker, then Docker in the Ubuntu WSL distribution (override with `DEV_WSL_DISTRO`). If Windows cannot reach WSL's loopback PostgreSQL port, the launcher owns a temporary TCP relay bound to Windows 127.0.0.1. Each connection uses Docker exec and nc in the project’s PostgreSQL container. The relay closes when the launcher exits. It does not expose the database on the LAN or edit the environment file. External database connections never start local Docker.

If schema checks fail, run the migration command before restarting. Do not use schema reset or db push to repair a database containing valuable data. Database outages produce a safe 503 and a retry screen, while admin authentication failures redirect only on 401. Browser use is prohibited; verify with `curl`, HTTP regression tests, unit tests, and type checking.

`DEV_DATABASE_MODE=compose` selects the project’s bundled database explicitly. For a custom database set `DEV_DATABASE_MODE=external`; the launcher never starts Compose or redirects that connection. Dependencies are pinned. Prisma CLI runs from the root workspace so patched transitive dependency overrides also apply to workspace commands.

Security overrides currently pin deepmerge-ts 8.0.2 and mysql2 3.24.3 beneath Prisma CLI 7.10.0. Generation, migration deployment and clean export installation were verified with these overrides. Review them when upgrading Prisma; do not use an automatic major downgrade to clear an audit report.

## Cloudflare development tunnel

Run `npm run dev` and point the Cloudflare Tunnel hostname `dev3000.nsheth.in` to `http://localhost:3000`. Open `https://dev3000.nsheth.in`. Vite allows this exact hostname and requires port 3000 to be free instead of silently switching ports. Localhost access continues to work.

`apps/playground/src/request-origin.ts` holds the explicit HTTPS development origin, shared by Vite configuration and both server-function origin checks. This accounts for Cloudflare terminating HTTPS before forwarding HTTP locally. The exception applies only outside production, accepts only the configured tunnel or local port 3000 as the receiving host, and never trusts arbitrary forwarded headers. For a different development tunnel, update this constant and its regression tests. Production same-origin checks remain unchanged.

Public pages, server-function requests, rejection of unrelated origins/hosts, and the live-reload WebSocket were verified with direct HTTP/WebSocket clients. GitHub OAuth, when configured, also needs `PUBLIC_ORIGIN=https://dev3000.nsheth.in` and the matching provider callback described in [AUTH.md](AUTH.md).
