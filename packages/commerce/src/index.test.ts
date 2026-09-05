import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canTransitionOrder, cartSchema, orderTotal } from './index'

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
