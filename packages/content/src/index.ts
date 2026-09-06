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
  author: z.string().trim().max(120).default(''),
  coverUrl: z
    .union([
      z.literal(''),
      z.url().refine((value) => {
        const url = new URL(value)
        return url.protocol === 'https:' && !url.username && !url.password
      }, 'Use an HTTPS image URL'),
    ])
    .default(''),
  coverAlt: z.string().trim().max(200).default(''),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  seoTitle: z.string().trim().max(70).default(''),
  seoDescription: z.string().trim().max(180).default(''),
  publishedAt: z.union([z.literal(''), z.iso.datetime()]).default(''),
})

export type PostInput = z.infer<typeof postInputSchema>

export type ArticleBlock =
  | { type: 'heading' | 'subheading' | 'quote' | 'paragraph'; text: string }
  | { type: 'list'; items: Array<string> }
// Deliberately small plain-text grammar. HTML and inline syntax remain escaped text.
export function articleBlocks(body: string): Array<ArticleBlock> {
  return body
    .replaceAll('\r', '')
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith('### '))
        return { type: 'subheading', text: chunk.slice(4) }
      if (chunk.startsWith('## '))
        return { type: 'heading', text: chunk.slice(3) }
      const lines = chunk.split('\n')
      if (lines.every((line) => line.startsWith('- ')))
        return { type: 'list', items: lines.map((line) => line.slice(2)) }
      if (lines.every((line) => line.startsWith('> ')))
        return {
          type: 'quote',
          text: lines.map((line) => line.slice(2)).join('\n'),
        }
      return { type: 'paragraph', text: chunk }
    })
}
