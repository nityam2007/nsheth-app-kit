import { errorStatus } from '../errors'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getAccount, signOut, cancelOwnRequest } from '../account.functions'
import { Container } from '../components/container'
import { ActionForm, PageHeading } from '../components/workflow'
import { Button } from '../components/base/buttons/button'
import { money } from '../money'

export const Route = createFileRoute('/account')({
  loader: async () => {
    try {
      return await getAccount()
    } catch (error) {
      if (errorStatus(error) !== 401) throw error
      throw redirect({ to: '/login' })
    }
  },
  component: Account,
})
function Account() {
  const data = Route.useLoaderData(),
    cancel = useServerFn(cancelOwnRequest),
    logout = useServerFn(signOut)
  return (
    <Container className="py-12">
      <PageHeading
        eyebrow="Your account"
        title={data.principal.email}
        description="Your orders, appointments, stays, and enquiries associated with this verified email."
      />
      <div className="mb-10 flex flex-wrap items-center gap-6">
        <Link to="/" className="text-brand-secondary">
          Home
        </Link>
        {data.principal.permissions.length > 0 && (
          <Link to="/admin" className="text-brand-secondary">
            Open admin
          </Link>
        )}
        <Button
          color="secondary"
          onPress={() => {
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
              }),
            )
            const link = document.createElement('a')
            link.href = url
            link.download = 'my-account-data.json'
            link.click()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }}
        >
          Download my data
        </Button>
        <ActionForm
          label="Sign out"
          action={async () => {
            await logout()
            return '/login'
          }}
        >
          {null}
        </ActionForm>
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-primary">Orders</h2>
          {data.orders.length ? (
            data.orders.map((o) => (
              <p
                key={o.id}
                className="mb-4 rounded-lg border border-secondary p-4 text-tertiary"
              >
                {o.lines.map((l) => `${l.quantity} × ${l.name}`).join(', ')} ·{' '}
                {money(o.totalAmount)} · {o.status} ·{' '}
                {o.paid ? 'Paid' : 'Unpaid'}
              </p>
            ))
          ) : (
            <p className="text-tertiary">No orders yet.</p>
          )}
        </section>
        <section>
          <h2 className="mb-4 text-xl font-semibold text-primary">
            Appointments
          </h2>
          {data.bookings.length ? (
            data.bookings.map((b) => (
              <div key={b.id} className="mb-4 text-tertiary">
                <p>
                  {b.slot.service.name} · {b.slot.startsAt.toISOString()} ·{' '}
                  {b.status}
                </p>
                <p className="my-2 break-all text-xs">Reference {b.id}</p>
                {b.status !== 'CANCELLED' && b.cancelUntil && (
                  <ActionForm
                    label="Cancel appointment"
                    action={() =>
                      cancel({ data: { id: b.id, kind: 'booking' } })
                    }
                  >
                    <p className="text-sm">
                      Online cancellation before {b.cancelUntil.toISOString()}.
                      No refund is processed here.
                    </p>
                  </ActionForm>
                )}
              </div>
            ))
          ) : (
            <p className="text-tertiary">No appointments yet.</p>
          )}
        </section>
        <section>
          <h2 className="mb-4 text-xl font-semibold text-primary">Stays</h2>
          {data.reservations.length ? (
            data.reservations.map((r) => (
              <div key={r.id} className="mb-4 text-tertiary">
                <p>
                  {r.roomType.name} · {r.checkIn.toISOString().slice(0, 10)} →{' '}
                  {r.checkOut.toISOString().slice(0, 10)} · {r.status}
                </p>
                <p className="my-2 break-all text-xs">Reference {r.id}</p>
                {r.status !== 'CANCELLED' && r.cancelUntilDate && (
                  <ActionForm
                    label="Cancel reservation"
                    action={() =>
                      cancel({ data: { id: r.id, kind: 'reservation' } })
                    }
                  >
                    <p className="text-sm">
                      Online cancellation before {r.cancelUntilDate} (
                      {r.cancellationTimezone}). No refund is processed here.
                    </p>
                  </ActionForm>
                )}
              </div>
            ))
          ) : (
            <p className="text-tertiary">No stays yet.</p>
          )}
        </section>
        <section>
          <h2 className="mb-4 text-xl font-semibold text-primary">Enquiries</h2>
          {data.enquiries.length ? (
            data.enquiries.map((e) => (
              <p key={e.id} className="mb-4 text-tertiary">
                {e.product.name} · {e.status}
              </p>
            ))
          ) : (
            <p className="text-tertiary">No enquiries yet.</p>
          )}
        </section>
      </div>
      <p className="mt-10 text-tertiary">
        Need a correction, export, or deletion?{' '}
        <a className="text-brand-secondary underline" href="/privacy">
          Submit a privacy request.
        </a>
      </p>
    </Container>
  )
}
