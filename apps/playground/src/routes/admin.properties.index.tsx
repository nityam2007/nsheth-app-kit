import { createFileRoute } from '@tanstack/react-router'
import { getAdminProperties } from '../hospitality.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/properties/')({
  loader: () => getAdminProperties(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  return (
    <ObjectCollection
      title="Properties"
      eyebrow="Host"
      description="Manage property details, rooms, stay policies and room inventory."
      createHref="/admin/properties/new"
      createLabel="Add property"
      objects={records.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.location,
        status: p.status,
        href: '/admin/properties/' + p.slug,
        meta: [
          { label: 'Timezone', value: p.timezone },
          { label: 'Rooms', value: 'Open inventory' },
        ],
      }))}
    />
  )
}
