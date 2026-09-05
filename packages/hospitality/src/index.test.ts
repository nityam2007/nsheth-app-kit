import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  peakOccupancy,
  stayDatesSchema,
  stayNights,
  todayInTimezone,
} from './index'

test('checkout is exclusive, leap days and DST do not change night counts', () => {
  assert.equal(stayNights('2028-02-28', '2028-03-01').length, 2)
  assert.equal(
    stayDatesSchema.safeParse({ checkIn: '2027-01-01', checkOut: '2027-01-01' })
      .success,
    false,
  )
  assert.equal(
    stayDatesSchema.safeParse({ checkIn: '2027-01-01', checkOut: '2027-03-01' })
      .success,
    false,
  )
})
test('disjoint reservations do not falsely add together across the entire stay', () => {
  const stays = [
    { checkIn: new Date('2027-01-01'), checkOut: new Date('2027-01-02') },
    { checkIn: new Date('2027-01-02'), checkOut: new Date('2027-01-03') },
  ]
  assert.equal(peakOccupancy('2027-01-01', '2027-01-04', stays), 1)
  assert.equal(peakOccupancy('2027-01-03', '2027-01-04', stays), 0)
})
test('property local day determines the earliest arrival', () => {
  assert.equal(
    todayInTimezone('Asia/Kolkata', new Date('2027-01-01T20:00:00Z')),
    '2027-01-02',
  )
})
