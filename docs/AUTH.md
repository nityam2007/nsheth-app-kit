# Sign-in and operator access

Create a GitHub OAuth App. Set its callback to `https://your-domain/auth/callback`; set `PUBLIC_ORIGIN` to that exact HTTPS origin. Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and comma-separated verified owner emails in `ADMIN_EMAILS`. Never expose these variables with a `VITE_` prefix.

The authorization-code flow uses PKCE S256, a random state cookie, a single-use database attempt, and a ten-minute expiry. Only a verified primary email is accepted. Tokens are used transiently to retrieve the identity and are not persisted. App sessions last eight hours, store only token hashes, and use secure HTTP-only host cookies in production. Every private server function rechecks the user and permissions and disables shared caching.

Source: [GitHub OAuth flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps); TanStack's installed server-route and server-function skills and `reference/repos/github.com/TanStack/router`.

Users sign in before an admin grants access at `/admin/access`. Customer accounts see their own activity; editors manage content/products; staff manage booking/hospitality/orders/inbox; admins manage everything. Team changes revoke current sessions. Configured owners cannot be edited through the UI. The development-only admin shortcut stays unavailable in production.

Run `node --import tsx scripts/maintenance.mts` with `DATABASE_URL` on a daily scheduler to delete expired/revoked sessions, expired login attempts, and expired throttle buckets. This does not erase business records. Configure deployment-specific retention separately.

Public submissions have persistent per-email hourly limits. They are a baseline, not comprehensive bot protection; production hosts should add their own request/IP limits. No untrusted proxy headers are used as identities.

Live OAuth requires your app credentials and must be verified against the deployed callback before launch. Missing configuration fails closed.

