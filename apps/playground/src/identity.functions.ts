import {
  createSessionToken,
  hasPermission,
  hasRole,
  hashSessionToken,
} from '@nsheth/identity'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  getRequest,
  setCookie,
  setResponseStatus,
} from '@tanstack/react-start/server'

import { getPrisma } from './db'

import type { Principal } from '@nsheth/identity'

const DEMO_EMAIL = 'admin@demo.local'
const DEMO_ROLE = 'admin'
const DEMO_PERMISSION = 'identity.read'
const SESSION_SECONDS = 60 * 60 * 8

function sessionCookieName() {
  return process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'
}

function reject(status: number, message: string): never {
  setResponseStatus(status)
  throw new Error(message)
}

const identityMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const token = getCookie(sessionCookieName())

    if (!token) reject(401, 'Unauthorized')

    const session = await getPrisma().session.findFirst({
      where: {
        tokenHash: await hashSessionToken(token),
        expiresAt: { gt: new Date() },
        revokedAt: null,
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

    if (!session) reject(401, 'Unauthorized')

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
    reject(404, 'Not found')
  }

  const request = getRequest()
  const origin = request.headers.get('origin')

  if (!origin || origin !== new URL(request.url).origin) {
    reject(403, 'Origin check failed')
  }

  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000)

  await getPrisma().$transaction(async (transaction) => {
    const permission = await transaction.permission.upsert({
      where: { key: DEMO_PERMISSION },
      update: {},
      create: { key: DEMO_PERMISSION, name: 'Read identity' },
    })
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

    await transaction.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
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
      reject(403, 'Forbidden')
    }

    return context.principal
  })
