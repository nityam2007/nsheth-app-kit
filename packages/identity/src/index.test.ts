import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createSessionToken,
  hasPermission,
  hasRole,
  hashSessionToken,
} from './index.js'

import type { Principal } from './index.js'

test('checks access and hashes opaque session tokens', async () => {
  const principal: Principal = {
    userId: 'user-1',
    email: 'admin@example.com',
    roles: ['admin'],
    permissions: ['identity.read'],
  }

  assert.equal(hasRole(principal, 'admin'), true)
  assert.equal(hasPermission(principal, 'identity.write'), false)
  assert.notEqual(createSessionToken(), createSessionToken())
  assert.equal((await hashSessionToken('session-token')).length, 64)
})
