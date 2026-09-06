import { postInputSchema, postSlugSchema } from '@nsheth/content'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'
import type { PostInput } from '@nsheth/content'
import type { Post } from './generated/prisma/client'

function publication(data: PostInput) {
  if (data.coverUrl && !data.coverAlt)
    rejectRequest(400, 'Add alternative text for the cover image')
  return {
    ...data,
    publishedAt:
      data.status === 'PUBLISHED'
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : null,
  }
}
function snapshot(post: Post) {
  return postInputSchema.parse({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? '',
  })
}
const visible = () => ({
  status: 'PUBLISHED' as const,
  publishedAt: { not: null, lte: new Date() },
})
const metadata = {
  author: true,
  coverUrl: true,
  coverAlt: true,
  tags: true,
  seoTitle: true,
  seoDescription: true,
} as const
export const getAdminPosts = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    if (!hasPermission(context.principal, 'content.read'))
      rejectRequest(403, 'Forbidden')
    const posts = await getPrisma().post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 500,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        author: true,
        tags: true,
      },
    })
    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString().slice(0, 10),
      updatedAt: post.updatedAt.toISOString().slice(0, 10),
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }))
  })
export const createAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(postInputSchema)
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().post.create({
      data: publication(data),
      select: { slug: true },
    })
  })
export const getAdminPost = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: postSlugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.read'))
      rejectRequest(403, 'Forbidden')
    const post = await getPrisma().post.findUnique({
      where: data,
      include: {
        revisions: {
          orderBy: { version: 'desc' },
          take: 30,
          select: { id: true, version: true, createdAt: true },
        },
      },
    })
    return post
      ? {
          ...post,
          createdAt: post.createdAt.toISOString().slice(0, 10),
          updatedAt: post.updatedAt.toISOString().slice(0, 10),
          publishedAt: post.publishedAt?.toISOString() ?? '',
        }
      : null
  })
export const updateAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    postInputSchema.extend({
      currentSlug: postSlugSchema,
      expectedVersion: z.number().int().positive(),
    }),
  )
  .handler(
    async ({ context, data: { currentSlug, expectedVersion, ...data } }) => {
      if (!hasPermission(context.principal, 'content.write'))
        rejectRequest(403, 'Forbidden')
      requireSameOrigin()
      return getPrisma().$transaction(async (tx) => {
        const current = await tx.post.findUniqueOrThrow({
          where: { slug: currentSlug },
        })
        const changed = await tx.post.updateMany({
          where: { id: current.id, version: expectedVersion },
          data: { ...publication(data), version: { increment: 1 } },
        })
        if (!changed.count)
          rejectRequest(
            409,
            'Another editor changed this post. Refresh before saving.',
          )
        await tx.postRevision.create({
          data: {
            postId: current.id,
            version: current.version,
            snapshot: snapshot(current),
            actorId: context.principal.userId,
          },
        })
        return { slug: data.slug }
      })
    },
  )
export const restorePostRevision = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({
      postId: z.uuid(),
      revisionId: z.uuid(),
      expectedVersion: z.number().int().positive(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const revision = await tx.postRevision.findFirstOrThrow({
        where: { id: data.revisionId, postId: data.postId },
      })
      const current = await tx.post.findUniqueOrThrow({
        where: { id: data.postId },
      })
      const restored = postInputSchema.parse(revision.snapshot)
      // Keep the canonical URL; restoring old content must not break current links.
      const changed = await tx.post.updateMany({
        where: { id: data.postId, version: data.expectedVersion },
        data: {
          ...publication({ ...restored, slug: current.slug, status: 'DRAFT' }),
          version: { increment: 1 },
        },
      })
      if (!changed.count)
        rejectRequest(409, 'Post changed. Refresh before restoring.')
      await tx.postRevision.create({
        data: {
          postId: current.id,
          version: current.version,
          snapshot: snapshot(current),
          actorId: context.principal.userId,
        },
      })
      return { slug: current.slug }
    })
  })
export const deleteAdminPost = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({
      slug: postSlugSchema,
      expectedVersion: z.number().int().positive(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'content.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    const result = await getPrisma().post.deleteMany({
      where: { slug: data.slug, version: data.expectedVersion },
    })
    if (!result.count)
      rejectRequest(409, 'Post changed. Refresh before deleting.')
    return { ok: true }
  })
export const getPublishedPosts = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await getPrisma().post.findMany({
      where: visible(),
      orderBy: { publishedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        ...metadata,
      },
    })
    return rows.map((post) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? '',
    }))
  },
)
export const getPublishedPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: postSlugSchema }))
  .handler(async ({ data }) => {
    const post = await getPrisma().post.findFirst({
      where: { ...visible(), ...data },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        publishedAt: true,
        ...metadata,
      },
    })
    return post
      ? {
          ...post,
          publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? '',
        }
      : null
  })
