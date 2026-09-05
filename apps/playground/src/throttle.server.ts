import { hashSessionToken } from '@nsheth/identity'
import { getPrisma } from './db'
import { rejectRequest } from './server-utils'

export async function throttle(action: string, subject: string, limit = 5) {
  const bucket = Math.floor(Date.now() / 3600000)
  const key = await hashSessionToken(
    `${action}:${subject.toLowerCase()}:${bucket}`,
  )
  const row = await getPrisma().requestThrottle.upsert({
    where: { key },
    create: { key, hits: 1, expiresAt: new Date((bucket + 2) * 3600000) },
    update: { hits: { increment: 1 } },
  })
  if (row.hits > limit)
    rejectRequest(429, 'Too many requests. Please try again later.')
}
