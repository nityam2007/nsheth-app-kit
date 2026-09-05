import { createFileRoute } from '@tanstack/react-router'
import { Route as Parent } from './admin.properties.$slug'
import { PropertyForm } from '../components/admin/property-form'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/properties/$slug/edit')({
  component: Edit,
})
function Edit() {
  const property = Parent.useLoaderData()
  return (
    <section className="max-w-3xl">
      <PageHeading eyebrow="Hospitality" title="Edit property" />
      <PropertyForm initial={property} />
    </section>
  )
}
