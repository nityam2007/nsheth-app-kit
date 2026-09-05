import { createFileRoute } from '@tanstack/react-router'
import { receivePaymentEvent } from '../payments.server'

export const Route = createFileRoute('/api/stripe')({
  server: { handlers: { POST: ({ request }) => receivePaymentEvent(request) } },
})
