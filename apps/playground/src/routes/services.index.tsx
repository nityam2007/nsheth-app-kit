import { createFileRoute, Link } from '@tanstack/react-router'
import { getServices } from '../booking.functions'
import { EmptyState, PageHeading } from '../components/workflow'

export const Route = createFileRoute('/services/')({
  loader: () => getServices(),
  component: Services,
})
function Services() {
  const services = Route.useLoaderData()
  return (
    <section>
      <PageHeading
        eyebrow="Make time for what matters"
        title="Find your next appointment"
        description="Explore our services and choose an available time that works for you."
      />
      {!services.length && (
        <EmptyState>
          New services are on their way. Please check back soon.
        </EmptyState>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            className="rounded-xl border border-secondary p-6"
            key={s.slug}
          >
            <p className="text-sm text-brand-secondary">
              {s.durationMinutes} minutes
            </p>
            <h2 className="mt-3 text-xl font-semibold text-primary">
              {s.name}
            </h2>
            <p className="my-4 text-tertiary">{s.summary}</p>
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
              to="/services/$slug"
              params={{ slug: s.slug }}
            >
              View availability →
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
