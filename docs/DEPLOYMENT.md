# Deployment

Run migrations with `npm run db:deploy --workspace playground` against the target PostgreSQL database before starting the new release. Back up the database and configure encrypted connections using the provider's connection string. Keep provider secrets in the host's secret store. Never expose PostgreSQL publicly without appropriate network restrictions.

## Node / VPS

Run `npm ci`, generate the Prisma client, `npm run build`, then `npm start`. Set `DATABASE_URL`, `PUBLIC_ORIGIN`, `NODE_ENV=production`, and optionally `PORT`. The Node adapter streams responses, serves built assets, and preserves multiple session cookies. Put HTTPS termination in front of the service; bind only the reverse proxy to public ports. Set the canonical public origin so origin checks work behind a proxy.

Alternatively use `deployments/node-vps/compose.yaml` with a local untracked `.env` in that directory and an external PostgreSQL connection. The container runs as the unprivileged Node user. Migrations are deliberately separate from replica startup.

## Vercel

Import this repository with Root Directory `apps/playground`, the TanStack Start framework, and access to files outside that directory enabled for workspace packages. `vercel.json` uses native TanStack Start support. Configure the environment variables from `.env.example`; use a pooled PostgreSQL connection for serverless concurrency. Apply migrations through CI or a one-off release job. Live deployment needs your Vercel project/account.

## Cloudflare Workers

Run `npm run build:cloudflare`, then deploy with `npm run deploy:cloudflare --workspace playground`. Change the worker name and `PUBLIC_ORIGIN` in `apps/playground/wrangler.jsonc` first. Store secrets with Wrangler, not in tracked configuration. Configure a Hyperdrive binding named `HYPERDRIVE` (preferred), or a supported PostgreSQL `DATABASE_URL` secret. Add the binding's real ID to Wrangler configuration from your account.

The worker uses Node compatibility and request-scoped Prisma clients. A client stays alive until its response stream finishes and is then disconnected using `waitUntil`; PostgreSQL sockets are not reused across worker request contexts. Hyperdrive provides connection pooling outside the worker. Migrations run from Node/CI against the source database, not from a Worker.

Cloudflare's local runtime may require a supported native workerd executable. A config/build check is not proof of live edge operation: verify the deployed worker against your database and provider callbacks.

## Release checks

Run `npm run check`, `npm run lint`, `npm run typecheck`, `npm test`, and the deployment-specific build. Run `npm run test:integration` against a disposable PostgreSQL database after a Node build. Run Playwright browser tests with `TEST_URL` pointing to the development server. Schedule `node --import tsx scripts/maintenance.mts` daily. Complete the operator-specific items in `docs/PRIVACY.md` and test OAuth, Stripe, backup restore, and error monitoring on the actual host.
