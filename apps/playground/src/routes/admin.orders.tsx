import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import {
  getOrders,
  updateOrder,
  recordOfflinePayment,
} from '../commerce.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/admin/orders')({
  loader: () => getOrders(),
  component: Orders,
})
function Orders() {
  const orders = Route.useLoaderData(),
    update = useServerFn(updateOrder),
    paid = useServerFn(recordOfflinePayment)
  const [search, setSearch] = useState('')
  const rows = orders.filter((o) =>
    `${o.name} ${o.email} ${o.status} ${o.id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <section>
      <PageHeading
        eyebrow="Commerce"
        title="Orders"
        description="Track fulfilment and record offline payments. Latest 500 orders."
      />
      <div className="mb-6 max-w-md">
        <Input label="Search orders" value={search} onChange={setSearch} />
      </div>
      {!rows.length && <EmptyState>No matching orders.</EmptyState>}
      <div className="grid gap-6">
        {rows.map((o) => (
          <article
            key={o.id}
            className="rounded-xl border border-secondary p-6"
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
            <div className="grid gap-6 md:grid-cols-2">
              {o.status === 'PLACED' && (
                <ActionForm
                  label="Update order"
                  action={(f) =>
                    update({
                      data: {
                        id: o.id,
                        status:
                          f.get('status') === 'FULFILLED'
                            ? 'FULFILLED'
                            : 'CANCELLED',
                      },
                    })
                  }
                >
                  <SelectField name="status" label="Next status">
                    <option value="FULFILLED">Mark fulfilled</option>
                    {!o.paid && !o.paymentPending && (
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
                  action={() => paid({ data: { id: o.id } })}
                >
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
