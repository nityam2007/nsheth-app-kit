import { createFileRoute } from '@tanstack/react-router'
import { Route as Parent } from './admin.services.$slug'
import { ServiceForm } from '../components/admin/service-form'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/services/$slug/edit')({
  component: Edit,
})
function Edit() {
  const service = Parent.useLoaderData()
  return (
    <section className="max-w-3xl">
      <PageHeading eyebrow="Booking" title="Edit service" />
      <ServiceForm initial={service} />
    </section>
  )
}
