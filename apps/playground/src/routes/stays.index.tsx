import { createFileRoute, Link } from '@tanstack/react-router'
import { getProperties } from '../hospitality.functions'
import { EmptyState, PageHeading } from '../components/workflow'

export const Route = createFileRoute('/stays/')({
  loader: () => getProperties(),
  component: Stays,
})
function Stays() {
  const properties = Route.useLoaderData()
  return (
    <section>
      <PageHeading
        eyebrow="Stay a little longer"
        title="Find your place"
        description="Thoughtful stays, comfortable rooms, and time to make yourself at home."
      />
      {!properties.length && (
        <EmptyState>Our next places to stay are coming soon.</EmptyState>
      )}
      <div className="grid gap-8 md:grid-cols-2">
        {properties.map((p) => (
          <article key={p.slug} className="border-b border-secondary py-6">
            <p className="text-sm font-semibold text-brand-secondary">
              {p.location}
            </p>
            <h2 className="my-3 text-display-xs font-semibold text-primary">
              {p.name}
            </h2>
            <p className="mb-5 text-tertiary">{p.summary}</p>
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
              to="/stays/$slug"
              params={{ slug: p.slug }}
            >
              Explore rooms →
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
