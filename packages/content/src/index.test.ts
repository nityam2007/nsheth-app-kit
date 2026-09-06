import assert from 'node:assert/strict'
import test from 'node:test'

import { postInputSchema } from './index.js'

import { articleBlocks } from './index'

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
test('structured article blocks retain HTML as plain text', () => {
  assert.deepEqual(
    articleBlocks('## Heading\n\n- One\n- Two\n\n<script>alert(1)</script>'),
    [
      { type: 'heading', text: 'Heading' },
      { type: 'list', items: ['One', 'Two'] },
      { type: 'paragraph', text: '<script>alert(1)</script>' },
    ],
  )
})
