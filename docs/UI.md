# UI Reference

Untitled UI React is the source of truth for application components, semantic tokens, spacing, focus states, and responsive behavior.

For 0.9.1, the owner supplied Atelier's React template under `AIDATA/atelier-retro-style-admin-dashboard-template-2026-09-06-05-52-15-utc/template`. Its PageHead, shell navigation, dashboard task hierarchy and role tokens informed the warmer admin surfaces and clearer workflows. Application code adapts those patterns using existing Untitled controls; it does not import the template's router, fabricated metrics or demo actions. The vendor source stays local and ignored by Git.

Collections default to compact lists with an optional card view. Creation links use write permissions; attention links select the corresponding status. Every setup screen should explain the next meaningful action. Use actual record counts and current state; avoid decorative statistics and controls without a working destination.

0.9.2 consolidates public/account chrome in `SiteShell`. Navigation names stay constant across pages; only the active indicator changes. The admin top bar identifies the workspace rather than repeating each page title. Keep task-specific actions visible and place longer workflow guidance in the collapsed “How this works” disclosure. Avoid repeating headings, totals or account entry points solely to fill space.

## Sources

- Documentation: <https://www.untitledui.com/react/docs/introduction>
- Upstream source: `reference/repos/github.com/untitleduico/react/`
- Local components: `apps/playground/src/components/`
- Theme: `apps/playground/src/theme.css`

`@untitledui/react` is private, so required components are copied into the application and kept close to their upstream shape. Search upstream before changing a primitive. Copy only what an implemented route needs.

## Rules

- Use semantic Untitled classes such as `text-primary`, `bg-secondary`, and `ring-brand` instead of hard-coded application colors.
- Build controls on React Aria Components and preserve labels, validation, keyboard behavior, visible focus, and practical touch targets.
- Use Untitled UI Icons when an icon improves comprehension; decorative icons remain hidden from assistive technology.
- Prefer native controls for simple selections and browser behavior.
- Keep layouts responsive and honor reduced-motion preferences.
