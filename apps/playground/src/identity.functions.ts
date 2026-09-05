import {
  createSessionToken,
  hasPermission,
  hasRole,
  hashSessionToken,
} from '@nsheth/identity'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server'

import { getPrisma } from './db'
import { permissionDefinitions } from './permissions'
import { sessionCookieName } from './session.server'
import { rejectRequest, requireSameOrigin } from './server-utils'

import type { Principal } from '@nsheth/identity'

const DEMO_EMAIL = 'admin@demo.local'
const DEMO_ROLE = 'admin'
const DEMO_PERMISSION = 'identity.read'
const DEMO_PERMISSIONS = permissionDefinitions
const SESSION_SECONDS = 60 * 60 * 8

export const identityMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    setResponseHeader('Cache-Control', 'no-store')
    const token = getCookie(sessionCookieName())

    if (!token) rejectRequest(401, 'Unauthorized')

    const session = await getPrisma().session.findFirst({
      where: {
        tokenHash: await hashSessionToken(token),
        expiresAt: { gt: new Date() },
        revokedAt: null,
        user: { disabledAt: null },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            roles: {
              select: {
                role: {
                  select: {
                    key: true,
                    permissions: {
                      select: { permission: { select: { key: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!session) rejectRequest(401, 'Unauthorized')

    const principal: Principal = {
      userId: session.user.id,
      email: session.user.email,
      roles: session.user.roles.map(({ role }) => role.key),
      permissions: [
        ...new Set(
          session.user.roles.flatMap(({ role }) =>
            role.permissions.map(({ permission }) => permission.key),
          ),
        ),
      ],
    }

    return next({ context: { principal } })
  },
)

export const createDemoIdentitySession = createServerFn({
  method: 'POST',
}).handler(async () => {
  if (process.env.NODE_ENV === 'production') {
    rejectRequest(404, 'Not found')
  }

  requireSameOrigin()

  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000)

  await getPrisma().$transaction(async (transaction) => {
    const permissions = await Promise.all(
      DEMO_PERMISSIONS.map((permission) =>
        transaction.permission.upsert({
          where: { key: permission.key },
          update: {},
          create: permission,
        }),
      ),
    )
    const role = await transaction.role.upsert({
      where: { key: DEMO_ROLE },
      update: {},
      create: { key: DEMO_ROLE, name: 'Admin' },
    })
    const user = await transaction.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: { email: DEMO_EMAIL, name: 'Demo Admin' },
    })

    await transaction.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    })
    await transaction.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    })
    await transaction.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    await transaction.session.create({
      data: {
        tokenHash: await hashSessionToken(token),
        userId: user.id,
        expiresAt,
      },
    })
  })

  setCookie(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_SECONDS,
    path: '/',
  })

  return { ok: true }
})

export const getIdentityRbacProof = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (
      !hasRole(context.principal, DEMO_ROLE) ||
      !hasPermission(context.principal, DEMO_PERMISSION)
    ) {
      rejectRequest(403, 'Forbidden')
    }

    return context.principal
  })
