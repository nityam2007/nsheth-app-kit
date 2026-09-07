import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Parent } from './admin.properties.$slug'
import {
  MetricStrip,
  SectionPanel,
  RecordTrail,
} from '../components/admin/workspace'
import { ActionForm, PageHeading } from '../components/workflow'
import { deleteProperty } from '../hospitality.functions'

export const Route = createFileRoute('/admin/properties/$slug/')({
  component: Property,
})
function Property() {
  const property = Parent.useLoaderData(),
    destroy = useServerFn(deleteProperty)
  return (
    <section>
      <RecordTrail href="/admin/properties" label="Properties" />
      <PageHeading
        eyebrow={`Hospitality · ${property.status}`}
        title={property.name}
        description={`${property.location} · ${property.timezone}`}
      />
      <div className="mb-8 flex flex-wrap gap-3">
        <a
          className="admin-primary-link"
          href={'/admin/properties/' + property.slug + '/rooms'}
        >
          Manage rooms
        </a>
        <Link
          className="admin-secondary-link"
          to="/admin/properties/$slug/edit"
          params={{ slug: property.slug }}
        >
          Edit property
        </Link>
        {property.status === 'PUBLISHED' && (
          <Link
            className="admin-secondary-link"
            to="/stays/$slug"
            params={{ slug: property.slug }}
          >
            View public page
          </Link>
        )}
      </div>
      <p className="mb-8 whitespace-pre-wrap text-tertiary">
        {property.description}
      </p>
      <MetricStrip
        items={[
          { label: 'Room types', value: property.rooms.length },
          {
            label: 'Total rooms',
            value: property.rooms.reduce((n, r) => n + r.inventory, 0),
          },
          { label: 'Check-in', value: property.checkInTime },
          { label: 'Check-out', value: property.checkOutTime },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Location & amenities">
          <p className="text-secondary">
            {property.address || property.location}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <li
                className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary"
                key={a}
              >
                {a}
              </li>
            ))}
          </ul>
        </SectionPanel>
        <SectionPanel title="Guest policy">
          <p className="whitespace-pre-wrap text-tertiary">
            {property.policy || 'No additional house rules.'}
          </p>
          <p className="mt-4 text-sm text-secondary">
            Cancellation notice: {property.cancelNoticeDays} days before arrival
          </p>
        </SectionPanel>
      </div>{' '}
      <section className="mt-12 border-t border-secondary pt-8">
        <p className="mb-4 text-tertiary">
          Properties with reservation history cannot be deleted. Unpublish them
          instead.
        </p>
        <ActionForm
          label="Delete property"
          action={async () => {
            if (
              !window.confirm('Delete this property and its empty room types?')
            )
              return false
            await destroy({ data: { id: property.id } })
            return '/admin/properties'
          }}
        >
          {null}
        </ActionForm>
      </section>
    </section>
  )
}
