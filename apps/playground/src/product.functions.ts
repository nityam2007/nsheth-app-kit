import { moduleMiddleware } from './module.middleware'
import {
  enquiryInputSchema,
  productInputSchema,
  productSlugSchema,
  mediaSchema,
  specificationSchema,
} from '@nsheth/product'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { publicationDate } from './publication'
import { rejectRequest, requireSameOrigin } from './server-utils'
import { throttle } from './throttle.server'

const publicWhere = () => ({
  status: 'PUBLISHED' as const,
  archivedAt: null,
  publishedAt: { not: null, lte: new Date() },
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
})
const detailSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  description: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  sku: true,
  brand: true,
  unit: true,
  category: true,
  tags: true,
  gallery: true,
  specifications: true,
  seoTitle: true,
  seoDescription: true,
  version: true,
  archivedAt: true,
  parentId: true,
  optionLabel: true,
  imageUrl: true,
  price: true,
  stock: true,
} as const
const normalize = (p: { gallery: unknown; specifications: unknown }) => ({
  gallery: mediaSchema.catch([]).parse(p.gallery),
  specifications: specificationSchema.catch([]).parse(p.specifications),
})
export const getAdminProducts = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'product.read'))
      rejectRequest(403, 'Forbidden')
    const products = await getPrisma().product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        sku: true,
        stock: true,
        category: true,
        archivedAt: true,
        parentId: true,
      },
    })
    return products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString().slice(0, 10),
      updatedAt: p.updatedAt.toISOString().slice(0, 10),
      publishedAt: p.publishedAt?.toISOString().slice(0, 10) ?? null,
    }))
  })
export const createAdminProduct = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(productInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().product.create({
      data: {
        ...data,
        sku: data.sku || null,
        imageUrl: data.gallery[0]?.url ?? '',
        publishedAt: publicationDate(data.status, null),
      },
      select: { slug: true },
    })
  })
export const getAdminProduct = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(z.object({ slug: productSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.read'))
      rejectRequest(403, 'Forbidden')
    const p = await getPrisma().product.findUnique({
      where: data,
      select: {
        ...detailSelect,
        _count: {
          select: { enquiries: true, orderLines: true, movements: true },
        },
        options: {
          select: {
            id: true,
            slug: true,
            name: true,
            optionLabel: true,
            sku: true,
            status: true,
            price: true,
            stock: true,
            archivedAt: true,
          },
        },
        parent: { select: { slug: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' }, take: 30 },
      },
    })
    if (!p) return null
    return {
      ...p,
      ...normalize(p),
      sku: p.sku ?? '',
      enquiryCount: p._count.enquiries,
      historyCount:
        p._count.enquiries + p._count.orderLines + p._count.movements,
      createdAt: p.createdAt.toISOString().slice(0, 10),
      updatedAt: p.updatedAt.toISOString().slice(0, 10),
      publishedAt: p.publishedAt?.toISOString().slice(0, 10) ?? null,
    }
  })
export const updateAdminProduct = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(
    productInputSchema.extend({
      currentSlug: productSlugSchema,
      expectedVersion: z.number().int().min(1),
    }),
  )
  .handler(
    async ({ context, data: { currentSlug, expectedVersion, ...data } }) => {
      if (!hasPermission(context.principal, 'product.write'))
        rejectRequest(403, 'Forbidden')
      requireSameOrigin()
      return getPrisma().$transaction(async (tx) => {
        const current = await tx.product.findUnique({
          where: { slug: currentSlug },
        })
        if (!current) rejectRequest(404, 'Product not found')
        if (current.archivedAt && data.status === 'PUBLISHED')
          rejectRequest(409, 'Restore this product before publishing')
        const result = await tx.product.updateMany({
          where: { id: current.id, version: expectedVersion },
          data: {
            ...data,
            sku: data.sku || null,
            imageUrl: data.gallery[0]?.url ?? current.imageUrl,
            publishedAt: publicationDate(data.status, current.publishedAt),
            version: { increment: 1 },
          },
        })
        if (!result.count)
          rejectRequest(
            409,
            'This product changed since you opened it. Reload before saving.',
          )
        await tx.auditEvent.create({
          data: {
            entityType: 'product',
            entityId: current.id,
            actorId: context.principal.userId,
            action: 'edited',
            summary: 'Product details updated',
          },
        })
        return { slug: data.slug }
      })
    },
  )
export const deleteAdminProduct = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(z.object({ slug: productSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    const p = await getPrisma().product.findUnique({
      where: data,
      include: {
        _count: {
          select: {
            enquiries: true,
            orderLines: true,
            options: true,
            movements: true,
          },
        },
      },
    })
    if (!p) rejectRequest(404, 'Product not found')
    if (Object.values(p._count).some(Boolean))
      rejectRequest(
        409,
        'This product has options or activity. Retire it instead of deleting.',
      )
    await getPrisma().product.delete({ where: { id: p.id } })
    return { ok: true }
  })
export const changeProductLifecycle = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      expectedVersion: z.number().int().min(1),
      action: z.enum(['retire', 'restore', 'copy']),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const p = await tx.product.findUniqueOrThrow({ where: { id: data.id } })
      if (p.version !== data.expectedVersion)
        rejectRequest(409, 'This product changed. Reload before continuing.')
      if (data.action === 'copy') {
        const copy = await tx.product.create({
          data: {
            name: p.name.slice(0, 150) + ' copy',
            slug: p.slug.slice(0, 140) + '-' + crypto.randomUUID().slice(0, 8),
            summary: p.summary,
            description: p.description,
            brand: p.brand,
            unit: p.unit,
            category: p.category,
            tags: p.tags,
            gallery: p.gallery ?? [],
            specifications: p.specifications ?? [],
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            price: p.price,
            imageUrl: p.imageUrl,
          },
        })
        return { slug: copy.slug }
      }
      const result = await tx.product.updateMany({
        where: { id: p.id, version: data.expectedVersion },
        data: {
          archivedAt: data.action === 'retire' ? new Date() : null,
          status: 'DRAFT',
          publishedAt: null,
          forSale: false,
          version: { increment: 1 },
        },
      })
      if (!result.count)
        rejectRequest(409, 'This product changed. Reload before continuing.')
      await tx.auditEvent.create({
        data: {
          entityType: 'product',
          entityId: p.id,
          actorId: context.principal.userId,
          action: data.action,
          summary: 'Publication and sale disabled',
        },
      })
      return { slug: p.slug }
    })
  })
