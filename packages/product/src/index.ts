import { z } from 'zod'

export const productStatuses = ['DRAFT', 'PUBLISHED'] as const

export const productSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug')

export const mediaSchema = z
  .array(
    z.object({
      url: z
        .url()
        .max(2000)
        .refine((value) => {
          const url = new URL(value)
          return url.protocol === 'https:' && !url.username && !url.password
        }, 'Use a public HTTPS image URL'),
      alt: z.string().trim().min(1).max(200),
    }),
  )
  .max(12)
export const specificationSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(80),
      value: z.string().trim().min(1).max(300),
    }),
  )
  .max(30)
  .refine(
    (rows) =>
      new Set(rows.map((row) => row.label.toLowerCase())).size === rows.length,
    'Specification names must be unique',
  )

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: productSlugSchema,
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(100_000),
  status: z.enum(productStatuses),
  sku: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-zA-Z0-9._-]*$/)
    .default(''),
  brand: z.string().trim().max(100).default(''),
  unit: z.string().trim().min(1).max(30).default('piece'),
  category: z.string().trim().max(100).default(''),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  gallery: mediaSchema.default([]),
  specifications: specificationSchema.default([]),
  seoTitle: z.string().trim().max(70).default(''),
  seoDescription: z.string().trim().max(170).default(''),
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
