# Project Rules

> **Maintenance freeze — 12 September 2026:** No active development or maintenance is planned. Historical roadmaps and TODOs do not authorize further work. Resume only on an explicit owner request; see `docs/PLAN.md`. The rules below apply if work is explicitly resumed.

1. Read this file, `README.md`, `docs/PLAN.md`, and only the task-relevant files before coding. Context first; do not load whole repositories or docs into context.
2. Prepend every completed change to the top of `CHANGELOG.md`. Update `README.md`, `docs/PLAN.md`, and other affected docs in the same change.
3. Use npm only. Keep the generated TanStack structure unless a documented need requires a change.
4. Use `npm run dev` for the fast Vite/TSX workflow. Do not run a production build after every edit; use `npm run lint` and `npm run typecheck`. Build for releases, deployment/config changes, build-only behavior, or explicit requests.
5. ESLint and TypeScript checks must pass for touched code. Do not suppress errors without documenting why.
6. Before using a third-party API, follow `.opencode/skills/source-code-context/SKILL.md`: search Intent guidance when available, installed package types, and the relevant source under `reference/repos/github.com/`. Do not guess APIs.
7. Keep route/actions focused on product rules. Extract service-layer mechanics only after they are reused; do not create speculative abstractions.
8. Modules are optional. Only the app kernel, UI foundations, config, database boundary, server boundary, validation, and errors may become shared foundation dependencies.
9. Target edge/serverless first without coupling domain code to a host. Supported deployment targets are Cloudflare, Vercel, and Node/VPS.
10. Preserve accessibility: semantic HTML, visible focus, keyboard operation, 44px touch targets, reduced-motion support, and useful native controls.
11. Follow `docs/UI.md`. Use copied Untitled UI React components and semantic tokens for application UI; add only components required by working routes.
12. Do not use any browser, browser automation, browser inspection, screenshots, or browser-based tests for this repository. Use shell tools, curl/wget, direct HTTP requests, source inspection, and non-browser tests for research and verification. This applies to all agents. Do not claim visual or browser interaction verification from HTTP checks.
13. Keep code, docs, and reports concise. Record decisions, requirements, setup, gotchas, and next steps; omit filler.
14. Use pre-1.0 semantic versions. Keep workspace package versions aligned, use versioned changelog headings, and prefix release commit subjects with the version, for example `0.1.0 - Add catalogue foundation`.
15. After a completed task passes required verification, commit the intended changes and push the tracked branch. Inspect status, diff, and recent commits first; never stage secrets or unrelated work.
16. Plan each existing module's user journeys, data, lifecycle, error states, authorization, reusable blocks, and acceptance checks before expanding it. Basic CRUD is not product readiness. Do not introduce new modules or resume templates until the existing-module readiness plan is satisfied.
17. Use only repository-local skills and relevant installed-package guidance. When delegating, use the user-requested `gpt-5.3-codex-spark` model; do not substitute Sol or Astra subagents.
