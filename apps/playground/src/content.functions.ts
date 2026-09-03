import { postInputSchema, postSlugSchema } from '@nsheth/content'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getPrisma } from './db'
import { identityMiddleware, requireSameOrigin } from './identity.functions'

function reject(status: number, message: string): never {
  setResponseStatus(status)
  throw new Error(message)
}

export const getAdminPosts = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'content.read')) {
      reject(403, 'Forbidden')
    }

    const posts = await getPrisma().post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        publishedAt: true,
      },
    })

    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString().slice(0, 10),
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? null,
    }))
  })

export const createAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(postInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write')) {
      reject(403, 'Forbidden')
    }

    requireSameOrigin()

    const post = await getPrisma().post.create({
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      select: { id: true },
    })

    return post
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
