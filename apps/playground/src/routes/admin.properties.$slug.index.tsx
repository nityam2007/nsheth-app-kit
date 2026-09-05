import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Parent } from './admin.properties.$slug'
import { RoomForm } from '../components/admin/room-form'
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
      <PageHeading
        eyebrow={`Hospitality · ${property.status}`}
        title={property.name}
        description={`${property.location} · ${property.timezone}`}
      />
      <div className="mb-8 flex gap-6">
        <Link
          className="text-brand-secondary"
          to="/admin/properties/$slug/edit"
          params={{ slug: property.slug }}
        >
          Edit property
        </Link>
        {property.status === 'PUBLISHED' && (
          <Link
            className="text-brand-secondary"
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
      <section className="max-w-3xl">
        <h2 className="mb-5 text-xl font-semibold text-primary">Room types</h2>
        {property.rooms.map((room) => (
          <details
            className="mb-5 rounded-xl border border-secondary p-5"
            key={room.id}
          >
            <summary className="min-h-11 cursor-pointer font-semibold text-primary">
              {room.name} · {room.inventory} rooms ·{' '}
              {room.active ? 'Open' : 'Closed'}
            </summary>
            <RoomForm propertyId={property.id} room={room} />
          </details>
        ))}
        <h2 className="my-6 text-xl font-semibold text-primary">
          Add a room type
        </h2>
        <RoomForm propertyId={property.id} />
      </section>
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
              return
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
