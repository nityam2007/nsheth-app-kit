import assert from 'node:assert/strict'
import test from 'node:test'

import { enquiryInputSchema, productInputSchema } from './index.js'

test('validates and normalizes product input', () => {
  const product = productInputSchema.parse({
    name: '  Workshop table  ',
    slug: 'workshop-table',
    summary: 'Built for focused teams.',
    description: 'A durable table made to order.',
    status: 'PUBLISHED',
  })

  assert.equal(product.name, 'Workshop table')
  assert.equal(
    productInputSchema.safeParse({ ...product, slug: 'Not Valid' }).success,
    false,
  )
})

test('validates and normalizes enquiry input', () => {
  const enquiry = enquiryInputSchema.parse({
    productId: 'c521b078-80d3-4bc8-8e86-8e60a4f70237',
    name: '  Ada Lovelace  ',
    email: '  ADA@EXAMPLE.COM ',
    quantity: 4,
    message: 'Please quote delivery to London.',
  })

  assert.equal(enquiry.name, 'Ada Lovelace')
  assert.equal(enquiry.email, 'ada@example.com')
  assert.equal(
    enquiryInputSchema.safeParse({ ...enquiry, quantity: 0 }).success,
    false,
  )
})
