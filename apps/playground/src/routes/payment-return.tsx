import { SiteShell } from '../components/site-shell'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '../components/container'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/payment-return')({
  component: () => (
    <SiteShell>
      <Container className="max-w-2xl py-20">
        <PageHeading
          eyebrow="Your order"
          title="Payment session ended"
          description="Check your account for the latest payment status. Returning here does not confirm that payment succeeded."
        />
        <p className="mb-6 text-tertiary">
          Sign in with the same verified email used for checkout to view your
          order’s current status. Contact the team if you need help with an
          interrupted payment.
        </p>
        <Link
          to="/account"
          className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
        >
          View my orders →
        </Link>
      </Container>
    </SiteShell>
  ),
})
