import { z } from 'zod'

export const productStatuses = ['DRAFT', 'PUBLISHED'] as const

export const productSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug')

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: productSlugSchema,
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(100_000),
  status: z.enum(productStatuses),
})

export const enquiryInputSchema = z.object({
  productId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  quantity: z.number().int().min(1).max(1_000_000),
  message: z.string().trim().min(10).max(2_000),
})

export type ProductInput = z.infer<typeof productInputSchema>
export type EnquiryInput = z.infer<typeof enquiryInputSchema>
