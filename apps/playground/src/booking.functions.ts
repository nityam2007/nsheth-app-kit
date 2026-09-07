import { moduleMiddleware } from './module.middleware'
import { throttle } from './throttle.server'
import {
  bookingInputSchema,
  bookingStatuses,
  canTransitionBooking,
  hasCapacity,
  withinBookingWindow,
  serviceInputSchema,
  slotInputSchema,
  slugSchema,
} from '@nsheth/booking'
import { attachHistory } from './audit.server'
import { hasPermission, hashSessionToken } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const getAdminServices = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'booking.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().service.findMany({ orderBy: { name: 'asc' }, take: 500 })
  })
export const getAdminService = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('booking')])
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
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(
    serviceInputSchema.extend({
      currentSlug: slugSchema.optional(),
      expectedVersion: z.number().int().positive().optional(),
    }),
  )
  .handler(
    async ({ context, data: { currentSlug, expectedVersion, ...data } }) => {
      if (!hasPermission(context.principal, 'booking.write'))
        rejectRequest(403, 'Forbidden')
      requireSameOrigin()
      return getPrisma().$transaction(async (tx) => {
        if (!currentSlug) return tx.service.create({ data })
        if (!expectedVersion)
          rejectRequest(400, 'Reload the service before editing')
        const changed = await tx.service.updateMany({
          where: { slug: currentSlug, version: expectedVersion },
          data: { ...data, version: { increment: 1 } },
        })
        if (!changed.count)
          rejectRequest(409, 'Service changed. Refresh before editing.')
        return tx.service.findUniqueOrThrow({ where: { slug: data.slug } })
      })
    },
  )
export const deleteAdminService = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
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
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(slotInputSchema)
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    if (new Date(data.startsAt) <= new Date())
      rejectRequest(400, 'Choose a future time')
    return getPrisma().$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Service" WHERE id = ${data.serviceId}::uuid FOR UPDATE`
      const service = await tx.service.findUniqueOrThrow({
        where: { id: data.serviceId },
      })
      const startsAt = new Date(data.startsAt),
        endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000)
      if (
        await tx.availabilitySlot.count({
          where: {
            serviceId: service.id,
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        })
      )
        rejectRequest(
          409,
          'This overlaps an existing slot. Increase its capacity instead.',
        )
      return tx.availabilitySlot.create({ data: { ...data, startsAt, endsAt } })
    })
  })
export const removeAvailability = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().availabilitySlot.delete({ where: data })
    return { ok: true }
  })
export const getServices = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('booking')])
  .handler(() =>
    getPrisma().service.findMany({
      where: { status: 'PUBLISHED' },
      select: { name: true, slug: true, summary: true, durationMinutes: true },
      orderBy: { name: 'asc' },
    }),
  )
