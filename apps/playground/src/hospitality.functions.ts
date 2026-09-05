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
import { hasPermission } from '@nsheth/identity'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getPrisma } from './db'
import { identityMiddleware } from './identity.functions'
import { rejectRequest, requireSameOrigin } from './server-utils'

export const getAdminProperties = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'hospitality.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().property.findMany({ orderBy: { name: 'asc' } })
  })
export const getAdminProperty = createServerFn({ method: 'GET' })
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
  .middleware([identityMiddleware])
  .validator(propertyInputSchema.extend({ currentSlug: z.string().optional() }))
  .handler(({ context, data: { currentSlug, ...data } }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return currentSlug
      ? getPrisma().property.update({ where: { slug: currentSlug }, data })
      : getPrisma().property.create({ data })
  })
export const deleteProperty = createServerFn({ method: 'POST' })
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
  .middleware([identityMiddleware])
  .validator(roomInputSchema)
  .handler(async ({ context, data: { id, ...data } }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
      if (!id) return tx.roomType.create({ data })
      await tx.$queryRaw`SELECT id FROM "RoomType" WHERE id = ${id}::uuid FOR UPDATE`
      const current = await tx.roomType.findUniqueOrThrow({ where: { id } })
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
      return tx.roomType.update({ where: { id }, data })
    })
  })
export const getProperties = createServerFn({ method: 'GET' }).handler(() =>
  getPrisma().property.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, name: true, summary: true, location: true },
    orderBy: { name: 'asc' },
  }),
)
export const getProperty = createServerFn({ method: 'GET' })
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
      data.guests > room.maxGuests
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
  .validator(reservationInputSchema)
  .handler(async ({ data }) => {
    requireSameOrigin()
    return getPrisma().$transaction(async (tx) => {
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
      const reservation = await tx.reservation.create({
        data: {
          ...data,
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          totalAmount,
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
  .middleware([identityMiddleware])
  .handler(({ context }) => {
    if (!hasPermission(context.principal, 'hospitality.read'))
      rejectRequest(403, 'Forbidden')
    return getPrisma().reservation.findMany({
      include: {
        roomType: { include: { property: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
  })
export const updateReservation = createServerFn({ method: 'POST' })
  .middleware([identityMiddleware])
  .validator(
    z.object({ id: z.uuid(), status: z.enum(['CONFIRMED', 'CANCELLED']) }),
  )
  .handler(async ({ context, data }) => {
    if (!hasPermission(context.principal, 'hospitality.write'))
      rejectRequest(403, 'Forbidden')
    requireSameOrigin()
    const current = await getPrisma().reservation.findUniqueOrThrow({
      where: { id: data.id },
    })
    if (!canTransitionBooking(current.status, data.status))
      rejectRequest(409, 'Invalid transition')
    const result = await getPrisma().reservation.updateMany({
      where: { id: data.id, status: current.status },
      data: { status: data.status },
    })
    if (!result.count)
      rejectRequest(409, 'Reservation changed. Refresh and retry.')
    return { ok: true }
  })
