import { visibleAdminModules } from '@nsheth/admin'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'

import { adminModules, identityUsersModule } from './admin.modules'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest } from './server-utils'

export const getWorkspaceOverview = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    const modules = visibleAdminModules(adminModules, context.principal)
    if (!modules.length) rejectRequest(403, 'Forbidden')
    const db = getPrisma()
    const metrics = await Promise.all(
      modules.map(async (module) => {
        let total = 0,
          pending = 0
        switch (module.id) {
          case 'product-catalogue':
            ;[total, pending] = await Promise.all([
              db.product.count(),
              db.product.count({
                where: { status: 'DRAFT', archivedAt: null },
              }),
            ])
            break
          case 'content-posts':
            ;[total, pending] = await Promise.all([
              db.post.count(),
              db.post.count({ where: { status: 'DRAFT' } }),
            ])
            break
          case 'commerce-orders':
            ;[total, pending] = await Promise.all([
              db.order.count(),
              db.order.count({ where: { status: 'PLACED' } }),
            ])
            break
          case 'booking-services':
            total = await db.service.count()
            break
          case 'booking-requests':
            ;[total, pending] = await Promise.all([
              db.bookingRequest.count(),
              db.bookingRequest.count({ where: { status: 'REQUESTED' } }),
            ])
            break
          case 'hospitality-properties':
            total = await db.property.count()
            break
          case 'hospitality-reservations':
            ;[total, pending] = await Promise.all([
              db.reservation.count(),
              db.reservation.count({ where: { status: 'REQUESTED' } }),
            ])
            break
          case 'operations-enquiries':
            ;[total, pending] = await Promise.all([
              db.enquiry.count(),
              db.enquiry.count({ where: { status: 'NEW' } }),
            ])
            break
          case 'operations-privacy':
            ;[total, pending] = await Promise.all([
              db.privacyRequest.count(),
              db.privacyRequest.count({ where: { status: 'OPEN' } }),
            ])
            break
          case 'identity-users':
            total = await db.user.count()
            break
          default:
            return null
        }
        return { ...module, total, pending }
      }),
    )
    return metrics.filter((metric) => metric !== null)
  })

export const getAdminContext = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!visibleAdminModules(adminModules, context.principal).length) {
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
        emailVerifiedAt: true,
        disabledAt: true,
        roles: { select: { role: { select: { key: true } } } },
      },
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString().slice(0, 10),
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      disabledAt: user.disabledAt?.toISOString() ?? null,
      roles: user.roles.map(({ role }) => role.key),
    }))
  })

export const getWorkspaceActivity = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    const modules = visibleAdminModules(adminModules, context.principal)
    if (!modules.length) rejectRequest(403, 'Forbidden')
    const entities: Record<string, string> = {
      'product-catalogue': 'product',
      'content-posts': 'post',
      'commerce-orders': 'order',
      'booking-services': 'service',
      'booking-requests': 'booking',
      'hospitality-properties': 'property',
      'hospitality-reservations': 'reservation',
      'operations-enquiries': 'enquiry',
      'operations-privacy': 'privacy',
      'identity-access': 'access',
    }
    return getPrisma().auditEvent.findMany({
      where: {
        entityType: { in: modules.map((m) => entities[m.id]).filter(Boolean) },
      },
      select: { id: true, summary: true, entityType: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })
  })
