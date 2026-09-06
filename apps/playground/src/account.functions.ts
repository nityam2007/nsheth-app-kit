import { todayInTimezone } from '@nsheth/hospitality'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { hasPermission, hasRole, hashSessionToken } from '@nsheth/identity'
import { z } from 'zod'
import { identityMiddleware } from './identity.functions'
import { cookieOptions, ensureRoles, sessionCookieName } from './session.server'
import { getPrisma } from './db'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  requireSameOrigin()
  const token = getCookie(sessionCookieName())
  if (token)
    await getPrisma().session.updateMany({
      where: { tokenHash: await hashSessionToken(token) },
      data: { revokedAt: new Date() },
    })
  setCookie(sessionCookieName(), '', cookieOptions(0))
  return { ok: true }
})
export const getAccount = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    const { principal } = context,
      db = getPrisma()
    const [orders, bookings, reservations, enquiries] = await Promise.all([
      db.order.findMany({
        where: { email: principal.email },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paid: true,
          createdAt: true,
          lines: { select: { name: true, quantity: true, price: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.bookingRequest.findMany({
        where: { email: principal.email },
        select: {
          id: true,
          status: true,
          notes: true,
          cancelUntil: true,
          slot: {
            select: { startsAt: true, service: { select: { name: true } } },
          },
        },
      }),
      db.reservation.findMany({
        where: { email: principal.email },
        select: {
          id: true,
          status: true,
          cancelUntilDate: true,
          cancellationTimezone: true,
          checkIn: true,
          checkOut: true,
          totalAmount: true,
          roomType: { select: { name: true } },
        },
      }),
      db.enquiry.findMany({
        where: { email: principal.email },
        select: {
          id: true,
          message: true,
          quantity: true,
          status: true,
          product: { select: { name: true } },
        },
      }),
    ])
    return { principal, orders, bookings, reservations, enquiries }
  })
export const getAccessUsers = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (
      !hasPermission(context.principal, 'identity.write') ||
      !hasRole(context.principal, 'admin')
    )
      rejectRequest(403, 'Forbidden')
    return getPrisma().user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        disabledAt: true,
        roles: { select: { role: { select: { key: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })
export const updateAccess = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({
      userId: z.uuid(),
      role: z.enum(['admin', 'staff', 'editor', 'customer']),
      disabled: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (
      !hasPermission(context.principal, 'identity.write') ||
      !hasRole(context.principal, 'admin')
    )
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    if (data.userId === context.principal.userId)
      rejectRequest(409, 'You cannot change your own access')
    await ensureRoles()
    await getPrisma().$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(784013, 1)`
      const actor = await tx.user.findFirst({
        where: {
          id: context.principal.userId,
          disabledAt: null,
          roles: { some: { role: { key: 'admin' } } },
        },
      })
      if (!actor)
        rejectRequest(403, 'Your administrator access changed. Sign in again.')
      const user = await tx.user.findUniqueOrThrow({
        where: { id: data.userId },
      })
      if (
        (process.env.ADMIN_EMAILS ?? '')
          .split(',')
          .some((s) => s.trim().toLowerCase() === user.email)
      )
        rejectRequest(
          409,
          'Configured owners must be managed through ADMIN_EMAILS',
        )
      const role = await tx.role.findUniqueOrThrow({
        where: { key: data.role },
      })
      await tx.userRole.deleteMany({ where: { userId: user.id } })
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } })
      await tx.user.update({
        where: { id: user.id },
        data: { disabledAt: data.disabled ? new Date() : null },
      })
      const remaining = await tx.user.count({
        where: {
          disabledAt: null,
          roles: { some: { role: { key: 'admin' } } },
        },
      })
      if (!remaining)
        rejectRequest(409, 'At least one enabled administrator is required')
      await tx.auditEvent.create({
        data: {
          entityType: 'access',
          entityId: user.id,
          actorId: context.principal.userId,
          action: 'access-changed',
          summary: `Role: ${data.role}; ${data.disabled ? 'disabled' : 'enabled'}`,
        },
      })
      await tx.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    })
    return { ok: true }
  })

export const cancelOwnRequest = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({ id: z.uuid(), kind: z.enum(['booking', 'reservation']) }),
  )
  .handler(async ({ context, data }) => {
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const where = { id: data.id, email: context.principal.email }
      if (data.kind === 'booking') {
        const row = await tx.bookingRequest.findFirst({ where })
        if (!row) rejectRequest(404, 'Request not found')
        if (row.status === 'CANCELLED') return { ok: true }
        if (!row.cancelUntil || row.cancelUntil <= new Date())
          rejectRequest(
            409,
            'The online cancellation window has closed. Contact the team.',
          )
        const changed = await tx.bookingRequest.updateMany({
          where: { ...where, version: row.version },
          data: { status: 'CANCELLED', version: { increment: 1 } },
        })
        if (!changed.count)
          rejectRequest(409, 'Request changed. Refresh and retry.')
      } else {
        const row = await tx.reservation.findFirst({ where })
        if (!row) rejectRequest(404, 'Request not found')
        if (row.status === 'CANCELLED') return { ok: true }
        if (
          !row.cancelUntilDate ||
          todayInTimezone(row.cancellationTimezone) >= row.cancelUntilDate
        )
          rejectRequest(
            409,
            'The online cancellation window has closed. Contact the team.',
          )
        const changed = await tx.reservation.updateMany({
          where: { ...where, version: row.version },
          data: { status: 'CANCELLED', version: { increment: 1 } },
        })
        if (!changed.count)
          rejectRequest(409, 'Request changed. Refresh and retry.')
      }
      await tx.auditEvent.create({
        data: {
          entityType: data.kind,
          entityId: data.id,
          actorId: context.principal.userId,
          action: 'cancelled',
          summary: 'Cancelled by the customer; capacity released',
        },
      })
      return { ok: true }
    })
  })

export const getOwnSessions = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    const token = getCookie(sessionCookieName()),
      hash = token ? await hashSessionToken(token) : ''
    const rows = await getPrisma().session.findMany({
      where: {
        userId: context.principal.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, tokenHash: true, createdAt: true, expiresAt: true },
    })
    return rows.map(({ tokenHash, ...session }) => ({
      ...session,
      current: tokenHash === hash,
    }))
  })
export const revokeOwnSession = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    requireSameOrigin()
    const token = getCookie(sessionCookieName()),
      hash = token ? await hashSessionToken(token) : ''
    const result = await getPrisma().session.updateMany({
      where: {
        id: data.id,
        userId: context.principal.userId,
        tokenHash: { not: hash },
      },
      data: { revokedAt: new Date() },
    })
    if (!result.count)
      rejectRequest(404, 'Session not found, or use Sign out for this session')
    return { ok: true }
  })
