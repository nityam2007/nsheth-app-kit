import { visibleAdminModules } from '@nsheth/admin'
import { hasPermission, hasRole } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'

import { adminModules, identityUsersModule } from './admin.modules'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest } from './server-utils'

export const getAdminContext = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasRole(context.principal, 'admin')) {
      rejectRequest(403, 'Forbidden')
    }

    return {
      principal: context.principal,
      modules: visibleAdminModules(adminModules, context.principal),
    }
  })

export const getAdminUsers = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, identityUsersModule.permission)) {
      rejectRequest(403, 'Forbidden')
    }

    const users = await getPrisma().user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: { select: { role: { select: { key: true } } } },
      },
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString().slice(0, 10),
      roles: user.roles.map(({ role }) => role.key),
    }))
  })
