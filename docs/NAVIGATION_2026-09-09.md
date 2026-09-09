# Navigation follow-up — 0.9.2

The owner narrowed the failure to opening another page from Home: the page could fail with a null `useContext` error, while a document reload worked. The 0.9.1 checks loaded documents independently and did not cover this transition.

## Changes

- Freeze Vite's development dependency graph with `optimizeDeps.noDiscovery` and explicit React/runtime entry points. Visiting a lazy route must not regenerate shared React chunks while earlier chunks remain loaded. Keep `no-store` and React deduplication. Remove the optional development overlay and its Vite instrumentation.
- Use router links for Home cards, public navigation and admin sidebar destinations. Share `SiteShell` across Home, catalogue, shop, services, stays, account, privacy and payment-return pages so the header/footer labels stay consistent.
- Keep the admin top bar's workspace label fixed. Remove repeated heading eyebrows, overview totals and the extra Home account panel; shorten creation descriptions and collapse workflow instructions under “How this works.”
- Render route errors without router hooks or hook-based controls. “Reload page” replaces loader invalidation, which cannot repair an already broken module graph. Development stack details are available in a collapsed disclosure; production still hides them.

## Verification and limits

`npm run test:navigation` keeps one actual client instance alive and performs 13 transitions, beginning with a click on the Home Stays card. It also exercises public/sidebar links, checks the destination, rejects error pages and duplicate main/headings, and verifies stable navigation labels and a single optimized dependency version after lazy imports. The Node VM fetch adapter preserves Request and Headers semantics for real server-function calls. Closed dialog links are excluded from click selection.

The fresh-session transition test passes. The originally reported null-hook exception was not reproduced in that fresh VM session; freezing discovery addresses the mixed-module mechanism found in the earlier audit, rather than claiming an exhaustive reproduction of the owner's existing browser state. Node VM/jsdom tests do not verify browser caches, live HMR transport or visual layout.

Workspace types/lint/formatting, 40 unit/component tests, 63 independently hydrated pages, Node production integration (including 81 server-rendered pages), and the Cloudflare build pass. No database reset or additional development-server launch was performed for this follow-up. The owner's existing server handled configuration changes through its normal reload mechanism.

When adding a CommonJS dependency used by the client, include it in Vite's explicit dependency list and run navigation/hydration checks. A tab retaining modules from before this change needs one document reload to acquire the updated graph.

## Owner-confirmed follow-up — 0.9.3

The owner supplied a product editor stack with React/useServerFn using `ea52532f` and React DOM using `c8b778cc`. Direct HTTP inspection found the current module graph consistently used `c8b778cc`, while the older optimized React URL returned 504. The owner confirmed that Ctrl+Shift+R restored New product. This confirms retained development modules in that session; it does not establish a new product validation or database failure, or prove which browser cache/HMR event retained the modules.

Collection creation actions now use router Links. `test:navigation` exercises 19 transitions, including clicks from the four collections into their creation forms, and asserts each form and submit action mounted. Fresh product/post/property document hydration also passed. No additional optimizer changes, automatic reload loops, database resets or assistant-launched development servers were needed.

For 0.9.3, all 19 transitions, seven component tests, workspace lint/types/formatting and the Node production build pass. These checks use Node VM/jsdom and direct HTTP, not a browser.
