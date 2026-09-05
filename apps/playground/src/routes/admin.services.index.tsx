import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminServices } from '../booking.functions'
import { EmptyState, PageHeading } from '../components/workflow'
import { Input } from '../components/base/input/input'

export const Route = createFileRoute('/admin/services/')({
  loader: () => getAdminServices(),
  component: Services,
})
function Services() {
  const services = Route.useLoaderData()
  const [search, setSearch] = useState('')
  const rows = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <section>
      <PageHeading
        eyebrow="Booking"
        title="Services"
        description="Publish services, offer dated slots, and manage booking requests."
      />
      <Link
        to="/admin/services/new"
        className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
      >
        Create service →
      </Link>
      <div className="my-6 max-w-md">
        <Input label="Search services" value={search} onChange={setSearch} />
      </div>
      {!rows.length ? (
        <EmptyState>
          No services found. Create your first service to offer appointments.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-secondary">
          {rows.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 py-5"
            >
              <div>
                <Link
                  className="font-semibold text-brand-secondary"
                  to="/admin/services/$slug"
                  params={{ slug: s.slug }}
                >
                  {s.name}
                </Link>
                <p className="mt-1 text-sm text-tertiary">
                  {s.durationMinutes} minutes · {s.status}
                </p>
              </div>
              <Link
                className="inline-flex min-h-11 items-center text-sm font-semibold text-secondary"
                to="/admin/services/$slug/edit"
                params={{ slug: s.slug }}
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
