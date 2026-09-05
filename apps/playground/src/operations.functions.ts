import { createServerFn } from '@tanstack/react-start'
import { hasPermission } from '@nsheth/identity'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'
import { throttle } from './throttle.server'

export const getEnquiries = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'operations.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().enquiry.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
  })
export const updateEnquiry = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']),
    }),
  )
  .handler(({ context, data: { id, status } }) => {
    if (!hasPermission(context.principal, 'operations.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().enquiry.update({ where: { id }, data: { status } })
  })
export const submitPrivacyRequest = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().toLowerCase().email().max(254),
      request: z.string().trim().min(10).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    requireSameOrigin()
    await throttle('privacy', data.email)
    const request = await getPrisma().privacyRequest.create({ data })
    return { reference: request.id }
  })
export const getPrivacyRequests = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'operations.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().privacyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
  })
export const updatePrivacyRequest = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({ id: z.uuid(), status: z.enum(['OPEN', 'REVIEWED', 'CLOSED']) }),
  )
  .handler(({ context, data: { id, status } }) => {
    if (!hasPermission(context.principal, 'operations.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().privacyRequest.update({
      where: { id },
      data: { status },
    })
  })
