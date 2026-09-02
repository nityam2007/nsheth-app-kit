# Context Handoff

Start every new chat with: **Read `docs/CONTEXT.md` and continue.**

1. Read `RULES.md`, then `docs/PLAN.md`; open other docs only when relevant.
2. Current state: the TanStack, `@nsheth/ui`, and `@nsheth/identity` foundations are complete and verified. Run with `npm run dev`.
3. Next task: admin shell and module registration defined in `docs/PLAN.md`.
4. Before TanStack work, run Intent `list` and load only the matching skill. Search local upstream source when APIs remain unclear.
5. Identity setup requires `DATABASE_URL` and `npm run db:migrate --workspace playground`; its demo bootstrap is development-only.
6. Finish each task by prepending `CHANGELOG.md`, updating affected docs, and running `npm run check`, `npm run lint`, and `npm run typecheck`; avoid routine production builds.

Setup caveats are in `docs/SCAFFOLD.md`.
