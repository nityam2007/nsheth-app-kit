# Context Handoff

Start every new chat with: **Read `docs/CONTEXT.md` and continue.**

1. Read `RULES.md`, then `docs/PLAN.md`; open other docs only when relevant.
2. Current state: the TanStack, UI, identity, admin, and `@nsheth/content` foundations are complete and verified. Compose provides PostgreSQL; Node/npm run on the host.
3. Next task: product core and catalogue/RFQ defined in `docs/PLAN.md`.
4. Before TanStack work, run Intent `list` and load only the matching skill. Search local upstream source when APIs remain unclear.
5. Database-backed demos require `docker compose up -d --wait postgres`, `DATABASE_URL`, and `npm run db:migrate --workspace playground`; the identity bootstrap is development-only.
6. Turborepo is deferred until a second runnable app or measured task cost justifies it; keep the npm workspace facade meanwhile.
7. Finish each task by prepending `CHANGELOG.md`, updating affected docs, and running `npm run check`, `npm run lint`, and `npm run typecheck`; avoid routine production builds.

Setup caveats are in `docs/SCAFFOLD.md`.
