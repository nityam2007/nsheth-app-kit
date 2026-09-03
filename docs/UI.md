# UI Reference

Untitled UI React is the source of truth for application components, semantic tokens, spacing, focus states, and responsive behavior.

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
