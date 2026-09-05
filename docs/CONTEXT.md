# Context Handoff

Start every new chat with: **Read `docs/CONTEXT.md` and continue.**

1. Read `RULES.md`, then `docs/PLAN.md`; open other docs only when relevant.
2. Current version: `0.6.0`. The TanStack, copied Untitled UI, identity, admin, content/blog, and product catalogue/RFQ foundations are complete and verified. The admin shell has grouped permission-filtered navigation, a persistent desktop sidebar, and a native-dialog mobile drawer; resources include responsive list, create, detail, edit, and delete workflows. Compose provides PostgreSQL; Node/npm run on the host.
3. Booking, hospitality, commerce, GitHub sign-in, team access, and operator inboxes are implemented. See `docs/AUTH.md` for live OAuth setup. Next: integrations, deployment targets, and reusable compositions.
4. Before third-party integration work, follow `.opencode/skills/source-code-context/SKILL.md`. Run Intent for TanStack work and search installed types plus local upstream source before guessing APIs.
5. Database-backed demos require `docker compose up -d --wait postgres`, `DATABASE_URL`, and `npm run db:migrate --workspace playground`; the identity bootstrap is development-only.
6. Turborepo is deferred until a second runnable app or measured task cost justifies it; keep the npm workspace facade meanwhile.
7. Finish each task by prepending `CHANGELOG.md`, updating affected docs, and running `npm run check`, `npm run lint`, and `npm run typecheck`; avoid routine production builds.

Setup caveats are in `docs/SCAFFOLD.md`.
