import {
  cartSchema,
  checkoutSchema,
  saleInputSchema,
  orderTotal,
  canTransitionOrder,
} from '@nsheth/commerce'
import { hasPermission, hashSessionToken } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const getStoreProducts = createServerFn({ method: 'GET' }).handler(() =>
  getPrisma().product.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
      forSale: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      price: true,
      stock: true,
      category: true,
      imageUrl: true,
    },
    orderBy: { name: 'asc' },
  }),
)
export const getStoreProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(({ data }) =>
    getPrisma().product.findFirst({
      where: {
        ...data,
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        forSale: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        summary: true,
        description: true,
        price: true,
        stock: true,
        category: true,
        imageUrl: true,
      },
    }),
  )
export const getProductSale = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'product.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().product.findUniqueOrThrow({
      where: data,
      select: {
        id: true,
        price: true,
        stock: true,
        forSale: true,
        category: true,
        imageUrl: true,
      },
    })
  })
export const saveProductSale = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(saleInputSchema)
  .handler(({ context, data: { productId, ...data } }) => {
    if (!hasPermission(context.principal, 'product.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().product.update({ where: { id: productId }, data })
  })
export const quoteCart = createServerFn({ method: 'GET' })
  .validator(cartSchema)
  .handler(async ({ data }) => {
    const products = await getPrisma().product.findMany({
      where: {
        id: { in: data.map((l) => l.productId) },
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        forSale: true,
      },
      select: { id: true, name: true, price: true, stock: true },
    })
    const lines = data.map((line) => {
      const p = products.find((product) => product.id === line.productId)
      if (!p || p.stock < line.quantity)
        rejectRequest(409, 'A product is unavailable or has insufficient stock')
      return { ...line, name: p.name, price: p.price }
    })
    return { lines, totalAmount: orderTotal(lines), currency: 'INR' }
  })
export const placeOrder = createServerFn({ method: 'POST' })
  .validator(checkoutSchema)
  .handler(async ({ data: { key, ...data } }) => {
    requireSameOrigin()
    const requestHash = await hashSessionToken(key),
      payloadHash = await hashSessionToken(JSON.stringify(data))
    return getPrisma().$transaction(async (tx) => {
      // An advisory transaction lock also serializes retries before an order exists.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestHash}, 0))`
      const existing = await tx.order.findUnique({
        where: { requestHash },
        select: { id: true, totalAmount: true, payloadHash: true },
      })
      if (existing) {
        if (existing.payloadHash !== payloadHash)
          rejectRequest(409, 'Checkout changed. Start a new checkout.')
        return { reference: existing.id, totalAmount: existing.totalAmount }
      }
      const lines = []
      // Stable locking order prevents deadlocks across multi-product carts.
      for (const line of [...data.lines].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      )) {
        await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${line.productId}::uuid FOR UPDATE`
        const product = await tx.product.findFirst({
          where: {
            id: line.productId,
            status: 'PUBLISHED',
            publishedAt: { lte: new Date() },
            forSale: true,
          },
        })
        if (!product || product.stock < line.quantity)
          rejectRequest(409, 'Insufficient stock. Refresh your cart.')
        lines.push({
          productId: product.id,
          name: product.name,
          quantity: line.quantity,
          price: product.price,
        })
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: line.quantity } },
        })
      }
      const totalAmount = orderTotal(lines)
      if (totalAmount !== data.expectedTotal)
        rejectRequest(
          409,
          'Prices changed. Refresh the quote before placing your order.',
        )
      const order = await tx.order.create({
        data: {
          requestHash,
          payloadHash,
          name: data.name,
          email: data.email,
          address: data.address,
          totalAmount,
          lines: { create: lines },
        },
      })
      return { reference: order.id, totalAmount }
    })
  })
export const getOrders = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'commerce.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().order.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        totalAmount: true,
        currency: true,
        status: true,
        paid: true,
        createdAt: true,
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
  })
export const updateOrder = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({ id: z.uuid(), status: z.enum(['FULFILLED', 'CANCELLED']) }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'commerce.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${data.id}::uuid FOR UPDATE`
      const order = await tx.order.findUniqueOrThrow({
        where: { id: data.id },
        include: { lines: true },
      })
      if (!canTransitionOrder(order.status, data.status))
        rejectRequest(409, 'This order cannot change status')
      if (data.status === 'CANCELLED' && order.paid)
        rejectRequest(
          409,
          'A paid order requires a refund workflow before cancellation',
        )
      if (data.status === 'CANCELLED')
        for (const line of [...order.lines].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        ))
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { increment: line.quantity } },
          })
      await tx.order.update({
        where: { id: order.id },
        data: { status: data.status },
      })
      return { ok: true }
    })
  })
export const recordOfflinePayment = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'commerce.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().order.update({
      where: { id: data.id, status: { not: 'CANCELLED' } },
      data: { paid: true },
    })
    return { ok: true }
  })
