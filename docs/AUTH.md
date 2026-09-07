# Sign-in and operator access

## Email accounts

`/register` creates an unverified customer. The email link opens `/verify-email`, where the owner chooses a password before receiving access to email-linked activity. No password or session is assigned by an unauthenticated registration. Existing verified accounts are never overwritten. `/login`, `/forgot-password` and `/reset-password` complete the flow. `/account/profile` edits the signed-in name; `/account/security` manages sessions, recovery and data export.

Passwords use random salts and PBKDF2-HMAC-SHA256 with 600,000 iterations. Verification/reset tokens are random, hashed in PostgreSQL, expire after 30 minutes and are consumed transactionally once. Reset invalidates all challenges and sessions. Login rechecks the password revision while holding the same account lock as reset. Rate limits apply to registration, login and recovery.

Development shows an explicitly labelled email preview link, without sending mail. In production set `PUBLIC_ORIGIN` to the HTTPS site origin, `AUTH_EMAIL_WEBHOOK` to your HTTPS mail endpoint and `AUTH_EMAIL_SECRET` to its bearer credential. The endpoint accepts JSON `{to, subject, text}` and must return a successful status after accepting delivery. Missing configuration fails closed; production responses never contain the link. Verify real delivery before launch.

Migration `20260907120000_email_accounts` adds password/verification fields and hashed challenges. Existing verified GitHub identities and the development admin retain their verified status. Other preexisting accounts must verify before their sessions can access data.

Run `npm run test:auth` with the local development app/database running to verify registration, verification, expiry, role isolation, profile changes, reset and session revocation. It creates and removes its own temporary customer. No real email is sent.

## GitHub and operator roles

Create a GitHub OAuth App. Set its callback to `https://your-domain/auth/callback`; set `PUBLIC_ORIGIN` to that exact HTTPS origin. Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and comma-separated verified owner emails in `ADMIN_EMAILS`. Never expose these variables with a `VITE_` prefix.

The authorization-code flow uses PKCE S256, a random state cookie, a single-use database attempt, and a ten-minute expiry. Only a verified primary email is accepted. Tokens are used transiently to retrieve the identity and are not persisted. App sessions last eight hours, store only token hashes, and use secure HTTP-only host cookies in production. Every private server function rechecks the user and permissions and disables shared caching.

Source: [GitHub OAuth flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps); TanStack's installed server-route and server-function skills and `reference/repos/github.com/TanStack/router`.

Users sign in before an admin grants access at `/admin/access`. Customer accounts see their own activity; editors manage content/products; staff manage booking/hospitality/orders/inbox; admins manage everything. Team changes revoke current sessions. Configured owners cannot be edited through the UI. The development-only admin shortcut stays unavailable in production.

Run `node --import tsx scripts/maintenance.mts` with `DATABASE_URL` on a daily scheduler to delete expired/revoked sessions, expired login attempts, email challenges, and expired throttle buckets. This does not erase business records. Configure deployment-specific retention separately.

Public submissions have persistent per-email hourly limits. They are a baseline, not comprehensive bot protection; production hosts should add their own request/IP limits. No untrusted proxy headers are used as identities.

Live OAuth requires your app credentials and must be verified against the deployed callback before launch. Missing configuration fails closed.
