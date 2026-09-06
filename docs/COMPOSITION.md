# Use the kit in a project

Choose existing blocks and export a configured copy:

```sh
npm run compose -- --list
npm run compose -- --modules content,commerce --name "My project" --out ../my-project
```

The output must be a new directory outside this repository. Commerce includes product; hospitality includes booking capacity rules; operations includes product enquiry data. The exporter includes the existing source, local skills, package lock and migrations. It excludes local environment files, dependencies, build output, symlinks and Git history. It assigns a separate Compose project/volume and suggested local database port. If that port is occupied, change it in both `compose.yaml` and the destination environment file.

In the output directory, run `npm ci`, copy `apps/playground/.env.example` to `.env.local`, then run `npm run setup` and `npm run dev`. Supply your own production database and provider credentials. The export itself does not create a database, deploy, or connect to a remote Git repository.

## Configuration and copy map

- `apps/playground/src/app.settings.json`: name, description and enabled modules. Selection controls navigation, route access and server calls. Rebuild after changing it.
- `blocks.manifest.json`: each block's domain package, route prefixes, server files, components, models, configuration and dependencies. Server files are relative to `apps/playground/src`; component paths are relative to its `components` directory. Routes are file prefixes in `src/routes`.
- `src/commerce.config.ts`: currency, delivery and flat tax policy. Product prices and room rates are entered in their operator forms.
- Identity/session authorization, safe errors, request limits, database access, shared controls and account history form the common integration boundary. Retain their imports when moving individual files.
- `docs/modules/`: customer/operator journeys, acceptance criteria and exclusions for each existing block.

All existing source and additive models remain in an export. Selection disables behavior; it is not physical tree pruning or tenant isolation. Signed payment callbacks and a user's existing account history remain available when a module is disabled. `APP_DISABLED_MODULES` is a server emergency switch for comma-separated module IDs; change the checked-in configuration to hide navigation too.

For manual copying, take the manifest's files and dependencies together, copy their Prisma models/relations into the target schema, generate a migration in that target, and adapt the identity middleware and shared controls. Do not paste this repository's migration history into an unrelated populated database. The account file references multiple domains; remove omitted domain queries and sections together when physically pruning.

## Checks and extension points

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. The full-kit integration suite runs against a separate disposable PostgreSQL database. The development HTTP script checks the full default configuration. For a selected project, verify the enabled routes and that disabled routes/direct calls return 404. No browser tools or browser tests are permitted.

Provider setup, deployment accounts, content/media, business-specific pricing and taxes, emails, refunds, tenancy and any industry-specific workflow remain project work. This kit supplies tested common journeys and copy contracts; the 75% target is a reuse goal, not a universal completion claim.
