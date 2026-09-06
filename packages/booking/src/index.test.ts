import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  bookingInputSchema,
  canTransitionBooking,
  hasCapacity,
  slotInputSchema,
  withinBookingWindow,
} from './index'

test('capacity includes pending requests and rejects invalid quantities', () => {
  assert.equal(hasCapacity(2, 1), true)
  assert.equal(hasCapacity(2, 2), false)
  assert.equal(hasCapacity(2, 0, -1), false)
})
test('cancelled requests cannot reacquire inventory', () => {
  assert.equal(canTransitionBooking('REQUESTED', 'CONFIRMED'), true)
  assert.equal(canTransitionBooking('CONFIRMED', 'CANCELLED'), true)
  assert.equal(canTransitionBooking('CANCELLED', 'CONFIRMED'), false)
})
test('validate contact and absolute slot timestamps', () => {
  assert.equal(
    bookingInputSchema.safeParse({
      slotId: 'bad',
      name: 'A',
      email: 'bad',
      notes: '',
    }).success,
    false,
  )
  assert.equal(
    slotInputSchema.safeParse({
      serviceId: crypto.randomUUID(),
      startsAt: '2027-01-01T10:00',
      capacity: 1,
    }).success,
    false,
  )
})

test('lead time and booking horizon use absolute instants', () => {
  const now = new Date('2030-01-01T00:00:00Z'),
    policy = { minLeadHours: 2, maxAdvanceDays: 30 }
  assert.equal(
    withinBookingWindow(new Date('2030-01-01T01:59:00Z'), policy, now),
    false,
  )
  assert.equal(
    withinBookingWindow(new Date('2030-01-01T03:00:00Z'), policy, now),
    true,
  )
  assert.equal(
    withinBookingWindow(new Date('2030-02-02T03:00:00Z'), policy, now),
    false,
  )
})
