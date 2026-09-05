import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getAdminBookings, updateBookingStatus } from '../booking.functions'
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
  return (
    <section>
      <PageHeading
        eyebrow="Booking"
        title="Booking requests"
        description="Pending requests reserve capacity until confirmed or cancelled. Latest 500 requests."
      />
      {!bookings.length && <EmptyState>No booking requests yet.</EmptyState>}
      <div className="grid gap-6">
        {bookings.map((b) => (
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
                      status:
                        form.get('status') === 'CONFIRMED'
                          ? 'CONFIRMED'
                          : 'CANCELLED',
                    },
                  })
                }
              >
                <SelectField label="Next status" name="status">
                  {b.status === 'REQUESTED' && (
                    <option value="CONFIRMED">Confirm</option>
                  )}
                  <option value="CANCELLED">Cancel and release capacity</option>
                </SelectField>
              </ActionForm>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
