import { useState } from 'react'
import { Input } from '../components/base/input/input'
import { HistoryList } from '../components/history-list'
import {
  getService,
  rescheduleBooking,
  getAdminBookings,
  updateBookingStatus,
} from '../booking.functions'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'

export const Route = createFileRoute('/admin/bookings')({
  loader: () => getAdminBookings(),
  component: Bookings,
})
function Bookings() {
  const bookings = Route.useLoaderData(),
    update = useServerFn(updateBookingStatus)
  const [search, setSearch] = useState('')
  const filtered = bookings.filter((b) =>
    `${b.id} ${b.name} ${b.email} ${b.status} ${b.slot.service.name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <section>
      <PageHeading
        eyebrow="Booking"
        title="Booking requests"
        description="Pending requests reserve capacity until confirmed or cancelled. Latest 500 requests."
      />
      <div className="mb-6 max-w-md">
        <Input
          label="Search reference, guest, service or status"
          value={search}
          onChange={setSearch}
        />
      </div>
      {!filtered.length && <EmptyState>No booking requests yet.</EmptyState>}
      <div className="grid gap-6">
        {filtered.map((b) => (
          <article
            key={b.id}
            className="rounded-xl border border-secondary bg-primary p-6"
          >
            <div className="mb-4 flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-semibold text-primary">
                  {b.slot.service.name}
                </h2>
                <p className="text-tertiary">
                  {b.slot.startsAt.toISOString().replace('T', ' ').slice(0, 16)}{' '}
                  UTC
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-secondary">
                {b.status}
              </span>
            </div>
            <p className="text-secondary">
              {b.name} · <a href={`mailto:${b.email}`}>{b.email}</a>
            </p>
            <p className="my-4 whitespace-pre-wrap text-tertiary">{b.notes}</p>
            <p className="mb-4 break-all text-xs text-tertiary">
              Reference {b.id}
            </p>
            {b.status !== 'CANCELLED' && (
              <ActionForm
                label="Update request"
                action={(form) =>
                  update({
                    data: {
                      id: b.id,
                      expectedVersion: b.version,
                      note: String(form.get('note')),
                      status:
                        form.get('status') === 'CONFIRMED'
                          ? 'CONFIRMED'
                          : 'CANCELLED',
                    },
                  })
                }
              >
                <Input
                  name="note"
                  label="Reason or confirmation note"
                  minLength={5}
                  maxLength={300}
                  isRequired
                />
                <SelectField label="Next status" name="status">
                  {b.status === 'REQUESTED' && (
                    <option value="CONFIRMED">Confirm</option>
                  )}
                  <option value="CANCELLED">Cancel and release capacity</option>
                </SelectField>
              </ActionForm>
            )}
            {b.status !== 'CANCELLED' && <MoveBooking booking={b} />}
            <HistoryList events={b.history} />
          </article>
        ))}
      </div>
    </section>
  )
}

function MoveBooking({
  booking,
}: {
  booking: ReturnType<typeof Route.useLoaderData>[number]
}) {
  const get = useServerFn(getService),
    move = useServerFn(rescheduleBooking)
  const [slots, setSlots] = useState<
    NonNullable<Awaited<ReturnType<typeof getService>>>['slots']
  >([])
  return (
    <details className="mt-5">
      <summary className="min-h-11 cursor-pointer py-3 text-secondary">
        Reschedule within this service
      </summary>
      <ActionForm
        label="Find available times"
        action={async () => {
          const service = await get({
            data: { slug: booking.slot.service.slug },
          })
          setSlots(
            service?.slots.filter((slot) => slot.id !== booking.slotId) ?? [],
          )
        }}
      >
        <p className="text-sm text-tertiary">
          Moving preserves the reference and records the reason. Availability is
          checked again when saving.
        </p>
      </ActionForm>
      {slots.length > 0 && (
        <ActionForm
          label="Move appointment"
          action={(f) =>
            move({
              data: {
                id: booking.id,
                slotId: String(f.get('slotId')),
                expectedVersion: booking.version,
                note: String(f.get('note')),
              },
            })
          }
        >
          <SelectField name="slotId" label="Available destination (UTC)">
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.startsAt.toISOString()} · {slot.remaining} places
              </option>
            ))}
          </SelectField>
          <Input
            name="note"
            label="Reason for move"
            minLength={5}
            maxLength={300}
            isRequired
          />
        </ActionForm>
      )}
    </details>
  )
}
