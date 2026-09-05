import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { getReservations, updateReservation } from '../hospitality.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/admin/reservations')({
  loader: () => getReservations(),
  component: Reservations,
})
function Reservations() {
  const rows = Route.useLoaderData(),
    update = useServerFn(updateReservation)
  const [search, setSearch] = useState('')
  const filtered = rows.filter((r) =>
    `${r.name} ${r.email} ${r.roomType.property.name} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <section>
      <PageHeading
        eyebrow="Hospitality"
        title="Reservations"
        description="Pending requests hold one room across every night of the stay. Latest 500 reservations."
      />
      <div className="mb-6 max-w-md">
        <Input
          label="Search guest, property or status"
          value={search}
          onChange={setSearch}
        />
      </div>
      {!filtered.length && <EmptyState>No matching reservations.</EmptyState>}
      <div className="grid gap-5">
        {filtered.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-secondary p-6"
          >
            <h2 className="font-semibold text-primary">
              {r.roomType.property.name} · {r.roomType.name}
            </h2>
            <p className="my-3 text-tertiary">
              {r.checkIn.toISOString().slice(0, 10)} →{' '}
              {r.checkOut.toISOString().slice(0, 10)} · {r.guests} guests ·{' '}
              {money(r.totalAmount, r.currency)}
            </p>
            <p className="text-secondary">
              {r.name} · <a href={`mailto:${r.email}`}>{r.email}</a>
            </p>
            <p className="my-3 text-sm font-semibold text-brand-secondary">
              {r.status}
            </p>
            <p className="mb-4 break-all text-xs text-tertiary">{r.id}</p>
            {r.status !== 'CANCELLED' && (
              <ActionForm
                label="Update reservation"
                action={(f) =>
                  update({
                    data: {
                      id: r.id,
                      status:
                        f.get('status') === 'CONFIRMED'
                          ? 'CONFIRMED'
                          : 'CANCELLED',
                    },
                  })
                }
              >
                <SelectField name="status" label="Next status">
                  {r.status === 'REQUESTED' && (
                    <option value="CONFIRMED">Confirm</option>
                  )}
                  <option value="CANCELLED">Cancel and release room</option>
                </SelectField>
              </ActionForm>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
