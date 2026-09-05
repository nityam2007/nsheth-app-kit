import { z } from 'zod'

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const serviceInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: slugSchema,
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(100_000),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  durationMinutes: z.number().int().min(5).max(1440),
})
export const slotInputSchema = z.object({
  serviceId: z.uuid(),
  startsAt: z.iso.datetime(),
  capacity: z.number().int().min(1).max(100),
})
export const bookingInputSchema = z.object({
  slotId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  notes: z.string().trim().max(2000),
})
export const bookingStatuses = ['REQUESTED', 'CONFIRMED', 'CANCELLED'] as const
export function canTransitionBooking(from: string, to: string) {
  return (
    (from === 'REQUESTED' && (to === 'CONFIRMED' || to === 'CANCELLED')) ||
    (from === 'CONFIRMED' && to === 'CANCELLED')
  )
}
export function hasCapacity(capacity: number, reserved: number, quantity = 1) {
  return (
    Number.isInteger(quantity) &&
    quantity > 0 &&
    reserved + quantity <= capacity
  )
}
export type ServiceInput = z.infer<typeof serviceInputSchema>