export const createProductOption = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      parentId: z.uuid(),
      label: z.string().trim().min(1).max(80),
      sku: z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-zA-Z0-9._-]+$/),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'product.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${data.parentId}::uuid FOR UPDATE`
      const p = await tx.product.findUniqueOrThrow({
        where: { id: data.parentId },
        include: { _count: { select: { options: true } } },
      })
      if (p.parentId || p.archivedAt || p._count.options >= 50)
        rejectRequest(409, 'Choose an active parent with fewer than 50 options')
      if (
        await tx.product.count({
          where: {
            parentId: p.id,
            optionLabel: { equals: data.label, mode: 'insensitive' },
          },
        })
      )
        rejectRequest(409, 'This option label already exists')
      return tx.product.create({
        data: {
          parentId: p.id,
          optionLabel: data.label,
          sku: data.sku,
          name: p.name.slice(0, 75) + ' / ' + data.label,
          slug: p.slug.slice(0, 140) + '-' + crypto.randomUUID().slice(0, 8),
          summary: p.summary,
          description: p.description,
          brand: p.brand,
          unit: p.unit,
          category: p.category,
          gallery: p.gallery ?? [],
          specifications: p.specifications ?? [],
          imageUrl: p.imageUrl,
          price: p.price,
        },
        select: { slug: true },
      })
    })
  })
export const getPublishedProducts = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('product')])
  .handler(() =>
    getPrisma().product.findMany({
      where: {
        ...publicWhere(),
        publishedAt: { lte: new Date() },
        parentId: null,
      },
      orderBy: { publishedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        category: true,
        brand: true,
        imageUrl: true,
        tags: true,
      },
    }),
  )
export const getPublishedProduct = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('product')])
  .validator(z.object({ slug: productSlugSchema }))
  .handler(async ({ data }) => {
    const p = await getPrisma().product.findFirst({
      where: { ...publicWhere(), ...data, publishedAt: { lte: new Date() } },
      select: {
        ...detailSelect,
        options: {
          where: {
            status: 'PUBLISHED',
            archivedAt: null,
            publishedAt: { lte: new Date() },
          },
          select: { slug: true, name: true, optionLabel: true },
        },
      },
    })
    return p ? { ...p, ...normalize(p) } : null
  })
export const submitProductEnquiry = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('product')])
  .validator(enquiryInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    await throttle('enquiry', data.email)
    const p = await getPrisma().product.findFirst({
      where: {
        ...publicWhere(),
        id: data.productId,
        publishedAt: { lte: new Date() },
      },
      select: { id: true },
    })
    if (!p) rejectRequest(404, 'Product not found')
    const enquiry = await getPrisma().enquiry.create({ data })
    return { ok: true, reference: enquiry.id }
  })
