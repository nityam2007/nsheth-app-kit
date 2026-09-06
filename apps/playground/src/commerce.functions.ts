import { moduleMiddleware } from './module.middleware'
import { commercePolicy } from './commerce.config'
import { mediaSchema, specificationSchema } from '@nsheth/product'
import { throttle } from './throttle.server'
import {
  cartSchema,
  checkoutSchema,
  saleInputSchema,
  orderTotal,
  checkoutTotals,
  canTransitionOrder,
} from '@nsheth/commerce'
import { hasPermission, hashSessionToken } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

const activeOptions = {
  status: 'PUBLISHED' as const,
  archivedAt: null,
  forSale: true,
}
function purchasable() {
  return {
    status: 'PUBLISHED' as const,
    publishedAt: { lte: new Date() },
    archivedAt: null,
    forSale: true,
    OR: [
      { parentId: null },
      {
        parent: {
          status: 'PUBLISHED' as const,
          archivedAt: null,
          publishedAt: { lte: new Date() },
        },
      },
    ],
  }
}
export const getStoreProducts = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('commerce')])
  .handler(async () => {
    const products = await getPrisma().product.findMany({
      where: { ...purchasable(), parentId: null },
      select: {
        id: true,
        slug: true,
        name: true,
        summary: true,
        price: true,
        stock: true,
        category: true,
        imageUrl: true,
        options: {
          where: { ...activeOptions, publishedAt: { lte: new Date() } },
          select: { price: true, stock: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 200,
    })
    return products.map((p) => ({
      ...p,
      price: p.options.length
        ? Math.min(...p.options.map((o) => o.price))
        : p.price,
      stock: p.options.length
        ? p.options.reduce((sum, o) => sum + o.stock, 0)
        : p.stock,
    }))
  })
export const getStoreProduct = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('commerce')])
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(async ({ data }) => {
    const p = await getPrisma().product.findFirst({
      where: { ...purchasable(), ...data },
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
        gallery: true,
        specifications: true,
        sku: true,
        brand: true,
        unit: true,
        seoTitle: true,
        seoDescription: true,
        options: {
          where: { ...activeOptions, publishedAt: { lte: new Date() } },
          select: {
            id: true,
            slug: true,
            name: true,
            optionLabel: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
        parent: { select: { slug: true, name: true } },
      },
    })
    return p
      ? {
          ...p,
          gallery: mediaSchema.catch([]).parse(p.gallery),
          specifications: specificationSchema.catch([]).parse(p.specifications),
        }
      : null
  })
export const getProductSale = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('commerce')])
  .middleware([identityMiddleware])
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'product.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().product.findUniqueOrThrow({
      where: data,
      select: {
        id: true,
        version: true,
        price: true,
        stock: true,
        forSale: true,
        category: true,
        imageUrl: true,
      },
    })
  })
export const saveProductSale = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('commerce')])
  .middleware([identityMiddleware])
  .validator(saleInputSchema)
  .handler(
    async ({
      context,
      data: { productId, expectedVersion, expectedStock, reason, ...data },
    }) => {
      if (!hasPermission(context.principal, 'product.write'))
        rejectRequest(403, 'Forbidden')
      requireSameOrigin()
      return getPrisma().$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${productId}::uuid FOR UPDATE`
        const current = await tx.product.findUniqueOrThrow({
          where: { id: productId },
        })
        if (
          current.version !== expectedVersion ||
          current.stock !== expectedStock
        )
          rejectRequest(
            409,
            'Price or stock changed. Reload the latest values before adjusting.',
          )
        if (current.archivedAt && data.forSale)
          rejectRequest(409, 'Restore this product before enabling sales')
        const product = await tx.product.update({
          where: { id: productId },
          data: { ...data, version: { increment: 1 } },
        })
        if (current.stock !== data.stock)
          await tx.inventoryMovement.create({
            data: {
              productId,
              delta: data.stock - current.stock,
              balance: data.stock,
              reason,
              actorId: context.principal.userId,
            },
          })
        await tx.auditEvent.create({
          data: {
            entityType: 'product',
            entityId: productId,
            action: 'sale-settings',
            actorId: context.principal.userId,
            summary: reason,
          },
        })
        return { id: product.id }
      })
    },
  )
export const quoteCart = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('commerce')])
  .validator(cartSchema)
  .handler(async ({ data }) => {
    const products = await getPrisma().product.findMany({
      where: {
        id: { in: data.map((l) => l.productId) },
        ...purchasable(),
        options: {
          none: { ...activeOptions, publishedAt: { lte: new Date() } },
        },
      },
      select: { id: true, name: true, price: true, stock: true },
    })
    const lines = data.map((line) => {
      const p = products.find((product) => product.id === line.productId)
      if (!p || p.stock < line.quantity)
        rejectRequest(409, 'A product is unavailable or has insufficient stock')
      return { ...line, name: p.name, price: p.price }
    })
    return {
      lines,
      ...checkoutTotals(
        orderTotal(lines),
        commercePolicy.shippingFee,
        commercePolicy.taxBasisPoints,
      ),
      currency: commercePolicy.currency,
      onlinePayment: Boolean(
        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
      ),
    }
  })
export const placeOrder = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('commerce')])
  .validator(checkoutSchema)
  .handler(async ({ data: { key, ...data } }) => {
    requireSameOrigin()
    await throttle('order', data.email)
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
      if (await tx.closedCheckoutKey.findUnique({ where: { requestHash } }))
        rejectRequest(
          409,
          'This checkout attempt was closed. Start a new checkout.',
        )
      const lines = []
      // Stable locking order prevents deadlocks across multi-product carts.
      for (const line of [...data.lines].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      )) {
        await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${line.productId}::uuid FOR UPDATE`
        const product = await tx.product.findFirst({
          where: {
            id: line.productId,
            ...purchasable(),
            options: {
              none: { ...activeOptions, publishedAt: { lte: new Date() } },
            },
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
        const remaining = await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: line.quantity },
            version: { increment: 1 },
          },
        })
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            delta: -line.quantity,
            balance: remaining.stock,
            reason: 'Order placed',
            reference: requestHash,
          },
        })
      }
      const totalAmount = checkoutTotals(
        orderTotal(lines),
        commercePolicy.shippingFee,
        commercePolicy.taxBasisPoints,
      ).totalAmount
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
          ...checkoutTotals(
            orderTotal(lines),
            commercePolicy.shippingFee,
            commercePolicy.taxBasisPoints,
          ),
          currency: commercePolicy.currency,
          lines: { create: lines },
        },
      })
      await tx.inventoryMovement.updateMany({
        where: { reference: requestHash, reason: 'Order placed' },
        data: { reference: order.id },
      })
      await tx.auditEvent.create({
        data: {
          entityType: 'order',
          entityId: order.id,
          action: 'placed',
          summary: 'Order placed and stock reserved',
        },
      })
      return { reference: order.id, totalAmount }
    })
  })
