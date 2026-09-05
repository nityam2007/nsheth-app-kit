import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const propertyInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug,
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(100_000),
  location: z.string().trim().min(2).max(200),
  timezone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value })
      return true
    } catch {
      return false
    }
  }, 'Use an IANA timezone'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})
export const roomInputSchema = z.object({
  propertyId: z.uuid(),
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(2000),
  inventory: z.number().int().min(1).max(500),
  maxGuests: z.number().int().min(1).max(20),
  nightlyRate: z.number().int().min(0).max(10_000_000),
  active: z.boolean(),
})
export const stayDatesSchema = z
  .object({ checkIn: z.iso.date(), checkOut: z.iso.date() })
  .refine((d) => {
    const nights = (Date.parse(d.checkOut) - Date.parse(d.checkIn)) / 86400000
    return nights >= 1 && nights <= 30
  }, 'Stays must be between 1 and 30 nights')
export const reservationInputSchema = stayDatesSchema.safeExtend({
  roomTypeId: z.uuid(),
  guests: z.number().int().min(1).max(20),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
})
export function stayNights(checkIn: string, checkOut: string) {
  const dates: Array<string> = []
  for (let at = Date.parse(checkIn); at < Date.parse(checkOut); at += 86400000)
    dates.push(new Date(at).toISOString().slice(0, 10))
  return dates
}
export function peakOccupancy(
  checkIn: string,
  checkOut: string,
  stays: ReadonlyArray<{ checkIn: Date; checkOut: Date }>,
) {
  return Math.max(
    0,
    ...stayNights(checkIn, checkOut).map(
      (day) =>
        stays.filter(
          (s) =>
            s.checkIn.getTime() <= Date.parse(day) &&
            s.checkOut.getTime() > Date.parse(day),
        ).length,
    ),
  )
}
export function todayInTimezone(timezone: string, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
export type PropertyInput = z.infer<typeof propertyInputSchema>
