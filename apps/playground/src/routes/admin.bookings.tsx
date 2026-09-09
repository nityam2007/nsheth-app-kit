import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { useState } from 'react'
import { ObjectCollection, RecordTrail } from '../components/admin/workspace'
import { requireRouteModule } from '../module-route'
import { Input } from '../components/base/input/input'
import { HistoryList } from '../components/history-list'
import {
  getService,
  rescheduleBooking,
  getAdminBookings,
  updateBookingStatus,
} from '../booking.functions'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'

export const Route = createFileRoute('/admin/bookings')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { record?: string; status?: string } => ({
    ...collectionSearch(search),
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  beforeLoad: () => requireRouteModule('booking'),
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: ({ deps }) => getAdminBookings({ data: { record: deps.record } }),
  component: Bookings,
})
function Bookings() {
  const bookings = Route.useLoaderData(),
    update = useServerFn(updateBookingStatus)
  const { record, status: collectionStatus } = Route.useSearch()
  if (record && !bookings.some((item) => item.id === record)) throw notFound()
  if (!record)
    return (
      <ObjectCollection
        key={collectionStatus}
        initialStatus={collectionStatus}
        guidance={adminWorkflows['/admin/bookings']?.steps}
        title="Appointments"
        eyebrow="Schedule"
        description="Customer appointments with a clear time, status and next action."
        objects={bookings.map((b) => ({
          id: b.id,
          title: b.slot.service.name,
          subtitle: b.name + ' · ' + b.email,
          status: b.status,
          href: '/admin/bookings?record=' + b.id,
          meta: [
            {
              label: 'Starts (UTC)',
              value: b.slot.startsAt
                .toISOString()
                .slice(0, 16)
                .replace('T', ' '),
            },
            { label: 'Reference', value: b.id.slice(0, 8) },
          ],
        }))}
      />
    )
  return (
    <section>
      <RecordTrail href="/admin/bookings" label="Appointments" />
      <PageHeading
        eyebrow="Booking"
        title={bookings.find((b) => b.id === record)!.slot.service.name}
        description="Appointment details, capacity, rescheduling and follow-up."
      />
      <div className="grid gap-6">
        {bookings
          .filter((item) => item.id === record)
          .map((b) => (
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
                    {b.slot.startsAt
                      .toISOString()
                      .replace('T', ' ')
                      .slice(0, 16)}{' '}
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
              <p className="my-4 whitespace-pre-wrap text-tertiary">
                {b.notes}
              </p>
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
                    <option value="CANCELLED">
                      Cancel and release capacity
                    </option>
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
