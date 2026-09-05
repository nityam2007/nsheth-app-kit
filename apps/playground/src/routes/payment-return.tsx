import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '../components/container'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/payment-return')({
  component: () => (
    <Container className="max-w-2xl py-20">
      <PageHeading
        eyebrow="Your order"
        title="Payment session ended"
        description="Payment status is confirmed by the provider’s signed notification. Returning to this page does not by itself confirm payment."
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
  ),
})
