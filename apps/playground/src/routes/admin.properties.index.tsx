import { createFileRoute, Link } from '@tanstack/react-router'
import { getAdminProperties } from '../hospitality.functions'
import { EmptyState, PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/properties/')({
  loader: () => getAdminProperties(),
  component: Properties,
})
function Properties() {
  const properties = Route.useLoaderData()
  return (
    <section>
      <PageHeading
        eyebrow="Hospitality"
        title="Properties"
        description="Manage a single hotel or a collection of properties from one workspace."
      />
      <Link
        className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
        to="/admin/properties/new"
      >
        Add property →
      </Link>
      {!properties.length && (
        <EmptyState>Add a property to start offering stays.</EmptyState>
      )}
      <ul className="divide-y divide-secondary">
        {properties.map((p) => (
          <li key={p.id} className="flex flex-wrap justify-between gap-4 py-5">
            <div>
              <Link
                className="font-semibold text-brand-secondary"
                to="/admin/properties/$slug"
                params={{ slug: p.slug }}
              >
                {p.name}
              </Link>
              <p className="mt-2 text-tertiary">
                {p.location} · {p.status}
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center text-brand-secondary"
              to="/admin/properties/$slug/edit"
              params={{ slug: p.slug }}
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
