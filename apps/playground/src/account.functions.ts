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
      await tx.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    })
    return { ok: true }
  })
