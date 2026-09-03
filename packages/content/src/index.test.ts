import assert from 'node:assert/strict'
import test from 'node:test'

import { postInputSchema } from './index.js'

test('validates and normalizes post input', () => {
  const post = postInputSchema.parse({
    title: '  A useful post  ',
    slug: 'a-useful-post',
    excerpt: 'A concise summary.',
    body: 'The post body.',
    status: 'PUBLISHED',
  })

  assert.equal(post.title, 'A useful post')
  assert.equal(
    postInputSchema.safeParse({ ...post, slug: 'Not Valid' }).success,
    false,
  )
})
