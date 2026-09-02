# Scaffold Record

## Commands Used

Current add-ons were checked first:

```bash
npx --yes @tanstack/cli@latest create --list-add-ons --framework React --json
```

The app was generated with:

```bash
npx --yes @tanstack/cli@latest create playground --target-dir apps/playground --blank --framework React --package-manager npm --toolchain eslint --add-ons tanstack-query,prisma,table,form,store,db --intent --no-git -y
```

Intent was then confirmed with:

```bash
npx --yes @tanstack/intent@latest install
npx --yes @tanstack/intent@latest list
```

The resulting choices are retained in `apps/playground/.cta.json`. PostgreSQL is the Prisma default. Blank mode intentionally omits Tailwind and example UI; NSheth CSS foundations are the next phase.

## Source Context

TanStack CLI source is cloned locally at `reference/repos/github.com/TanStack/cli` and ignored by Git. Relevant source checked during setup:

- `packages/cli/src/command-line.ts`: blank-mode defaults, add-on defaults, npm selection, and Intent behavior.
- `packages/create/src/create-app.ts`: blank/example filtering and generated setup flow.
- `packages/cli/src/cli.ts`: current create command options and add-on listing.

Future work should clone or search only the TanStack repository needed for that task.

## Known Gotchas

- `npm audit` currently reports four high-severity transitive advisories under the Prisma CLI toolchain. Its automated fix downgrades Prisma across a major version, so it was not applied. Recheck after Prisma publishes a compatible fix.
- npm may report pending install-script approvals for Prisma, esbuild, and `unrs-resolver`. Route and client generation currently succeed; review with `npm approve-scripts --allow-scripts-pending` if a clean-machine install blocks binaries.
- `tsr generate` currently emits a non-fatal circular-dependency warning from its installed CLI package.
