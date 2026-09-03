# Architecture

## Shape

```text
apps/
  playground/
packages/
  core/ identity/ admin/ content/ product/
  commerce/ booking/ hospitality/ communication/
  payments/ growth/ operations/ integrations/
addons/
templates/
  portfolio/ blog/ service-booking/ hotel/
  multi-hotel/ catalogue/ ecommerce/
deployments/
  cloudflare/ vercel/ node-vps/
```

Directories reserve ownership boundaries; they are not permission to prebuild unused modules.

## Dependency Direction

```text
templates/apps -> domain modules -> core boundaries
              \-> copied Untitled UI primitives
integrations and deployments implement core boundaries
```

- TanStack Start owns SSR, routes, and server functions.
- Router owns route structure and typed navigation.
- Query owns remote asynchronous state.
- TanStack DB may add reactive collections and optimistic domain data; it is not the server database or API.
- Prisma owns server persistence against PostgreSQL initially.
- Form and Table support forms and admin resources.
- Store supports temporary client workflows such as cart state.
- Hotkeys and Pacer are added when real admin interactions require them.

The playground owns the small set of Untitled UI React primitives used by its routes under `src/components`. Components are copied from upstream source instead of consumed through the private `@untitledui/react` package; add another primitive only when a working route requires it.

`packages/identity` owns provider-neutral principals, role/permission checks, and opaque session-token mechanics. Apps own session persistence, cookie policy, authentication providers, and authorization decisions at their server boundaries.

`packages/admin` owns the small module registration shape and permission filtering. Apps own route definitions, resource policy, data loading, and shell composition.

`packages/content` owns publication states and provider-neutral post validation. Apps own content persistence, admin authorization, public visibility queries, routes, and rendering.

`packages/product` owns product publication and RFQ enquiry validation. Apps own catalogue persistence, admin authorization, public visibility queries, enquiry acceptance policy, routes, and rendering.

The root npm workspace scripts remain the task facade. Add Turborepo incrementally only when multiple runnable apps or measured CI cost make dependency-aware scheduling and caching valuable.

## Shared Mechanics

Routes/actions own authorization, policy, transitions, and user-facing errors. Shared services own repeated provider calls, parsing, validation, and other operational mechanics. Extract only after reuse is real.

## Deployment

Domain code must not assume a persistent filesystem or in-memory process. Uploads, jobs, webhooks, and database connections use replaceable boundaries compatible with Cloudflare, Vercel, and Node/VPS.
