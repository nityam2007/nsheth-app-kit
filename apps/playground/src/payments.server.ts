import Stripe from 'stripe'
import { getPrisma } from './db'

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe is not configured')
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
    timeout: 15000,
  })
}
export async function createPaymentSession(orderId: string) {
  const origin = process.env.PUBLIC_ORIGIN
  if (
    !origin ||
    (process.env.NODE_ENV === 'production' && !origin.startsWith('https://'))
  )
    throw new Error('Payment origin is not configured')
  const stripe = stripeClient(),
    db = getPrisma()
  const order = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId}::uuid FOR UPDATE`
    const current = await tx.order.findUniqueOrThrow({ where: { id: orderId } })
    if (current.status !== 'PLACED' || current.paid || current.totalAmount <= 0)
      throw new Error('Order cannot be paid')
    return tx.order.update({
      where: { id: orderId },
      data: {
        paymentPending: true,
        paymentStartedAt: current.paymentStartedAt ?? new Date(),
      },
    })
  })
  if (order.paymentSessionId) {
    const session = await stripe.checkout.sessions.retrieve(
      order.paymentSessionId,
    )
    if (session.status === 'open' && session.url) return session.url
    // A completed session must be reconciled by the signed webhook, never by redirect.
    throw new Error(
      'Payment session ended. Contact the operator for reconciliation.',
    )
  }
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: order.totalAmount,
            product_data: { name: `Order ${order.id}` },
          },
        },
      ],
      success_url: `${origin}/payment-return`,
      cancel_url: `${origin}/payment-return`,
      expires_at: Math.floor(order.paymentStartedAt!.getTime() / 1000) + 1800,
    },
    { idempotencyKey: `order-${order.id}` },
  )
  await db.order.update({
    where: { id: order.id },
    data: { paymentSessionId: session.id },
  })
  if (!session.url) throw new Error('Payment URL unavailable')
  return session.url
}
export async function verifyPaymentEvent(
  payload: string,
  signature: string,
  secret: string,
) {
  return new Stripe(
    'sk_test_signature_verification',
  ).webhooks.constructEventAsync(
    payload,
    signature,
    secret,
    300,
    Stripe.createSubtleCryptoProvider(),
  )
}
export async function receivePaymentEvent(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET,
    signature = request.headers.get('stripe-signature')
  if (!secret) return new Response('Webhook is not configured', { status: 503 })
  if (!signature) return new Response('Missing signature', { status: 400 })
  if (Number(request.headers.get('content-length') ?? 0) > 1_000_000)
    return new Response('Payload too large', { status: 413 })
  const payload = await request.text()
  if (payload.length > 1_000_000)
    return new Response('Payload too large', { status: 413 })
  let event
  try {
    event = await verifyPaymentEvent(payload, signature, secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.expired'
  )
    return Response.json({ received: true })
  const session = event.data.object,
    orderId = session.metadata?.orderId
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId))
    return new Response('Invalid order reference', { status: 400 })
  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId}::uuid FOR UPDATE`
      if (await tx.paymentEvent.findUnique({ where: { id: event.id } })) return
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } })
      if (order.paymentSessionId && order.paymentSessionId !== session.id)
        throw new Error('Payment session mismatch')
      if (
        session.amount_total !== order.totalAmount ||
        session.currency !== order.currency.toLowerCase()
      )
        throw new Error('Payment amount mismatch')
      const paid =
        event.type === 'checkout.session.completed' &&
        session.payment_status === 'paid'
      if (event.type === 'checkout.session.completed' && !paid)
        throw new Error('Payment is not settled')
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentPending: false,
          paymentSessionId: session.id,
          ...(paid ? { paid: true } : {}),
        },
      })
      await tx.paymentEvent.create({
        data: { id: event.id, type: event.type, orderId },
      })
    })
  } catch {
    return new Response('Payment reconciliation failed', { status: 409 })
  }
  return Response.json({ received: true })
}
