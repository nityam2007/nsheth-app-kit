import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import {
  getProperty,
  requestReservation,
  checkRoomAvailability,
} from '../hospitality.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  controlClass,
} from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/stays/$slug')({
  loader: async ({ params }) => {
    const property = await getProperty({ data: params })
    if (!property) throw notFound()
    return property
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'Stay'} | NSheth App Kit` }],
  }),
  component: Property,
})
function Property() {
  const property = Route.useLoaderData()
  return (
    <section>
      <PageHeading
        eyebrow={property.location}
        title={property.name}
        description={property.summary}
      />
      <p className="mb-12 max-w-3xl whitespace-pre-wrap leading-7 text-tertiary">
        {property.description}
      </p>
      <h2 className="mb-6 text-display-xs font-semibold text-primary">
        Choose your room
      </h2>
      {!property.rooms.length && (
        <EmptyState>No rooms are open for requests right now.</EmptyState>
      )}
      <div className="grid gap-8 lg:grid-cols-2">
        {property.rooms.map((room) => (
          <Room key={room.id} room={room} />
        ))}
      </div>
    </section>
  )
}
function Room({
  room,
}: {
  room: {
    id: string
    name: string
    description: string
    maxGuests: number
    nightlyRate: number
  }
}) {
  const request = useServerFn(requestReservation),
    check = useServerFn(checkRoomAvailability)
  const [reference, setReference] = useState(''),
    [quote, setQuote] = useState('')
  return (
    <article className="rounded-xl border border-secondary bg-secondary p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-primary">{room.name}</h3>
      <p className="my-3 text-tertiary">{room.description}</p>
      <p className="mb-6 font-semibold text-brand-secondary">
        {money(room.nightlyRate)} / night · Up to {room.maxGuests} guests
      </p>
      {reference ? (
        <div role="status">
          <p className="font-semibold text-primary">
            Reservation request received.
          </p>
          <p className="my-3 text-tertiary">
            Our team will contact you to confirm this stay. No payment has been
            taken.
          </p>
          <p className="break-all text-sm text-brand-secondary">{reference}</p>
        </div>
      ) : (
        <ActionForm
          label="Request this room"
          action={async (f) => {
            const result = await request({
              data: {
                roomTypeId: room.id,
                checkIn: String(f.get('checkIn')),
                checkOut: String(f.get('checkOut')),
                guests: Number(f.get('guests')),
                name: String(f.get('name')),
                email: String(f.get('email')),
              },
            })
            setReference(`${result.reference} · ${money(result.totalAmount)}`)
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-secondary">
              Check-in
              <input
                className={controlClass}
                name="checkIn"
                type="date"
                required
                onChange={() => setQuote('')}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-secondary">
              Check-out
              <input
                className={controlClass}
                name="checkOut"
                type="date"
                required
                onChange={() => setQuote('')}
              />
            </label>
          </div>
          <Input
            label="Guests"
            name="guests"
            type="number"
            min={1}
            max={room.maxGuests}
            defaultValue="1"
            isRequired
            onChange={() => setQuote('')}
          />
          <button
            className="min-h-11 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-secondary"
            type="button"
            onClick={async (e) => {
              const form = e.currentTarget.form
              if (!form) return
              const f = new FormData(form)
              try {
                const result = await check({
                  data: {
                    roomTypeId: room.id,
                    checkIn: String(f.get('checkIn')),
                    checkOut: String(f.get('checkOut')),
                    guests: Number(f.get('guests')),
                  },
                })
                setQuote(
                  result.available
                    ? `Available now · ${money(result.totalAmount)} for your stay`
                    : 'Unavailable for these dates or guests.',
                )
              } catch {
                setQuote('Choose valid dates between 1 and 30 nights.')
              }
            }}
          >
            Check availability & total
          </button>
          {quote && (
            <p role="status" className="text-sm text-brand-secondary">
              {quote}
            </p>
          )}
          <Input
            label="Guest name"
            name="name"
            isRequired
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            isRequired
            maxLength={254}
            autoComplete="email"
          />
          <p className="text-sm text-tertiary">
            One room per request. Rates are in INR. We use your contact details
            to confirm availability and arrange your stay. Availability is
            checked again when you submit.
          </p>
        </ActionForm>
      )}
    </article>
  )
}