export const getOrders = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('commerce')])
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'commerce.read'))
      rejectRequest(403, 'Forbidden')
    const orders = await getPrisma().order.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        totalAmount: true,
        currency: true,
        status: true,
        paid: true,
        paymentPending: true,
        createdAt: true,
        lines: true,
        carrier: true,
        trackingNumber: true,
        fulfilledAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    const events = await getPrisma().auditEvent.findMany({
      where: { entityType: 'order', entityId: { in: orders.map((o) => o.id) } },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    })
    return orders.map((o) => ({
      ...o,
      events: events.filter((e) => e.entityId === o.id).slice(0, 20),
    }))
  })
export const updateOrder = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('commerce')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(['FULFILLED', 'CANCELLED']),
      carrier: z.string().trim().max(100).default(''),
      trackingNumber: z.string().trim().max(150).default(''),
      note: z.string().trim().min(5).max(300),
    }),
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
      if (data.status === 'FULFILLED' && (!order.paid || order.paymentPending))
        rejectRequest(
          409,
          'Record settled payment before fulfilling this order',
        )
      if (data.status === 'CANCELLED' && (order.paid || order.paymentPending))
        rejectRequest(
          409,
          'A paid order requires a refund workflow before cancellation',
        )
      if (data.status === 'CANCELLED')
        for (const line of [...order.lines].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        )) {
          const product = await tx.product.update({
            where: { id: line.productId },
            data: {
              stock: { increment: line.quantity },
              version: { increment: 1 },
            },
          })
          await tx.inventoryMovement.create({
            data: {
              productId: line.productId,
              delta: line.quantity,
              balance: product.stock,
              reason: 'Order cancelled',
              reference: order.id,
              actorId: context.principal.userId,
            },
          })
        }
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: data.status,
          ...(data.status === 'FULFILLED'
            ? {
                carrier: data.carrier,
                trackingNumber: data.trackingNumber,
                fulfilledAt: new Date(),
              }
            : {}),
        },
      })
      await tx.auditEvent.create({
        data: {
          entityType: 'order',
          entityId: order.id,
          action: data.status.toLowerCase(),
          actorId: context.principal.userId,
          summary: data.note,
        },
      })
      return { ok: true }
    })
  })
export const recordOfflinePayment = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('commerce')])
  .middleware([identityMiddleware])
  .validator(
    z.object({ id: z.uuid(), reference: z.string().trim().min(3).max(150) }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'commerce.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${data.id}::uuid FOR UPDATE`
      const order = await tx.order.findUniqueOrThrow({ where: { id: data.id } })
      if (order.paid) return
      if (order.status === 'CANCELLED' || order.paymentPending)
        rejectRequest(409, 'This order cannot accept an offline payment')
      await tx.order.update({ where: { id: data.id }, data: { paid: true } })
      await tx.auditEvent.create({
        data: {
          entityType: 'order',
          entityId: data.id,
          action: 'payment-recorded',
          actorId: context.principal.userId,
          summary: 'Offline payment: ' + data.reference,
        },
      })
    })
    return { ok: true }
  })

export const recoverCheckout = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('commerce')])
  .validator(z.object({ key: z.string().regex(/^[a-f0-9]{64}$/) }))
  .handler(async ({ data }) => {
    requireSameOrigin()
    const requestHash = await hashSessionToken(data.key)
    return getPrisma().$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestHash}, 0))`
      const order = await tx.order.findUnique({
        where: { requestHash },
        select: { id: true, totalAmount: true },
      })
      if (order) return { reference: order.id, totalAmount: order.totalAmount }
      // Permanently close an absent attempt before permitting a new key. A delayed original request cannot create a duplicate.
      await tx.closedCheckoutKey.upsert({
        where: { requestHash },
        update: {},
        create: { requestHash },
      })
      return null
    })
  })
