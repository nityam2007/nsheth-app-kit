import { moduleMiddleware } from './module.middleware'
import { throttle } from './throttle.server'
import { canTransitionBooking, hasCapacity } from '@nsheth/booking'
import {
  peakOccupancy,
  propertyInputSchema,
  reservationInputSchema,
  roomInputSchema,
  stayDatesSchema,
  stayNights,
  todayInTimezone,
} from '@nsheth/hospitality'
import { attachHistory } from './audit.server'
import { hasPermission, hashSessionToken } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const getAdminProperties = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'hospitality.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().property.findMany({
      orderBy: { name: 'asc' },
      take: 500,
    })
  })
export const getAdminProperty = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'hospitality.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().property.findUnique({
      where: data,
      include: { rooms: { orderBy: { name: 'asc' } } },
    })
  })
export const saveProperty = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(
    propertyInputSchema.extend({
      currentSlug: z.string().max(160).optional(),
      expectedVersion: z.number().int().positive().optional(),
    }),
  )
  .handler(
    async ({ context, data: { currentSlug, expectedVersion, ...data } }) => {
      if (!hasPermission(context.principal, 'hospitality.write'))
        rejectRequest(403, 'Forbidden')
      requireSameOrigin()
      return getPrisma().$transaction(async (tx) => {
        if (!currentSlug) return tx.property.create({ data })
        if (!expectedVersion)
          rejectRequest(400, 'Reload the property before editing')
        const changed = await tx.property.updateMany({
          where: { slug: currentSlug, version: expectedVersion },
          data: { ...data, version: { increment: 1 } },
        })
        if (!changed.count)
          rejectRequest(409, 'Property changed. Refresh before editing.')
        return tx.property.findUniqueOrThrow({ where: { slug: data.slug } })
      })
    },
  )
export const deleteProperty = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    await getPrisma().property.delete({ where: data })
    return { ok: true }
  })
export const saveRoom = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(roomInputSchema)
  .handler(async ({ context, data: { id, expectedVersion, ...data } }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    if (data.minNights > data.maxNights)
      rejectRequest(400, 'Minimum nights cannot exceed maximum nights')
    return getPrisma().$transaction(async (tx) => {
      if (!id) return tx.roomType.create({ data })
      await tx.$queryRaw`SELECT id FROM "RoomType" WHERE id = ${id}::uuid FOR UPDATE`
      const current = await tx.roomType.findUniqueOrThrow({ where: { id } })
      if (current.version !== expectedVersion)
        rejectRequest(409, 'Room changed. Refresh before editing.')
      if (current.propertyId !== data.propertyId)
        rejectRequest(400, 'Cannot move a room type between properties')
      const stays = await tx.reservation.findMany({
        where: {
          roomTypeId: id,
          status: { not: 'CANCELLED' },
          checkOut: { gt: new Date() },
        },
      })
      const boundaries = [
        ...new Set(stays.map((s) => s.checkIn.toISOString().slice(0, 10))),
      ]
      const peak = Math.max(
        0,
        ...boundaries.map(
          (day) =>
            stays.filter(
              (s) => s.checkIn <= new Date(day) && s.checkOut > new Date(day),
            ).length,
        ),
      )
      if (data.inventory < peak)
        rejectRequest(409, 'Inventory cannot be below existing reservations')
      if (stays.some((stay) => stay.guests > data.maxGuests))
        rejectRequest(
          409,
          'Guest capacity cannot be below existing reservations',
        )
      return tx.roomType.update({
        where: { id },
        data: { ...data, version: { increment: 1 } },
      })
    })
  })
export const getProperties = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .handler(() =>
    getPrisma().property.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, name: true, summary: true, location: true },
      orderBy: { name: 'asc' },
    }),
  )
export const getProperty = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .validator(z.object({ slug: z.string().max(160) }))
  .handler(({ data }) =>
    getPrisma().property.findFirst({
      where: { ...data, status: 'PUBLISHED' },
      include: {
        rooms: { where: { active: true }, orderBy: { nightlyRate: 'asc' } },
      },
    }),
  )
