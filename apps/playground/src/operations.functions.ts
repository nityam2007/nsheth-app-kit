import { moduleMiddleware } from './module.middleware'
import { attachHistory } from './audit.server'
import { createServerFn } from '@tanstack/react-start'
import { hasPermission } from '@nsheth/identity'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'
import { throttle } from './throttle.server'

export const getEnquiries = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('operations')])
  .middleware([identityMiddleware])
  .validator(z.object({ record: z.uuid().optional() }).optional())
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'operations.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma()
      .enquiry.findMany({
        where: data?.record ? { id: data.record } : undefined,
        include: { product: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((rows) => attachHistory('enquiry', rows))
  })
const triageFields = {
  expectedVersion: z.number().int().positive(),
  note: z.string().trim().min(5).max(2000),
  ownership: z.enum(['keep', 'claim', 'release']),
  followUpAt: z.union([z.literal(''), z.iso.datetime()]),
}
export const updateEnquiry = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('operations')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']),
      ...triageFields,
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'operations.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const current = await tx.enquiry.findUniqueOrThrow({
        where: { id: data.id },
      })
      const result = await tx.enquiry.updateMany({
        where: { id: data.id, version: data.expectedVersion },
        data: {
          status: data.status,
          assigneeId:
            data.ownership === 'claim'
              ? context.principal.userId
              : data.ownership === 'release'
                ? null
                : current.assigneeId,
          followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
          version: { increment: 1 },
        },
      })
      if (!result.count)
        rejectRequest(409, 'Enquiry changed. Refresh before saving.')
      await tx.auditEvent.create({
        data: {
          entityType: 'enquiry',
          entityId: data.id,
          action: data.status.toLowerCase(),
          actorId: context.principal.userId,
          summary: data.note,
        },
      })
      return { ok: true }
    })
  })
export const submitPrivacyRequest = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('operations')])
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
  .middleware([moduleMiddleware('operations')])
  .middleware([identityMiddleware])
  .validator(z.object({ record: z.uuid().optional() }).optional())
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'operations.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma()
      .privacyRequest.findMany({
        where: data?.record ? { id: data.record } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((rows) => attachHistory('privacy', rows))
  })
export const updatePrivacyRequest = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('operations')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(['OPEN', 'REVIEWED', 'CLOSED']),
      ...triageFields,
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'operations.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const current = await tx.privacyRequest.findUniqueOrThrow({
        where: { id: data.id },
      })
      const result = await tx.privacyRequest.updateMany({
        where: { id: data.id, version: data.expectedVersion },
        data: {
          status: data.status,
          assigneeId:
            data.ownership === 'claim'
              ? context.principal.userId
              : data.ownership === 'release'
                ? null
                : current.assigneeId,
          followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
          version: { increment: 1 },
        },
      })
      if (!result.count)
        rejectRequest(409, 'Case changed. Refresh before saving.')
      await tx.auditEvent.create({
        data: {
          entityType: 'privacy',
          entityId: data.id,
          action: data.status.toLowerCase(),
          actorId: context.principal.userId,
          summary: data.note,
        },
      })
      return { ok: true }
    })
  })
