import { createSessionToken, hashSessionToken } from '@nsheth/identity'
import { setCookie } from '@tanstack/react-start/server'
import { getPrisma } from './db'
import { permissionDefinitions, rolePermissions } from './permissions'

export function sessionCookieName() {
  return process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'
}
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}
export async function issueSession(userId: string) {
  const token = createSessionToken(),
    seconds = 60 * 60 * 8
  await getPrisma().session.create({
    data: {
      userId,
      tokenHash: await hashSessionToken(token),
      expiresAt: new Date(Date.now() + seconds * 1000),
    },
  })
  setCookie(sessionCookieName(), token, cookieOptions(seconds))
}
export async function ensureRoles() {
  const db = getPrisma()
  const permissions = await Promise.all(
    permissionDefinitions.map((p) =>
      db.permission.upsert({
        where: { key: p.key },
        update: { name: p.name },
        create: p,
      }),
    ),
  )
  for (const [key, allowed] of Object.entries(rolePermissions)) {
    const role = await db.role.upsert({
      where: { key },
      update: {},
      create: { key, name: key[0].toUpperCase() + key.slice(1) },
    })
    await db.rolePermission.createMany({
      data: permissions
        .filter((p) => allowed.some((k) => k === p.key))
        .map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    })
  }
}
