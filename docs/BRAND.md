# NSheth Brand Reference

Source of truth: `AIDATA/brand/index.html`.

Implemented in `packages/ui/src/styles.css`. Required font files are bundled under `apps/playground/public/fonts`; the playground has no runtime dependency on the source site.

## Direction

- Purpose: useful digital work made clearly; precise, capable, and alive.
- Voice: clear, human, factual, slightly poetic. Concrete first, active verbs, one thought at a time, stop early.
- Visual system: dark-first, wide, asymmetric, low-density. Reuse rules and semantics, not identical page layouts.

## Tokens

```css
--canvas: #0b0d0c;
--surface-1: #151817;
--surface-2: #202421;
--ink: #f2f3ef;
--muted: #a8aea9;
--signal: #ff3d81;
--signal-hover: #ff679d;
--signal-pressed: #d92162;
--success: #54c67a;
--warning: #ffc857;
--danger: #ff6464;
--font-sans: "Neue Montreal", "Helvetica Neue", Arial, sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
--gutter: clamp(1.25rem, 4vw, 4rem);
--copy-measure: 56ch;
--ease: cubic-bezier(0.16, 1, 0.3, 1);
```

- Local fonts only: Neue Montreal 400/500/700 and IBM Plex Mono 400/500.
- Containers: 77.5rem standard, 90rem wide.
- Grid: 12 desktop, 8 tablet, 4 phone columns.
- Radius scale: 8, 14, 24, 32, 48, 56px.
- Motion timing: 140, 240, 480, 850ms; one dominant motion layer at most.

## Non-Negotiables

- One clear page job and one focal idea.
- Semantic landmarks, labels, native controls, visible focus, 44px targets, responsive and reduced-motion states.
- Hot Rose directs attention; no broad pink atmosphere.
- No generic equal-card layouts, graph-paper textures, glassmorphism, decorative gradients, fake proof, logo walls, or copied page structures.
- Verify all claims, metrics, links, roles, testimonials, and project labels before publishing.
