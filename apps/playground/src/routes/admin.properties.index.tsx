import { hasPermission } from '@nsheth/identity'
import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { createFileRoute } from '@tanstack/react-router'
import { getAdminProperties } from '../hospitality.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/properties/')({
  validateSearch: collectionSearch,
  loader: () => getAdminProperties(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  const { principal } = Route.useRouteContext()
  return (
    <ObjectCollection
      key={Route.useSearch().status}
      initialStatus={Route.useSearch().status}
      guidance={adminWorkflows['/admin/properties']?.steps}
      title="Properties"
      eyebrow="Host"
      description="Manage property details, rooms, stay policies and room inventory."
      createHref={
        hasPermission(principal, 'hospitality.write')
          ? '/admin/properties/new'
          : undefined
      }
      createLabel="Add property"
      objects={records.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.location,
        status: p.status,
        href: '/admin/properties/' + p.slug,
        action: hasPermission(principal, 'hospitality.write')
          ? {
              href: '/admin/properties/' + p.slug + '/rooms',
              label: 'Rooms & rates',
            }
          : undefined,
        meta: [
          { label: 'Timezone', value: p.timezone },
          { label: 'Room types', value: String(p._count.rooms) },
        ],
      }))}
    />
  )
}
