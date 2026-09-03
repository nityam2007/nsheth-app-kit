import assert from 'node:assert/strict'
import test from 'node:test'

import { visibleAdminModules } from './index.js'

import type { AdminModule } from './index.js'
import type { Principal } from '@nsheth/identity'

test('filters admin modules by permission', () => {
  const modules = [
    {
      id: 'users',
      group: 'Identity',
      label: 'People',
      href: '/admin/users',
      permission: 'identity.read',
    },
    {
      id: 'settings',
      group: 'System',
      label: 'Settings',
      href: '/admin/settings',
      permission: 'settings.manage',
    },
  ] as const satisfies ReadonlyArray<AdminModule>
  const principal: Principal = {
    userId: 'user-1',
    email: 'admin@example.com',
    roles: ['admin'],
    permissions: ['identity.read'],
  }

  assert.deepEqual(
    visibleAdminModules(modules, principal).map(({ id }) => id),
    ['users'],
  )
})
