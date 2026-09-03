import assert from 'node:assert/strict'
import test from 'node:test'

import { slugify } from './slug.js'

test('creates a valid URL slug from a record name', () => {
  assert.equal(slugify('  Workshop Table / Oak  '), 'workshop-table-oak')
  assert.equal(slugify('Already--spaced'), 'already-spaced')
})
