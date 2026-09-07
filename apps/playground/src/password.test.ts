import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from './password.ts'

test('password hashes are salted and accept only the original password', async () => {
  const password = 'a long dev-only password 🔑'
  const a = await hashPassword(password),
    b = await hashPassword(password)
  assert.notEqual(a, b)
  assert.equal(await verifyPassword(password, a), true)
  assert.equal(await verifyPassword(password + 'x', a), false)
  assert.ok(!a.includes(password))
})
test('missing or malformed digests do not authenticate', async () => {
  for (const digest of [null, '', 'pbkdf2-sha256$1$00$00', 'x'.repeat(200)])
    assert.equal(
      await verifyPassword('a long dev-only password', digest),
      false,
    )
})
