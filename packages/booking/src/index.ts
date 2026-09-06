import { z } from 'zod'

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const timezoneSchema = z
  .string()
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value })
      return true
    } catch {
      return false
    }
  }, 'Use an IANA timezone')
export function withinBookingWindow(
  startsAt: Date,
  policy: { minLeadHours: number; maxAdvanceDays: number },
  now = new Date(),
) {
  const hours = (startsAt.getTime() - now.getTime()) / 3600000
  return hours > policy.minLeadHours && hours <= policy.maxAdvanceDays * 24
}
export const serviceInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: slugSchema,
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(100_000),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  durationMinutes: z.number().int().min(5).max(1440),
  timezone: timezoneSchema.default('Asia/Kolkata'),
  location: z.string().trim().max(300).default(''),
  policy: z.string().trim().max(4000).default(''),
  minLeadHours: z.number().int().min(0).max(720).default(0),
  maxAdvanceDays: z.number().int().min(1).max(3650).default(365),
  cancelNoticeHours: z.number().int().min(0).max(720).default(24),
})
export const slotInputSchema = z.object({
  serviceId: z.uuid(),
  startsAt: z.iso.datetime(),
  capacity: z.number().int().min(1).max(100),
})
export const bookingInputSchema = z.object({
  key: z.string().regex(/^[a-f0-9]{64}$/),
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
