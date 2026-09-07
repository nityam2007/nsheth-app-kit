import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { isGithubLoginConfigured } from './auth.server'
import { getPrisma } from './db'
import { requireSameOrigin, rejectRequest } from './server-utils'
import { ensureRoles, issueSession } from './session.server'
import { throttle } from './throttle.server'
import { hashPassword, verifyPassword } from './password'
import { hashSessionToken } from '@nsheth/identity'
import { requireEmailDelivery, sendChallenge } from './email-auth.server'

const email = z.string().trim().toLowerCase().pipe(z.email().max(254))
const password = z.string().min(12, 'Use at least 12 characters.').max(128)
const token = z.string().min(32).max(128)
export const getSignInOptions = createServerFn({ method: 'GET' }).handler(
  () => ({ github: isGithubLoginConfigured() }),
)
export const registerAccount = createServerFn({ method: 'POST' })
  .validator(z.object({ name: z.string().trim().min(1).max(100), email }))
  .handler(async ({ data }) => {
    requireSameOrigin()
    requireEmailDelivery()
    await throttle('register', data.email)
    await ensureRoles()
    const db = getPrisma()
    const role = await db.role.findUniqueOrThrow({ where: { key: 'customer' } })
    // Existing accounts are never overwritten by an unauthenticated registration.
    const user = await db.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        roles: { create: { roleId: role.id } },
      },
    })
    if (user.disabledAt || user.emailVerifiedAt)
      return { developmentLink: undefined }
    return sendChallenge(user.id, user.email, 'VERIFY')
  })
export const loginWithPassword = createServerFn({ method: 'POST' })
  .validator(z.object({ email, password: z.string().min(1).max(128) }))
  .handler(async ({ data }) => {
    requireSameOrigin()
    await throttle('login', data.email, 15)
    const user = await getPrisma().user.findUnique({
      where: { email: data.email },
    })
    const valid = await verifyPassword(
      data.password,
      user?.passwordHash ?? null,
    )
    if (!valid || !user || user.disabledAt)
      rejectRequest(401, 'Email or password is incorrect.')
    if (!user.emailVerifiedAt)
      rejectRequest(
        403,
        'Verify your email before signing in. Use Resend verification below.',
      )
    await getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id}::uuid FOR UPDATE`
      const current = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
      })
      if (
        current.disabledAt ||
        !current.emailVerifiedAt ||
        current.passwordHash !== user.passwordHash
      )
        rejectRequest(401, 'Your account changed. Sign in again.')
      await issueSession(current.id, tx)
    })
    return { ok: true }
  })
export const requestAccountEmail = createServerFn({ method: 'POST' })
  .validator(z.object({ email, kind: z.enum(['VERIFY', 'RESET']) }))
  .handler(async ({ data }) => {
    requireSameOrigin()
    requireEmailDelivery()
    await throttle('account-email', data.email)
    const user = await getPrisma().user.findUnique({
      where: { email: data.email },
    })
    if (
      !user ||
      user.disabledAt ||
      (data.kind === 'RESET' &&
        (!user.passwordHash || !user.emailVerifiedAt)) ||
      (data.kind === 'VERIFY' && user.emailVerifiedAt)
    )
      return { developmentLink: undefined }
    return sendChallenge(user.id, user.email, data.kind)
  })
export const completeAccountChallenge = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      token,
      kind: z.enum(['VERIFY', 'RESET']),
      password: password.optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireSameOrigin()
    if (!data.password) rejectRequest(400, 'Enter a new password.')
    const tokenHash = await hashSessionToken(data.token)
    const db = getPrisma()
    const challenge = await db.authChallenge.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
    if (
      !challenge ||
      challenge.kind !== data.kind ||
      challenge.expiresAt <= new Date() ||
      challenge.user.disabledAt
    )
      rejectRequest(
        400,
        'This link is invalid or expired. Request a new email.',
      )
    const digest = await hashPassword(data.password)
    await db.$transaction(async (tx) => {
      // Serialize competing verification/reset links for this account.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${challenge.userId}::uuid FOR UPDATE`
      const consumed = await tx.authChallenge.deleteMany({
        where: { tokenHash, kind: data.kind, expiresAt: { gt: new Date() } },
      })
      if (!consumed.count)
        rejectRequest(400, 'This link has already been used or expired.')
      const user = await tx.user.findUniqueOrThrow({
        where: { id: challenge.userId },
      })
      if (user.disabledAt) rejectRequest(403, 'Account disabled.')
      if (data.kind === 'VERIFY' && user.emailVerifiedAt)
        rejectRequest(400, 'Your email is already verified. Sign in.')
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          ...(digest ? { passwordHash: digest } : {}),
        },
      })
      await tx.authChallenge.deleteMany({ where: { userId: user.id } })
      await tx.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    })
    return { ok: true }
  })
