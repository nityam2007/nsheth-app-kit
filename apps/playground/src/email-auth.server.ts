import { createSessionToken, hashSessionToken } from '@nsheth/identity'
import { getRequest } from '@tanstack/react-start/server'
import { getPrisma } from './db'
import { rejectRequest } from './server-utils'

export function requireEmailDelivery() {
  if (process.env.NODE_ENV !== 'production') return
  const webhook = process.env.AUTH_EMAIL_WEBHOOK
  const origin = process.env.PUBLIC_ORIGIN
  if (!webhook || !origin || !process.env.AUTH_EMAIL_SECRET)
    rejectRequest(
      503,
      'Email sign-in is not configured. Please contact the team.',
    )
  try {
    if (
      new URL(webhook).protocol !== 'https:' ||
      new URL(origin).protocol !== 'https:'
    )
      throw new Error('HTTPS required')
  } catch {
    rejectRequest(503, 'Email delivery configuration needs attention.')
  }
}
export async function sendChallenge(
  userId: string,
  email: string,
  kind: 'VERIFY' | 'RESET',
) {
  requireEmailDelivery()
  const db = getPrisma()
  const token = createSessionToken()
  const tokenHash = await hashSessionToken(token)
  const expiresAt = new Date(Date.now() + 30 * 60_000)
  await db.authChallenge.create({
    data: { tokenHash, userId, kind, expiresAt },
  })
  const path = kind === 'VERIFY' ? '/verify-email' : '/reset-password'
  const origin =
    process.env.NODE_ENV === 'production'
      ? process.env.PUBLIC_ORIGIN!
      : new URL(getRequest().url).origin
  const url = new URL(path, origin)
  url.searchParams.set('token', token)
  if (process.env.NODE_ENV !== 'production')
    return { developmentLink: url.pathname + url.search }
  try {
    const response = await fetch(process.env.AUTH_EMAIL_WEBHOOK!, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.AUTH_EMAIL_SECRET!,
      },
      body: JSON.stringify({
        to: email,
        subject:
          kind === 'VERIFY' ? 'Verify your email' : 'Reset your password',
        text: 'Open this link within 30 minutes: ' + url.href,
      }),
    })
    if (!response.ok) throw new Error('Delivery failed')
  } catch {
    await db.authChallenge.deleteMany({ where: { tokenHash } })
    rejectRequest(503, 'We could not send the email. Please try again later.')
  }
  return { developmentLink: undefined }
}
