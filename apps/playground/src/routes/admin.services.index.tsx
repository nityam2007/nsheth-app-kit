import { createFileRoute } from '@tanstack/react-router'
import { getAdminServices } from '../booking.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/services/')({
  loader: () => getAdminServices(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  return (
    <ObjectCollection
      title="Services"
      eyebrow="Schedule"
      description="Service information, booking policies and available appointment times."
      createHref="/admin/services/new"
      createLabel="New service"
      objects={records.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.summary,
        status: p.status,
        href: '/admin/services/' + p.slug,
        meta: [
          { label: 'Duration', value: p.durationMinutes + ' minutes' },
          { label: 'Timezone', value: p.timezone },
        ],
      }))}
    />
  )
}
