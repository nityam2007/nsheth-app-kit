# Plan

## Active: Existing-module readiness

0.9.3 confirms the follow-up product editor failure was a retained mixed-version React graph: the owner's hard refresh restored the editor. Creation actions now use router links and the retained-session regression includes all four creation forms. Avoid further speculative dependency configuration changes without a fresh failing trace.

0.9.2 addresses the owner's click-versus-reload report with a fixed dependency graph, removal of optional development instrumentation, hook-independent error recovery, shared public/account chrome and quieter admin screens. The [navigation follow-up](NAVIGATION_2026-09-09.md) records same-session click coverage and the limits of non-browser verification.

0.9.1 completes the follow-up [runtime/security audit](AUDIT_2026-09-09.md): stabilize development React dependencies, add actual-module hydration checks, repair standalone content landmarks and session rotation, expose safe support references, patch the Cloudflare image dependency, and separate deployment build outputs. Production Node integration and Cloudflare builds now run successfully on this host. Keep new modules/templates paused; live provider delivery and visual checks remain separate acceptance work.

The owner-requested Atelier UX pass adds explicit task entry points, permission-aware navigation search, actionable status queues and property/service setup guidance. The local database was recreated with authorization and all 13 migrations applied. The final production sweep passes 81 pages; development startup remains under the owner’s control. Source hot reload and a managed environment/configuration restart workflow share one startup command.

The current scope is the [admin and account rebuild](ADMIN_REBUILD.md): restructure navigation and objects, deepen existing screens, repair client failures, and complete account entry points. Development data may be replaced with the owner's authorization; production data must remain untouched.

0.8.7 implements the grouped operator workspace, object collections/detail views, availability/room screens, sectioned editors, and verified email/account flows. It also repairs redirect status, framework error serialization and stale generated-client reuse. The new schema and development examples are applied locally. Type, unit/component and live development HTTP checks are tracked in ADMIN_REBUILD.md; production build/integration remain blocked by this session's Windows child-process permissions. Keep the change unreleased until those checks pass.
