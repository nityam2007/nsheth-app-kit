import { throttle } from './throttle.server'
import {
  bookingInputSchema,
  bookingStatuses,
  canTransitionBooking,
  hasCapacity,
  serviceInputSchema,
  slotInputSchema,
  slugSchema,
} from '@nsheth/booking'
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const getAdminServices = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'booking.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().service.findMany({ orderBy: { name: 'asc' } })
  })
export const getAdminService = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: slugSchema }))
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().service.findUnique({
      where: data,
      include: {
        slots: {
          orderBy: { startsAt: 'asc' },
          include: { _count: { select: { bookings: true } } },
        },
      },
    })
  })
export const saveAdminService = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(serviceInputSchema.extend({ currentSlug: slugSchema.optional() }))
  .handler(({ context, data: { currentSlug, ...data } }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return currentSlug
      ? getPrisma().service.update({ where: { slug: currentSlug }, data })
      : getPrisma().service.create({ data })
  })
export const deleteAdminService = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ slug: slugSchema }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    // Foreign keys prevent deletion of any service with booking history.
    await getPrisma().service.delete({ where: data })
    return { ok: true }
  })
export const addAvailability = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(slotInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    if (new Date(data.startsAt) <= new Date())
      rejectRequest(400, 'Choose a future time')
    const service = await getPrisma().service.findUniqueOrThrow({
      where: { id: data.serviceId },
    })
    return getPrisma().availabilitySlot.create({
      data: {
        ...data,
        endsAt: new Date(
          new Date(data.startsAt).getTime() + service.durationMinutes * 60_000,
        ),
      },
    })
  })
export const removeAvailability = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().availabilitySlot.delete({ where: data })
    return { ok: true }
  })
export const getServices = createServerFn({ method: 'GET' }).handler(() =>
  getPrisma().service.findMany({
    where: { status: 'PUBLISHED' },
    select: { name: true, slug: true, summary: true, durationMinutes: true },
    orderBy: { name: 'asc' },
  }),
)
export const getService = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: slugSchema }))
  .handler(async ({ data }) => {
    const service = await getPrisma().service.findFirst({
      where: { ...data, status: 'PUBLISHED' },
      include: {
        slots: {
          where: { startsAt: { gt: new Date() } },
          orderBy: { startsAt: 'asc' },
          include: {
            _count: {
              select: { bookings: { where: { status: { not: 'CANCELLED' } } } },
            },
          },
        },
      },
    })
    if (!service) return null
    return {
      name: service.name,
      slug: service.slug,
      summary: service.summary,
      description: service.description,
      durationMinutes: service.durationMinutes,
      slots: service.slots
        .filter((s) => hasCapacity(s.capacity, s._count.bookings))
        .map((s) => ({
          id: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          remaining: s.capacity - s._count.bookings,
        })),
    }
  })
export const requestBooking = createServerFn({ method: 'POST' })
  .validator(bookingInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    await throttle('booking', data.email)
    return getPrisma().$transaction(async (tx) => {
      // Lock the slot before counting. All competing requests serialize on this row.
      await tx.$queryRaw`SELECT id FROM "AvailabilitySlot" WHERE id = ${data.slotId}::uuid FOR UPDATE`
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: data.slotId },
        include: {
          service: true,
          _count: {
            select: { bookings: { where: { status: { not: 'CANCELLED' } } } },
          },
        },
      })
      if (
        !slot ||
        slot.service.status !== 'PUBLISHED' ||
        slot.startsAt <= new Date()
      )
        rejectRequest(404, 'Slot is unavailable')
      if (!hasCapacity(slot.capacity, slot._count.bookings))
        rejectRequest(409, 'Slot is full. Choose another time.')
      const booking = await tx.bookingRequest.create({ data })
      return { reference: booking.id }
    })
  })
export const getAdminBookings = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'booking.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().bookingRequest.findMany({
      include: { slot: { include: { service: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
  })
export const updateBookingStatus = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid(), status: z.enum(bookingStatuses) }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    const current = await getPrisma().bookingRequest.findUniqueOrThrow({
      where: { id: data.id },
    })
    if (!canTransitionBooking(current.status, data.status))
      rejectRequest(409, 'This transition is unavailable')
    const result = await getPrisma().bookingRequest.updateMany({
      where: { id: data.id, status: current.status },
      data: { status: data.status },
    })
    if (!result.count) rejectRequest(409, 'Booking changed. Refresh and retry.')
    return { ok: true }
  })
