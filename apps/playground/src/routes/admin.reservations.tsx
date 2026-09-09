import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { ObjectCollection, RecordTrail } from '../components/admin/workspace'
import { requireRouteModule } from '../module-route'
import { HistoryList } from '../components/history-list'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getReservations, updateReservation } from '../hospitality.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/admin/reservations')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { record?: string; status?: string } => ({
    ...collectionSearch(search),
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  beforeLoad: () => requireRouteModule('hospitality'),
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: ({ deps }) => getReservations({ data: { record: deps.record } }),
  component: Reservations,
})
function Reservations() {
  const rows = Route.useLoaderData(),
    update = useServerFn(updateReservation)
  const { record, status: collectionStatus } = Route.useSearch()
  if (record && !rows.some((item) => item.id === record)) throw notFound()
  if (!record)
    return (
      <ObjectCollection
        key={collectionStatus}
        initialStatus={collectionStatus}
        guidance={adminWorkflows['/admin/reservations']?.steps}
        title="Reservations"
        eyebrow="Host"
        description="Guest stays, room details, quotes and cancellation controls."
        objects={rows.map((r) => ({
          id: r.id,
          title: r.roomType.property.name,
          subtitle: r.name + ' · ' + r.roomType.name,
          status: r.status,
          href: '/admin/reservations?record=' + r.id,
          meta: [
            { label: 'Arrival', value: r.checkIn.toISOString().slice(0, 10) },
            { label: 'Total', value: money(r.totalAmount, r.currency) },
          ],
        }))}
      />
    )
  return (
    <section>
      <RecordTrail href="/admin/reservations" label="Reservations" />
      <PageHeading
        eyebrow="Hospitality"
        title={rows.find((r) => r.id === record)!.name}
        description="Guest details, dates, room and reservation status."
      />
      <div className="grid gap-5">
        {rows
          .filter((item) => item.id === record)
          .map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-secondary bg-primary p-6 sm:p-8"
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
                        expectedVersion: r.version,
                        note: String(f.get('note')),
                        status:
                          f.get('status') === 'CONFIRMED'
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
                  <SelectField name="status" label="Next status">
                    {r.status === 'REQUESTED' && (
                      <option value="CONFIRMED">Confirm</option>
                    )}
                    <option value="CANCELLED">Cancel and release room</option>
                  </SelectField>
                </ActionForm>
              )}
              <HistoryList events={r.history} />
            </article>
          ))}
      </div>
    </section>
  )
}
