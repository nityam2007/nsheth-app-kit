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
  expectedVersion: z.number().int().min(1),
  expectedStock: z.number().int().min(0),
  reason: z.string().trim().min(5).max(200),
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

export function checkoutTotals(
  subtotal: number,
  shippingFee: number,
  taxBasisPoints: number,
) {
  for (const value of [subtotal, shippingFee, taxBasisPoints])
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error('Invalid pricing policy')
  if (taxBasisPoints > 10000) throw new Error('Invalid tax rate')
  const taxAmount = Math.round((subtotal * taxBasisPoints) / 10000),
    totalAmount = orderTotal([
      { quantity: 1, price: subtotal },
      { quantity: 1, price: shippingFee },
      { quantity: 1, price: taxAmount },
    ])
  return { subtotal, shippingFee, taxAmount, totalAmount }
}