export const getService = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('booking')])
  .validator(z.object({ slug: slugSchema }))
  .handler(async ({ data }) => {
    const service = await getPrisma().service.findFirst({
      where: { ...data, status: 'PUBLISHED' },
      include: {
        slots: {
          where: { startsAt: { gt: new Date() }, paused: false },
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
      timezone: service.timezone,
      location: service.location,
      policy: service.policy,
      cancelNoticeHours: service.cancelNoticeHours,
      minLeadHours: service.minLeadHours,
      maxAdvanceDays: service.maxAdvanceDays,
      slots: service.slots
        .filter(
          (s) =>
            withinBookingWindow(s.startsAt, service) &&
            hasCapacity(s.capacity, s._count.bookings),
        )
        .map((s) => ({
          id: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          remaining: s.capacity - s._count.bookings,
        })),
    }
  })
export const requestBooking = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
  .validator(bookingInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    const { key, ...payload } = data
    const requestHash = await hashSessionToken(key),
      payloadHash = await hashSessionToken(JSON.stringify(payload))
    return getPrisma().$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestHash}, 2))`
      const prior = await tx.bookingRequest.findUnique({
        where: { requestHash },
      })
      if (prior) {
        if (prior.payloadHash !== payloadHash)
          rejectRequest(
            409,
            'This attempt already contains different details. Use the original details to retrieve its reference.',
          )
        return { reference: prior.id }
      }
      await throttle('booking', data.email, 5, tx)
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
        slot.paused ||
        !withinBookingWindow(slot.startsAt, slot.service)
      )
        rejectRequest(404, 'Slot is unavailable')
      if (!hasCapacity(slot.capacity, slot._count.bookings))
        rejectRequest(409, 'Slot is full. Choose another time.')
      const booking = await tx.bookingRequest.create({
        data: {
          ...payload,
          requestHash,
          payloadHash,
          cancelUntil: new Date(
            slot.startsAt.getTime() - slot.service.cancelNoticeHours * 3600000,
          ),
        },
      })
      await tx.auditEvent.create({
        data: {
          entityType: 'booking',
          entityId: booking.id,
          action: 'requested',
          summary: 'Appointment requested',
        },
      })
      return { reference: booking.id }
    })
  })
export const getAdminBookings = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(z.object({ record: z.uuid().optional() }).optional())
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma()
      .bookingRequest.findMany({
        where: data?.record ? { id: data.record } : undefined,
        include: {
          slot: {
            include: { service: { select: { name: true, slug: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((rows) => attachHistory('booking', rows))
  })
export const updateBookingStatus = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(bookingStatuses),
      expectedVersion: z.number().int().positive(),
      note: z.string().trim().min(5).max(300),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const current = await tx.bookingRequest.findUniqueOrThrow({
        where: { id: data.id },
      })
      if (!canTransitionBooking(current.status, data.status))
        rejectRequest(409, 'This transition is unavailable')
      const result = await tx.bookingRequest.updateMany({
        where: {
          id: data.id,
          version: data.expectedVersion,
          status: current.status,
        },
        data: { status: data.status, version: { increment: 1 } },
      })
      if (!result.count)
        rejectRequest(409, 'Booking changed. Refresh and retry.')
      await tx.auditEvent.create({
        data: {
          entityType: 'booking',
          entityId: data.id,
          actorId: context.principal.userId,
          action: data.status.toLowerCase(),
          summary: data.note,
        },
      })
      return { ok: true }
    })
  })

export const pauseAvailability = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid(), paused: z.boolean() }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().availabilitySlot.update({
      where: { id: data.id },
      data: { paused: data.paused },
    })
    return { ok: true }
  })

export const rescheduleBooking = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('booking')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      slotId: z.uuid(),
      expectedVersion: z.number().int().positive(),
      note: z.string().trim().min(5).max(300),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'booking.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      // Target-slot lock serializes moves with new requests. Version CAS prevents competing moves.
      await tx.$queryRaw`SELECT id FROM "AvailabilitySlot" WHERE id = ${data.slotId}::uuid FOR UPDATE`
      const [current, target] = await Promise.all([
        tx.bookingRequest.findUniqueOrThrow({
          where: { id: data.id },
          include: { slot: true },
        }),
        tx.availabilitySlot.findUniqueOrThrow({
          where: { id: data.slotId },
          include: {
            service: true,
            _count: {
              select: { bookings: { where: { status: { not: 'CANCELLED' } } } },
            },
          },
        }),
      ])
      if (
        current.status === 'CANCELLED' ||
        current.slotId === target.id ||
        current.slot.startsAt <= new Date() ||
        current.slot.serviceId !== target.serviceId ||
        target.paused ||
        target.service.status !== 'PUBLISHED' ||
        !withinBookingWindow(target.startsAt, target.service)
      )
        rejectRequest(
          409,
          'Choose an available future slot for the same service',
        )
      if (!hasCapacity(target.capacity, target._count.bookings))
        rejectRequest(409, 'The destination slot is full')
      const changed = await tx.bookingRequest.updateMany({
        where: {
          id: data.id,
          version: data.expectedVersion,
          status: current.status,
        },
        data: {
          slotId: target.id,
          version: { increment: 1 },
          cancelUntil: new Date(
            target.startsAt.getTime() -
              target.service.cancelNoticeHours * 3600000,
          ),
        },
      })
      if (!changed.count)
        rejectRequest(409, 'Booking changed. Refresh and retry.')
      await tx.auditEvent.create({
        data: {
          entityType: 'booking',
          entityId: data.id,
          actorId: context.principal.userId,
          action: 'rescheduled',
          summary: `${current.slot.startsAt.toISOString()} → ${target.startsAt.toISOString()}: ${data.note}`,
        },
      })
      return { ok: true }
    })
  })
