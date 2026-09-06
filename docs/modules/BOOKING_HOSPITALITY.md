# Appointment and accommodation workflows

## Journeys and acceptance plan

Operators configure service location, timezone, lead time, booking horizon and cancellation notice; publish capacity-based appointment slots; pause slots without destroying history; and confirm, cancel or move requests with a recorded reason. Customers see the policy, choose an available time, submit an identical request safely after a network failure, and cancel through their verified-email account before the snapshotted deadline.

Accommodation operators configure address, amenities, arrival/departure times and cancellation notice, plus room capacity and stay-length rules. Guests check a dated quote before requesting a room. The server rechecks price, occupancy and policy under a room lock. Operators cannot reduce inventory or guest capacity below active commitments. Dates remain property-local calendar dates with exclusive checkout.

Data changes are additive: optimistic versions, policy snapshots, hashed retry keys/payloads, operational history and paused-slot state. Existing records remain valid; historical requests with no cancellation snapshot require operator assistance.

Acceptance: concurrent submissions cannot oversell; identical retries create one record; changed retry payloads conflict; stale forms conflict; overlapping service slots conflict; cancelled requests cannot reacquire capacity; rescheduling checks the destination while preserving the original on failure; customer cancellation requires ownership and a valid deadline; changed stay prices require a refreshed quote. Validate via unit tests and production HTTP/database tests only.

## Reuse and boundaries

Copy the booking/hospitality domain packages, server functions, public and admin routes, account cancellation action, relevant Prisma models, audit helper and shared controls. These are request-and-confirm blocks for one operator. Online deposits, channel-manager synchronization, recurring staff rosters, waitlists, room assignment/housekeeping, notification delivery and automatic refunds are excluded. Cancellation here releases capacity; no payment or refund is implied. Configure business policies before publishing.

Verified in 0.8.3: unit policy/date tests and production HTTP/database assertions for overlapping slots, paused availability, moves, identical retries, payload conflicts, quoted totals, stale room edits and owned cancellation. No browser verification. Lock design follows PostgreSQL transaction-lock semantics: https://www.postgresql.org/docs/17/explicit-locking.html. Authorization remains checked server-side for each operation, following https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html.
