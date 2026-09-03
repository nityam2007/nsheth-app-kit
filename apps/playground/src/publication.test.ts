import assert from 'node:assert/strict'
import test from 'node:test'

import { publicationDate } from './publication.js'

test('sets, preserves, and clears publication dates', () => {
  const firstPublished = new Date('2026-09-01T00:00:00Z')
  const now = new Date('2026-09-03T00:00:00Z')

  assert.equal(publicationDate('PUBLISHED', null, now), now)
  assert.equal(
    publicationDate('PUBLISHED', firstPublished, now),
    firstPublished,
  )
  assert.equal(publicationDate('DRAFT', firstPublished, now), null)
})
