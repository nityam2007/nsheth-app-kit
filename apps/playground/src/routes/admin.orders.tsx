import { ObjectCollection, RecordTrail } from '../components/admin/workspace'
import { requireRouteModule } from '../module-route'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  getOrders,
  updateOrder,
  recordOfflinePayment,
} from '../commerce.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/admin/orders')({
  validateSearch: (search: Record<string, unknown>): { record?: string } => ({
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  beforeLoad: () => requireRouteModule('commerce'),
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: ({ deps }) => getOrders({ data: { record: deps.record } }),
  component: Orders,
})
function Orders() {
  const orders = Route.useLoaderData(),
    update = useServerFn(updateOrder),
    paid = useServerFn(recordOfflinePayment)
  const { record } = Route.useSearch()
  if (record && !orders.some((item) => item.id === record)) throw notFound()
  if (!record)
    return (
      <ObjectCollection
        title="Orders"
        eyebrow="Sell"
        description="Customer orders, payment and fulfilment."
        objects={orders.map((o) => ({
          id: o.id,
          title: o.name,
          subtitle: o.email,
          status: o.status,
          href: '/admin/orders?record=' + o.id,
          meta: [
            { label: 'Total', value: money(o.totalAmount, o.currency) },
            {
              label: 'Payment',
              value: o.paid ? 'Paid' : o.paymentPending ? 'Pending' : 'Unpaid',
            },
          ],
        }))}
      />
    )
  return (
    <section>
      <RecordTrail href="/admin/orders" label="Orders" />
      <PageHeading
        eyebrow="Commerce"
        title={orders.find((o) => o.id === record)!.name}
        description="Order details, payment and fulfilment."
      />
      <div className="grid gap-6">
        {orders
          .filter((item) => item.id === record)
          .map((o) => (
            <article
              key={o.id}
              className="rounded-xl border border-secondary bg-primary p-6 sm:p-8"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary">
                  {o.name} · {money(o.totalAmount, o.currency)}
                </h2>
                <span className="text-sm font-semibold text-brand-secondary">
                  {o.status} ·{' '}
                  {o.paid
                    ? 'Paid'
                    : o.paymentPending
                      ? 'Online payment pending'
                      : 'Unpaid'}
                </span>
              </div>
              <p className="my-3 text-tertiary">
                <a href={`mailto:${o.email}`}>{o.email}</a>
              </p>
              <p className="whitespace-pre-wrap text-tertiary">{o.address}</p>
              <ul className="my-5 grid gap-2 text-secondary">
                {o.lines.map((l) => (
                  <li key={l.id}>
                    {l.quantity} × {l.name} · {money(l.price * l.quantity)}
                  </li>
                ))}
              </ul>
              <p className="mb-5 break-all text-xs text-tertiary">
                {o.id} · {o.createdAt.toISOString().slice(0, 10)}
              </p>
              {o.trackingNumber && (
                <p className="mb-5 text-sm text-secondary">
                  Delivery: {o.carrier} · {o.trackingNumber}
                </p>
              )}
              <details className="mb-6">
                <summary className="min-h-11 cursor-pointer font-semibold text-secondary">
                  Order history ({o.events.length})
                </summary>
                <ol className="grid gap-3">
                  {o.events.map((event) => (
                    <li className="text-sm text-tertiary" key={event.id}>
                      {event.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace('T', ' ')}{' '}
                      · {event.summary}
                    </li>
                  ))}
                </ol>
              </details>
              <div className="grid gap-6 md:grid-cols-2">
                {o.status === 'PLACED' && !o.paymentPending && (
                  <ActionForm
                    label="Update order"
                    action={(f) =>
                      update({
                        data: {
                          id: o.id,
                          carrier: String(f.get('carrier')),
                          trackingNumber: String(f.get('trackingNumber')),
                          note: String(f.get('note')),
                          status:
                            f.get('status') === 'FULFILLED'
                              ? 'FULFILLED'
                              : 'CANCELLED',
                        },
                      })
                    }
                  >
                    <Input
                      name="note"
                      label="Change note"
                      isRequired
                      minLength={5}
                      maxLength={300}
                    />
                    <Input
                      name="carrier"
                      label="Carrier / delivery method"
                      maxLength={100}
                    />
                    <Input
                      name="trackingNumber"
                      label="Tracking or collection reference"
                      maxLength={150}
                    />
                    <SelectField name="status" label="Next status">
                      {o.paid && (
                        <option value="FULFILLED">Mark fulfilled</option>
                      )}
                      {!o.paid && (
                        <option value="CANCELLED">
                          Cancel and restore stock
                        </option>
                      )}
                    </SelectField>
                  </ActionForm>
                )}
                {!o.paid && !o.paymentPending && o.status !== 'CANCELLED' && (
                  <ActionForm
                    label="Record payment received"
                    action={(f) =>
                      paid({
                        data: {
                          id: o.id,
                          reference: String(f.get('reference')),
                        },
                      })
                    }
                  >
                    <Input
                      name="reference"
                      label="Payment reference"
                      isRequired
                      minLength={3}
                      maxLength={150}
                    />
                    <p className="text-sm text-tertiary">
                      Use only after receiving the full amount offline.
                    </p>
                  </ActionForm>
                )}
              </div>
            </article>
          ))}
      </div>
    </section>
  )
}
