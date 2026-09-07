# Plan

## Active: Existing-module readiness

The current scope is the [admin and account rebuild](ADMIN_REBUILD.md): restructure navigation and objects, deepen existing screens, repair client failures, and complete account entry points. Development data may be replaced with the owner's authorization; production data must remain untouched.

0.8.7 implements the grouped operator workspace, object collections/detail views, availability/room screens, sectioned editors, and verified email/account flows. It also repairs redirect status, framework error serialization and stale generated-client reuse. The new schema and development examples are applied locally. Type, unit/component and live development HTTP checks are tracked in ADMIN_REBUILD.md; production build/integration remain blocked by this session's Windows child-process permissions. Keep the change unreleased until those checks pass.
