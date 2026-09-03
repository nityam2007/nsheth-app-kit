import { z } from 'zod'

export const publicationStates = ['DRAFT', 'PUBLISHED'] as const

export const postSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug')

export const postInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: postSlugSchema,
  excerpt: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(100_000),
  status: z.enum(publicationStates),
})

export type PostInput = z.infer<typeof postInputSchema>
