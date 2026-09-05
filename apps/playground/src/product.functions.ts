import { throttle } from './throttle.server'
import {
  enquiryInputSchema,
  productInputSchema,
  productSlugSchema,
} from '@nsheth/product'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { publicationDate } from './publication'
import { rejectRequest, requireSameOrigin } from './server-utils'

const adminProductSchema = productInputSchema.extend({
  currentSlug: productSlugSchema,
})

export const getAdminProducts = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'product.read')) {
      rejectRequest(403, 'Forbidden')
    }

    const products = await getPrisma().product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    })

    return products.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString().slice(0, 10),
      updatedAt: product.updatedAt.toISOString().slice(0, 10),
      publishedAt: product.publishedAt?.toISOString().slice(0, 10) ?? null,
    }))
  })

export const createAdminProduct = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(productInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()

    return getPrisma().product.create({
      data: {
        ...data,
        publishedAt: publicationDate(data.status, null),
      },
      select: { slug: true },
    })
  })

export const getAdminProduct = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: productSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.read')) {
      rejectRequest(403, 'Forbidden')
    }

    const product = await getPrisma().product.findUnique({
      where: { slug: data.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        _count: { select: { enquiries: true } },
      },
    })

    if (!product) return null

    const { _count, ...fields } = product
    return {
      ...fields,
      enquiryCount: _count.enquiries,
      createdAt: product.createdAt.toISOString().slice(0, 10),
      updatedAt: product.updatedAt.toISOString().slice(0, 10),
      publishedAt: product.publishedAt?.toISOString().slice(0, 10) ?? null,
    }
  })

export const updateAdminProduct = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(adminProductSchema)
  .handler(async ({ context, data: { currentSlug, ...data } }) => {
    if (!hasPermission(context.principal, 'product.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()

    const current = await getPrisma().product.findUnique({
      where: { slug: currentSlug },
      select: { publishedAt: true },
    })
    if (!current) rejectRequest(404, 'Product not found')

    return getPrisma().product.update({
      where: { slug: currentSlug },
      data: {
        ...data,
        publishedAt: publicationDate(data.status, current.publishedAt),
      },
      select: { slug: true },
    })
  })

export const deleteAdminProduct = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: productSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()

    const product = await getPrisma().product.findUnique({
      where: { slug: data.slug },
      select: { _count: { select: { enquiries: true } } },
    })
    if (!product) rejectRequest(404, 'Product not found')
    if (product._count.enquiries) {
      rejectRequest(409, 'Products with enquiries cannot be deleted')
    }

    await getPrisma().product.delete({ where: { slug: data.slug } })
    return { ok: true }
  })

export const getPublishedProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    const products = await getPrisma().product.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
      },
    })

    return products
  },
)

export const getPublishedProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: productSlugSchema }))
  .handler(({ data }) =>
    getPrisma().product.findFirst({
      where: {
        slug: data.slug,
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: new Date() },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        description: true,
      },
    }),
  )

export const submitProductEnquiry = createServerFn({ method: 'POST' })
  .validator(enquiryInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    await throttle('enquiry', data.email)

    const product = await getPrisma().product.findFirst({
      where: {
        id: data.productId,
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: new Date() },
      },
      select: { id: true },
    })

    if (!product) rejectRequest(404, 'Product not found')

    await getPrisma().enquiry.create({ data })

    return { ok: true }
  })