export const checkRoomAvailability = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .validator(
    stayDatesSchema.safeExtend({
      roomTypeId: z.uuid(),
      guests: z.number().int().min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const room = await getPrisma().roomType.findFirst({
      where: {
        id: data.roomTypeId,
        active: true,
        property: { status: 'PUBLISHED' },
      },
      include: { property: true },
    })
    if (
      !room ||
      data.checkIn < todayInTimezone(room.property.timezone) ||
      data.guests > room.maxGuests ||
      stayNights(data.checkIn, data.checkOut).length < room.minNights ||
      stayNights(data.checkIn, data.checkOut).length > room.maxNights
    )
      return { available: false, totalAmount: 0 }
    const stays = await getPrisma().reservation.findMany({
      where: {
        roomTypeId: room.id,
        status: { not: 'CANCELLED' },
        checkIn: { lt: new Date(data.checkOut) },
        checkOut: { gt: new Date(data.checkIn) },
      },
      select: { checkIn: true, checkOut: true },
    })
    return {
      available: hasCapacity(
        room.inventory,
        peakOccupancy(data.checkIn, data.checkOut, stays),
      ),
      totalAmount:
        room.nightlyRate * stayNights(data.checkIn, data.checkOut).length,
    }
  })
export const requestReservation = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('hospitality')])
  .validator(reservationInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    const { key, expectedTotal, ...payload } = data
    const requestHash = await hashSessionToken(key),
      payloadHash = await hashSessionToken(
        JSON.stringify({ ...payload, expectedTotal }),
      )
    return getPrisma().$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${requestHash}, 3))`
      const prior = await tx.reservation.findUnique({ where: { requestHash } })
      if (prior) {
        if (prior.payloadHash !== payloadHash)
          rejectRequest(
            409,
            'This attempt already contains different details. Retry the original details to retrieve its reference.',
          )
        return {
          reference: prior.id,
          totalAmount: prior.totalAmount,
          currency: prior.currency,
        }
      }
      await throttle('reservation', data.email, 5, tx)
      await tx.$queryRaw`SELECT id FROM "RoomType" WHERE id = ${data.roomTypeId}::uuid FOR UPDATE`
      const room = await tx.roomType.findUnique({
        where: { id: data.roomTypeId },
        include: { property: true },
      })
      if (
        !room ||
        !room.active ||
        room.property.status !== 'PUBLISHED' ||
        data.guests > room.maxGuests ||
        data.checkIn < todayInTimezone(room.property.timezone)
      )
        rejectRequest(400, 'Room unavailable for these dates and guests')
      const stays = await tx.reservation.findMany({
        where: {
          roomTypeId: room.id,
          status: { not: 'CANCELLED' },
          checkIn: { lt: new Date(data.checkOut) },
          checkOut: { gt: new Date(data.checkIn) },
        },
        select: { checkIn: true, checkOut: true },
      })
      if (
        !hasCapacity(
          room.inventory,
          peakOccupancy(data.checkIn, data.checkOut, stays),
        )
      )
        rejectRequest(409, 'No rooms available for these dates')
      const totalAmount =
        room.nightlyRate * stayNights(data.checkIn, data.checkOut).length
      if (totalAmount !== expectedTotal)
        rejectRequest(
          409,
          'The rate changed. Check availability and total again.',
        )
      const nights = stayNights(data.checkIn, data.checkOut).length
      if (nights < room.minNights || nights > room.maxNights)
        rejectRequest(
          400,
          `Choose a stay between ${room.minNights} and ${room.maxNights} nights`,
        )
      const reservation = await tx.reservation.create({
        data: {
          ...payload,
          requestHash,
          payloadHash,
          cancelUntilDate: new Date(
            Date.parse(data.checkIn) -
              room.property.cancelNoticeDays * 86400000,
          )
            .toISOString()
            .slice(0, 10),
          cancellationTimezone: room.property.timezone,
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          totalAmount,
        },
      })
      await tx.auditEvent.create({
        data: {
          entityType: 'reservation',
          entityId: reservation.id,
          action: 'requested',
          summary: 'Stay requested',
        },
      })
      return {
        reference: reservation.id,
        totalAmount,
        currency: reservation.currency,
      }
    })
  })
export const getReservations = createServerFn({ method: 'GET' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(z.object({ record: z.uuid().optional() }).optional())
  .handler(({ context, data }) => {
    if (!hasPermission(context.principal, 'hospitality.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma()
      .reservation.findMany({
        where: data?.record ? { id: data.record } : undefined,
        include: {
          roomType: { include: { property: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      .then((rows) => attachHistory('reservation', rows))
  })
export const updateReservation = createServerFn({ method: 'POST' })
  .middleware([moduleMiddleware('hospitality')])
  .middleware([identityMiddleware])
  .validator(
    z.object({
      id: z.uuid(),
      status: z.enum(['CONFIRMED', 'CANCELLED']),
      expectedVersion: z.number().int().positive(),
      note: z.string().trim().min(5).max(300),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      const current = await tx.reservation.findUniqueOrThrow({
        where: { id: data.id },
      })
      if (!canTransitionBooking(current.status, data.status))
        rejectRequest(409, 'Invalid transition')
      const result = await tx.reservation.updateMany({
        where: {
          id: data.id,
          version: data.expectedVersion,
          status: current.status,
        },
        data: { status: data.status, version: { increment: 1 } },
      })
      if (!result.count)
        rejectRequest(409, 'Reservation changed. Refresh and retry.')
      await tx.auditEvent.create({
        data: {
          entityType: 'reservation',
          entityId: data.id,
          actorId: context.principal.userId,
          action: data.status.toLowerCase(),
          summary: data.note,
        },
      })
      return { ok: true }
    })
  })
