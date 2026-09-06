# Reusing existing blocks

The composition step configures the existing app; it does not add another module or template. A checked-in manifest identifies each block's routes, server functions, components, domain package, database models, permissions and dependencies. Source remains available for copying and modification.

Planned acceptance: a single configuration controls public/admin navigation and server-function availability; disabled blocks reject direct requests before database access; composition produces a fresh directory without secrets, dependencies, build output or Git history; the generated configuration resolves module dependencies and preserves a runnable workspace. Export never overwrites a destination.

The generated app keeps the complete existing source and additive database history. Selection gates behavior; it is not physical code removal or tenant isolation. Destination projects can prune modules using the manifest after removing their shared account/history references. Configure branding, business policies, OAuth, database and optional payments, then install, migrate and verify. This provides working common journeys, not a claim that every project's remaining work is exactly 25%.
