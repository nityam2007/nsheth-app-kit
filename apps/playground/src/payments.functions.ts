import { createServerFn } from '@tanstack/react-start'
import { hashSessionToken } from '@nsheth/identity'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { requireSameOrigin, rejectRequest } from './server-utils'
import { createPaymentSession } from './payments.server'

export const startPayment = createServerFn({ method: 'POST' })
  .validator(
    z.object({ reference: z.uuid(), key: z.string().regex(/^[a-f0-9]{64}$/) }),
  )
  .handler(async ({ data }) => {
    requireSameOrigin()
    const order = await getPrisma().order.findFirst({
      where: {
        id: data.reference,
        requestHash: await hashSessionToken(data.key),
      },
    })
    if (!order) rejectRequest(403, 'Forbidden')
    return { url: await createPaymentSession(order.id) }
  })
export const startAccountPayment = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    requireSameOrigin()
    const order = await getPrisma().order.findFirst({
      where: { id: data.id, email: context.principal.email },
    })
    if (!order) rejectRequest(403, 'Forbidden')
    return { url: await createPaymentSession(order.id) }
  })
