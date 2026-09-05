---
name: source-code-context
description: Use when integrating or debugging third-party packages. Search checked-out upstream source, installed package types, and OpenSrc before guessing APIs or adding alternatives.
---

# Source Code Context

Use source as targeted reference, not as bulk prompt context.

## Workflow

1. Search the relevant checkout under `reference/repos/github.com/`.
2. Check the installed package and types when exact installed-version behavior matters.
3. Run Intent for TanStack packages when a matching skill exists.
4. Use OpenSrc when a checkout is missing or another package version is required:

```bash
npx -y opensrc@latest fetch <package-or-github-repo>
npx -y opensrc@latest path <package-or-github-repo>
```

The current OpenSrc CLI requires the `fetch` subcommand and uses a source cache. Check `--help` if a later CLI version changes its syntax. Source caches are reference code, not global skills.

5. Implement the smallest change matching the real API and established project patterns.

Do not paste whole repositories into context, invent APIs, or install replacement packages before checking source.

## Local Sources

- TanStack: `reference/repos/github.com/TanStack/`
- Untitled UI React: `reference/repos/github.com/untitleduico/react/`

Report the specific upstream files used when they materially informed an implementation.
