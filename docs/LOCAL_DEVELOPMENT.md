# Local development

Use Node 24, npm, and PostgreSQL 17. Copy `apps/playground/.env.example` to `.env.local` and configure the database. Do not commit secrets.

- `npm run doctor`: read-only database/migration check and IPv4/IPv6 development-listener diagnostics with safe output.
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

The managed launcher checks both `127.0.0.1:3000` and `[::1]:3000` before startup. A different application can occupy IPv4 while Vite successfully binds IPv6; then `localhost` can show different pages depending on the client. Stop or reconfigure the conflicting listener before running `npm run dev`. On Windows, inspect `netstat -ano -p tcp` and `netstat -ano -p tcpv6`, then use `Get-Process -Id <PID>` to identify the owner. Do not stop an unidentified process. `dev:bare` bypasses this preflight.

Open `/admin` or `/account` to reach sign-in. In development, select **Use development admin**. GitHub sign-in is offered only when its server configuration is present. Anonymous page requests redirect to login; anonymous private API requests still return 401.

For WSL diagnostics, run `wsl --list --verbose` and `wsl -d Ubuntu -- docker info`, followed by `npm run doctor`. A successful database query through a Windows `wslrelay` listener confirms the forwarded database path is working. `Wsl/EnumerateDistros/Service/E_ACCESSDENIED` from a restricted terminal does not establish that WSL or PostgreSQL is down; inspect WSL from a terminal with access. Do not reset the database or restart WSL solely because that inspection is denied.

`apps/playground/src/request-origin.ts` holds the explicit HTTPS development origin, shared by Vite configuration and both server-function origin checks. This accounts for Cloudflare terminating HTTPS before forwarding HTTP locally. The exception applies only outside production, accepts only the configured tunnel or local port 3000 as the receiving host, and never trusts arbitrary forwarded headers. For a different development tunnel, update this constant and its regression tests. Production same-origin checks remain unchanged.

Public pages, server-function requests, rejection of unrelated origins/hosts, and the live-reload WebSocket were verified with direct HTTP/WebSocket clients. GitHub OAuth, when configured, also needs `PUBLIC_ORIGIN=https://dev3000.nsheth.in` and the matching provider callback described in [AUTH.md](AUTH.md).

Development HTML sends `Cache-Control: private, no-store`. Configure Cloudflare to bypass caching for this development hostname and purge any previously cached HTML after changing that rule. Existing cached entries can keep serving older markup alongside newer client modules. A fresh query string can diagnose an old cache entry; it is not a substitute for clearing the cache. Runtime error details are shown only in development and do not replace client verification.

## Admin/account sample workspace

The 0.9.1 audit recreated local `nsheth_app_kit` with the owner's authorization. Fresh fixtures include two products, one article, a service with a future slot, a property with rooms, and incoming requests. Sign-in accounts are created through registration or development admin access.

For an intentional future clean start, stop dev and run `npm run db:reset:local -- --yes`. This permanently drops only the local database named `nsheth_app_kit`, then generates Prisma, applies migrations and seeds examples. The command refuses production, remote hosts and other database names. `npm run setup` and `npm run seed:dev` remain non-resetting operations; the seed command now uses the managed Windows/WSL database connection too.

After `npm run setup`, run `npm run seed:dev`. It creates named sample products, an article, a bookable service, a property/room and customer requests, preserving existing records. It refuses production or any database except local `nsheth_app_kit`. Register `customer@demo.local` through `/register` to see the sample activity after following the development email preview and choosing a password. For operator access, expand **Development access** on `/login` and select **Use development admin**.

When regenerating Prisma during development, the app replaces its cached client if the generated constructor changes. Safe errors use an explicit TanStack serialization adapter so client navigation retains 401/403/503 status and validation feedback.

## One startup, automatic updates

`npm run dev` owns a supervisor and one database/Vite worker. React/TypeScript/CSS and imported workspace source changes use Vite's existing hot reload. Vite handles its own configuration reloads. Saving `.env.local`, package manifests/lockfile, `app.settings.json` or the database/startup worker files triggers a debounced worker restart with fresh settings. The previous worker and its children exit before a replacement starts; Ctrl+C closes the supervisor and its children. Changes to the supervisor itself (`dev-local.mjs`, `dev-watch.mjs`) require restarting the command. Install new dependencies before starting dev; schema changes still require explicit migration/generation commands.

Development modules use `no-store` and known shared/lazy dependencies are prebundled to avoid mixing stale React module graphs. Reload a tab left open from an older version once. The supervisor's file-change and restart serialization tests run without Vite; live browser HMR behavior has not been verified. After the requested shutdown, a new owner-started VS Code session was detected; the audit did not launch dev.
