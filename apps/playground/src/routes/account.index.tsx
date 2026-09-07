import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Account } from './account'
import { cancelOwnRequest } from '../account.functions'
import { ActionForm } from '../components/workflow'
import {
  WorkspaceHeading,
  MetricStrip,
  SectionPanel,
  StatusBadge,
} from '../components/admin/workspace'
import { money } from '../money'
import { Button } from '../components/base/buttons/button'

export const Route = createFileRoute('/account/')({ component: Activity })
function Activity() {
  const data = Account.useLoaderData(),
    cancel = useServerFn(cancelOwnRequest)
  const [view, setView] = useState('Orders')
  return (
    <>
      <WorkspaceHeading
        eyebrow="Your account"
        title="Your activity"
        description="Orders, appointments, stays, and enquiries connected to your verified email."
      />
      <MetricStrip
        items={[
          { label: 'Orders', value: data.orders.length },
          { label: 'Appointments', value: data.bookings.length },
          { label: 'Stays', value: data.reservations.length },
          { label: 'Enquiries', value: data.enquiries.length },
        ]}
      />
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Activity type"
      >
        {['Orders', 'Appointments', 'Stays', 'Enquiries'].map((label) => (
          <Button
            key={label}
            color={view === label ? 'primary' : 'secondary'}
            aria-pressed={view === label}
            onPress={() => setView(label)}
          >
            {label}
          </Button>
        ))}
      </div>
      <SectionPanel title={view}>
        {view === 'Orders' &&
          (data.orders.length ? (
            <ul className="divide-y divide-secondary">
              {data.orders.map((o) => (
                <li className="py-5 first:pt-0" key={o.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <h3 className="font-semibold text-primary">
                      {o.lines
                        .map((l) => l.quantity + ' × ' + l.name)
                        .join(', ')}
                    </h3>
                    <StatusBadge value={o.status} />
                  </div>
                  <p className="mt-3 text-secondary">
                    {money(o.totalAmount)} · {o.paid ? 'Paid' : 'Payment due'}
                  </p>
                  <p className="mt-2 break-all text-xs text-tertiary">
                    Reference {o.id} · {o.createdAt.toISOString().slice(0, 10)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tertiary">
              No orders yet.{' '}
              <a href="/shop" className="text-brand-secondary underline">
                Browse the shop
              </a>
            </p>
          ))}
        {view === 'Appointments' &&
          (data.bookings.length ? (
            <ul className="divide-y divide-secondary">
              {data.bookings.map((b) => (
                <li className="py-5 first:pt-0" key={b.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <h3 className="font-semibold text-primary">
                      {b.slot.service.name}
                    </h3>
                    <StatusBadge value={b.status} />
                  </div>
                  <p className="my-3 text-secondary">
                    {b.slot.startsAt
                      .toISOString()
                      .slice(0, 16)
                      .replace('T', ' ')}{' '}
                    UTC
                  </p>
                  <p className="mb-4 break-all text-xs text-tertiary">
                    Reference {b.id}
                  </p>
                  {b.status !== 'CANCELLED' &&
                    b.cancelUntil &&
                    b.cancelUntil > new Date() && (
                      <ActionForm
                        label="Cancel appointment"
                        action={() =>
                          cancel({ data: { id: b.id, kind: 'booking' } })
                        }
                      >
                        <p className="text-sm text-tertiary">
                          Cancellation available until{' '}
                          {b.cancelUntil.toISOString().slice(0, 16)} UTC. No
                          refund is processed here.
                        </p>
                      </ActionForm>
                    )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tertiary">
              No appointments yet.{' '}
              <a href="/services" className="text-brand-secondary underline">
                Explore services
              </a>
            </p>
          ))}
        {view === 'Stays' &&
          (data.reservations.length ? (
            <ul className="divide-y divide-secondary">
              {data.reservations.map((r) => (
                <li className="py-5 first:pt-0" key={r.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <h3 className="font-semibold text-primary">
                      {r.roomType.name}
                    </h3>
                    <StatusBadge value={r.status} />
                  </div>
                  <p className="my-3 text-secondary">
                    {r.checkIn.toISOString().slice(0, 10)} →{' '}
                    {r.checkOut.toISOString().slice(0, 10)} ·{' '}
                    {money(r.totalAmount)}
                  </p>
                  <p className="mb-4 break-all text-xs text-tertiary">
                    Reference {r.id}
                  </p>
                  {r.status !== 'CANCELLED' && r.cancelUntilDate && (
                    <ActionForm
                      label="Cancel reservation"
                      action={() =>
                        cancel({ data: { id: r.id, kind: 'reservation' } })
                      }
                    >
                      <p className="text-sm text-tertiary">
                        Cancellation must be before {r.cancelUntilDate} (
                        {r.cancellationTimezone}). No refund is processed here.
                      </p>
                    </ActionForm>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tertiary">
              No stays yet.{' '}
              <a href="/stays" className="text-brand-secondary underline">
                Find a stay
              </a>
            </p>
          ))}
        {view === 'Enquiries' &&
          (data.enquiries.length ? (
            <ul className="divide-y divide-secondary">
              {data.enquiries.map((e) => (
                <li className="py-5 first:pt-0" key={e.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <h3 className="font-semibold text-primary">
                      {e.product.name}
                    </h3>
                    <StatusBadge value={e.status} />
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-tertiary">
                    {e.message}
                  </p>
                  <p className="mt-3 break-all text-xs text-tertiary">
                    Reference {e.id} · Quantity {e.quantity}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-tertiary">
              No enquiries yet.{' '}
              <a href="/catalogue" className="text-brand-secondary underline">
                Explore the catalogue
              </a>
            </p>
          ))}
      </SectionPanel>
    </>
  )
}
