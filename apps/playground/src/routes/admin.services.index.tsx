import { hasPermission } from '@nsheth/identity'
import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { createFileRoute } from '@tanstack/react-router'
import { getAdminServices } from '../booking.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/services/')({
  validateSearch: collectionSearch,
  loader: () => getAdminServices(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  const { principal } = Route.useRouteContext()
  return (
    <ObjectCollection
      key={Route.useSearch().status}
      initialStatus={Route.useSearch().status}
      guidance={adminWorkflows['/admin/services']?.steps}
      title="Services"
      eyebrow="Schedule"
      description="Service information, booking policies and available appointment times."
      createHref={
        hasPermission(principal, 'booking.write')
          ? '/admin/services/new'
          : undefined
      }
      createLabel="New service"
      objects={records.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.summary,
        status: p.status,
        href: '/admin/services/' + p.slug,
        action: hasPermission(principal, 'booking.write')
          ? {
              href: '/admin/services/' + p.slug + '/availability',
              label: 'Available times',
            }
          : undefined,
        meta: [
          { label: 'Duration', value: p.durationMinutes + ' minutes' },
          { label: 'Timezone', value: p.timezone },
        ],
      }))}
    />
  )
}
