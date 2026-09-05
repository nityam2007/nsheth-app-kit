import { createFileRoute } from '@tanstack/react-router'
import { ServiceForm } from '../components/admin/service-form'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/services/new')({
  component: () => (
    <section className="max-w-3xl">
      <PageHeading eyebrow="Booking" title="New service" />
      <ServiceForm />
    </section>
  ),
})
