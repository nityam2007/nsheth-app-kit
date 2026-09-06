# Local development

Use Node 24, npm, and PostgreSQL 17. Copy `apps/playground/.env.example` to `.env.local` and configure the database. Do not commit secrets.

- `npm run doctor`: read-only connection and migration check with safe diagnostic output.
- `npm run dev:local`: starts the Compose PostgreSQL service if needed, checks migrations, then starts Vite.
- `npm run db:local -- deploy`: applies checked-in migrations through the same connection path; preserves existing rows.
- `npm run db:local -- generate`: regenerates the Prisma client.
- `npm run dev`: plain Vite for an already reachable configured database.

On Windows the launcher first tries native Docker, then Docker in the Ubuntu WSL distribution (override with `DEV_WSL_DISTRO`). If Windows cannot reach WSL's loopback PostgreSQL port, the launcher owns a temporary TCP relay bound to Windows 127.0.0.1. Each connection uses Docker exec and nc in the project’s PostgreSQL container. The relay closes when the launcher exits. It does not expose the database on the LAN or edit the environment file. External database connections never start local Docker.

If schema checks fail, run the migration command before restarting. Do not use schema reset or db push to repair a database containing valuable data. Database outages produce a safe 503 and a retry screen, while admin authentication failures redirect only on 401. Browser use is prohibited; verify with `curl`, HTTP regression tests, unit tests, and type checking.
