import { postInputSchema, postSlugSchema } from '@nsheth/content'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { publicationDate } from './publication'
import { rejectRequest, requireSameOrigin } from './server-utils'

const adminPostSchema = postInputSchema.extend({
  currentSlug: postSlugSchema,
})

export const getAdminPosts = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'content.read')) {
      rejectRequest(403, 'Forbidden')
    }

    const posts = await getPrisma().post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    })

    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString().slice(0, 10),
      updatedAt: post.updatedAt.toISOString().slice(0, 10),
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? null,
    }))
  })

export const createAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(postInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()

    return getPrisma().post.create({
      data: {
        ...data,
        publishedAt: publicationDate(data.status, null),
      },
      select: { slug: true },
    })
  })

export const getAdminPost = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: postSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.read')) {
      rejectRequest(403, 'Forbidden')
    }

    const post = await getPrisma().post.findUnique({
      where: { slug: data.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    })

    return post
      ? {
          ...post,
          createdAt: post.createdAt.toISOString().slice(0, 10),
          updatedAt: post.updatedAt.toISOString().slice(0, 10),
          publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? null,
        }
      : null
  })

export const updateAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(adminPostSchema)
  .handler(async ({ context, data: { currentSlug, ...data } }) => {
    if (!hasPermission(context.principal, 'content.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()

    const current = await getPrisma().post.findUnique({
      where: { slug: currentSlug },
      select: { publishedAt: true },
    })
    if (!current) rejectRequest(404, 'Post not found')

    return getPrisma().post.update({
      where: { slug: currentSlug },
      data: {
        ...data,
        publishedAt: publicationDate(data.status, current.publishedAt),
      },
      select: { slug: true },
    })
  })

export const deleteAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: postSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write')) {
      rejectRequest(403, 'Forbidden')
    }

    requireSameOrigin()
    await getPrisma().post.delete({ where: { slug: data.slug } })
    return { ok: true }
  })

export const getPublishedPosts = createServerFn({ method: 'GET' }).handler(
  async () => {
    const posts = await getPrisma().post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    })

    return posts.map((post) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? '',
    }))
  },
)

export const getPublishedPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: postSlugSchema }))
  .handler(async ({ data }) => {
    const post = await getPrisma().post.findFirst({
      where: {
        slug: data.slug,
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: new Date() },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        publishedAt: true,
      },
    })

    return post
      ? {
          ...post,
          publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? '',
        }
      : null
  })
