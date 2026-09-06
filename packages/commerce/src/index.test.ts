import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  canTransitionOrder,
  cartSchema,
  checkoutTotals,
  orderTotal,
} from './index'

test('cart rejects duplicate lines and invalid quantities', () => {
  const id = crypto.randomUUID()
  assert.equal(
    cartSchema.safeParse([
      { productId: id, quantity: 1 },
      { productId: id, quantity: 1 },
    ]).success,
    false,
  )
  assert.equal(
    cartSchema.safeParse([{ productId: id, quantity: -1 }]).success,
    false,
  )
})
test('totals use integer minor units and reject overflow', () => {
  assert.equal(orderTotal([{ quantity: 3, price: 1999 }]), 5997)
  assert.throws(() => orderTotal([{ quantity: 999999, price: 999999 }]))
  assert.equal(canTransitionOrder('CANCELLED', 'PLACED'), false)
  assert.equal(canTransitionOrder('PLACED', 'FULFILLED'), true)
})

test('checkout rounds configured tax once and includes delivery', () => {
  assert.deepEqual(checkoutTotals(10001, 500, 1800), {
    subtotal: 10001,
    shippingFee: 500,
    taxAmount: 1800,
    totalAmount: 12301,
  })
  assert.throws(() => checkoutTotals(100, -1, 0))
  assert.throws(() => checkoutTotals(100, 0, 10001))
})
