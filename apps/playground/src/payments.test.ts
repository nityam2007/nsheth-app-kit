import assert from 'node:assert/strict'
import { test } from 'node:test'
import Stripe from 'stripe'
import { verifyPaymentEvent } from './payments.server'

test('webhook verification rejects tampering and stale signatures', async () => {
  const stripe = new Stripe('sk_test_local'),
    secret = 'whsec_test_fixture'
  const payload = JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test' } },
  })
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret,
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  })
  assert.equal(
    (await verifyPaymentEvent(payload, signature, secret)).id,
    'evt_test',
  )
  await assert.rejects(verifyPaymentEvent(payload + ' ', signature, secret))
  const stale = await stripe.webhooks.generateTestHeaderStringAsync({
    payload,
    secret,
    timestamp: 1,
    cryptoProvider: Stripe.createSubtleCryptoProvider(),
  })
  await assert.rejects(verifyPaymentEvent(payload, stale, secret))
})
