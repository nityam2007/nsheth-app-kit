import { z } from 'zod'

export const cartLineSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(99),
})
export const cartSchema = z
  .array(cartLineSchema)
  .min(1)
  .max(50)
  .refine(
    (lines) => new Set(lines.map((l) => l.productId)).size === lines.length,
    'Each product may appear once',
  )
export const checkoutSchema = z.object({
  expectedTotal: z.number().int().min(0).max(2_000_000_000),
  key: z.string().regex(/^[a-f0-9]{64}$/),
  lines: cartSchema,
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  address: z.string().trim().min(10).max(1000),
})
export const saleInputSchema = z.object({
  productId: z.uuid(),
  price: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  forSale: z.boolean(),
  category: z.string().trim().max(100),
  imageUrl: z.union([
    z.literal(''),
    z
      .url()
      .max(2000)
      .refine(
        (v) => new URL(v).protocol === 'https:',
        'Use an HTTPS image URL',
      ),
  ]),
})
export function orderTotal(
  lines: ReadonlyArray<{ quantity: number; price: number }>,
) {
  const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0)
  if (!Number.isSafeInteger(total) || total < 0 || total > 2_000_000_000)
    throw new Error('Order total is outside supported limits')
  return total
}
export function canTransitionOrder(from: string, to: string) {
  return from === 'PLACED' && (to === 'FULFILLED' || to === 'CANCELLED')
}
export type CartLine = z.infer<typeof cartLineSchema>
